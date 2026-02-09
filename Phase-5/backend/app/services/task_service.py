from datetime import datetime
from typing import Optional, List
from sqlmodel import select, case, col
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import or_, cast, ARRAY, Text
from app.models.task import Task


class TaskService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_task(
        self,
        user_id: str,
        title: str,
        description: Optional[str] = None,
        priority: str = "medium",
        tags: Optional[List[str]] = None,
        due_date: Optional[datetime] = None,
        recurring: Optional[str] = None,
        reminders: Optional[List[datetime]] = None,
    ) -> Task:
        task = Task(
            user_id=user_id,
            title=title,
            description=description,
            priority=priority,
            tags=tags or [],
            due_date=due_date,
            recurring=recurring,
            reminders=reminders or [],
        )
        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task)
        return task

    async def get_task(self, task_id: int, user_id: str) -> Optional[Task]:
        result = await self.session.execute(
            select(Task).where(Task.id == task_id, Task.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def list_tasks(
        self,
        user_id: str,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        tag: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_order: str = "desc",
    ) -> List[Task]:
        query = select(Task).where(Task.user_id == user_id)

        if status and status != "all":
            query = query.where(Task.status == status)
        if priority:
            query = query.where(Task.priority == priority)
        if tag:
            query = query.where(
                Task.tags.contains(cast([tag], ARRAY(Text)))
            )
        if search:
            pattern = f"%{search}%"
            query = query.where(
                or_(
                    Task.title.ilike(pattern),
                    Task.description.ilike(pattern),
                )
            )

        if sort_by == "priority":
            priority_order = case(
                (Task.priority == "high", 1),
                (Task.priority == "medium", 2),
                (Task.priority == "low", 3),
                else_=4,
            )
            if sort_order == "asc":
                query = query.order_by(priority_order.asc())
            else:
                query = query.order_by(priority_order.desc())
        elif sort_by == "name":
            if sort_order == "asc":
                query = query.order_by(Task.title.asc())
            else:
                query = query.order_by(Task.title.desc())
        elif sort_by == "date":
            if sort_order == "asc":
                query = query.order_by(Task.due_date.asc().nulls_last())
            else:
                query = query.order_by(Task.due_date.desc().nulls_last())
        else:
            query = query.order_by(Task.created_at.desc())

        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def update_task(
        self,
        task_id: int,
        user_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        priority: Optional[str] = None,
        tags: Optional[List[str]] = None,
        due_date: Optional[datetime] = None,
        recurring: Optional[str] = None,
        reminders: Optional[List[datetime]] = None,
    ) -> Optional[Task]:
        task = await self.get_task(task_id, user_id)
        if not task:
            return None

        changes = {}
        if title is not None:
            changes["title"] = {"old": task.title, "new": title}
            task.title = title
        if description is not None:
            changes["description"] = {"old": task.description, "new": description}
            task.description = description
        if priority is not None:
            changes["priority"] = {"old": task.priority, "new": priority}
            task.priority = priority
        if tags is not None:
            changes["tags"] = {"old": list(task.tags), "new": tags}
            task.tags = tags
        if due_date is not None:
            changes["due_date"] = {
                "old": task.due_date.isoformat() if task.due_date else None,
                "new": due_date.isoformat(),
            }
            task.due_date = due_date
        if recurring is not None:
            changes["recurring"] = {"old": task.recurring, "new": recurring}
            task.recurring = recurring
        if reminders is not None:
            changes["reminders"] = {
                "old": [r.isoformat() for r in task.reminders] if task.reminders else [],
                "new": [r.isoformat() for r in reminders],
            }
            task.reminders = reminders

        task.updated_at = datetime.utcnow()
        task._changes = changes

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

    async def get_tasks_with_reminders(
        self, user_id: str
    ) -> List[Task]:
        now = datetime.utcnow()
        query = (
            select(Task)
            .where(
                Task.user_id == user_id,
                Task.status == "pending",
                Task.reminders != [],
                Task.due_date.isnot(None),
                Task.due_date > now,
            )
            .order_by(Task.due_date.asc())
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())
