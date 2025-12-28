# Data Model: Phase I Todo CLI Application

**Feature**: 1-todo-cli-app
**Date**: 2025-12-29
**Spec**: [specs/1-todo-cli-app/spec.md](C:\Users\Windows 10 Pro\Desktop\Hackathon II\Phase 1\specs\1-todo-cli-app/spec.md)

## Entity: Task

### Attributes

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | int | Required, Unique, Auto-generated | Sequential identifier assigned when task is created |
| description | str | Required, Non-empty | Text content of the task entered by user |
| status | str | Required, Enum: "complete", "incomplete" | Current completion status of the task (default: "incomplete") |

### Validation Rules

1. **ID**: Must be a positive integer, unique within the application session
2. **Description**: Must not be empty or contain only whitespace
3. **Status**: Must be either "complete" or "incomplete", defaults to "incomplete" when created

### State Transitions

- New Task: `status = "incomplete"`
- Complete Task: `status = "complete"` (via mark_complete operation)
- Incomplete Task: `status = "incomplete"` (via mark_incomplete operation)

## In-Memory Data Structures

### Task Collection

```python
tasks: List[Task] = []
```

- A list to store all Task objects in memory
- Maintains insertion order
- Provides O(n) lookup for specific tasks by ID

### ID Generation

```python
next_id: int = 1
```

- Counter to track the next available ID
- Increments after each new task creation
- Ensures unique IDs during application session

## Relationships

- No relationships needed as this is a single-entity system
- Each task is independent and self-contained

## Operations

### CRUD Operations

1. **Create**: Add new task with unique ID and "incomplete" status
2. **Read**: Retrieve all tasks or specific task by ID
3. **Update**: Modify task description or status
4. **Delete**: Remove task by ID

### Business Operations

1. **Mark Complete**: Change task status to "complete"
2. **Mark Incomplete**: Change task status to "incomplete"
3. **List All**: Retrieve all tasks in memory
4. **Find by ID**: Retrieve specific task by its unique ID