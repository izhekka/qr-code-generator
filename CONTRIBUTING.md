# Contributing to qr-generator

Thanks for wanting to contribute! This is a free, privacy-first QR-code
designer built as a **fully static** website — everything runs in the
browser: no backend, no tracking, no uploads. Contributions are welcome in
any size, from a typo fix to a new styling feature.

## Ground rules

A few constraints are non-negotiable — please keep your changes inside them:

- **Static only.** No API routes, no server-side rendering of the
  constructor, no backend, no analytics, no persistence. QR rendering,
  styling and export all happen client-side.
- **No login, no tracking, no uploads.** The landing page sells this
  privacy; don't add anything that contradicts it. (Exception: cookieless
  Vercel Web Analytics — aggregate page-view counts only, already shipped.)
- **A QR must always stay scannable.** Styling features must keep quiet
  zones and contrast sane.

See [`AGENTS.md`](AGENTS.md) for the full constraint list and
[`docs/README.md`](docs/README.md) for the project documentation map.

## Ways to contribute

### Quick fix — edit directly on GitHub

For typo fixes, doc improvements or one-file changes, open the file on
GitHub, click the pencil icon, make your change, and GitHub will guide you
through creating a pull request (it auto-forks the repo for you).

### Change — via your fork

For anything bigger:

1. [Fork](https://github.com/izhekka/qr-code-generator/fork) the repository.
2. Clone your fork and create a branch:
   ```bash
   git clone https://github.com/<your-username>/qr-code-generator.git
   cd qr-code-generator
   git checkout -b feature/my-change   # lowercase, hyphenated
   ```
3. Commit your work — subjects like `feat: …` / `fix: …` / `docs: …`
   (see [`docs/git-workflow.md`](docs/git-workflow.md) for details).
4. Push the branch to your fork and open a pull request against `main`.

### Regular contributors — direct clone

If you've been invited as a collaborator, you have write access:

1. Clone the repository directly —
   `https://github.com/izhekka/qr-code-generator.git` — and create a branch.
2. Push your branch to this repository (never to `main`).
3. Open a pull request from your branch.

## Review policy

Every change to this repository goes through a pull request reviewed by the
maintainer — `main` is protected, so no change merges without an approval.
Direct pushes to `main` are reserved for the maintainer.

## Local setup

```bash
npm install
npm run dev          # http://localhost:3000
```

Useful checks before you open a PR:

```bash
npm run test         # vitest unit + component tests
npm run build        # next build — also verifies static prerender
npm run e2e          # Playwright — includes a scannability check on exports
```

## Before you open a PR

- Keep it small and focused: one topic per pull request.
- Make sure `npm run test` and `npm run build` pass.
- Use lowercase, hyphenated branch names (`feature/…`, `fix/…`, `docs/…`).
- Describe what your change does and why in the PR description.
