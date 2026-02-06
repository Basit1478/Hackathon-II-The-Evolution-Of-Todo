from pydantic import BaseModel

class DeleteTaskInput(BaseModel):
    user_id: str
    task_id: int

class DeleteTaskOutput(BaseModel):
    task_id: int
    status: str = "deleted"
    title: str

async def delete_task_tool(session, input_data: DeleteTaskInput) -> DeleteTaskOutput:
    from app.services.task_service import TaskService
    service = TaskService(session)
    task = await service.get_task(task_id=input_data.task_id, user_id=input_data.user_id)
    if not task:
        raise ValueError(f"Task {input_data.task_id} not found")
    title = task.title
    await service.delete_task(task_id=input_data.task_id, user_id=input_data.user_id)
    return DeleteTaskOutput(task_id=input_data.task_id, status="deleted", title=title)

TOOL_DEFINITION = {
    "name": "delete_task",
    "description": "Delete a task",
    "input_schema": {
        "type": "object",
        "properties": {
            "user_id": {"type": "string"},
            "task_id": {"type": "integer"},
        },
        "required": ["user_id", "task_id"],
    },
}
