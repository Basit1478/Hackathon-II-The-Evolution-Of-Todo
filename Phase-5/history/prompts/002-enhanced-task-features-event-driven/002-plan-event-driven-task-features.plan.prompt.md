---
id: PHR-004
title: plan-event-driven-task-features
stage: plan
date: 2026-02-07
surface: claude-code
model: claude-opus-4-6
feature: 002-enhanced-task-features-event-driven
branch: master
user: basit_ali
command: /sp.plan
labels: [plan, kafka, dapr, priority, tags, due-date, recurring, reminders, minikube, doks, microservices]
links:
  spec: specs/002-enhanced-task-features-event-driven/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - specs/002-enhanced-task-features-event-driven/plan.md
  - specs/002-enhanced-task-features-event-driven/research.md
  - specs/002-enhanced-task-features-event-driven/data-model.md
  - specs/002-enhanced-task-features-event-driven/quickstart.md
  - specs/002-enhanced-task-features-event-driven/contracts/tasks-api.yaml
  - specs/002-enhanced-task-features-event-driven/contracts/events.yaml
  - specs/002-enhanced-task-features-event-driven/contracts/mcp-tools.yaml
tests:
  - N/A
---

## Prompt

User invoked `/sp.plan` with input:

```
- backend: models update, Dapr events
- frontend: UI add (dropdowns, search)
- helm: new services, envs
- dapr: pubsub.yaml
- test local -> deploy DO
```

## Response snapshot

Generated complete implementation plan with Phase 0 and Phase 1 artifacts:

**Phase 0 - Research (research.md)**: 10 research decisions covering PostgreSQL ARRAY columns, enum storage, Dapr pub/sub with Kafka, CloudEvents format, recurring-service architecture, notification-service architecture, Minikube+Dapr setup, DOKS deployment, react-day-picker for calendar, and ILIKE search.

**Phase 1 - Design**:
- **data-model.md**: Enhanced Task entity (5 new fields: priority, tags, due_date, recurring, reminders), TaskEvent (CloudEvents transient), DeliveredReminder (in-memory). Migration SQL for adding columns with defaults.
- **contracts/tasks-api.yaml**: OpenAPI 3.1 with enhanced CRUD + search/sort/filter query params.
- **contracts/events.yaml**: 3 Kafka event types (tasks.created, tasks.updated, tasks.completed) + reminder.due on 2 topics. Dapr component reference.
- **contracts/mcp-tools.yaml**: All 5 MCP tools updated with new field support.
- **quickstart.md**: Local dev, Minikube deployment, and DOKS production deployment instructions.

**plan.md**: Full project structure showing ~15 modified files and ~10 new files across backend, frontend, services, dapr, and k8s directories. Constitution check passed all 8 principles.

## Outcome

- Impact: Complete implementation plan with 7 artifacts ready for /sp.tasks
- Tests: N/A (plan phase)
- Files: 7 files created in specs/002-enhanced-task-features-event-driven/
- Next prompts: /sp.tasks to generate task list from plan artifacts
- Reflection: Thorough codebase exploration was critical - discovered existing models, MCP tools, K8s manifests, and Dockerfiles that inform the incremental approach

## Evaluation notes (flywheel)

- Failure modes observed: PowerShell scripts unavailable on WSL2 - used manual fallback
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
