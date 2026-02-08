<!--
  SYNC IMPACT REPORT
  ==================
  Version change: 1.0.0 -> 1.1.0

  Modified principles:
    - II. Stateless Architecture: Added Kafka consumer offset rule
    - V. Quality & Testing: Added event-driven contract test rule
    - VI. Security & Performance: Added Kafka latency target and
      Dapr mTLS requirement

  Added sections:
    - VII. Event-Driven Architecture (Kafka + Dapr)
    - VIII. Deployment & Infrastructure (Minikube / DOKS)
    - Task Features section (priority, tags, due_date, recurring,
      reminders)
    - Tech Stack entries: Kafka, Dapr, Docker, Minikube, DOKS

  Removed sections: None

  Templates status:
    - .specify/templates/plan-template.md: ✅ Compatible; Constitution
      Check section is generic and will inherit updated principles
    - .specify/templates/spec-template.md: ✅ Compatible; user stories
      and requirements align; new task features appear in specs
    - .specify/templates/tasks-template.md: ✅ Compatible; TDD workflow
      and phases align; event-driven tasks fit Phase 2 foundational
    - .specify/templates/phr-template.prompt.md: ✅ Compatible; no
      constitution-specific references needed

  Follow-up TODOs: None
-->

# TaskMaster Pro AI Constitution

## Core Principles

### I. Spec-Driven Development

All implementation MUST follow the Spec-Driven Development (SDD)
methodology:
- All code is generated via Claude Code - no manual coding allowed
- Specifications MUST be created before any implementation begins
- Every feature requires: spec.md -> plan.md -> tasks.md workflow
- Changes to implementation require spec updates first

**Rationale**: Ensures traceability, consistency, and AI-generated
code quality by maintaining a clear chain from requirements to
implementation.

### II. Stateless Architecture

The system MUST maintain zero server-side memory:
- All application state MUST be persisted in PostgreSQL (Neon)
- Backend services MUST be stateless and horizontally scalable
- Session data MUST be stored in the database, not in-memory
- No reliance on server-local storage or caching without database
  backing
- Kafka consumer offsets MUST be managed by the broker, not
  application state

**Rationale**: Enables horizontal scaling, simplifies deployment
to Kubernetes, and ensures reliability across multiple pod replicas.

### III. AI-Native Design

The application is built around AI-first interaction patterns:
- Primary user interface MUST be natural language chat
- Backend MUST use MCP (Model Context Protocol) tools for task
  operations
- AI orchestration MUST use OpenAI Agents SDK
- All AI interactions MUST be logged for conversation persistence

**Rationale**: Leverages modern AI capabilities to provide intuitive
task management through natural language.

### IV. Modern UI Standards

The frontend MUST adhere to these design requirements:
- UI framework: Tailwind CSS 3.4+ with shadcn/ui components
- Icons: Lucide React exclusively
- Responsive: Mobile-first design approach
- Theme: Dark mode support required
- Typography: Inter Variable font family
- Design tokens: Follow the Design System color palette defined below

**Rationale**: Ensures consistent, accessible, and modern user
experience across all devices.

### V. Quality & Testing

Code quality gates MUST be enforced:
- All user-facing features MUST have acceptance criteria before
  implementation
- Integration tests MUST cover API contracts and MCP tool interactions
- Event-driven flows MUST have contract tests verifying Kafka message
  schemas
- Error handling MUST be explicit with user-friendly messages
- Logging MUST capture all significant operations for debugging

**Rationale**: Maintains reliability and enables rapid debugging of
AI-driven and event-driven workflows.

### VI. Security & Performance

Non-functional requirements MUST be met:
- Authentication MUST use Better Auth with secure session management
- API endpoints MUST validate input and sanitize output
- Database queries MUST use parameterized statements (no raw SQL
  interpolation)
- Response times SHOULD target <500ms p95 for chat interactions
- Kafka event processing latency SHOULD target <200ms p95
- All inter-service communication via Dapr MUST use mTLS

**Rationale**: Protects user data, ensures responsive AI interactions,
and secures event-driven communication channels.

### VII. Event-Driven Architecture

The system MUST use an event-driven architecture for decoupled
communication:
- Apache Kafka MUST be the event backbone for all async operations
- Dapr MUST be used as the sidecar runtime for pub/sub, state
  management, and service invocation
- Events MUST follow a documented schema (CloudEvents format)
- Producers MUST NOT depend on consumer availability
- Idempotent consumers MUST be guaranteed; duplicate events MUST NOT
  cause data corruption
- Event topics MUST be namespaced by domain (e.g., `tasks.created`,
  `tasks.updated`, `reminders.due`)

**Rationale**: Decouples services for independent scaling, enables
reliable async processing (reminders, recurring tasks), and provides
an audit trail of all state changes.

### VIII. Deployment & Infrastructure

The system MUST support a progressive deployment path:
- Local development MUST use Minikube with Dapr-enabled Kubernetes
  cluster
- Production deployment MUST target DigitalOcean DOKS (managed
  Kubernetes)
- All services MUST be containerized with Docker and orchestrated via
  Kubernetes manifests or Helm charts
- Infrastructure MUST be defined as code (Kubernetes YAML or Helm)
- CI/CD pipeline MUST automate build, test, and deploy to DOKS
- Health checks and readiness probes MUST be defined for all services

**Rationale**: Ensures reproducible environments from local
development to production, leverages managed Kubernetes for
operational simplicity, and enforces infrastructure-as-code discipline.

## Task Features

The todo application MUST support the following task attributes:

| Feature | Type | Description |
|---------|------|-------------|
| Priority | enum (low, medium, high, urgent) | Task urgency level |
| Tags | string[] | User-defined labels for categorization |
| Due Date | datetime | Deadline for task completion |
| Recurring | cron/interval | Repeating task schedule |
| Reminders | datetime[] | Notification triggers before due date |

- Priority MUST be filterable and sortable in both UI and API
- Tags MUST support creation, assignment, and filtering
- Due dates MUST display relative time and support timezone awareness
- Recurring tasks MUST auto-generate next instance upon completion
  via Kafka event
- Reminders MUST be processed by a dedicated Kafka consumer and
  delivered to the user

## Tech Stack

| Layer | Technology | Version/Notes |
|-------|-----------|---------------|
| Frontend | Next.js | 15.x |
| UI Components | shadcn/ui | Latest |
| Styling | Tailwind CSS | 3.4+ |
| Icons | Lucide React | Latest |
| Backend | FastAPI | Latest |
| AI Orchestration | OpenAI Agents SDK | Latest |
| MCP | Official MCP SDK | Latest |
| Database | Neon PostgreSQL | Serverless |
| Authentication | Better Auth | Latest |
| Event Streaming | Apache Kafka | 3.x (KRaft mode) |
| Sidecar Runtime | Dapr | 1.x |
| Container Runtime | Docker | Latest |
| Local K8s | Minikube | Latest |
| Production K8s | DigitalOcean DOKS | Managed |

**Stack Mandate**: Deviations from this stack require explicit
justification and ADR documentation.

## Design System

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Primary | indigo-500 | Actions, links, focus states |
| Secondary | slate-700 | Text, borders, subtle elements |
| Success | emerald-500 | Confirmations, completed states |
| Error | rose-500 | Errors, destructive actions |

### Typography

- **Font Family**: Inter Variable
- **Scale**: xs (12px), sm (14px), base (16px), lg (18px), xl (20px)
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

## Success Criteria

The following MUST be achieved for project completion:

- [ ] **MCP Tools**: 5+ MCP tools fully operational (create, read,
  update, delete, list tasks) with priority, tags, and due date
  support
- [ ] **Natural Language**: Chat interface processes natural language
  task commands via OpenAI Agents SDK
- [ ] **Conversation Persistence**: Full conversation history stored
  and retrievable
- [ ] **Task Features**: Priority, tags, due dates, recurring tasks,
  and reminders all functional
- [ ] **Event-Driven**: Kafka topics active for task lifecycle events,
  reminders, and recurring task generation
- [ ] **Dapr Integration**: Pub/sub and service invocation working
  via Dapr sidecars
- [ ] **Responsive UI**: Functional on mobile (375px+) through
  desktop (1920px+)
- [ ] **Local Deploy**: Application runs on Minikube with all
  services healthy
- [ ] **Production Deploy**: Application deployed to DigitalOcean
  DOKS and accessible via public URL

## Governance

### Amendment Process

1. Proposed changes MUST be documented with rationale
2. Changes affecting core principles require team review
3. All amendments MUST update the version and Last Amended date
4. Migration plan required for breaking changes

### Versioning Policy

- **MAJOR**: Removal or redefinition of core principles
- **MINOR**: Addition of new principles or sections
- **PATCH**: Clarifications, typo fixes, non-semantic updates

### Compliance

- All PRs MUST verify compliance with this constitution
- Code reviews MUST check adherence to Tech Stack and Design System
- Event schema changes MUST be backward-compatible or versioned
- Complexity beyond these guidelines MUST be justified in ADRs

**Version**: 1.1.0 | **Ratified**: 2026-01-18 | **Last Amended**: 2026-02-07
