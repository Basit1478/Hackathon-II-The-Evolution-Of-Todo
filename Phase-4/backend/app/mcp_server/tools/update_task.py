from typing import Optional
from pydantic import BaseModel

class UpdateTaskInput(BaseModel):
    user_id: str
    task_id: int
    title: Optional[str] = None
    description: Optional[str] = None

class UpdateTaskOutput(BaseModel):
    task_id: int
    status: str = "updated"

async def update_task_tool(session, input_data: UpdateTaskInput) -> UpdateTaskOutput:
    from app.services.task_service import TaskService
    service = TaskService(session)
    task = await service.update_task(task_id=input_data.task_id, user_id=input_data.user_id, title=input_data.title, description=input_data.description)
    if not task:
        raise ValueError(f"Task {input_data.task_id} not found")
    return UpdateTaskOutput(task_id=task.id, status="updated")

TOOL_DEFINITION = {
    "name": "update_task",
    "description": "Update a task's title or description",
    "input_schema": {
        "type": "object",
        "properties": {
            "user_id": {"type": "string"},
            "task_id": {"type": "integer"},
            "title": {"type": "string", "maxLength": 200},
            "description": {"type": "string"},
        },
        "required": ["user_id", "task_id"],
    },
}
