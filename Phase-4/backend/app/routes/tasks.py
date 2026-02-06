from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_session
from app.services.task_service import TaskService

router = APIRouter(prefix="/api", tags=["tasks"])

class TaskCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None

class TaskResponse(BaseModel):
    id: int
    user_id: str
    title: str
    description: Optional[str]
    status: str
    created_at: str
    updated_at: str

@router.get("/{user_id}/tasks", response_model=List[TaskResponse])
async def get_tasks(user_id: str, status: Optional[str] = None, session: AsyncSession = Depends(get_session)):
    task_service = TaskService(session)
    tasks = await task_service.list_tasks(user_id, status)
    return [TaskResponse(id=t.id, user_id=t.user_id, title=t.title, description=t.description, status=t.status, created_at=t.created_at.isoformat(), updated_at=t.updated_at.isoformat()) for t in tasks]

@router.post("/{user_id}/tasks", response_model=TaskResponse)
async def create_task(user_id: str, request: TaskCreateRequest, session: AsyncSession = Depends(get_session)):
    task_service = TaskService(session)
    task = await task_service.create_task(user_id, request.title, request.description)
    return TaskResponse(id=task.id, user_id=task.user_id, title=task.title, description=task.description, status=task.status, created_at=task.created_at.isoformat(), updated_at=task.updated_at.isoformat())

@router.delete("/{user_id}/tasks/{task_id}")
async def delete_task(user_id: str, task_id: int, session: AsyncSession = Depends(get_session)):
    task_service = TaskService(session)
    success = await task_service.delete_task(task_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}
