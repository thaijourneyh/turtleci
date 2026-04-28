# Production Checklist

## Security

- Rotate the Sanity token used during migration
- Create a read-only Sanity token for builds
- Keep `SANITY_API_WRITE_TOKEN` out of Cloudflare Pages production variables
- Confirm `.env` is not committed

## Cloudflare Pages

- Repository connected
- Root directory set correctly
- Build command set to `npm run build`
- Output directory set to `dist`
- Build environment variables added
- Node version aligned with `.nvmrc`

## Sanity

- Production dataset confirmed
- Build token tested locally
- Deploy hook created in Cloudflare Pages
- Sanity webhook created for:
  - `blogPost`
  - `marqueeLogo`
  - `carouselItem`
- Webhook tested end-to-end

## Pre-cutover checks

- `npm run check:build-env` passes locally
- Homepage matches current production
- Features page marquee logos render
- Pricing page FAQ works
- Blog index matches current live content
- At least 3 blog detail pages checked
- Contact page loads correctly
- Asset URLs load correctly

## Cutover

- Deploy to preview first
- Verify preview routes
- Point `www.turtleci.io` to the new host
- Re-test critical routes after DNS propagation
