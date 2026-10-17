# Docs map — what to read, and when

This is the routing file for agent-facing documentation. The project
description and hard constraints live in the root `AGENTS.md` (all providers
read that single canonical file; Claude Code additionally imports it from its
root `CLAUDE.md`).

| File | Read before… |
|---|---|
| [`../AGENTS.md`](../AGENTS.md) | **Always** — project description + hard constraints that may never be violated. |
| [`ponytail.md`](ponytail.md) | **Always** — the standing working mode applied to every change request; default level `full`. |
| [`architecture.md`](architecture.md) | Touching anything under `lib/`, the rendering pipeline, or the sticker system. |
| [`development.md`](development.md) | Writing or changing any code — commands, style, UX/UI conventions, testing. |
| [`git-workflow.md`](git-workflow.md) | Committing, landing a branch, or deploying. |

Start here when the task touches more than one area: read this table, open
the files the task spans, then begin on a feature branch
(see [`git-workflow.md`](git-workflow.md)).