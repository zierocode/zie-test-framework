# zie-test-framework

AI Automated Testing Framework - Server-Based Architecture

## Tech Stack

- **Runtime**: Node.js / TypeScript
- **Test runner**: vitest

## Build Commands

```bash
make test-unit        # unit tests
make test             # full suite
make push m="msg"     # commit + push
make start            # start dev server
make deploy ENV=prod  # deploy to prod
```

## Key Rules

- Only commit when explicitly asked
- Read before edit
- Zero-error policy - proofread before delivering
- Confirm before destructive ops
- Update docs when behavior changes
- Security - never expose secrets
- CLAUDE.md missing - create it first

## SDLC State

Managed by zie-framework — see `zie-framework/ROADMAP.md` for current backlog.
