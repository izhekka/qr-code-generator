# QR Code Generator — Design

**Date:** 2026-10-14
**Status:** Approved

## Goal

A free, no-login QR code generator site. All computation happens in the browser; the server serves static assets only (no API routes, no server functions), so Vercel's CDN handles the full throughput. Two pages total.

## Stack

- **Next.js 15 (App Router) + TypeScript**, Tailwind CSS.
- **QR rendering:** `qr-code-styling` (MIT, canvas + SVG), loaded client-only via `next/dynamic` with `ssr: false`.
- Both routes statically prerendered. Vercel deploys the project with its defaults — no custom config.
- Routes: `/` (landing) and `/constructor` (static QR builder).

## Landing page (`/`)

- Light-gray background, full-viewport hero.
- Headline, navy→purple gradient: "No sign-ups. No payments. Just grab your working QR code."
- Single CTA button, "Create Static QR", links to `/constructor`.
- Minimal wordmark, no nav links, no footer clutter.

## Constructor page (`/constructor`)

Two-column layout.

### Left column

**1. QR content** — type chips: Link, Text, E-mail, Call. Fields per type:

- Link: URL (auto-prefix `https://` when a scheme is missing; inline error if still invalid)
- Text: text area
- E-mail: to, subject, body (`to` is validated as an email address)
- Call: phone number (tel: URI)

**2. Design** — three tabs:

- **Sticker:** "None" + ~8 sticker frames (square, rounded, phone, clipboard, shopping bag, etc.), each an inline-SVG border + optional "SCAN ME" label. Previews render as small SVGs.
- **Pattern:** dot shape row (square, dots, rounded, classy, …), dot color selector; "Use gradient pattern" switch → two color selectors; background color selector; "Use transparent background" checkbox; "Use gradient background" switch → two color selectors.
- **Corners:** frame style row (≈4: none, square, dot, extra-rounded); corner dots style row (≈5: none, square, dot, rounded, …); one color selector for each.

These map to `qr-code-styling`'s native `shapeType`/`colors`/`cornersSquareStyle`/`cornersDotStyle` options; variant counts may be trimmed to what the library supports without custom drawing.

**3. Logo tab:** file upload (picker + drag-drop; held client-side as a data URL), "clear corner dots behind logo" option, size slider. Error-correction level goes from "M" to "H" when a logo is present.

### Right column (sticky)

- Live preview — re-renders on every change.
- **Download QR Code** button (disabled until content is valid), with a format dropdown (PNG, JPEG, SVG, WEBP) and a pixel-size selector for raster formats (512 / 1024 / 2048).

## Sticker frames

The library has no frame support, so frames are a separate overlay system:

- Preview renders the QR as **SVG** (`dotType` output); the sticker frame is an inline-SVG overlay drawn around it.
- **Export:** frame SVG + QR SVG are composited via `DOMParser`/serialization; SVG downloads use the merged markup directly, raster formats rasterize the merged SVG to a canvas at the chosen size.

## State

A single `useReducer`-style settings object (type, content, sticker, pattern, corners, logo, export) drives the preview and the download. No persistence in v1.

## Error handling

- Invalid URL or email → inline validation error; Download stays disabled.
- Logo read failure → toast.
- Payload too large for the QR capacity → inline error on content section.
- All of it client-side only.

## Testing

- **Vitest** unit tests: payload encoders (link/email/call), settings reducer, frame+QR SVG composition.
- **Playwright** smoke test: `/constructor` renders, generated PNG decodes back to the original payload with a JS QR decoder, download produces a file.