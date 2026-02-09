from pydantic import BaseModel


class CompleteTaskInput(BaseModel):
    user_id: str
    task_id: int


class CompleteTaskOutput(BaseModel):
    task_id: int
    status: str = "completed"
    title: str


async def complete_task_tool(session, input_data: CompleteTaskInput) -> CompleteTaskOutput:
    """
    Mark a task as completed.

    Args:
        session: Database session
        input_data: CompleteTaskInput with user_id and task_id

    Returns:
        CompleteTaskOutput with task_id, status, and title

    Raises:
        ValueError: If task not found or doesn't belong to user
    """
    from app.services.task_service import TaskService

    service = TaskService(session)
    task = await service.complete_task(
        task_id=input_data.task_id,
        user_id=input_data.user_id,
    )

    if not task:
        raise ValueError(f"Task {input_data.task_id} not found or doesn't belong to user")

    return CompleteTaskOutput(
        task_id=task.id,
        status="completed",
        title=task.title,
    )


# Tool definition for MCP
TOOL_DEFINITION = {
    "name": "complete_task",
    "description": "Mark a task as completed",
    "input_schema": {
        "type": "object",
        "properties": {
            "user_id": {"type": "string", "description": "The user's ID"},
            "task_id": {"type": "integer", "description": "The ID of the task to complete"},
        },
        "required": ["user_id", "task_id"],
    },
}
