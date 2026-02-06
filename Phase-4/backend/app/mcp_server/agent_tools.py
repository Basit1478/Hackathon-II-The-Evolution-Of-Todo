from datetime import datetime
from agents import function_tool, RunContextWrapper
from sqlmodel import Session, select
from app.db.database import engine
from app.models.task import Task
from pydantic import BaseModel

class TaskMasterContext(BaseModel):
    user_id: str
    user_name: str = "User"

@function_tool
def add_task(ctx: RunContextWrapper[TaskMasterContext], title: str, description: str = "") -> str:
    user_id = ctx.context.user_id
    with Session(engine) as session:
        task = Task(user_id=user_id, title=title, description=description or None, status="pending", created_at=datetime.utcnow(), updated_at=datetime.utcnow())
        session.add(task)
        session.commit()
        session.refresh(task)
        return f"Task created: '{task.title}' (ID: {task.id})"

@function_tool
def list_tasks(ctx: RunContextWrapper[TaskMasterContext], status: str = "all") -> str:
    user_id = ctx.context.user_id
    with Session(engine) as session:
        statement = select(Task).where(Task.user_id == user_id)
        if status != "all":
            statement = statement.where(Task.status == status)
        tasks = session.exec(statement).all()
        if not tasks:
            return "No tasks found."
        return "\n".join([f"[ID: {t.id}] {t.title} - {t.status}" for t in tasks])

@function_tool
def complete_task(ctx: RunContextWrapper[TaskMasterContext], task_id: int) -> str:
    user_id = ctx.context.user_id
    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task or task.user_id != user_id:
            return f"Task {task_id} not found."
        task.status = "completed"
        task.updated_at = datetime.utcnow()
        session.commit()
        return f"Completed: '{task.title}'"

@function_tool
def delete_task(ctx: RunContextWrapper[TaskMasterContext], task_id: int) -> str:
    user_id = ctx.context.user_id
    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task or task.user_id != user_id:
            return f"Task {task_id} not found."
        title = task.title
        session.delete(task)
        session.commit()
        return f"Deleted: '{title}'"

@function_tool
def update_task(ctx: RunContextWrapper[TaskMasterContext], task_id: int, title: str = None, description: str = None) -> str:
    user_id = ctx.context.user_id
    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task or task.user_id != user_id:
            return f"Task {task_id} not found."
        if title:
            task.title = title
        if description:
            task.description = description
        task.updated_at = datetime.utcnow()
        session.commit()
        return f"Updated: '{task.title}'"

def get_mcp_tools():
    return [add_task, list_tasks, complete_task, delete_task, update_task]
