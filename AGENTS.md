# qr-generator — agent guide

A free, privacy-first QR-code designer built as a **fully static** website.
Users pick content, choose a sticker frame, style the pattern, corners and
logo, and download PNG/SVG — all rendered client-side. The landing page
sells "Works forever, Private by design": no login, no tracking, no server.
Read [`docs/README.md`](docs/README.md) for the full documentation map.

## Hard constraints (never violate)

- **Static-only site.** No API routes, no server-side rendering of the
  constructor, no backend, no analytics, no persistence. Everything (QR
  rendering, styling, export) happens in the browser. Pages are statically
  prerendered by Next.js.
- **No login, no tracking, no uploads.** The landing page sells this privacy;
  don't add anything that contradicts it. Exception: cookieless Vercel Web
  Analytics (aggregate page-view counts only — no cookies, no personal data,
  QR content never leaves the browser). Any other analytics or tracking is
  forbidden.
- **Exactly two pages:** the landing `/` and the QR constructor
  `/builder-static`. New features belong inside one of them.
- **Never name an app route after an `Object.prototype` property**
  (`constructor`, `hasOwnProperty`, `toString`, …) — the Vercel Next builder
  crashes on such route names (`Unsupported output type: "undefined"`). This
  is why the second page is `/builder-static`, not `/constructor`.
- **A QR must always stay scannable.** Any styling feature must keep quiet
  zones and contrast sane (e.g. logo implies error-correction level `H`, see
  `buildQrConfig`).

## Working mode: ponytail (always on)

Every change request — implementation, fix, refactor, review, dependency
choice — is scoped with [`docs/ponytail.md`](docs/ponytail.md): the smallest
change that fully solves the task. Applies without being asked; default
level `full`, the user may request `lite`/`ultra`. It governs how much code
to write, not how work is gated — the branch/review/landing flow still
applies, and its "never cut" list wins when minimalism collides with any
of its protected items.

## Documentation map

- [`docs/README.md`](docs/README.md) — routing file: what to read, and when.
- [`docs/ponytail.md`](docs/ponytail.md) — standing working mode, applied
  to every change (see above).
- [`docs/architecture.md`](docs/architecture.md) — tech stack, data flow,
  composition model, sticker system.
- [`docs/development.md`](docs/development.md) — commands, code style,
  UX/UI conventions, testing.
- [`docs/git-workflow.md`](docs/git-workflow.md) — branches, commits, deploy.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
