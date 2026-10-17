# Development guide — commands, style, UX/UI, testing

Read before writing or changing any code. Project description and hard
constraints are in the root `AGENTS.md`; the stack and the rendering
pipeline are in [`architecture.md`](architecture.md); landing and deploy
rules are in [`git-workflow.md`](git-workflow.md).

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