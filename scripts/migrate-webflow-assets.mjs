import path from "node:path";
import { createClient } from "@sanity/client";

const token = process.env.SANITY_API_WRITE_TOKEN;

if (!token) {
  console.error("Missing SANITY_API_WRITE_TOKEN.");
  process.exit(1);
}

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || "7n9izhbq",
  dataset: process.env.PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-04-24",
  token,
  useCdn: false
});

const assetCache = new Map();
const stats = {
  uploadedAssets: 0,
  reusedAssets: 0,
  patchedDocs: 0,
  convertedInlineImages: 0,
  migratedThumbnails: 0,
  migratedLogos: 0,
  migratedCarouselImages: 0,
  failedUrls: [],
  failedDocs: []
};

function isWebUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function toFilename(urlString, fallbackBaseName) {
  try {
    const url = new URL(urlString);
    const base = path.basename(url.pathname) || fallbackBaseName;
    return decodeURIComponent(base.split("?")[0]) || fallbackBaseName;
  } catch {
    return fallbackBaseName;
  }
}

async function fetchBinary(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    contentType: response.headers.get("content-type") || "application/octet-stream"
  };
}

async function withRetry(label, fn, retries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        break;
      }

      const waitMs = attempt * 1500;
      console.warn(`[retry ${attempt}/${retries}] ${label}: ${error.message}. Waiting ${waitMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }

  throw lastError;
}

async function uploadImageAsset(url, fallbackBaseName) {
  if (!isWebUrl(url)) {
    return null;
  }

  if (assetCache.has(url)) {
    stats.reusedAssets += 1;
    return assetCache.get(url);
  }

  const { buffer, contentType } = await withRetry(`download ${url}`, () => fetchBinary(url));
  const filename = toFilename(url, fallbackBaseName);
  const asset = await withRetry(`upload ${url}`, () => client.assets.upload("image", buffer, {
    filename,
    contentType
  }));

  const ref = {
    _type: "reference",
    _ref: asset._id
  };

  assetCache.set(url, ref);
  stats.uploadedAssets += 1;
  return ref;
}

function contentNeedsMigration(content) {
  return Array.isArray(content) && content.some((block) => block?._type === "externalImage" && isWebUrl(block.url));
}

async function migrateBlogPosts() {
  const posts = await client.fetch(`
    *[_type == "blogPost"]{
      _id,
      title,
      thumbnailUrl,
      thumbnail,
      content
    }
  `);

  for (const post of posts) {
    const patch = {};

    if (!post.thumbnail?.asset?._ref && isWebUrl(post.thumbnailUrl)) {
      let assetRef;
      try {
        assetRef = await uploadImageAsset(post.thumbnailUrl, `${post._id}-thumbnail`);
      } catch (error) {
        stats.failedUrls.push({ url: post.thumbnailUrl, message: error.message });
      }
      if (assetRef) {
        patch.thumbnail = {
          _type: "image",
          asset: assetRef,
          alt: post.title || ""
        };
        stats.migratedThumbnails += 1;
      }
    }

    if (contentNeedsMigration(post.content)) {
      patch.content = await Promise.all(
        post.content.map(async (block) => {
          if (block?._type !== "externalImage" || !isWebUrl(block.url)) {
            return block;
          }

          let assetRef;
          try {
            assetRef = await uploadImageAsset(block.url, `${post._id}-${block._key || "image"}`);
          } catch (error) {
            stats.failedUrls.push({ url: block.url, message: error.message });
            return block;
          }
          if (!assetRef) {
            return block;
          }

          stats.convertedInlineImages += 1;

          return {
            _type: "image",
            _key: block._key,
            asset: assetRef,
            alt: block.alt || "",
            caption: block.caption || ""
          };
        })
      );
    }

    if (Object.keys(patch).length > 0) {
      try {
        await withRetry(`patch ${post._id}`, () => client.patch(post._id).set(patch).commit());
        stats.patchedDocs += 1;
      } catch (error) {
        stats.failedDocs.push({ id: post._id, message: error.message });
      }
    }
  }
}

async function migrateMarqueeLogos() {
  const docs = await client.fetch(`
    *[_type == "marqueeLogo"]{
      _id,
      name,
      altText,
      logoUrl,
      logo
    }
  `);

  for (const doc of docs) {
    if (doc.logo?.asset?._ref || !isWebUrl(doc.logoUrl)) {
      continue;
    }

    let assetRef;
    try {
      assetRef = await uploadImageAsset(doc.logoUrl, `${doc._id}-logo`);
    } catch (error) {
      stats.failedUrls.push({ url: doc.logoUrl, message: error.message });
      continue;
    }
    if (!assetRef) {
      continue;
    }

    try {
      await withRetry(`patch ${doc._id}`, () => client.patch(doc._id).set({
        logo: {
          _type: "image",
          asset: assetRef,
          alt: doc.altText || doc.name || ""
        }
      }).commit());

      stats.migratedLogos += 1;
      stats.patchedDocs += 1;
    } catch (error) {
      stats.failedDocs.push({ id: doc._id, message: error.message });
    }
  }
}

async function migrateCarouselItems() {
  const docs = await client.fetch(`
    *[_type == "carouselItem"]{
      _id,
      title,
      thumbnailUrl,
      thumbnail
    }
  `);

  for (const doc of docs) {
    if (doc.thumbnail?.asset?._ref || !isWebUrl(doc.thumbnailUrl)) {
      continue;
    }

    let assetRef;
    try {
      assetRef = await uploadImageAsset(doc.thumbnailUrl, `${doc._id}-thumbnail`);
    } catch (error) {
      stats.failedUrls.push({ url: doc.thumbnailUrl, message: error.message });
      continue;
    }
    if (!assetRef) {
      continue;
    }

    try {
      await withRetry(`patch ${doc._id}`, () => client.patch(doc._id).set({
        thumbnail: {
          _type: "image",
          asset: assetRef,
          alt: doc.title || ""
        }
      }).commit());

      stats.migratedCarouselImages += 1;
      stats.patchedDocs += 1;
    } catch (error) {
      stats.failedDocs.push({ id: doc._id, message: error.message });
    }
  }
}

async function main() {
  await migrateBlogPosts();
  await migrateMarqueeLogos();
  await migrateCarouselItems();

  console.log(JSON.stringify(stats, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
