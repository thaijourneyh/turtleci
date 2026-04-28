# Deployment

## Current deployment shape

The site builds as static HTML, CSS, and JS into `dist/`.

That means:

- no host-specific server runtime is required for page rendering
- Sanity is queried during the build
- the built artifact can be moved between static hosts with minimal change

## Cloudflare Pages

### If `turtleci-astro` is its own repository

Use:

- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: use a current LTS version supported by Astro

### If `turtleci-astro` stays inside the current parent repository

In Cloudflare Pages, set:

- Root directory: `turtleci-astro`
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: use a current LTS version supported by Astro

This is important because the Astro app is not at the repository root.

## Cloudflare Pages setup order

1. Create the Pages project from GitHub.
2. Set the root directory only if this app stays nested inside the current repository.
3. Set the build command and output directory.
4. Add the build environment variables.
5. Run the first preview deployment.
6. Verify preview output before adding the production domain.

## Required Cloudflare build environment variables

- `PUBLIC_SANITY_PROJECT_ID=7n9izhbq`
- `PUBLIC_SANITY_DATASET=production`
- `PUBLIC_SANITY_API_VERSION=2025-04-24`
- `SANITY_API_READ_TOKEN=...`

Optional:

- `SITE_URL=https://www.turtleci.io`

Do not set `SANITY_API_WRITE_TOKEN` in production unless you have a specific operational reason.

## Recommended token setup

- Production build token: read-only if possible
- Local/import token: separate write-capable token

The token previously used during migration should be rotated before production use.

## Validation before deploy

Run locally before connecting Cloudflare Pages:

```bash
npm run check:build-env
npm run build
```

If you need to re-import Webflow CMS content:

```bash
npm run check:import-env
npm run import:webflow
```

## Sanity content updates

Because the site is static, new Sanity content only appears after a rebuild.

Recommended production workflow:

1. Create a Cloudflare Pages deploy hook.
2. In Sanity, add a webhook that calls that deploy hook when relevant documents change.
3. Limit the webhook to the document types that affect the site:
   - `blogPost`
   - `marqueeLogo`
   - `carouselItem`

This keeps content changes operationally simple without making the site runtime-dependent.

## Sanity webhook setup

In Sanity:

- Trigger on create, update, delete
- Filter by types used by the site
- Call the Cloudflare deploy hook URL
- Use the Cloudflare Pages deploy hook for the production environment

Typical filter:

```groq
_type in ["blogPost", "marqueeLogo", "carouselItem"]
```

Detailed setup steps:

- [SANITY_WEBHOOK.md](./SANITY_WEBHOOK.md)

## Domain cutover

For production cutover:

1. Deploy the site on a preview domain first.
2. Verify the main public routes:
   - `/`
   - `/features-turtleci`
   - `/pricing-plan`
   - `/blogs`
   - at least 3 blog detail pages
3. Verify asset paths and interactions.
4. Point `www.turtleci.io` to the new Pages project.
5. Re-test the same route set after DNS propagation.

If the apex domain is also used:

6. Point the apex/root domain to the same project as needed.

## Moving to another host later

If you move the site later to another provider, the expected changes are:

- new deploy target
- same build command
- same environment variables
- DNS update

The Astro code and Sanity content model do not need to change.

## Practical checklist

Before first production deploy:

- Rotate the current Sanity token
- Create a read-only build token
- Set Cloudflare Pages env vars
- Create a deploy hook
- Add a Sanity webhook to trigger rebuilds
- Test preview deployment
- Cut over DNS
- Use [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) as the handoff list
