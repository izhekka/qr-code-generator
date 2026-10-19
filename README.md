# QR Generator

A static QR code generator. QR rendering, styling and export run entirely
in the browser; the server only serves static assets (no API routes, no
runtime server code). Two app pages: the landing page (`/`) and the QR
constructor (`/builder-static`), plus statically prerendered guide pages
under `/guides/`.

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router, TypeScript, static prerender)
- React 19
- [Tailwind CSS 4](https://tailwindcss.com/)
- [qr-code-styling](https://www.npmjs.com/package/qr-code-styling) — QR rendering (client-only, loaded with `ssr: false`)
- Vitest — unit tests (`lib/`)
- Playwright — end-to-end tests (`e2e/`)

## Project structure

    app/                    pages (landing + constructor) and global styles
    components/             React components used by the constructor
    lib/                    pure logic: types, payload encoders, validation,
                            settings reducer, QR config, sticker frames, export
    e2e/                    Playwright specs
    docs/                   agent/contributor guides — start at docs/README.md

## Local setup

    npm install
    npm run dev             # http://localhost:3000

## Tests

    npm run test            # Vitest unit + component tests (RTL, jsdom)
    npm run test:coverage   # same, with coverage thresholds
    npx next build
    npm run e2e             # Playwright (serves the production build);
                            # exports are decoded with jsQR to prove they scan

## Production build

    npm run build
    npm run start

## Deploy (Vercel)

The site is fully static (framework preset **Next.js**, no environment
variables, no API routes) — both pages are statically rendered and served
from the CDN.

**One-time setup:** link the local repo to the Vercel project

    npx vercel link

**Deploy from your machine**

    npm run deploy          # production
    npm run deploy:preview  # preview URL for the current branch

**Deploy from GitHub** (`.github/workflows/deploy.yml`):

- Runs automatically on every push to `main`.
- Or trigger manually (Actions → Deploy → Run workflow) with the branch to
  deploy as the input — `main` is the default. `main` deploys to production,
  any other branch to a preview URL.
- The workflow runs the unit tests, then builds with the Vercel CLI and
  deploys the prebuilt output. It needs three repository secrets:
  `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (the ids are written
  to `.vercel/project.json` by `vercel link`, which is gitignored).