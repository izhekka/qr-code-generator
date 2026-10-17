---
name: superpowers-wrapper
description: Use when the user requests any change in this repo — feature, bugfix, docs edit, config change, or trivial one-liner — before any action, exploration, or question about that change. Also use before reviewing finished work, before landing a branch, and whenever the session will touch files while main is checked out
---

# Superpowers Wrapper

## Overview

Repo-wide change discipline for this repository. Every change request — code, docs, config, one-line typo — goes through the six phases below, in order. **Violating the letter of these phases is violating their spirit.** Phase preconditions make re-entry safe: resume at the first phase whose precondition holds.

## Phase 0 — Branch guard (before prompts, reads, or questions)

```bash
git branch --show-current
```

- On `main`: `git checkout -b feature/<topic>` — lowercase, hyphenated, derived from the request. Uncommitted work on `main` carries over.
- Not on `main`: continue on that branch; note its name.
- A previous session left a feature branch for this work? Continue it — never stack a new one.

## Phase 1 — Kick off the process (before any file read, edit, or clarifying question)

Precondition: Phase 0 done.

A process skill runs on every change. The change type picks WHICH, never WHETHER:

- Features, components, behavior changes → `superpowers:brainstorming` → spec → `superpowers:writing-plans`.
- Bugs, unexpected behavior → `superpowers:systematic-debugging`.
- Mechanical edits (typo, one-line docs, config) → you may conclude no process skill applies — but only here, inside Phase 1, after the branch guard, by naming which skills you checked. Deciding this silently anywhere else is a violation.

## Phase 2 — Implement

Precondition: a plan (or debugging direction) exists.

- `superpowers:test-driven-development`: failing test first, minimal code to pass.
- Read the pass/fail line before committing (`make test`; web suite: `npm test` in `apps/web`). Never chain test and commit in one compound command.
- One commit per task; subjects `feat:` / `fix:` / `docs:`; attribution trailer per session convention.

## Phase 3 — Code-review gate

Precondition: implementation complete, tests green.

- `superpowers:requesting-code-review` on the branch's diff; resolve findings via `superpowers:receiving-code-review`, then re-review. "Implementation finished" means this gate passed.

## Phase 4 — Landing decision (HARD STOP — always ask)

Precondition: Phase 3 clean.

Never land or delete a branch automatically. STOP and present the finished,
reviewed branch to the user, asking how they want to proceed:

- **Squash-land into `main` now** (then run Phase 5 immediately)
- **Keep the branch** for manual review — push it and open a PR, or leave it
  local; do NOT touch `main`.

Only the user's explicit answer lands. If they choose to keep/PR, stop here:
`main` stays untouched, the branch stays alive, and the session may end —
resume later at this phase. The branch is deleted only after the user chose
the squash landing AND the push of Phase 5 succeeded.

## Phase 5 — Squash-only landing

Precondition: the user chose squash-landing in Phase 4.

The only sanctioned landing into `main`:

```bash
git checkout main
git merge --squash <branch>
git commit -m "<landed message summarizing the task commits>"
git push origin main
git branch -D <branch>
```

Forbidden for landing into `main`: plain `git merge`, `git rebase`, PR-button merges. Push rejected because the remote advanced: refresh `main`, rebase the *feature branch* onto it, re-run tests, redo Phase 3 for the delta, retry the squash.

## Red Flags — STOP

- "It's just docs / a typo — no skill needed" → that call lives in Phase 1, not as an excuse to skip it
- "I'll branch right before committing" → the guard runs at request time
- "Review can wait until after merge" or skipping re-review after fixing findings
- Merging or rebasing a feature branch into `main` directly
- Landing, pushing, or deleting a branch without the user's explicit Phase 4 choice — "the process says I land when done" is never authorization

| Rationalization | Reality |
|---|---|
| "Docs/config tweak — no process skill applies" | Maybe — but that judgment is made in Phase 1, explicitly, after the guard |
| "I already know the change is trivial" | Triviality changes which skills run, not whether Phase 0/1 do |
| "Review after merging is fine" | Squash landing is Phase 5 and only reachable from the Phase 4 user gate |
| "Rebase / PR merge is cleaner here" | Landing into `main` stays squash-only (Phase 5), but ONLY after the user chose it in Phase 4 |
| "Tests are green — landing is the obvious next step" | Green tests trigger the Phase 4 question, not the landing |