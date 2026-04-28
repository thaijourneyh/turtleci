import { createClient } from "@sanity/client";
import { htmlToBlocks } from "@portabletext/block-tools";
import { JSDOM } from "jsdom";
import { Schema } from "@sanity/schema";

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

const compiledSchema = Schema.compile({
  name: "turtleci",
  types: [
    {
      type: "object",
      name: "externalImage",
      fields: [
        { name: "url", type: "url" },
        { name: "alt", type: "string" },
        { name: "caption", type: "string" }
      ]
    },
    {
      type: "document",
      name: "blogPost",
      fields: [
        {
          name: "content",
          type: "array",
          of: [{ type: "block" }, { type: "externalImage" }]
        }
      ]
    }
  ]
});

const portableTextContentType = compiledSchema.get("blogPost").fields.find((field) => field.name === "content").type;

function parseHtml(html) {
  return new JSDOM(`<body>${html}</body>`).window.document;
}

function htmlToPortableText(html) {
  if (!html || !html.trim()) {
    return [];
  }

  return htmlToBlocks(html, portableTextContentType, {
    parseHtml,
    matchers: {
      image: ({ props, context }) => {
        if (!props.src) {
          return undefined;
        }

        return {
          _type: "externalImage",
          _key: context.keyGenerator(),
          url: props.src,
          alt: props.alt || ""
        };
      }
    }
  });
}

async function main() {
  const posts = await client.fetch(`*[_type == "blogPost"]{_id, contentHtml}`);

  let migratedCount = 0;

  for (const post of posts) {
    if (!post.contentHtml || !post.contentHtml.trim()) {
      continue;
    }

    const content = htmlToPortableText(post.contentHtml);
    await client.patch(post._id).set({ content }).commit();
    migratedCount += 1;
  }

  console.log(`Migrated ${migratedCount} blog posts to Portable Text.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
