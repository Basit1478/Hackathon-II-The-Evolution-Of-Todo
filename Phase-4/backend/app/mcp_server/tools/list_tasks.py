from typing import Optional, List
from pydantic import BaseModel

class ListTasksInput(BaseModel):
    user_id: str
    status: Optional[str] = "all"

class TaskItem(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    created_at: str

class ListTasksOutput(BaseModel):
    tasks: List[TaskItem]
    total: int

async def list_tasks_tool(session, input_data: ListTasksInput) -> ListTasksOutput:
    from app.services.task_service import TaskService
    service = TaskService(session)
    status_filter = input_data.status if input_data.status != "all" else None
    tasks = await service.list_tasks(user_id=input_data.user_id, status=status_filter)
    task_items = [TaskItem(id=t.id, title=t.title, description=t.description, status=t.status, created_at=t.created_at.isoformat()) for t in tasks]
    return ListTasksOutput(tasks=task_items, total=len(task_items))

TOOL_DEFINITION = {
    "name": "list_tasks",
    "description": "List all tasks for a user",
    "input_schema": {
        "type": "object",
        "properties": {
            "user_id": {"type": "string"},
            "status": {"type": "string", "enum": ["all", "pending", "completed"]},
        },
        "required": ["user_id"],
    },
}
