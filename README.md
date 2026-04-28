# TurtleCI Astro

This project preserves the exported Webflow site structure in Astro, uses Sanity for CMS-backed content, and builds to static files.

## Hosting model

- Astro output is static
- Sanity is used at build time
- deploy artifact is `dist/`

This keeps the site portable across Cloudflare Pages and other static hosts.

## Local commands

```bash
npm install
npm run check:build-env
npm run dev
npm run build
```

## Environment variables

Build-time variables in `.env.example`:

- `PUBLIC_SANITY_PROJECT_ID`
- `PUBLIC_SANITY_DATASET`
- `PUBLIC_SANITY_API_VERSION`
- `SANITY_API_READ_TOKEN`

Import-only variables in `.env.import.example`:

- `SANITY_API_WRITE_TOKEN`
- `WEBFLOW_CMS_DIR`

`SANITY_API_WRITE_TOKEN` is not required for production hosting.

## Deployment docs

- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
- [SANITY_WEBHOOK.md](./SANITY_WEBHOOK.md)
- [GITHUB_HANDOFF.md](./GITHUB_HANDOFF.md)
