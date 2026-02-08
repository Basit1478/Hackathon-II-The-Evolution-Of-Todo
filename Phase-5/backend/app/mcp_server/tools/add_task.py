from typing import Dict, Any, Optional
from ..config import settings
from ..db.database import get_session
from ..models.task import Task
from sqlmodel import Session


class TaskService:
    """
    Service class for managing tasks.
    """

    def __init__(self):
        self.session = get_session()

    def create_task(
        self,
        title: str,
        description: Optional[str] = None,
        due_date: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Create a new task.

        Args:
            title: Task title
            description: Task description (optional)
            due_date: Due date in ISO format (optional)

        Returns:
            Dict with task details
        """
        task = Task(
            title=title,
            description=description,
            status="pending",
            due_date=due_date,
        )
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        return self._task_to_dict(task)

    def list_tasks(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List all tasks, optionally filtered by status.

        Args:
            status: Filter by task status (pending, in_progress, done)

        Returns:
            List of task dictionaries
        """
        query = self.session.query(Task)
        if status:
            query = query.filter(Task.status == status)
        tasks = query.all()
        return [self._task_to_dict(task) for task in tasks]

    def update_task_status(
        self, task_id: int, status: str
    ) -> Optional[Dict[str, Any]]:
        """
        Update a task's status.

        Args:
            task_id: Task ID to update
            status: New status (pending, in_progress, done)

        Returns:
            Updated task dictionary or None if task not found
        """
        task = self.session.get(Task, task_id)
        if not task:
            return None
        task.status = status
        self.session.commit()
        self.session.refresh(task)
        return self._task_to_dict(task)

    def _task_to_dict(self, task: Task) -> Dict[str, Any]:
        """Convert Task model to dictionary."""
        return {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "due_date": task.due_date,
            "created_at": task.created_at,
            "updated_at": task.updated_at,
        }

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.session.close()
