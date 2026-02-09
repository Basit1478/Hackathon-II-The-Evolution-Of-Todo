import logging
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.services.task_service import TaskService
from app.services.event_service import EventService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["tasks"])
event_service = EventService()


class TaskCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    priority: str = Field(default="medium")
    tags: List[str] = Field(default=[])
    due_date: Optional[str] = None
    recurring: Optional[str] = None
    reminders: List[str] = Field(default=[])

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        if v not in ("high", "medium", "low"):
            raise ValueError("priority must be high, medium, or low")
        return v

    @field_validator("recurring")
    @classmethod
    def validate_recurring(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("daily", "weekly", "monthly"):
            raise ValueError("recurring must be daily, weekly, or monthly")
        return v

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: List[str]) -> List[str]:
        if len(v) > 20:
            raise ValueError("maximum 20 tags allowed")
        return [t[:50] for t in v if t.strip()]


class TaskUpdateRequest(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: Optional[str] = Field(default=None, pattern=r"^(pending|completed)$")
    priority: Optional[str] = None
    tags: Optional[List[str]] = None
    due_date: Optional[str] = None
    recurring: Optional[str] = None
    reminders: Optional[List[str]] = None

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("high", "medium", "low"):
            raise ValueError("priority must be high, medium, or low")
        return v

    @field_validator("recurring")
    @classmethod
    def validate_recurring(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("daily", "weekly", "monthly"):
            raise ValueError("recurring must be daily, weekly, or monthly")
        return v


class TaskResponse(BaseModel):
    id: int
    user_id: str
    title: str
    description: Optional[str]
    status: str
    priority: str
    tags: List[str]
    due_date: Optional[str]
    recurring: Optional[str]
    reminders: List[str]
    created_at: str
    updated_at: str


def _task_to_response(task) -> TaskResponse:
    return TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        tags=list(task.tags) if task.tags else [],
        due_date=task.due_date.isoformat() if task.due_date else None,
        recurring=task.recurring,
        reminders=[r.isoformat() for r in task.reminders] if task.reminders else [],
        created_at=task.created_at.isoformat(),
        updated_at=task.updated_at.isoformat(),
    )


def _parse_datetime(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _parse_datetime_list(values: List[str]) -> List[datetime]:
    return [datetime.fromisoformat(v.replace("Z", "+00:00")) for v in values if v]


@router.get("/{user_id}/tasks", response_model=List[TaskResponse])
async def get_tasks(
    user_id: str,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: str = "desc",
    session: AsyncSession = Depends(get_session),
):
    task_service = TaskService(session)
    tasks = await task_service.list_tasks(
        user_id,
        status=status,
        priority=priority,
        tag=tag,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return [_task_to_response(task) for task in tasks]


@router.get("/{user_id}/tasks/reminders", response_model=List[TaskResponse])
async def get_tasks_with_reminders(
    user_id: str,
    session: AsyncSession = Depends(get_session),
):
    task_service = TaskService(session)
    tasks = await task_service.get_tasks_with_reminders(user_id)
    return [_task_to_response(task) for task in tasks]


@router.post("/{user_id}/tasks", response_model=TaskResponse)
async def create_task(
    user_id: str,
    request: TaskCreateRequest,
    session: AsyncSession = Depends(get_session),
):
    task_service = TaskService(session)
    task = await task_service.create_task(
        user_id=user_id,
        title=request.title,
        description=request.description,
        priority=request.priority,
        tags=request.tags,
        due_date=_parse_datetime(request.due_date),
        recurring=request.recurring,
        reminders=_parse_datetime_list(request.reminders),
    )

    await event_service.publish_event(
        "task-events",
        "tasks.created",
        {
            "task_id": task.id,
            "user_id": task.user_id,
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "tags": list(task.tags) if task.tags else [],
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "recurring": task.recurring,
            "reminders": [r.isoformat() for r in task.reminders]
            if task.reminders
            else [],
        },
    )

    return _task_to_response(task)


@router.put("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: str,
    task_id: int,
    request: TaskUpdateRequest,
    session: AsyncSession = Depends(get_session),
):
    task_service = TaskService(session)

    existing_task = await task_service.get_task(task_id, user_id)
    if not existing_task:
        raise HTTPException(status_code=404, detail="Task not found or access denied")

    updated_task = await task_service.update_task(
        task_id=task_id,
        user_id=user_id,
        title=request.title,
        description=request.description,
        priority=request.priority,
        tags=request.tags,
        due_date=_parse_datetime(request.due_date) if request.due_date else None,
        recurring=request.recurring,
        reminders=_parse_datetime_list(request.reminders)
        if request.reminders is not None
        else None,
    )

    if request.status is not None and updated_task.status != request.status:
        updated_task.status = request.status
        updated_task.updated_at = datetime.utcnow()
        session.add(updated_task)
        await session.commit()
        await session.refresh(updated_task)

    changes = getattr(updated_task, "_changes", {})
    if changes:
        await event_service.publish_event(
            "task-events",
            "tasks.updated",
            {
                "task_id": updated_task.id,
                "user_id": updated_task.user_id,
                "changes": changes,
            },
        )

    return _task_to_response(updated_task)


@router.post("/{user_id}/tasks/{task_id}/complete", response_model=TaskResponse)
async def complete_task(
    user_id: str,
    task_id: int,
    session: AsyncSession = Depends(get_session),
):
    task_service = TaskService(session)
    task = await task_service.complete_task(task_id, user_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found or access denied")

    await event_service.publish_event(
        "task-events",
        "tasks.completed",
        {
            "task_id": task.id,
            "user_id": task.user_id,
            "title": task.title,
            "recurring": task.recurring,
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "priority": task.priority,
            "tags": list(task.tags) if task.tags else [],
            "reminders": [r.isoformat() for r in task.reminders]
            if task.reminders
            else [],
            "completed_at": task.updated_at.isoformat(),
        },
    )

    return _task_to_response(task)


@router.delete("/{user_id}/tasks/{task_id}")
async def delete_task(
    user_id: str,
    task_id: int,
    session: AsyncSession = Depends(get_session),
):
    task_service = TaskService(session)
    success = await task_service.delete_task(task_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found or access denied")
    return {"message": "Task deleted successfully"}
