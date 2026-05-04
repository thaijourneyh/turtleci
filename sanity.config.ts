import { structureTool } from "sanity/structure";
import { defineConfig } from "sanity";
import { schemaTypes } from "./sanity/schemaTypes";
import { explicitPublishAction } from "./sanity/explicitPublishAction";

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID || "7n9izhbq";
const dataset = process.env.PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "turtleci",
  title: "TurtleCI Content Studio",
  projectId,
  dataset,
  plugins: [structureTool()],
  document: {
    actions: (prev) => [...prev, explicitPublishAction]
  },
  schema: {
    types: schemaTypes
  }
});
