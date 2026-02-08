# Data Model: Enhanced Task Features & Event-Driven Architecture

**Feature**: 002-enhanced-task-features-event-driven
**Date**: 2026-02-07

## Entity: Task (Enhanced)

Extends existing `backend/app/models/task.py`. All existing fields preserved for backward compatibility.

### Fields

| Field | Type | Nullable | Default | Index | Notes |
|-------|------|----------|---------|-------|-------|
| id | int | No | auto-increment | PK | Existing |
| user_id | str | No | - | Yes | Existing |
| title | str(200) | No | - | - | Existing |
| description | str | Yes | null | - | Existing |
| status | str | No | "pending" | Yes | Existing; values: pending, completed |
| priority | str | No | "medium" | Yes | **NEW**; values: high, medium, low |
| tags | str[] | No | [] | GIN | **NEW**; PostgreSQL ARRAY(String) |
| due_date | datetime(tz) | Yes | null | Yes | **NEW**; timezone-aware UTC |
| recurring | str | Yes | null | - | **NEW**; values: daily, weekly, monthly |
| reminders | datetime(tz)[] | No | [] | - | **NEW**; PostgreSQL ARRAY(DateTime(timezone=True)) |
| created_at | datetime | No | utcnow | - | Existing |
| updated_at | datetime | No | utcnow | - | Existing |

### Validation Rules

- `priority` MUST be one of: "high", "medium", "low"
- `recurring` MUST be one of: "daily", "weekly", "monthly", or null
- `tags` elements MUST be non-empty strings, max 50 chars each, max 20 tags per task
- `due_date` MUST be timezone-aware (stored as UTC)
- `reminders` elements MUST be timezone-aware datetimes, each before `due_date`
- If `recurring` is set, `due_date` MUST also be set
- If `reminders` is non-empty, `due_date` MUST also be set

### Indexes

- `ix_tasks_user_id` (existing)
- `ix_tasks_status` (existing)
- `ix_tasks_priority` on `priority`
- `ix_tasks_due_date` on `due_date`
- `ix_tasks_tags` GIN index on `tags` (for `@>` containment queries)

### State Transitions

```
pending → completed  (complete_task)
completed → pending  (reopen - future)
```

When status transitions to "completed" and `recurring` is not null, a `task-completed` event triggers creation of a new task with:
- Same: title, description, priority, tags, recurring, reminders (adjusted)
- Updated: due_date = calculate_next_due(original_due_date, recurring)
- Reset: status = "pending"

## Entity: TaskEvent (Transient - Not Persisted)

CloudEvents envelope published to Kafka via Dapr. Not stored in the database.

### Schema (CloudEvents v1.0)

| Field | Type | Description |
|-------|------|-------------|
| specversion | str | Always "1.0" |
| type | str | "tasks.created" \| "tasks.updated" \| "tasks.completed" |
| source | str | "/api/tasks" |
| id | uuid | Unique event identifier |
| time | datetime(ISO8601) | Event timestamp |
| datacontenttype | str | "application/json" |
| data | object | Event payload (see below) |

### Event Data Payloads

**tasks.created**:
```json
{
  "task_id": 1,
  "user_id": "abc123",
  "title": "Buy groceries",
  "description": null,
  "priority": "medium",
  "tags": ["home"],
  "due_date": "2026-02-08T17:00:00Z",
  "recurring": null,
  "reminders": []
}
```

**tasks.updated**:
```json
{
  "task_id": 1,
  "user_id": "abc123",
  "changes": {
    "priority": { "old": "low", "new": "high" },
    "tags": { "old": [], "new": ["work"] }
  }
}
```

**tasks.completed**:
```json
{
  "task_id": 1,
  "user_id": "abc123",
  "title": "Buy groceries",
  "recurring": "weekly",
  "due_date": "2026-02-08T17:00:00Z",
  "completed_at": "2026-02-07T15:30:00Z"
}
```

## Entity: DeliveredReminder (In-Memory - Notification Service)

Tracks which reminders have been delivered to prevent duplicates.

| Field | Type | Description |
|-------|------|-------------|
| reminder_key | str | Hash of `{task_id}:{reminder_datetime}` |
| delivered_at | datetime | When the reminder was sent |

This is stored in a Python `set` or `dict` within the notification-service process. On restart, all reminders are re-evaluated (reminders already past are skipped).

## Relationships

```
User (1) ──── (N) Task
Task (1) ──── (N) TaskEvent (transient, via Kafka)
Task.reminders[] ──── DeliveredReminder (in-memory tracking)
```

## Migration Strategy

**Alembic migration** to add new columns to existing `tasks` table:

```sql
ALTER TABLE tasks ADD COLUMN priority VARCHAR NOT NULL DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN tags VARCHAR[] NOT NULL DEFAULT '{}';
ALTER TABLE tasks ADD COLUMN due_date TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN recurring VARCHAR;
ALTER TABLE tasks ADD COLUMN reminders TIMESTAMPTZ[] NOT NULL DEFAULT '{}';

CREATE INDEX ix_tasks_priority ON tasks (priority);
CREATE INDEX ix_tasks_due_date ON tasks (due_date);
CREATE INDEX ix_tasks_tags ON tasks USING GIN (tags);
```

All new columns have defaults, so existing rows are unaffected. No data migration required.
