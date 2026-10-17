# AGENTS.md — guide for AI agents working on this repo

Read this before writing any code. It defines the stack, the architecture,
the code style, and the UX/UI conventions; follow them so the project stays
consistent across sessions.

## Hard constraints (never violate)

- **Static-only site.** No API routes, no server-side rendering of the
  constructor, no backend, no analytics, no persistence. Everything (QR
  rendering, styling, export) happens in the browser. Pages are statically
  prerendered by Next.js.
- **No login, no tracking, no uploads.** The landing page sells this privacy;
  don't add anything that contradicts it.
- **Exactly two pages:** the landing `/` and the QR constructor
  `/builder-static`. New features belong inside one of them.
- **Never name an app route after an `Object.prototype` property**
  (`constructor`, `hasOwnProperty`, `toString`, …) — the Vercel Next builder
  crashes on such route names (`Unsupported output type: "undefined"`). This
  is why the second page is `/builder-static`, not `/constructor`.
- **A QR must always stay scannable.** Any styling feature must keep quiet
  zones and contrast sane (e.g. logo implies error-correction level `H`, see
  `buildQrConfig`).

## Tech stack

| What | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript | static prerender; `strict: true` |
| UI | React 19 + Tailwind CSS 4 | Tailwind v4 syntax (`@import "tailwindcss"`, `@theme`-less tokens in `:root`) |
| QR rendering | `qr-code-styling` ^1.9 | **client-only** — never render it during SSR |
| Unit/component tests | Vitest 5 + React Testing Library + user-event | jsdom via `// @vitest-environment jsdom` docblock per file |
| E2E | Playwright | runs against the **production build** (`npm run start`) |

This Next.js version has breaking changes vs your training data. Before
writing Next-specific code, read the relevant guide in
`node_modules/next/dist/docs/`.

## Commands

```
npm run dev            # http://localhost:3000
npm run test           # vitest unit + component tests
npm run test:coverage  # thresholds: stmts 83 / branches 84 / funcs 78 / lines 83
npm run build          # next build (also verifies static prerender)
npm run e2e            # Playwright; serves the production build
```

Run Playwright without a `--project` flag (the config defines none), and note
it wipes `test-results/` at the start of every run. `rtk proxy npx ...` gives
full, token-filtered-free output.

## Architecture

### Data flow (one direction, no server)

`Settings` (a single `Settings` object in `lib/types.ts`, defaults in
`lib/settings.ts`) ← `settingsReducer` ← components `dispatch` typed
`Action`s (`lib/actions.ts`). Panels never mutate state; they dispatch
`{ type: 'setPattern' | 'setCorners' | ..., patch: Partial<...> }`.

`Settings` → `buildQrConfig(settings, size)` (`lib/qrConfig.ts`) →
`qr-code-styling` options. `buildPayload` (`lib/payload.ts`) encodes content
into the QR string; `getValidationError` (`lib/validate.ts`) returns the
human error or `null`.

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

## Code style

- TypeScript, strict; prefer discriminated unions over stringly-typed props
  (see `Action`, `QrType`, `DotType`).
- Pure logic goes in `lib/` and must stay free of browser/React dependencies
  so it runs in node tests; browser-only code (canvas, `Image`, download
  anchor) is isolated in `compose.ts` helpers (`rasterize`, `saveBlob`).
- Components are client components (`'use client'`) only when they need state
  or the QR library; landing-page sections stay server components.
- Tailwind for all styling, arbitrary-value classes like `bg-[#23234f]` /
  `text-[#7b5cd6]`; design tokens are CSS variables in `app/globals.css`
  (`--bg #f1f2f6`, `--navy #23234f`, `--purple #7b5cd6`). Class order in
  existing files: layout → spacing → border → typography → colors → states;
  match it.
- Comments explain **invariants and why**, not what (see the quiet-margin and
  export-at-1000 comments). If you add an invariant, comment it — tests
  encode the same numbers.
- No dead code: `BuilderClient`'s `PlaceholderTab`/`stub` map is scaffolding
  legacy; panels now fill `panels`, don't grow `stub`.

## UX/UI design patterns

- **Minimal light aesthetic.** Page background `#f1f2f6`, white cards
  (`rounded-2xl bg-white p-6 shadow-sm` via `components/controls.tsx`
  `Panel`), text `#23234f`. Max width `max-w-6xl`, page padding `p-6`.
- **Layout:** constructor is a two-column grid
  (`lg:grid-cols-[1fr_420px]`) — editor steps left, preview & download right
  in a sticky column. Collapses to one column on mobile.
- **Numbered steps:** section titles `“1 · Complete the content”`,
  `“2 · Design your QR code”`, `“3 · Preview & download”`. Design changes go
  under step 2 as tabs (`Sticker / Pattern / Corners / Logo`) — tab buttons:
  active `bg-[#23234f] text-white`, idle `text-gray-500`, `mb-4` below the
  tab row.
- **Controls** (all in `components/controls.tsx` — reuse, don't reinvent):
  - `ColorPicker`: label on top, color swatch (`h-9 w-9`) + hex text input
    below it in a row. Never put the label inline beside the boxes — labels
    sit **above** their inputs. Hex inputs need `aria-label="{label} hex"`
    (tests target this).
  - `Toggle`: checkbox with `accent-[#7b5cd6]`, label text follows.
  - `Panel`: white rounded card with an `h2` title.
- **Primary action style:** `bg-[#23234f]` pill/rounded-xl, hover
  `bg-[#7b5cd6]`, white text; disabled `bg-gray-300` + not-allowed cursor.
- **Accessibility:** inputs are wrapped in `<label>` with the visible label
  as text (screen readers + RTL both resolve via label). Errors show as
  inline text with `role="alert"`.
- **Copy tone:** short, benefit-first, no jargon, no exclamation marks
  ("Works forever", "Private by design"). Footer: tagline left,
  `FAQ` (→ `/#faq`) and `Contribute` (→ `https://github.com/izhekka/qr-code-generator`,
  exported as `CONTRIBUTE_URL`) right. The footer (`SiteFooter` in
  `app/layout.tsx`) is on every page.

## Testing conventions

- Every `lib/` module and every component has a colocated `*.test.ts(x)`.
  Coverage thresholds in `vitest.config.ts` must not regress — if a new
  browser-only helper is uncovered, structure it so the decision logic is
  testable.
- **Panels must render through `tests/harness.tsx` `PanelHarness`** (real
  `settingsReducer`), not a bare `dispatch: vi.fn()` — controlled inputs need
  state updates to accept typing.
- Prefer `userEvent` and `{backspace>N}text` patterns; assert with
  `toHaveBeenCalledWith(...)` (not `toHaveBeenLastCalledWith`).
  Disambiguate labels strictly, e.g. `getByLabel('Background color hex')`
  vs `'Background color'`.
- Prefer asserting on **composed artifacts** (`backgroundLayer(settings)`,
  `composeSvg(...)` output strings) and on **real pixels** (e2e uses pngjs
  sampling and jsQR decode of exported files) over screenshots.
- E2e specs live in `e2e/` (excluded from `tsconfig`); at least one e2e
  proves an export **scans** (decodes with `jsQR`).

## Git & release

- Work happens on a feature branch; finish by squash-merging to `main`
  (`git merge --squash` + one commit). `main` should always build and pass
  all tests.
- Commits: imperative subject ≤ 72 chars, body optional, ending with
  `Co-Authored-By: Claude Code <noreply@anthropic.com>`.
- `.gitignore` is sectioned (dependencies / build / test artifacts /
  `.vercel/` / caches / `docs/superpowers/` / IDE). `docs/` planning
  artifacts from superpowers sessions stay untracked; **this file
  (`docs/agents.md`) is tracked**.
- Deploy (Vercel): local tasks `npm run deploy` (production) and
  `npm run deploy:preview`; CI via `.github/workflows/deploy.yml` — auto runs
  on pushes to `main`, or manually (Actions → Deploy → Run workflow) with a
  branch input, `main` default. Chosen `main` → production, other branches →
  preview; unit tests run before every deploy. Needs repo secrets
  `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`. The site is fully
  static (no env vars). See the README *Deploy* section for setup steps.