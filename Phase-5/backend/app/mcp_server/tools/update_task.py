from typing import Optional, List
from pydantic import BaseModel


class UpdateTaskInput(BaseModel):
    user_id: str
    task_id: int
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    tags: Optional[List[str]] = None
    due_date: Optional[str] = None
    recurring: Optional[str] = None
    reminders: Optional[List[str]] = None


class UpdateTaskOutput(BaseModel):
    task_id: int
    status: str = "updated"


async def update_task_tool(session, input_data: UpdateTaskInput) -> UpdateTaskOutput:
    """Update a task's properties."""
    from datetime import datetime
    from app.services.task_service import TaskService

    service = TaskService(session)

    due_date = None
    if input_data.due_date:
        due_date = datetime.fromisoformat(
            input_data.due_date.replace("Z", "+00:00")
        )

    reminders = None
    if input_data.reminders is not None:
        reminders = [
            datetime.fromisoformat(r.replace("Z", "+00:00"))
            for r in input_data.reminders
        ]

    task = await service.update_task(
        task_id=input_data.task_id,
        user_id=input_data.user_id,
        title=input_data.title,
        description=input_data.description,
        priority=input_data.priority,
        tags=input_data.tags,
        due_date=due_date,
        recurring=input_data.recurring,
        reminders=reminders,
    )

    if not task:
        raise ValueError(f"Task {input_data.task_id} not found or doesn't belong to user")

    return UpdateTaskOutput(task_id=task.id, status="updated")


TOOL_DEFINITION = {
    "name": "update_task",
    "description": "Update a task's properties (title, description, priority, tags, due date, recurring, reminders)",
    "input_schema": {
        "type": "object",
        "properties": {
            "user_id": {"type": "string", "description": "The user's ID"},
            "task_id": {"type": "integer", "description": "The ID of the task to update"},
            "title": {"type": "string", "description": "New title", "maxLength": 200},
            "description": {"type": "string", "description": "New description"},
            "priority": {
                "type": "string",
                "enum": ["high", "medium", "low"],
                "description": "New priority level",
            },
            "tags": {
                "type": "array",
                "items": {"type": "string"},
                "description": "New tags (replaces existing)",
            },
            "due_date": {
                "type": "string",
                "description": "New due date in ISO 8601 format",
            },
            "recurring": {
                "type": "string",
                "enum": ["daily", "weekly", "monthly"],
                "description": "Recurrence interval",
            },
            "reminders": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Reminder datetimes in ISO 8601 format",
            },
        },
        "required": ["user_id", "task_id"],
    },
}
