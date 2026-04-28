# GitHub Handoff

This project is ready to live in its own repository.

## Recommended repository shape

Use `turtleci-astro` as a standalone repository.

That simplifies:

- Cloudflare Pages setup
- deployment path clarity
- access control
- future hosting migration

## Before the first push

Verify these are not committed:

- `.env`
- `.env.import.example` is fine
- `node_modules/`
- `dist/`
- `.astro/`

`gitignore` already excludes them.

## Standalone repository setup

From inside `turtleci-astro`:

```bash
git init
git add .
git status
```

Check that:

- `.env` is not listed
- `node_modules` is not listed
- `dist` is not listed

Then:

```bash
git commit -m "Initial Astro + Sanity migration"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## If you keep it inside the current parent repository

That also works, but then Cloudflare Pages must use:

- Root directory: `turtleci-astro`

Use this only if you intentionally want one repository for multiple projects.

## Recommended first repository files

Keep these in the first push:

- `README.md`
- `DEPLOYMENT.md`
- `PRODUCTION_CHECKLIST.md`
- `SANITY_WEBHOOK.md`
- `.env.example`
- `.env.import.example`

These documents make the deploy path and operational model explicit.

## Immediate post-push actions

1. Rotate the Sanity token used during migration.
2. Create a read-only build token.
3. Add the new build token only in Cloudflare Pages.
4. Do not store production tokens in GitHub.
