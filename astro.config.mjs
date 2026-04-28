import react from "@astrojs/react";
import sanity from "@sanity/astro";
import { defineConfig } from "astro/config";

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID || "7n9izhbq";
const dataset = process.env.PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.PUBLIC_SANITY_API_VERSION || "2025-04-24";

export default defineConfig({
  devToolbar: {
    enabled: false
  },
  integrations: [
    react(),
    sanity({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      studioBasePath: "/studio",
      studioRouterHistory: "hash"
    })
  ],
  output: "static",
  site: "https://www.turtleci.io",
  trailingSlash: "never"
});
