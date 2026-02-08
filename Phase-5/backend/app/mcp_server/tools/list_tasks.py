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
