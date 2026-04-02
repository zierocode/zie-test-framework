# Components Registry — zie-test-framework

**Last updated:** 2026-04-02

## Modules

| Module    | ทำอะไรว         | Dependencies       |
|-----------|------------------|--------------------|
| `server/` | WebSocket server | PostgreSQL, Google API|
| `agent/`  | Local test exec  | Playwright, minimax-m2.5|
| `tests/`  | Generated specs  | LLM output         |
| `evidence/`| Local artifacts | Google Drive API   |

## APIs / Interfaces

### WebSocket Protocol (Agent ↔ Server)

- `story:deliver` - Send story to agent
- `test:result` - Report test result
- `auth:challenge` - OAuth challenge

### Google Drive API

- Upload evidence files
- Retrieve existing evidence

### Notion API

- Read stories from database
- Update test results

## External Dependencies

| Dependency         | Purpose                |
|--------------------|------------------------|
| PostgreSQL         | Users, projects, stories|
| Google OAuth       | Multi-user auth        |
| Google Drive API   | Evidence storage       |
| Notion API         | Story sync             |
| minimax-m2.5:cloud| Test case generation   |
| Playwright         | Browser automation     |
