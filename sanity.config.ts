import { structureTool } from "sanity/structure";
import { defineConfig } from "sanity";
import { schemaTypes } from "./sanity/schemaTypes";

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID || "7n9izhbq";
const dataset = process.env.PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "turtleci",
  title: "TurtleCI Content Studio",
  basePath: "/studio",
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: {
    types: schemaTypes
  }
});
