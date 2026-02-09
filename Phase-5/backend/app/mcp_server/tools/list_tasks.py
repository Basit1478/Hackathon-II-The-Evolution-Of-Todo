from typing import Optional, List
from pydantic import BaseModel


class ListTasksInput(BaseModel):
    user_id: str
    status: Optional[str] = "all"
    priority: Optional[str] = None
    tag: Optional[str] = None
    search: Optional[str] = None
    sort_by: Optional[str] = None
    sort_order: str = "desc"


class TaskItem(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    priority: str
    tags: List[str]
    due_date: Optional[str]
    recurring: Optional[str]
    created_at: str


class ListTasksOutput(BaseModel):
    tasks: List[TaskItem]
    total: int


async def list_tasks_tool(session, input_data: ListTasksInput) -> ListTasksOutput:
    """List tasks for a user, with optional filtering and sorting."""
    from app.services.task_service import TaskService

    service = TaskService(session)
    status_filter = input_data.status if input_data.status != "all" else None
    tasks = await service.list_tasks(
        user_id=input_data.user_id,
        status=status_filter,
        priority=input_data.priority,
        tag=input_data.tag,
        search=input_data.search,
        sort_by=input_data.sort_by,
        sort_order=input_data.sort_order,
    )

    task_items = [
        TaskItem(
            id=task.id,
            title=task.title,
            description=task.description,
            status=task.status,
            priority=task.priority,
            tags=list(task.tags) if task.tags else [],
            due_date=task.due_date.isoformat() if task.due_date else None,
            recurring=task.recurring,
            created_at=task.created_at.isoformat(),
        )
        for task in tasks
    ]

    return ListTasksOutput(tasks=task_items, total=len(task_items))


TOOL_DEFINITION = {
    "name": "list_tasks",
    "description": "List all tasks for a user, with optional filtering and sorting",
    "input_schema": {
        "type": "object",
        "properties": {
            "user_id": {"type": "string", "description": "The user's ID"},
            "status": {
                "type": "string",
                "enum": ["all", "pending", "completed"],
                "description": "Filter by task status (default: all)",
            },
            "priority": {
                "type": "string",
                "enum": ["high", "medium", "low"],
                "description": "Filter by priority level",
            },
            "tag": {
                "type": "string",
                "description": "Filter by tag name",
            },
            "search": {
                "type": "string",
                "description": "Keyword search in title and description",
            },
            "sort_by": {
                "type": "string",
                "enum": ["date", "priority", "name"],
                "description": "Sort field (default: date)",
            },
            "sort_order": {
                "type": "string",
                "enum": ["asc", "desc"],
                "description": "Sort direction (default: desc)",
            },
        },
        "required": ["user_id"],
    },
}
