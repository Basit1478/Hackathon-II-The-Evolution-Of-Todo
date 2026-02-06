from pydantic import BaseModel

class CompleteTaskInput(BaseModel):
    user_id: str
    task_id: int

class CompleteTaskOutput(BaseModel):
    task_id: int
    status: str = "completed"
    title: str

async def complete_task_tool(session, input_data: CompleteTaskInput) -> CompleteTaskOutput:
    from app.services.task_service import TaskService
    service = TaskService(session)
    task = await service.complete_task(task_id=input_data.task_id, user_id=input_data.user_id)
    if not task:
        raise ValueError(f"Task {input_data.task_id} not found")
    return CompleteTaskOutput(task_id=task.id, status="completed", title=task.title)

TOOL_DEFINITION = {
    "name": "complete_task",
    "description": "Mark a task as completed",
    "input_schema": {
        "type": "object",
        "properties": {
            "user_id": {"type": "string"},
            "task_id": {"type": "integer"},
        },
        "required": ["user_id", "task_id"],
    },
}
