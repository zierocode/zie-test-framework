# ZTF Server-Based Architecture Design

**Status:** APPROVED  
**Date:** 2026-04-02  
**Author:** Phoo Pha  
**Approver:** Zie  
**LLM Model:** qwen3-coder-next:cloud (Ollama Cloud)  

---

## 1. Problem & Motivation

### Problem
The AI Automated Testing Framework currently lacks a proper server-based architecture. Multiple local agents need coordinated execution management with centralized orchestration.

### Motivation
Zie wants a **lean + smart** testing framework where:
- LLM reads from Notion story → generates spec/TDD
- Test runs with Playwright → results sync back to Notion + Google Drive
- Server-controlled: Web UI (Docker on VPS) manages multiple local agents
- Multi-user support via Google OAuth
- No GitHub storage - all local execution with evidence in Google Drive
- QA workflow: Login → Project selection → Generate test → QA approve → Run test → Sync results

---

## 2. Architecture & Components

### High-Level Diagram
```
┌──────────────────────────────────────────────────────────────────────────┐
│                            VPS (Docker)                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  API Server (NestJS/Express)                                         │ │
│  │  - REST API for Admin Panel                                          │ │
│  │  - Job creation endpoints                                            │ │
│  │  - Agent status endpoints                                            │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  WebSocket Server (ws)                                               │ │
│  │  - Agent registration & heartbeat                                    │ │
│  │  - Job dispatch to agents                                            │ │
│  │  - Real-time result streaming                                        │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌──────────────────┐  │
│  │  PostgreSQL         │  │  Google OAuth       │  │  Notion API      │  │
│  │  - agents           │  │  - users            │  │  - stories       │  │
│  │  - jobs             │  │  - sessions         │  │  - test results  │  │
│  │  - results          │  │  - projects         │  │  - sync logs     │  │
│  │  - agent_jobs (join)│  │  - api_keys         │  │                  │  │
│  └─────────────────────┘  └─────────────────────┘  └──────────────────┘  │
│  ┌─────────────────────┐                                                 │
│  │  Google Drive Store │                                                 │
│  │  - test evidence    │                                                 │
│  │  - screenshots      │                                                 │
│  │  - video recordings │                                                 │
│  └─────────────────────┘                                                 │
└──────────────────────────────────────────────────────────────────────────┘
            ↑                      ↑                   ↑
            │                      │                   │
       [Outbound]             [Outbound]          [Outbound]
            │                      │                   │
┌───────────┴─────────┐  ┌────────┴─────────┐  ┌─────┴────────────┐
│   Agent 1 (Mac)     │  │  Agent 2 (Win)   │  │  Agent 3 (Mac)   │
│  ┌────────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │
│  │ Chrome/Playwright│ │  │ Chrome/Playwright│ │  │ Chrome/Playwright│ │
│  │ - Test execution │ │  │ - Test execution │ │  │ - Test execution │ │
│  │ - LLM generation │ │  │ - LLM generation │ │  │ - LLM generation │ │
│  │   (qwen3-coder-next:cloud) │ │  │   (qwen3-coder-next:cloud) │ │  │   (qwen3-coder-next:cloud) │ │
│  └────────────────┘ │  │ └──────────────┘ │  │ └──────────────┘ │
│  ┌────────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │
│  │ Google Drive   │ │  │ Google Drive   │ │  │ Google Drive   │ │
│  │ - evidence     │ │  │ - evidence     │ │  │ - evidence     │ │
│  │ - screenshots  │ │  │ - screenshots  │ │  │ - screenshots  │ │
│  └────────────────┘ │  │ └──────────────┘ │  │ └──────────────┘ │
└─────────────────────┘  └──────────────────┘  └──────────────────┘
```

### Component Details

#### Server Components

| Component | Tech | Purpose |
|-----------|------|---------|
| **WebSocket Server** | `ws` + `ws-server` | Agent communication, job dispatch |
| **HTTP API** | NestJS/Express | Admin panel, job creation, status |
| **PostgreSQL** | TypeORM | Persistent state: agents, jobs, results |
| **Google OAuth** | `google-auth-library` | User authentication |
| **Notion API** | `@notionhq/client` | Story reading, result sync |
| **Google Drive** | `googleapis` | Evidence storage (screenshots, videos) |

#### Agent Components

| Component | Tech | Purpose |
|-----------|------|---------|
| **WebSocket Client** | `ws` | Connect to server, receive jobs |
| **Chrome/Playwright** | `playwright-chromium` | Test execution |
| **LLM Client** | `ollama-cloud` | Generate test specs from stories (model: qwen3-coder-next:cloud) |
| **Google Drive Uploader** | `googleapis` | Upload evidence to Drive |

---

## 3. Data Flow

### Agent Registration Flow
```
Agent Start
    ↓
WebSocket Connect to Server (outbound)
    ↓
Send: { type: "register", agentId, hostname, capabilities }
    ↓
Server validates/creates agent record
    ↓
Send: { type: "registered", agentId, status: "idle" }
    ↓
Agent enters idle state, waits for jobs
```

### Job Execution Flow
```
Admin creates job via REST API
    ↓
Server: INSERT INTO jobs (status = 'pending')
    ↓
WebSocket broadcast: { type: "job_available", jobId, payload }
    ↓
Agent (idle) picks up job
    ↓
Agent sends: { type: "job_claimed", jobId }
    ↓
Server: UPDATE jobs SET status='running', agent_id=?
    ↓
Agent executes: Chrome/Playwright tests
    ↓
Agent streams: { type: "progress", jobId, step, message }
    ↓
Agent completes: { type: "result", jobId, status, results }
    ↓
Server: UPDATE jobs SET status='completed'
Server: Sync results to Notion via Notion API
Server: Upload evidence to Google Drive
```

### Bidirectional Communication

| Direction | Message Type | Payload Fields |
|-----------|--------------|----------------|
| Agent → Server | `register` | agentId, hostname, capabilities |
| Agent → Server | `heartbeat` | agentId, timestamp |
| Agent → Server | `job_claimed` | jobId |
| Agent → Server | `progress` | jobId, step, message, percentage |
| Agent → Server | `result` | jobId, status, screenshots[], notes |
| Server → Agent | `registered` | agentId, status |
| Server → Agent | `job_available` | jobId, storyUrl, projectConfig |
| Server → Agent | `job_cancelled` | jobId, reason |
| Server → Agent | `job_result` | jobId, results (broadcast to all) |

---

## 4. Edge Cases

| Scenario | Handling |
|----------|----------|
| **Agent disconnect mid-job** | Job marked `failed`, marked for retry, results lost (expected) |
| **Server restart during job** | Jobs in `running` state marked `failed` on startup |
| **Agent reconnects with same ID** | Server merges session, clears old connections |
| **Multiple agents for same job** | First claim wins, others ignore |
| **Notion sync fails** | Retry 3x, then mark job as `completed_with_errors` |
| **Google Drive upload fails** | Retry 3x, store locally as fallback |
| **LLM generation timeout** | Mark job `failed`, log error, notify admin |

---

## 5. Out of Scope

- GitHub storage (all local with Google Drive evidence)
- Port forwarding/firewall configuration
- Multi-browser support (Chrome only)
- Manual project setup (auto-configured)
- Kubernetes orchestration (Docker on VPS only)
- Multi-tenant isolation (single workspace)
| **Manual project setup** | Auto-configured |
| Kubernetes orchestration | Docker on VPS only |
| Multi-tenant isolation | Single workspace |

---

## 6. Next Steps (After Approval)

1. **Create spec review** - `/zie-spec` in project channel
2. **Draft implementation plan** - `/zie-plan` with task breakdown
3. **Set up server repo** - Bootstrap NestJS + PostgreSQL structure
4. **Agent SDK** - Create `@zie/test-agent` npm package
5. **Admin UI** - Simple React dashboard for job management

---

## Approval Record

| Phase | Date | Status | Approver |
|-------|------|--------|----------|
| Draft | 2026-04-02 | Created | Phoo Pha |
| Review | - | Awaiting | - |
| Approved | - | - | - |
| Implementation | - | - | - |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-02 | Phoo Pha | Initial draft |
