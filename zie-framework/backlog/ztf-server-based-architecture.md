# ZTF Server-Based Architecture

## Problem

The AI Automated Testing Framework currently lacks a proper server-based architecture. Need to define the architecture for the server (Docker on VPS) and local agent (Mac/Windows) communication and workflow.

## Motivation

Zie wants a **lean + smart** testing framework where:
- LLM reads from Notion story → generates spec/TDD
- Test runs with Playwright → results sync back to Notion + Google Drive
- Server-controlled: Web UI (Docker on VPS) manages multiple local agents
- Multi-user support via Google OAuth
- No GitHub storage - all local execution with evidence in Google Drive
- QA workflow: Login → Project selection → Generate test → QA approve → Run test → Sync results

## Rough Scope

### In Scope

- **Server (Docker on VPS)**: WebSocket server, PostgreSQL DB, Google OAuth, Notion API sync
- **Agent (local)**: WebSocket client, Chrome/Playwright test execution, LLM generation (minimax-m2.5)
- **Communication**: Outbound WebSocket only (no port forwarding needed)
- **Auto-registration**: Agent auto-registers on first run
- **Google Drive**: Evidence storage (service account)
- **SDLC process**: backlog → spec → plan → implement → release → retro

### Out of Scope

- GitHub storage (all local)
- Port forwarding/firewall configuration
- Multi-browser support (Chrome only)
- Manual project setup (auto-configured)
