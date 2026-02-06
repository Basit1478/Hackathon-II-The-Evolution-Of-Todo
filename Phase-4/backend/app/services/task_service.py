from datetime import datetime
from typing import Optional, List
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.task import Task

class TaskService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_task(self, user_id: str, title: str, description: Optional[str] = None) -> Task:
        task = Task(user_id=user_id, title=title, description=description)
        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task)
        return task

    async def get_task(self, task_id: int, user_id: str) -> Optional[Task]:
        result = await self.session.execute(select(Task).where(Task.id == task_id, Task.user_id == user_id))
        return result.scalar_one_or_none()

    async def list_tasks(self, user_id: str, status: Optional[str] = None) -> List[Task]:
        query = select(Task).where(Task.user_id == user_id)
        if status and status != "all":
            query = query.where(Task.status == status)
        result = await self.session.execute(query.order_by(Task.created_at.desc()))
        return list(result.scalars().all())

    async def update_task(self, task_id: int, user_id: str, title: Optional[str] = None, description: Optional[str] = None) -> Optional[Task]:
        task = await self.get_task(task_id, user_id)
        if not task:
            return None
        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        task.updated_at = datetime.utcnow()
        await self.session.commit()
        await self.session.refresh(task)
        return task

    async def complete_task(self, task_id: int, user_id: str) -> Optional[Task]:
        task = await self.get_task(task_id, user_id)
        if not task:
            return None
        task.status = "completed"
        task.updated_at = datetime.utcnow()
        await self.session.commit()
        await self.session.refresh(task)
        return task

    async def delete_task(self, task_id: int, user_id: str) -> bool:
        task = await self.get_task(task_id, user_id)
        if not task:
            return False
        await self.session.delete(task)
        await self.session.commit()
        return True
