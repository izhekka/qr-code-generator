# Git & release

Read before committing, landing a branch, or deploying. Project description
and hard constraints are in the root `AGENTS.md`; day-to-day rules are in
[`development.md`](development.md) and [`architecture.md`](architecture.md).

## Branches & landing

- Work happens on a feature branch; finish by squash-merging to `main`
  (`git merge --squash` + one commit). `main` should always build and pass
  all tests.
- Commits: imperative subject ≤ 72 chars, body optional, ending with
  `Co-Authored-By: Claude Code <noreply@anthropic.com>`.
- `.gitignore` is sectioned (dependencies / build / test artifacts /
  `.vercel/` / `.env*` / caches / `docs/superpowers/` / IDE). `docs/` planning
  artifacts from superpowers sessions stay untracked; the docs listed in
  [`README.md`](README.md) plus the root `AGENTS.md`/`CLAUDE.md` are tracked.
- If a future Next.js upgrade rotates the managed block in root `AGENTS.md`,
  re-verify the committed block matches what `next dev` generates (extract
  the block, diff against `buildAgentRulesBlock()` in
  `node_modules/next/dist/server/lib/generate-agent-files.js`) — otherwise
  `next dev` re-creates an uncommitted diff.

## Deploy (Vercel)

- Local tasks: `npm run deploy` (production) and `npm run deploy:preview`.
- CI via `.github/workflows/deploy.yml`: auto runs on pushes to `main`, or
  manually (Actions → Deploy → Run workflow) with a branch input, `main`
  default. Chosen `main` → production, other branches → preview; unit tests
  run before every deploy.
- Needs repo secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
  The site is fully static (no env vars). See the root `README.md`
  *Deploy* section for setup steps.
