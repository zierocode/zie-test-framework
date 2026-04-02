# ROADMAP — zie-test-framework

> Single source of truth for what's being built and why.
> Updated by /zie-idea (Next), /zie-plan (Ready), /zie-build (Now),
> /zie-ship (Done), /zie-retro (reprioritization).

---

## Ready — Approved Plans

<!-- Plans approved by Zie, ready to build. Pull into Now when slot is free. -->

- [x] ZTF Server-Based Architecture — [plan](plans/2026-04-02-ztf-server-based-architecture.md)

---

## Now — Active Sprint

<!-- Current feature in progress. One at a time (WIP=1). -->

- [x] ZTF Server-Based Architecture —
  [spec](specs/2026-04-02-ztf-server-based-architecture-design.md)
  [plan](plans/2026-04-02-ztf-server-based-architecture.md) ✓ completed

---

## Next — Prioritized Backlog

<!-- Ready to start. Ordered by priority. -->

- [ ] ZTF Server-Based Architecture — [backlog](backlog/ztf-server-based-architecture.md)

---

## Later — Someday / Maybe

<!-- Good ideas, not yet prioritized. -->

- [ ] (ideas that need more thought before committing)

---

## Done

<!-- Completed items. Never delete — this is history. -->

- [x] Project initialized with zie-framework — 2026-04-02
- [x] ZTF Server-Based Architecture — 2026-04-02 (Tasks 1-8)

## Summary: ZTF Server-Based Architecture

- **Server**: NestJS + PostgreSQL + WebSocket + REST API + Google OAuth +
  Notion API + Google Drive
- **Agent SDK**: Shared utilities (`@zie/agent`)
- **Agent App**: CLI with Playwright + LLM integration
- **Deployment**: Docker + CI/CD pipeline

All 25 tests pass. TypeScript builds successfully.

---

## Icebox — Deliberately Deferred

<!-- Good ideas explicitly put on hold. Include reason. -->

<!-- reason: needs more research / out of scope for now / dependency on X -->
