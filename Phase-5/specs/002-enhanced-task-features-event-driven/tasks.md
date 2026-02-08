# Tasks: Enhanced Task Features & Event-Driven Architecture

**Input**: Design documents from `/specs/002-enhanced-task-features-event-driven/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in feature specification. Test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Project initialization, dependency installation, infrastructure configuration

- [ ] T001 Add `dapr`, `httpx` to `backend/requirements.txt` and install dependencies
- [ ] T002 [P] Install `react-day-picker` and `date-fns` in `frontend/package.json` via `npm install react-day-picker date-fns`
- [ ] T003 [P] Create Dapr pub/sub component file at `dapr/components/pubsub.yaml` configuring Kafka broker per contracts/events.yaml
- [ ] T004 [P] Add `DAPR_HTTP_PORT` (default 3500) and `PUBSUB_NAME` (default "taskmaster-pubsub") settings to `backend/app/config.py`
- [ ] T005 [P] Create Task TypeScript type definition at `frontend/src/types/task.ts` with priority, tags, due_date, recurring, reminders fields matching contracts/tasks-api.yaml TaskResponse schema

**Checkpoint**: All dependencies installed, config ready, Dapr component defined.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Extend Task model in `backend/app/models/task.py`: add `priority` (VARCHAR, default "medium", indexed), `tags` (ARRAY(String), default []), `due_date` (DateTime(timezone=True), nullable, indexed), `recurring` (VARCHAR, nullable), `reminders` (ARRAY(DateTime(timezone=True)), default []). Add GIN index on tags. Use `sa_column=Column(...)` for ARRAY types per research R1.
- [ ] T007 Create Alembic migration for new Task columns in `backend/` by running `alembic revision --autogenerate -m "add_priority_tags_duedate_recurring_reminders"` and verify generated SQL matches data-model.md migration strategy
- [ ] T008 Update `TaskCreateRequest` and `TaskUpdateRequest` in `backend/app/routes/tasks.py`: add optional `priority`, `tags`, `due_date`, `recurring`, `reminders` fields with Pydantic validation (priority enum, tags max 20 items, tag max 50 chars)
- [ ] T009 Update `TaskResponse` in `backend/app/routes/tasks.py`: add `priority`, `tags`, `due_date`, `recurring`, `reminders` fields. Serialize `due_date` and `reminders` as ISO 8601 strings.
- [ ] T010 Update `TaskService.create_task()` in `backend/app/services/task_service.py`: accept and persist `priority`, `tags`, `due_date`, `recurring`, `reminders` parameters
- [ ] T011 Update `TaskService.update_task()` in `backend/app/services/task_service.py`: accept and persist `priority`, `tags`, `due_date`, `recurring`, `reminders` parameters. Track changed fields (old/new) for event publishing.
- [ ] T012 Update all task route handlers in `backend/app/routes/tasks.py` (create_task, update_task, get_tasks): pass new fields through to TaskService and include in TaskResponse serialization
- [ ] T013 Create `EventService` in `backend/app/services/event_service.py`: implement `publish_event(topic, event_type, data)` method using Dapr HTTP API (`POST http://localhost:{DAPR_HTTP_PORT}/v1.0/publish/{PUBSUB_NAME}/{topic}`). Fire-and-forget with try/except error logging. Use CloudEvents content-type header per research R4.
- [ ] T014 Update `backend/app/routes/tasks.py` create_task handler: after successful creation, call `EventService.publish_event("task-events", "tasks.created", task_data)` with task snapshot payload per contracts/events.yaml
- [ ] T015 Update `backend/app/routes/tasks.py` update_task handler: after successful update, call `EventService.publish_event("task-events", "tasks.updated", changes_data)` with changed fields payload per contracts/events.yaml
- [ ] T016 Update frontend API client in `frontend/src/lib/api/task.ts`: add `priority`, `tags`, `due_date`, `recurring`, `reminders` to create/update request types and response parsing. Add `search`, `tag`, `priority`, `sort_by`, `sort_order` query params to list function.

**Checkpoint**: Foundation ready - enhanced Task model persisted, events publishing, frontend types aligned. User story implementation can begin.

---

## Phase 3: User Story 1 - Set Priority on Tasks (Priority: P1) MVP

**Goal**: Users create/update tasks with priority (high/medium/low). AI chatbot interprets priority. UI shows color-coded badges. Tasks sortable/filterable by priority.

**Independent Test**: Create task via chat "Add deploy hotfix with high priority", verify stored as priority=high, red badge shown, sorted first by priority.

### Implementation for User Story 1

- [ ] T017 [P] [US1] Update `AddTaskInput` in `backend/app/mcp_server/tools/add_task.py`: add optional `priority` field (default "medium", enum validation). Update `add_task_tool()` to pass priority to `TaskService.create_task()`. Update `TOOL_DEFINITION` input_schema to include priority parameter per contracts/mcp-tools.yaml.
- [ ] T018 [P] [US1] Update `UpdateTaskInput` in `backend/app/mcp_server/tools/update_task.py`: add optional `priority` field. Update `update_task_tool()` to pass priority to `TaskService.update_task()`. Update `TOOL_DEFINITION` input_schema.
- [ ] T019 [P] [US1] Update `ListTasksInput` in `backend/app/mcp_server/tools/list_tasks.py`: add optional `priority` filter param. Update `list_tasks_tool()` to pass priority filter to `TaskService.list_tasks()`. Update `TOOL_DEFINITION` input_schema.
- [ ] T020 [US1] Update `TaskService.list_tasks()` in `backend/app/services/task_service.py`: add `priority` filter parameter. When provided, add `.where(Task.priority == priority)` to query.
- [ ] T021 [P] [US1] Update `add_task` and `update_task` @function_tool wrappers in `backend/app/mcp_server/agent_tools.py`: add `priority` parameter to function signatures and pass to underlying tool functions.
- [ ] T022 [P] [US1] Create `PriorityBadge` component in `frontend/src/components/tasks/priority-badge.tsx`: accept priority prop, render colored badge (red=high, yellow=medium, green=low) using shadcn/ui Badge component with Tailwind color classes.
- [ ] T023 [US1] Create `TaskCard` component in `frontend/src/components/tasks/task-card.tsx`: display task title, status, and PriorityBadge. Accept full Task type from `frontend/src/types/task.ts`.
- [ ] T024 [US1] Update tasks page at `frontend/src/app/dashboard/tasks/page.tsx`: integrate TaskCard component, display priority badges on each task, add priority filter dropdown using shadcn/ui DropdownMenu.

**Checkpoint**: Priority fully functional end-to-end. Tasks can be created/updated with priority via chat and API, displayed with color badges, filtered by priority.

---

## Phase 4: User Story 2 - Tag Tasks for Organization (Priority: P2)

**Goal**: Users assign tags (work/home/personal/custom) to tasks. Tags displayed as chips. Tasks filterable by tag.

**Independent Test**: Create task "Add meeting prep tagged work", verify tag stored, chip displayed, filter by "work" returns only matching tasks.

### Implementation for User Story 2

- [ ] T025 [P] [US2] Update `AddTaskInput` in `backend/app/mcp_server/tools/add_task.py`: add optional `tags` field (list of strings, default []). Update `add_task_tool()` and `TOOL_DEFINITION`.
- [ ] T026 [P] [US2] Update `UpdateTaskInput` in `backend/app/mcp_server/tools/update_task.py`: add optional `tags` field. Update `update_task_tool()` and `TOOL_DEFINITION`.
- [ ] T027 [US2] Update `ListTasksInput` in `backend/app/mcp_server/tools/list_tasks.py`: add optional `tag` filter param. Update `list_tasks_tool()` and `TOOL_DEFINITION`.
- [ ] T028 [US2] Update `TaskService.list_tasks()` in `backend/app/services/task_service.py`: add `tag` filter parameter. When provided, add `.where(Task.tags.contains([tag]))` using PostgreSQL ARRAY `@>` operator.
- [ ] T029 [P] [US2] Update `add_task` and `update_task` @function_tool wrappers in `backend/app/mcp_server/agent_tools.py`: add `tags` parameter to function signatures.
- [ ] T030 [P] [US2] Create `TagChips` component in `frontend/src/components/tasks/tag-chips.tsx`: accept tags array prop, render each tag as a shadcn/ui Badge variant="outline" with optional onRemove callback. Deduplicate tags on display.
- [ ] T031 [US2] Update `TaskCard` in `frontend/src/components/tasks/task-card.tsx`: integrate TagChips component below task title.
- [ ] T032 [US2] Update tasks page at `frontend/src/app/dashboard/tasks/page.tsx`: add tag filter input/dropdown allowing selection of existing tags from current task list.

**Checkpoint**: Tags fully functional. Tasks created/updated with tags via chat and API, chips displayed, filterable by tag.

---

## Phase 5: User Story 3 - Set Due Dates with Calendar Picker (Priority: P3)

**Goal**: Users assign due dates via NL or calendar picker. Relative time displayed. Overdue tasks highlighted.

**Independent Test**: Create task "Add submit report due tomorrow", verify due_date stored, relative time displays, overdue styling applies after date passes.

### Implementation for User Story 3

- [ ] T033 [P] [US3] Update `AddTaskInput` in `backend/app/mcp_server/tools/add_task.py`: add optional `due_date` field (ISO 8601 datetime string). Update `add_task_tool()` and `TOOL_DEFINITION`.
- [ ] T034 [P] [US3] Update `UpdateTaskInput` in `backend/app/mcp_server/tools/update_task.py`: add optional `due_date` field. Update `update_task_tool()` and `TOOL_DEFINITION`.
- [ ] T035 [P] [US3] Update `add_task` and `update_task` @function_tool wrappers in `backend/app/mcp_server/agent_tools.py`: add `due_date` parameter to function signatures.
- [ ] T036 [P] [US3] Create `DatePicker` component in `frontend/src/components/tasks/date-picker.tsx`: use `react-day-picker` with shadcn/ui Popover. Accept `value` (Date|null) and `onChange` callback. Display selected date with `date-fns` `format()`. Show relative time using `formatDistanceToNow()`.
- [ ] T037 [US3] Update `TaskCard` in `frontend/src/components/tasks/task-card.tsx`: display due_date with relative time (e.g., "due in 2 hours", "overdue by 1 day") using `date-fns`. Add red "overdue" indicator when `due_date < now` and status is pending. Use Lucide Clock icon.
- [ ] T038 [US3] Update tasks page at `frontend/src/app/dashboard/tasks/page.tsx`: integrate DatePicker in task create/edit form. Show overdue tasks with distinct styling (red border or background tint).

**Checkpoint**: Due dates fully functional. Calendar picker works on mobile and desktop, relative time accurate, overdue tasks highlighted.

---

## Phase 6: User Story 4 - Search and Sort Tasks (Priority: P4)

**Goal**: Users search by keyword/status/priority via chat or UI. Tasks sortable by date/priority/name.

**Independent Test**: Given 10+ tasks, search "groceries" returns matches. Sort by priority orders high → medium → low.

### Implementation for User Story 4

- [ ] T039 [US4] Update `TaskService.list_tasks()` in `backend/app/services/task_service.py`: add `search` keyword parameter using `ILIKE` on title and description. Add `sort_by` (date/priority/name) and `sort_order` (asc/desc) parameters. For priority sort, use SQL CASE expression mapping high=1, medium=2, low=3. For date sort, order by due_date (nulls last). For name sort, order by title.
- [ ] T040 [US4] Update `GET /{user_id}/tasks` route in `backend/app/routes/tasks.py`: add `search`, `sort_by`, `sort_order` query parameters. Pass to `TaskService.list_tasks()`.
- [ ] T041 [US4] Update `ListTasksInput` in `backend/app/mcp_server/tools/list_tasks.py`: add `search`, `sort_by`, `sort_order` params. Update `list_tasks_tool()` to pass to service. Update `TOOL_DEFINITION` input_schema.
- [ ] T042 [US4] Update `list_tasks` @function_tool wrapper in `backend/app/mcp_server/agent_tools.py`: add `search`, `sort_by`, `sort_order` parameters.
- [ ] T043 [P] [US4] Create `SearchBar` component in `frontend/src/components/tasks/search-bar.tsx`: text input with Lucide Search icon, debounced onChange (300ms). Accept `value` and `onChange` props.
- [ ] T044 [P] [US4] Create `SortControls` component in `frontend/src/components/tasks/sort-controls.tsx`: shadcn/ui DropdownMenu with options "Due Date", "Priority", "Name". Toggle asc/desc on re-select. Accept `sortBy`, `sortOrder`, `onChange` props. Use Lucide ArrowUpDown icon.
- [ ] T045 [US4] Update tasks page at `frontend/src/app/dashboard/tasks/page.tsx`: integrate SearchBar and SortControls above task list. Wire search/sort state to API client query params. Re-fetch tasks on search/sort change.

**Checkpoint**: Search and sort fully functional. Keyword search, priority/tag filters, and three sort modes working in both chat and UI.

---

## Phase 7: User Story 5 - Kafka Event Publishing (Priority: P5)

**Goal**: Task lifecycle events published to Kafka via Dapr pub/sub in CloudEvents format.

**Independent Test**: Create task via API, verify `tasks.created` event on `task-events` Kafka topic. Complete task, verify `tasks.completed` event.

### Implementation for User Story 5

- [ ] T046 [US5] Update `complete_task` route handler in `backend/app/routes/tasks.py`: after marking task completed, call `EventService.publish_event("task-events", "tasks.completed", completed_data)` with task_id, user_id, title, recurring, due_date, priority, tags, completed_at per contracts/events.yaml
- [ ] T047 [US5] Update `CompleteTaskInput/Output` in `backend/app/mcp_server/tools/complete_task.py`: after completion, call `EventService.publish_event()` for `tasks.completed` event. Import EventService and instantiate with config.
- [ ] T048 [US5] Add Dapr sidecar annotations to `k8s/backend.yaml`: add `dapr.io/enabled: "true"`, `dapr.io/app-id: "taskmaster-backend"`, `dapr.io/app-port: "8000"` to pod template metadata annotations.
- [ ] T049 [P] [US5] Create Kafka deployment manifest at `k8s/kafka.yaml`: reference Bitnami Kafka Helm chart with KRaft mode enabled, single broker, PLAINTEXT listener on port 9092.

**Checkpoint**: Events publishing end-to-end. Task create/update/complete all emit CloudEvents to Kafka via Dapr.

---

## Phase 8: User Story 6 - Recurring Tasks via Kafka Consumer (Priority: P6)

**Goal**: Completing a recurring task auto-generates next instance via recurring-service Kafka consumer.

**Independent Test**: Create daily recurring task with due date, complete it, verify new task auto-created with due_date + 1 day.

### Implementation for User Story 6

- [ ] T050 [P] [US6] Update `AddTaskInput` in `backend/app/mcp_server/tools/add_task.py`: add optional `recurring` field (enum: daily/weekly/monthly). Update `add_task_tool()` and `TOOL_DEFINITION`. Validate that due_date is set when recurring is set.
- [ ] T051 [P] [US6] Update `add_task` @function_tool wrapper in `backend/app/mcp_server/agent_tools.py`: add `recurring` parameter.
- [ ] T052 Create `services/recurring-service/requirements.txt` with: fastapi, uvicorn, httpx
- [ ] T053 Create `services/recurring-service/app/config.py`: settings for `DAPR_HTTP_PORT`, `PUBSUB_NAME`, `BACKEND_APP_ID` ("taskmaster-backend")
- [ ] T054 [US6] Create `services/recurring-service/app/main.py`: FastAPI app with POST `/dapr/subscribe` returning subscription to `task-events` topic for `tasks.completed` type. POST `/events/task-completed` handler: parse CloudEvents payload, check if `recurring` is not null, calculate next due_date (daily=+1d, weekly=+7d, monthly=+1mo using `dateutil.relativedelta`), call main backend API via Dapr service invocation (`POST http://localhost:{DAPR_HTTP_PORT}/v1.0/invoke/taskmaster-backend/method/api/{user_id}/tasks`) to create new task with same title, description, priority, tags, recurring, adjusted reminders, and new due_date.
- [ ] T055 [P] [US6] Create `services/recurring-service/Dockerfile`: Python 3.11-slim, install requirements, expose 8001, run uvicorn on port 8001
- [ ] T056 [P] [US6] Create `k8s/recurring-service.yaml`: Deployment with Dapr annotations (`dapr.io/app-id: "recurring-service"`, `dapr.io/app-port: "8001"`), 1 replica, Service on port 8001

**Checkpoint**: Recurring tasks functional. Complete a daily task → new task appears with tomorrow's due date.

---

## Phase 9: User Story 7 - Reminders via Notification Service (Priority: P7)

**Goal**: Reminder notifications delivered to chat when reminder time arrives.

**Independent Test**: Create task with due date in 2 hours and reminder 1 hour before. Verify chat notification at reminder time.

### Implementation for User Story 7

- [ ] T057 [P] [US7] Update `AddTaskInput` in `backend/app/mcp_server/tools/add_task.py`: add optional `reminders` field (list of ISO 8601 datetimes). Validate each reminder is before due_date. Update `TOOL_DEFINITION`.
- [ ] T058 [P] [US7] Update `add_task` and `update_task` @function_tool wrappers in `backend/app/mcp_server/agent_tools.py`: add `reminders` parameter.
- [ ] T059 Create `services/notification-service/requirements.txt` with: fastapi, uvicorn, httpx, apscheduler
- [ ] T060 Create `services/notification-service/app/config.py`: settings for `DAPR_HTTP_PORT`, `PUBSUB_NAME`, `BACKEND_APP_ID`, `CHECK_INTERVAL_SECONDS` (default 60)
- [ ] T061 [US7] Create `services/notification-service/app/main.py`: FastAPI app with APScheduler background task running every 60 seconds. On each tick: call main backend API via Dapr service invocation to get tasks with reminders. For each task, check if any reminder datetime is within the past 60 seconds window. If so, and if `{task_id}:{reminder_time}` hash not in `delivered_reminders` set, publish `reminder.due` event to `reminder-events` topic via Dapr pub/sub. Add hash to `delivered_reminders` set.
- [ ] T062 [US7] Add subscription endpoint to `backend/app/main.py` or `backend/app/routes/` for Dapr `reminder-events` topic: on receiving `reminder.due` event, insert a system message into the user's active conversation via `ConversationService` (e.g., "Reminder: '{task_title}' is due in 1 hour").
- [ ] T063 [P] [US7] Create `services/notification-service/Dockerfile`: Python 3.11-slim, install requirements, expose 8002, run uvicorn on port 8002
- [ ] T064 [P] [US7] Create `k8s/notification-service.yaml`: Deployment with Dapr annotations (`dapr.io/app-id: "notification-service"`, `dapr.io/app-port: "8002"`), 1 replica, Service on port 8002
- [ ] T065 [US7] Add `GET /{user_id}/tasks/reminders` endpoint to `backend/app/routes/tasks.py`: return tasks with non-empty reminders array where at least one reminder is in the future. Used by notification-service for polling.

**Checkpoint**: Reminders functional. Tasks with reminders trigger chat notifications within 60 seconds of reminder time.

---

## Phase 10: Deployment & Infrastructure

**Purpose**: Kubernetes manifests, Helm values, and deployment pipeline for Minikube and DOKS

- [ ] T066 [P] Create `helm/values.yaml` with centralized configuration: image tags, replica counts, environment variables (DATABASE_URL, GROQ_API_KEY, BETTER_AUTH_SECRET, CORS_ORIGINS, DAPR_HTTP_PORT, PUBSUB_NAME), Kafka broker address, resource limits for all services
- [ ] T067 [P] Update `backend/Dockerfile`: ensure `dapr` and `httpx` packages included in pip install step
- [ ] T068 Update `k8s/backend.yaml`: add Dapr sidecar annotations, add DAPR_HTTP_PORT and PUBSUB_NAME environment variables, reference helm/values.yaml for image tags
- [ ] T069 Validate Minikube deployment: run `minikube start`, `dapr init -k`, `helm install kafka bitnami/kafka --set kraft.enabled=true`, `kubectl apply -f dapr/components/`, `kubectl apply -f k8s/`, verify all pods healthy with `kubectl get pods`
- [ ] T070 Create DigitalOcean DOKS deployment documentation: update `specs/002-enhanced-task-features-event-driven/quickstart.md` with production deployment steps including DOCR image push, DOKS cluster provisioning, and Dapr/Kafka Helm install

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T071 [P] Update AI system prompt in `backend/app/ai/prompts.py`: inform the agent about new task fields (priority, tags, due_date, recurring, reminders) so it can interpret natural language commands like "high priority", "tagged work", "due Friday", "recurring daily", "remind me 1 hour before"
- [ ] T072 [P] Add validation in `backend/app/services/task_service.py`: if `recurring` is set but `due_date` is null, raise ValueError. If `reminders` is non-empty but `due_date` is null, raise ValueError.
- [ ] T073 Run Alembic migration against Neon database: `alembic upgrade head` and verify new columns exist with correct types and defaults
- [ ] T074 Verify backward compatibility: confirm existing tasks (without new fields) load correctly with defaults (priority="medium", tags=[], due_date=null, recurring=null, reminders=[])

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - US1 (Priority): Independent, can start after Phase 2
  - US2 (Tags): Independent, can start after Phase 2
  - US3 (Due Dates): Independent, can start after Phase 2
  - US4 (Search/Sort): Depends on US1 (priority sort) and US2 (tag filter) for full functionality, but can start after Phase 2
  - US5 (Kafka Events): Independent, can start after Phase 2 (EventService created in Phase 2)
  - US6 (Recurring): Depends on US3 (due_date) and US5 (events)
  - US7 (Reminders): Depends on US3 (due_date) and US5 (events)
- **Deployment (Phase 10)**: Depends on US5 (Kafka infra), US6, US7 (all services exist)
- **Polish (Phase 11)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 2 (Foundation)
    ├── US1 (Priority)  ───┐
    ├── US2 (Tags)      ───┤
    ├── US3 (Due Dates) ───┼── US4 (Search/Sort)
    ├── US5 (Events)    ───┤
    │   ├── US6 (Recurring)  [needs US3 + US5]
    │   └── US7 (Reminders)  [needs US3 + US5]
    └── Phase 10 (Deploy) [needs US5 + US6 + US7]
            └── Phase 11 (Polish)
```

### Within Each User Story

- Models/tools before services
- Services before endpoints/UI
- Backend before frontend for the same feature
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T005)
- US1, US2, US3 can all start in parallel after Phase 2
- Within each story, MCP tool updates marked [P] can run in parallel
- Frontend components marked [P] can run in parallel within a story
- Microservice Dockerfiles and K8s manifests marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Priority)
4. **STOP and VALIDATE**: Test priority via chat and UI
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Priority) → MVP with task priorities
3. US2 (Tags) → Categorization added
4. US3 (Due Dates) → Time-aware tasks
5. US4 (Search/Sort) → Full task management
6. US5 (Events) → Event infrastructure live
7. US6 (Recurring) → Auto-generated recurring tasks
8. US7 (Reminders) → Notification delivery
9. Deploy (Phase 10) → Minikube + DOKS
10. Polish (Phase 11) → AI prompts, validation, migration

### Parallel Team Strategy

With multiple developers after Phase 2:
- Developer A: US1 (Priority) → US4 (Search/Sort)
- Developer B: US2 (Tags) → US3 (Due Dates)
- Developer C: US5 (Events) → US6 (Recurring) → US7 (Reminders)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All MCP tool updates follow the pattern: Input schema → tool function → TOOL_DEFINITION → agent_tools.py wrapper
