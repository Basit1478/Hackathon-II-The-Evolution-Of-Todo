from pydantic import BaseModel


class DeleteTaskInput(BaseModel):
    user_id: str
    task_id: int


class DeleteTaskOutput(BaseModel):
    task_id: int
    status: str = "deleted"
    title: str


async def delete_task_tool(session, input_data: DeleteTaskInput) -> DeleteTaskOutput:
    """
    Delete a task.

    Args:
        session: Database session
        input_data: DeleteTaskInput with user_id and task_id

    Returns:
        DeleteTaskOutput with task_id, status, and title

    Raises:
        ValueError: If task not found or doesn't belong to user
    """
    from app.services.task_service import TaskService

    service = TaskService(session)

    # Get the task first to retrieve its title
    task = await service.get_task(
        task_id=input_data.task_id,
        user_id=input_data.user_id,
    )

    if not task:
        raise ValueError(f"Task {input_data.task_id} not found or doesn't belong to user")

    title = task.title
    success = await service.delete_task(
        task_id=input_data.task_id,
        user_id=input_data.user_id,
    )

    if not success:
        raise ValueError(f"Failed to delete task {input_data.task_id}")

    return DeleteTaskOutput(
        task_id=input_data.task_id,
        status="deleted",
        title=title,
    )


# Tool definition for MCP
TOOL_DEFINITION = {
    "name": "delete_task",
    "description": "Delete a task from the user's task list",
    "input_schema": {
        "type": "object",
        "properties": {
            "user_id": {"type": "string", "description": "The user's ID"},
            "task_id": {"type": "integer", "description": "The ID of the task to delete"},
        },
        "required": ["user_id", "task_id"],
    },
}
