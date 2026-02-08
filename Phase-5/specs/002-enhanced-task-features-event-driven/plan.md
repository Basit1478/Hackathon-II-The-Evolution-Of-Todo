# Implementation Plan: Enhanced Task Features & Event-Driven Architecture

**Branch**: `002-enhanced-task-features-event-driven` | **Date**: 2026-02-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-enhanced-task-features-event-driven/spec.md`

## Summary

Extend the existing TaskMaster Pro AI application with enhanced task attributes (priority, tags, due_date, recurring, reminders), search/sort capabilities, and an event-driven architecture using Apache Kafka + Dapr. Add two new microservices (recurring-service, notification-service) as Kafka consumers. Deploy the full system on Minikube locally and DigitalOcean DOKS for production.

## Technical Context

**Language/Version**: Python 3.11 (backend, microservices), TypeScript 5 (frontend)
**Primary Dependencies**: FastAPI, SQLModel, OpenAI Agents SDK, Dapr SDK, Next.js 14, shadcn/ui, react-day-picker, date-fns
**Storage**: PostgreSQL (Neon, serverless) with ARRAY columns for tags/reminders
**Testing**: pytest (backend), contract tests for Kafka event schemas
**Target Platform**: Kubernetes (Minikube local, DigitalOcean DOKS production)
**Project Type**: Web application (backend + frontend + microservices)
**Performance Goals**: <500ms p95 API responses, <200ms Kafka event latency, <60s reminder delivery
**Constraints**: Backward compatible with existing Task model and MCP tools, stateless services, fire-and-forget event publishing
**Scale/Scope**: Single-user to multi-user, 5 existing MCP tools enhanced, 2 new microservices, ~15 files modified, ~10 files created

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-Driven Development | PASS | spec.md created before plan; plan.md before implementation |
| II. Stateless Architecture | PASS | All state in PostgreSQL; Kafka offsets broker-managed; services stateless |
| III. AI-Native Design | PASS | MCP tools extended with new fields; OpenAI Agents SDK unchanged |
| IV. Modern UI Standards | PASS | shadcn/ui components, Lucide icons, Tailwind, mobile-first, dark mode |
| V. Quality & Testing | PASS | Contract tests for Kafka schemas; acceptance criteria per user story |
| VI. Security & Performance | PASS | Dapr mTLS; parameterized queries; <500ms/<200ms targets |
| VII. Event-Driven Architecture | PASS | Kafka + Dapr pub/sub; CloudEvents format; idempotent consumers |
| VIII. Deployment & Infrastructure | PASS | Minikube local; DOKS production; Docker + Helm; IaC |

**Gate Result**: ALL PASS - proceed to implementation.

## Project Structure

### Documentation (this feature)

```text
specs/002-enhanced-task-features-event-driven/
├── plan.md              # This file
├── research.md          # Phase 0 output (10 research decisions)
├── data-model.md        # Phase 1 output (Task enhanced, TaskEvent, DeliveredReminder)
├── quickstart.md        # Phase 1 output (local dev + Minikube + DOKS)
├── contracts/
│   ├── tasks-api.yaml   # OpenAPI 3.1 for enhanced task endpoints
│   ├── events.yaml      # Kafka topic + CloudEvents schemas
│   └── mcp-tools.yaml   # Updated MCP tool schemas (5 tools)
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── models/
│   │   └── task.py              # MODIFY: Add priority, tags, due_date, recurring, reminders
│   ├── services/
│   │   ├── task_service.py      # MODIFY: Add search, sort, filter, new field support
│   │   └── event_service.py     # NEW: Dapr pub/sub event publisher
│   ├── routes/
│   │   └── tasks.py             # MODIFY: Add query params, new request/response fields
│   ├── mcp_server/
│   │   ├── tools/
│   │   │   ├── add_task.py      # MODIFY: Accept new fields
│   │   │   ├── list_tasks.py    # MODIFY: Accept search/sort/filter params
│   │   │   ├── update_task.py   # MODIFY: Accept new fields
│   │   │   ├── complete_task.py # MODIFY: Publish task-completed event
│   │   │   └── delete_task.py   # No change needed
│   │   └── agent_tools.py       # MODIFY: Update @function_tool signatures
│   └── config.py                # MODIFY: Add DAPR_HTTP_PORT, PUBSUB_NAME
├── Dockerfile                   # MODIFY: Add Dapr SDK dependency
└── requirements.txt             # MODIFY: Add dapr, httpx (for Dapr HTTP calls)

frontend/
├── src/
│   ├── components/
│   │   ├── tasks/
│   │   │   ├── task-card.tsx        # NEW: Task card with priority badge, tags, due date
│   │   │   ├── priority-badge.tsx   # NEW: Color-coded priority badge
│   │   │   ├── tag-chips.tsx        # NEW: Tag display with remove capability
│   │   │   ├── date-picker.tsx      # NEW: Calendar date picker (react-day-picker)
│   │   │   ├── search-bar.tsx       # NEW: Search input with real-time filtering
│   │   │   └── sort-controls.tsx    # NEW: Sort dropdown (date/priority/name)
│   │   └── dashboard/
│   │       └── tasks/
│   │           └── page.tsx         # MODIFY: Integrate new task components
│   ├── lib/api/
│   │   └── task.ts                  # MODIFY: Add new fields + query params
│   └── types/
│       └── task.ts                  # NEW: Task type with new fields
├── package.json                     # MODIFY: Add react-day-picker, date-fns

services/
├── recurring-service/
│   ├── app/
│   │   ├── main.py              # NEW: FastAPI app with Dapr subscription endpoint
│   │   └── config.py            # NEW: Service config
│   ├── Dockerfile               # NEW: Python 3.11 slim
│   └── requirements.txt         # NEW: fastapi, uvicorn, httpx
└── notification-service/
    ├── app/
    │   ├── main.py              # NEW: FastAPI app with scheduled reminder check
    │   └── config.py            # NEW: Service config
    ├── Dockerfile               # NEW: Python 3.11 slim
    └── requirements.txt         # NEW: fastapi, uvicorn, httpx

dapr/
└── components/
    └── pubsub.yaml              # NEW: Kafka pub/sub component definition

k8s/
├── backend.yaml                 # MODIFY: Add Dapr annotations
├── frontend.yaml                # No change
├── postgres.yaml                # No change
├── recurring-service.yaml       # NEW: Deployment + Service with Dapr annotations
├── notification-service.yaml    # NEW: Deployment + Service with Dapr annotations
└── kafka.yaml                   # NEW: Kafka Helm values or manifest reference

helm/
└── values.yaml                  # NEW: Centralized Helm values for all services
```

**Structure Decision**: Web application structure (backend/ + frontend/) extended with services/ directory for new microservices, dapr/ for component configs, and updated k8s/ for Kubernetes manifests.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Two additional microservices (recurring-service, notification-service) | Constitution VII mandates event-driven architecture with decoupled consumers | Embedding recurring/reminder logic in main backend couples concerns and violates stateless + event-driven principles |
| Dapr sidecar runtime | Constitution VII mandates Dapr for pub/sub and service invocation | Direct Kafka client is simpler but constitution explicitly requires Dapr |
| Kafka infrastructure | Constitution VII mandates Kafka as event backbone | In-process event bus is simpler but doesn't support multi-service architecture or persistence |
