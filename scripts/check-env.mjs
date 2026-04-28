const mode = process.argv[2];

const requirements = {
  build: [
    "PUBLIC_SANITY_PROJECT_ID",
    "PUBLIC_SANITY_DATASET",
    "PUBLIC_SANITY_API_VERSION",
    "SANITY_API_READ_TOKEN"
  ],
  import: [
    "PUBLIC_SANITY_PROJECT_ID",
    "PUBLIC_SANITY_DATASET",
    "PUBLIC_SANITY_API_VERSION",
    "SANITY_API_READ_TOKEN",
    "SANITY_API_WRITE_TOKEN",
    "WEBFLOW_CMS_DIR"
  ]
};

if (!mode || !(mode in requirements)) {
  console.error("Usage: node ./scripts/check-env.mjs <build|import>");
  process.exit(1);
}

const missing = requirements[mode].filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required ${mode} environment variables:`);
  for (const key of missing) {
    console.error(`- ${key}`);
  }
  process.exit(1);
}

console.log(`Environment is valid for ${mode}.`);
