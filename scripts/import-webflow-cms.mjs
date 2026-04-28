import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import { createClient } from "@sanity/client";
import { htmlToBlocks } from "@portabletext/block-tools";
import { JSDOM } from "jsdom";
import { Schema } from "@sanity/schema";

const appRoot = process.cwd();
const exportPath = process.env.WEBFLOW_CMS_DIR;
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

function parseCsv(fileName) {
  const filePath = path.join(exportPath, fileName);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, errors } = Papa.parse(raw, { header: true, skipEmptyLines: true });

  if (errors.length > 0) {
    throw new Error(`Failed to parse ${fileName}: ${errors[0].message}`);
  }

  return data;
}

function parseDate(value) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function normalizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "");
}

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

function toBlogDocument(row) {
  const contentHtml = row.Content || "";
  return {
    _id: `blogPost.${row["Item ID"]}`,
    _type: "blogPost",
    title: row.Name,
    slug: { _type: "slug", current: row.Slug },
    seoTitle: row["Title Tag"] || row.Name,
    seoDescription: row.Description,
    thumbnailUrl: row.Thumbnail || undefined,
    content: htmlToPortableText(contentHtml),
    contentHtml,
    publishedAt: parseDate(row["Published On"]),
    createdAt: parseDate(row["Created On"]),
    updatedAt: parseDate(row["Updated On"]),
    legacyItemId: row["Item ID"],
    legacyCollectionId: row["Collection ID"]
  };
}

function toCarouselDocument(row) {
  return {
    _id: `carouselItem.${row["Item ID"]}`,
    _type: "carouselItem",
    title: row.Name,
    slug: { _type: "slug", current: normalizeSlug(row.Slug || row.Name) },
    description: row.Description || "",
    thumbnailUrl: row.Thumbnail || undefined,
    legacyItemId: row["Item ID"]
  };
}

function toLogoDocument(row) {
  return {
    _id: `marqueeLogo.${row["Item ID"]}`,
    _type: "marqueeLogo",
    name: row.Name,
    slug: { _type: "slug", current: normalizeSlug(row.Slug || row.Name) },
    logoUrl: row["Logo File"],
    altText: row["Alt Text"] || "",
    legacyItemId: row["Item ID"]
  };
}

async function ensureSchemas() {
  const schemaPath = path.resolve(appRoot, "sanity-schema.ndjson");
  const schemaContent = [
    JSON.stringify({
      _id: "_.schemas.blogPost",
      _type: "system.schema",
      name: "blogPost",
      types: [
        { name: "title", type: "string" },
        { name: "slug", type: "slug" },
        { name: "seoTitle", type: "string" },
        { name: "seoDescription", type: "text" },
        { name: "thumbnailUrl", type: "url" },
        { name: "contentHtml", type: "text" },
        { name: "publishedAt", type: "datetime" }
      ]
    })
  ].join("\n");

  fs.writeFileSync(schemaPath, `${schemaContent}\n`);
}

async function main() {
  const blogRows = parseCsv("Welcome to TurtleCI - Blogs - 675fd780f419406ad9a78f15.csv");
  const carouselRows = parseCsv("Welcome to TurtleCI - Carousel Collections - 6757f377cc48557b0ef646e0.csv");
  const logoRows = parseCsv("Welcome to TurtleCI - Marquee Logos - 6757f377cc48557b0ef646df.csv");

  const docs = [
    ...blogRows.filter((row) => row.Archived !== "true" && row.Draft !== "true" && row["Published On"]).map(toBlogDocument),
    ...carouselRows.map(toCarouselDocument),
    ...logoRows.map(toLogoDocument)
  ];

  for (const doc of docs) {
    await client.createOrReplace(doc);
  }

  console.log(`Imported ${docs.length} documents into Sanity.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
