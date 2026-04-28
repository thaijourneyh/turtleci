import fs from "node:fs";
import path from "node:path";

const siteUrl = process.env.SITE_URL || "https://www.turtleci.io";
const outputPath = path.resolve(process.cwd(), "src/data-live-route-manifest.json");

function normalizeRoute(route) {
  const value = route.trim();
  if (!value.startsWith("/")) return `/${value}`;
  return value.replace(/\/$/, "") || "/";
}

function extractRoutes(html) {
  const routes = new Set();
  const hrefPattern = /href="([^"#?]+)"/g;
  let match = hrefPattern.exec(html);

  while (match) {
    const value = match[1];
    if (value.startsWith(siteUrl)) {
      routes.add(normalizeRoute(new URL(value).pathname));
    } else if (value.startsWith("/")) {
      routes.add(normalizeRoute(value));
    }
    match = hrefPattern.exec(html);
  }

  return routes;
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

async function main() {
  const visited = new Set();
  const queue = ["/", "/blogs"];
  const routes = new Set();

  while (queue.length > 0) {
    const route = queue.shift();
    if (!route || visited.has(route)) continue;
    visited.add(route);
    const html = await fetchText(`${siteUrl}${route}`);
    const discovered = extractRoutes(html);

    for (const discoveredRoute of discovered) {
      routes.add(discoveredRoute);
      if ((discoveredRoute === "/blogs" || discoveredRoute.startsWith("/blogs/")) && !visited.has(discoveredRoute)) {
        queue.push(discoveredRoute);
      }
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    siteUrl,
    routes: [...routes].sort()
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Saved ${manifest.routes.length} routes to ${outputPath}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
