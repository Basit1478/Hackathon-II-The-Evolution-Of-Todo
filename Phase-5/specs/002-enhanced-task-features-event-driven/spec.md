# Feature Specification: Enhanced Task Features & Event-Driven Architecture

**Feature Branch**: `002-enhanced-task-features-event-driven`
**Created**: 2026-02-07
**Status**: Draft
**Input**: User description: "priority, tags, due_date, recurring, reminders, search, sort, Kafka events, Dapr pub/sub, microservices"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set Priority on Tasks (Priority: P1)

A user creates or updates a task with a priority level (high, medium, or low). The AI chatbot interprets natural language priority cues and the UI displays priority badges with color coding. Tasks can be sorted and filtered by priority.

**Why this priority**: Priority is the most fundamental task attribute beyond title/status. It enables users to focus on what matters most and is a prerequisite for meaningful sorting.

**Independent Test**: Create a task via chat with "Add urgent task: deploy hotfix with high priority" and verify the task is stored with priority=high, displayed with a red badge, and appears first when sorting by priority.

**Acceptance Scenarios**:

1. **Given** the chat is ready, **When** user types "Add buy groceries with low priority", **Then** task is created with priority=low and AI confirms "Created 'Buy groceries' with low priority"
2. **Given** a task exists with priority=low, **When** user types "Change task 3 to high priority", **Then** task priority updates to high and AI confirms the change
3. **Given** multiple tasks exist with different priorities, **When** user types "Show my tasks sorted by priority", **Then** tasks are listed high → medium → low
4. **Given** the task list UI is displayed, **When** tasks have priorities, **Then** each task shows a color-coded badge (red=high, yellow=medium, green=low)

---

### User Story 2 - Tag Tasks for Organization (Priority: P2)

A user assigns tags (work, home, personal, or custom) to tasks for categorization. Tags can be added at creation or later. Tasks can be filtered by one or more tags.

**Why this priority**: Tags provide flexible categorization that complements priority. Users need to slice tasks by context (work vs home) independently of urgency.

**Independent Test**: Create a task "Add meeting prep tagged work" and verify the tag is stored, displayed as a chip, and filtering by "work" returns only matching tasks.

**Acceptance Scenarios**:

1. **Given** the chat is ready, **When** user types "Add meeting prep tagged work", **Then** task is created with tags=["work"] and AI confirms with tag
2. **Given** a task exists, **When** user types "Tag task 2 with home and personal", **Then** tags=["home", "personal"] are added and AI confirms
3. **Given** tasks exist with various tags, **When** user types "Show my work tasks", **Then** only tasks tagged "work" are listed
4. **Given** the task list UI is displayed, **When** tasks have tags, **Then** each tag renders as a removable chip/badge

---

### User Story 3 - Set Due Dates with Calendar Picker (Priority: P3)

A user assigns a due date to a task via natural language or a calendar picker in the UI. Tasks display relative time ("due in 2 hours", "overdue by 1 day"). Overdue tasks are visually highlighted.

**Why this priority**: Due dates transform a simple todo list into a time-aware productivity tool. Required before recurring tasks and reminders can function.

**Independent Test**: Create a task "Add submit report due tomorrow" and verify the due_date is stored, relative time displays correctly, and overdue styling applies after the date passes.

**Acceptance Scenarios**:

1. **Given** the chat is ready, **When** user types "Add submit report due Friday", **Then** task is created with due_date set to next Friday and AI confirms with the date
2. **Given** a task exists, **When** user types "Set task 1 due date to March 15", **Then** due_date updates and AI confirms
3. **Given** a task is overdue, **When** the task list renders, **Then** the task shows a red "overdue" indicator with relative time ("overdue by 2 days")
4. **Given** the task detail UI, **When** user clicks the due date field, **Then** a calendar picker opens for date selection
5. **Given** the user is in a different timezone, **When** due dates are displayed, **Then** they reflect the user's local timezone

---

### User Story 4 - Search and Sort Tasks (Priority: P4)

A user searches tasks by keyword, status, or priority via the chat or UI controls. Tasks can be sorted by date, priority, or name. Search and sort work together.

**Why this priority**: With priority, tags, and dates in place, users need ways to find and organize their growing task lists. Essential for usability at scale.

**Independent Test**: Given 10+ tasks exist, type "Search for groceries" and verify only matching tasks are returned. Click "Sort by priority" and verify ordering.

**Acceptance Scenarios**:

1. **Given** tasks exist, **When** user types "Search for groceries", **Then** tasks with "groceries" in title or description are returned
2. **Given** tasks exist, **When** user types "Show high priority tasks", **Then** only priority=high tasks are listed
3. **Given** the task list UI, **When** user clicks "Sort by due date", **Then** tasks reorder by due_date ascending (soonest first, null last)
4. **Given** the task list UI, **When** user clicks "Sort by name", **Then** tasks reorder alphabetically by title
5. **Given** user searches with no results, **When** processed, **Then** AI responds "No tasks found matching 'xyz'"

---

### User Story 5 - Kafka Event Publishing for Task Lifecycle (Priority: P5)

When a task is created, updated, or completed, the system publishes a CloudEvents-formatted message to the appropriate Kafka topic via Dapr pub/sub. Events are consumed by downstream services without blocking the primary API response.

**Why this priority**: Event publishing is the foundation for the event-driven architecture. Recurring tasks and reminders depend on these events being emitted reliably.

**Independent Test**: Create a task via API, verify a `task-created` event appears on the `task-events` Kafka topic with correct CloudEvents schema. Complete the task, verify `task-completed` event is published.

**Acceptance Scenarios**:

1. **Given** a task is created, **When** the API returns success, **Then** a `task-created` event is published to `task-events` topic via Dapr with CloudEvents envelope containing task_id, user_id, title, priority, tags, and due_date
2. **Given** a task is updated (priority, tags, due_date, title, or description changed), **When** the API returns success, **Then** a `task-updated` event is published with before/after diff
3. **Given** a task is completed, **When** the API returns success, **Then** a `task-completed` event is published with task_id and completion timestamp
4. **Given** Kafka is unavailable, **When** a task operation occurs, **Then** the API still returns success (fire-and-forget) and the event is logged for retry

---

### User Story 6 - Recurring Tasks via Kafka Consumer (Priority: P6)

A user marks a task as recurring (daily, weekly, or monthly). When a recurring task is completed, a Kafka consumer receives the `task-completed` event and automatically creates the next instance with the same attributes and an updated due date.

**Why this priority**: Recurring tasks depend on event publishing (US5) and due dates (US3). This is the first consumer microservice validating the event-driven architecture.

**Independent Test**: Create a task with "Add standup meeting recurring daily due tomorrow", complete it, and verify a new task is auto-created with due_date = original + 1 day.

**Acceptance Scenarios**:

1. **Given** a task with recurring=daily and due_date=today, **When** user completes it, **Then** `task-completed` event triggers the recurring-service to create a new task with due_date=tomorrow
2. **Given** a task with recurring=weekly, **When** completed, **Then** new task is created with due_date + 7 days, same title, priority, and tags
3. **Given** a task with recurring=monthly, **When** completed, **Then** new task is created with due_date + 1 month
4. **Given** a non-recurring task, **When** completed, **Then** no new task is created (event is ignored by recurring-service)
5. **Given** the recurring-service is down, **When** a recurring task is completed, **Then** the event remains in Kafka and is processed when the service recovers

---

### User Story 7 - Reminders via Notification Service (Priority: P7)

A user sets a reminder on a task ("remind me 1 hour before"). A dedicated notification-service Kafka consumer checks for upcoming reminders and delivers them. Reminders are displayed in the chat as system messages.

**Why this priority**: Reminders are the most complex feature, requiring a scheduled consumer, time-based queries, and delivery mechanisms. Depends on due dates (US3) and events (US5).

**Independent Test**: Create a task with "Add meeting due in 2 hours with reminder 1 hour before", wait until 1 hour before, and verify a reminder message appears in the chat.

**Acceptance Scenarios**:

1. **Given** a task with due_date in 2 hours and reminder=1h, **When** 1 hour before due_date arrives, **Then** notification-service publishes a `reminder.due` event and the user sees a reminder in chat
2. **Given** user types "Remind me about task 3 one hour before", **Then** a reminder is stored for task 3 at due_date - 1 hour
3. **Given** a task has no due_date, **When** user tries to set a reminder, **Then** AI responds "Please set a due date first before adding a reminder"
4. **Given** a reminder has been delivered, **When** the same reminder time passes again, **Then** no duplicate reminder is sent (idempotent delivery)
5. **Given** the notification-service restarts, **When** it recovers, **Then** it processes any missed reminders that are still relevant (not past due_date)

---

### Edge Cases

- What happens when user sets priority to an invalid value (e.g., "critical")? → AI responds with valid options: high, medium, low
- What happens when user adds duplicate tags to a task? → System deduplicates silently
- What happens when due_date is set to a past date? → AI warns "This date is in the past" but allows it
- What happens when recurring task has no due_date? → AI responds "Recurring tasks require a due date"
- What happens when Kafka broker is unreachable at startup? → Service retries connection with exponential backoff, health check reports unhealthy
- What happens when a reminder's task is deleted before the reminder fires? → Notification-service checks task existence and skips if deleted
- What happens when user searches with special characters? → Input is sanitized, special chars are treated as literals
- How does system handle timezone changes for recurring tasks? → Due dates are stored in UTC, displayed in user's local timezone

## Requirements *(mandatory)*

### Functional Requirements

**Task Model Enhancements:**
- **FR-001**: Task model MUST include `priority` field as enum (high, medium, low) with default=medium
- **FR-002**: Task model MUST include `tags` field as array of strings, default empty
- **FR-003**: Task model MUST include `due_date` field as nullable datetime (timezone-aware, stored as UTC)
- **FR-004**: Task model MUST include `recurring` field as nullable enum (daily, weekly, monthly)
- **FR-005**: Task model MUST include `reminders` field as array of datetime values

**MCP Tool Updates:**
- **FR-006**: `add_task` tool MUST accept optional priority, tags, due_date, recurring, and reminder parameters
- **FR-007**: `update_task` tool MUST accept optional priority, tags, due_date, recurring, and reminder parameters
- **FR-008**: `list_tasks` tool MUST accept optional priority, tag, and search (keyword) filter parameters
- **FR-009**: `list_tasks` tool MUST accept optional sort_by parameter (date, priority, name) and sort_order (asc, desc)

**API Enhancements:**
- **FR-010**: `POST /{user_id}/tasks` MUST accept priority, tags, due_date, recurring, and reminders in request body
- **FR-011**: `PUT /{user_id}/tasks/{task_id}` MUST accept priority, tags, due_date, recurring, and reminders in request body
- **FR-012**: `GET /{user_id}/tasks` MUST accept query params: priority, tag, search, sort_by, sort_order
- **FR-013**: All task API responses MUST include priority, tags, due_date, recurring, and reminders fields

**Search & Sort:**
- **FR-014**: Search MUST match against task title and description fields (case-insensitive)
- **FR-015**: Sort by priority MUST order: high → medium → low (or reverse)
- **FR-016**: Sort by date MUST order by due_date (nulls last) or created_at as fallback

**Event-Driven (Kafka + Dapr):**
- **FR-017**: System MUST publish `task-created` event to `task-events` topic on task creation
- **FR-018**: System MUST publish `task-updated` event to `task-events` topic on task update
- **FR-019**: System MUST publish `task-completed` event to `task-events` topic on task completion
- **FR-020**: All events MUST use CloudEvents v1.0 envelope format
- **FR-021**: Dapr pub/sub component MUST be configured with Kafka as the broker
- **FR-022**: Event publishing MUST be non-blocking (fire-and-forget with error logging)

**Microservices:**
- **FR-023**: `recurring-service` MUST subscribe to `task-completed` events on `task-events` topic
- **FR-024**: `recurring-service` MUST create a new task instance when a completed task has recurring != null
- **FR-025**: `recurring-service` MUST calculate next due_date based on recurring interval
- **FR-026**: `notification-service` MUST poll for tasks with reminders approaching due
- **FR-027**: `notification-service` MUST publish `reminder.due` events when reminder time is reached
- **FR-028**: `notification-service` MUST be idempotent (track delivered reminders to prevent duplicates)

**UI Enhancements:**
- **FR-029**: Task list MUST display priority badges (color-coded: red=high, yellow=medium, green=low)
- **FR-030**: Task list MUST display tags as removable chips
- **FR-031**: Task list MUST display due dates with relative time formatting
- **FR-032**: Task detail/edit MUST include a calendar date picker for due_date
- **FR-033**: Task list MUST include sort controls (dropdown: date, priority, name)
- **FR-034**: Task list MUST include a search input field with real-time filtering

### Key Entities

- **Task** (enhanced): Existing entity extended with priority (enum), tags (string[]), due_date (datetime?), recurring (enum?), reminders (datetime[]). Belongs to one user. Current fields preserved: id, user_id, title, description, status, created_at, updated_at.
- **TaskEvent**: Represents a CloudEvents message. Attributes: id (uuid), type (task-created | task-updated | task-completed), source, subject (task_id), time, data (task snapshot). Published to Kafka, not persisted in DB.
- **Reminder**: Logical entity tracked within the Task (reminders array). The notification-service maintains a delivered_reminders set (in-memory or Redis) for idempotency.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create tasks with priority, tags, and due_date via natural language in under 3 seconds (p95)
- **SC-002**: Task list correctly filters by priority, tag, and keyword search returning results in under 500ms
- **SC-003**: Task lifecycle events (created, updated, completed) appear on Kafka topics within 200ms of API response
- **SC-004**: Recurring task auto-generation occurs within 5 seconds of completing a recurring task
- **SC-005**: Reminders are delivered within 60 seconds of the scheduled reminder time
- **SC-006**: Calendar date picker renders and functions correctly on mobile (375px+) and desktop
- **SC-007**: Sort controls produce correct ordering for all three sort modes (date, priority, name)
- **SC-008**: All existing MCP tools (add, list, complete, delete, update) continue to function with new fields (backward compatible)
- **SC-009**: Dapr sidecar successfully brokers pub/sub messages between main API and microservices
- **SC-010**: System operates correctly on Minikube with Kafka, Dapr, and all services running as pods
