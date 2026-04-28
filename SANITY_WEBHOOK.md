# Sanity Webhook Setup

Use this after the site is deployed on Cloudflare Pages.

## Goal

Trigger a new static deployment whenever CMS content changes.

## Cloudflare prerequisite

Create a Pages deploy hook for the production environment.

You will get a URL that looks like this:

```text
https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/...
```

## Sanity webhook fields

In the Sanity project settings, create a webhook with:

- Name: `Cloudflare Pages Production Rebuild`
- Dataset: `production`
- URL: the Cloudflare Pages deploy hook URL
- HTTP method: `POST`
- Trigger on:
  - Create
  - Update
  - Delete

## Filter

Use this filter so only site-relevant content triggers a rebuild:

```groq
_type in ["blogPost", "marqueeLogo", "carouselItem"]
```

## Payload

Default payload is fine. Cloudflare deploy hooks do not need a custom body.

## Testing

After saving the webhook:

1. Edit a blog post in Sanity.
2. Confirm a new Cloudflare Pages deployment starts.
3. After deploy completes, verify the updated page on the preview or production URL.
