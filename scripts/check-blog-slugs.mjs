import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

const appRoot = process.cwd();
const manifestPath = path.resolve(appRoot, "src/data-live-route-manifest.json");
const csvPath = path.resolve(
  process.env.WEBFLOW_CMS_DIR,
  "Welcome to TurtleCI - Blogs - 675fd780f419406ad9a78f15.csv"
);

function parseCsv(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, errors } = Papa.parse(raw, { header: true, skipEmptyLines: true });
  if (errors.length > 0) {
    throw new Error(errors[0].message);
  }
  return data;
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const liveSlugs = new Set(manifest.routes.filter((route) => route.startsWith("/blogs/")).map((route) => route.replace("/blogs/", "")));
const csvSlugs = new Set(parseCsv(csvPath).map((row) => row.Slug).filter(Boolean));

const onlyInLive = [...liveSlugs].filter((slug) => !csvSlugs.has(slug)).sort();
const onlyInCsv = [...csvSlugs].filter((slug) => !liveSlugs.has(slug)).sort();

console.log(`Live blog routes: ${liveSlugs.size}`);
console.log(`CSV blog slugs: ${csvSlugs.size}`);

if (onlyInLive.length > 0) {
  console.log("\nPresent live but missing from CSV:");
  for (const slug of onlyInLive) {
    console.log(`- ${slug}`);
  }
}

if (onlyInCsv.length > 0) {
  console.log("\nPresent in CSV but missing from live routes:");
  for (const slug of onlyInCsv) {
    console.log(`- ${slug}`);
  }
}
