# Architecture & tech stack

Read before touching anything under `lib/`, the rendering pipeline, or the
sticker system. Project description and hard constraints are in the root
`AGENTS.md`; commands, style and testing are in [`development.md`](development.md).

## Tech stack

| What | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript | static prerender; `strict: true` |
| UI | React 19 + Tailwind CSS 4 | Tailwind v4 syntax (`@import "tailwindcss"`, `@theme`-less tokens in `:root`) |
| QR rendering | `qr-code-styling` ^1.9 | **client-only** — never render it during SSR |
| Unit/component tests | Vitest 5 + React Testing Library + user-event | jsdom via `// @vitest-environment jsdom` docblock per file |
| E2E | Playwright | runs against the **production build** (`npm run start`) |

This Next.js version has breaking changes vs your training data — see the
"NOT the Next.js you know" note in the root `AGENTS.md` and read the
relevant guide in `node_modules/next/dist/docs/` before writing
Next-specific code.

## Architecture

### Data flow (one direction, no server)

`Settings` (a single `Settings` object in `lib/types.ts`, defaults in
`lib/settings.ts`) ← `settingsReducer` ← components `dispatch` typed
`Action`s (`lib/actions.ts`). Panels never mutate state; they dispatch
`{ type: 'setPattern' | 'setCorners' | ..., patch: Partial<...> }`.

`Settings` → `buildQrConfig(settings, size)` (`lib/qrConfig.ts`) →
`qr-code-styling` options. `buildPayload` (`lib/payload.ts`) encodes content
into the QR string; `getValidationError` (`lib/validate.ts`) returns the
human error or `null`. Content types live in `lib/types.ts` (`QrType`):
`link`, `text`, `email`, `call`, plus the payload-bearing `vcard` (VCARD 3.0),
`wifi` (`WIFI:` with spec escaping), `event` (floating-time iCalendar) and
`sms` (`SMSTO:`), and the URL presets `social`/`pdf`/`appstore` that reuse the
link encoder. The per-type forms are small components in
`components/content/`; state updates ride `setField` or `setContentPatch`.
Oversize payloads surface as `tooLong` through the capacity rule from the QR
standard compliance section.

### QR standard compliance

Rendering uses `qrcode-generator@^1.4.4` (bundled into `qr-code-styling`, and
called directly by `moduleCount` in `lib/qrConfig.ts`), which emits **QR Model
2 symbols only** (ISO/IEC 18004, versions 1–40, auto-selected) — the format
native iOS/Android cameras expect. The engine cannot produce Model 1 or Micro
QR and enforces the Model 2 capacity tables exactly, so an oversize payload
throws rather than yielding a non-standard symbol. `getValidationError`
(`lib/validate.ts`) therefore caps payloads at the version-40 byte ceiling via
`maxPayloadLength` — 2331 chars at EC M, 1273 at EC H — before the renderer
ever sees them. The e2e suite decodes rendered output with jsQR, itself a
Model-2-only decoder, so scanability is regression-tested end to end.

### Composition model (lib/compose.ts) — the key invariant

A rendered QR is **three layers** on a 0..1000 canvas:

1. **Background layer** — `backgroundLayer(settings)`: paints the sticker's
   `interior` path, or the full `<rect>`, with a solid or gradient fill. The
   QR itself **always renders on transparency**
   (`backgroundOptions.color: 'rgba(0,0,0,0)'`) because its square background
   would spill past sticker frames and mask gradients.
2. **QR** — nested `<svg x qrRect.y …>` from the library output, placed at
   `sticker.qrRect` (or the full canvas without a sticker). The library's
   `svg` string starts with an XML declaration + root `<svg>` which
   `composeSvg` strips.
3. **Frame** — `sticker.frame(label, colors)` markup on top.

**Logo compositing is app-owned, never library-owned.** The library's logo
image sizing derives the drawn box from hidden-dot math quantized to odd
module counts, which collapses neighboring slider stops (20% ≡ 30%). So
`buildQrConfig` passes **no** `image`/`imageOptions` (a logo only flips
error-correction to `H`); instead the composition clears a centered mask
hole at `logoGeometry` snapped **outward to whole modules**
(`logoHoleFraction` — so no partially-clipped dot touches the logo edge)
and overlays the image in that exact box. `moduleCount`
(`lib/qrConfig.ts`) reads the grid from the same `qrcode-generator` call
the library renders with. The preview mirrors this with a CSS
`mask-image` hole + positioned `<img>` (note: CSS masks read the **alpha**
channel, so the hole must be left unpainted, not "drawn black"). Slider
stops ≤30% scan reliably; 40%+ can exceed decoders' damage tolerance —
don't "fix" that by rounding the hole to library-style odd modules.

Both the preview (`components/QrPreview.tsx`) and the export
(`components/DownloadPanel.tsx` → `composeSvg` → `rasterize`/`saveBlob`) use
this exact pipeline, so preview and file always match. **Exports always
compose from a fresh 1000×1000 render** so coordinates line up with
`composeSvg`'s viewBox — never reuse the preview instance's size.

### Sticker system (lib/stickers-types.ts, stickers-impl.ts, stickers.ts)

`STICKERS` is a registry built by `define(id, label, qrRect, frameArt(r, ink), opts)`
where `opts = { interior, labelY? }`:

- `interior` — closed SVG path for the fillable region inside the frame
  borders (backgrounds paint here; `backgroundLayer` uses it directly).
- `qrRect` — where the QR's box is plotted inside the frame.
- `frame(labelText, colors)` — the overlay SVG string.
- `thumb(size, labelText, colors)` — a small icon for the picker with a
  deterministic 8×8 fake QR.

Conventions every sticker must honor:

- All art lives on a **0..1000 canvas**; labels default to `labelBand` at
  baseline `y=920` (override via `labelY`).
- The QR library draws content inset **~6.5% of the QR box** (quiet margin)
  — thumbnails must draw their mini-QR on the same inset content box
  (`CONTENT_MARGIN = 0.065` in `stickers-impl.ts`) or round frames overlap.
- Sticker color is two settings: `sticker.color` (frame/bar art stroke) and
  `sticker.textColor` (label text). The `topbar` sticker's bar takes
  `sticker.color` but its label stays white for contrast.
- Add a new sticker = add one `define(...)` entry + a `lib/stickers.test.ts`
  layout case. The existing test suite asserts content stays inside each
  frame's art and clear of labels; copy that pattern.
- Free-text colors are sanitized with `hex(input)` (invalid → `#000000`) —
  anything fed into library options or SVG markup must pass through it.

## Analytics

[Vercel Web Analytics](https://vercel.com/docs/analytics/quickstart) counts
page views via `<Analytics />` from `@vercel/analytics/next`, rendered once in
`app/layout.tsx`. It is cookieless and collects no personal data; the tracking
script is injected only on Vercel deployments — in development the package
loads a debug script that records nothing — so local development never sends
anything. Custom events are not tracked (Pro/Enterprise only, and the
privacy carve-out in AGENTS.md covers page views only).
