from typing import Optional, List
from pydantic import BaseModel, Field

class AddTaskInput(BaseModel):
    user_id: str
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    priority: str = "medium"
    tags: List[str] = []
    due_date: Optional[str] = None
    recurring: Optional[str] = None
    reminders: List[str] = []

class AddTaskOutput(BaseModel):
    task_id: int
    status: str = "created"
    title: str
    priority: str
    tags: List[str]

async def add_task_tool(session, input_data: AddTaskInput) -> AddTaskOutput:
    from datetime import datetime
    from app.services.task_service import TaskService
    service = TaskService(session)
    due_date = datetime.fromisoformat(input_data.due_date.replace("Z", "+00:00")) if input_data.due_date else None
    reminders = [datetime.fromisoformat(r.replace("Z", "+00:00")) for r in input_data.reminders]
    task = await service.create_task(user_id=input_data.user_id, title=input_data.title, description=input_data.description, priority=input_data.priority, tags=input_data.tags, due_date=due_date, recurring=input_data.recurring, reminders=reminders)
    return AddTaskOutput(task_id=task.id, status="created", title=task.title, priority=task.priority, tags=list(task.tags) if task.tags else [])

TOOL_DEFINITION = {
    "name": "add_task",
    "description": "Add a new task to the user's task list",
    "input_schema": {
        "type": "object",
        "properties": {
            "user_id": {"type": "string", "description": "The user's ID"},
            "title": {"type": "string", "description": "The task title", "minLength": 1, "maxLength": 200},
            "description": {"type": "string", "description": "Optional task description"},
            "priority": {"type": "string", "enum": ["high", "medium", "low"], "description": "Task priority level"},
            "tags": {"type": "array", "items": {"type": "string"}, "description": "Tags for categorization"},
            "due_date": {"type": "string", "description": "Due date in ISO 8601 format"},
            "recurring": {"type": "string", "enum": ["daily", "weekly", "monthly"], "description": "Recurrence interval"},
            "reminders": {"type": "array", "items": {"type": "string"}, "description": "Reminder datetimes in ISO 8601"},
        },
        "required": ["user_id", "title"],
    },
}
