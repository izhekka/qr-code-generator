# QR Generator

A static QR code generator. QR rendering, styling and export run entirely
in the browser; the server only serves static assets (no API routes, no
runtime server code). Two pages: the landing page (`/`) and the QR
constructor (`/constructor`).

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
    docs/superpowers/       design spec and implementation plan

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

Push to a Git host and import the repo at vercel.com/new (or run `vercel`).
Defaults work as-is: framework preset **Next.js**, no environment variables,
no API routes — both pages are statically rendered and served from the CDN.