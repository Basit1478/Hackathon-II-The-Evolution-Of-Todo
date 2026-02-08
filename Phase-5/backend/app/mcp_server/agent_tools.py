from datetime import datetime
from typing import List, Optional
from agents import function_tool, RunContextWrapper
from sqlmodel import Session, select
from app.db.database import engine
from app.models.task import Task
from pydantic import BaseModel

class TaskMasterContext(BaseModel):
    user_id: str
    user_name: str = "User"

@function_tool
def add_task(ctx: RunContextWrapper[TaskMasterContext], title: str, description: str = "", priority: str = "medium", tags: List[str] = [], due_date: str = "", recurring: str = "", reminders: List[str] = []) -> str:
    """Add a new task."""
    user_id = ctx.context.user_id
    with Session(engine) as session:
        parsed_due = datetime.fromisoformat(due_date.replace("Z", "+00:00")) if due_date else None
        parsed_reminders = [datetime.fromisoformat(r.replace("Z", "+00:00")) for r in reminders if r]
        task = Task(user_id=user_id, title=title, description=description or None, status="pending", priority=priority if priority in ("high", "medium", "low") else "medium", tags=tags or [], due_date=parsed_due, recurring=recurring if recurring in ("daily", "weekly", "monthly") else None, reminders=parsed_reminders, created_at=datetime.utcnow(), updated_at=datetime.utcnow())
        session.add(task)
        session.commit()
        session.refresh(task)
        parts = [f"Task created: '{task.title}' (ID: {task.id})"]
        if task.priority != "medium": parts.append(f"Priority: {task.priority}")
        if task.tags: parts.append(f"Tags: {', '.join(task.tags)}")
        if task.due_date: parts.append(f"Due: {task.due_date.isoformat()}")
        if task.recurring: parts.append(f"Recurring: {task.recurring}")
        return " | ".join(parts)

@function_tool
def list_tasks(ctx: RunContextWrapper[TaskMasterContext], status: str = "all", priority: str = "", tag: str = "", search: str = "", sort_by: str = "", sort_order: str = "desc") -> str:
    """List tasks with optional filtering."""
    user_id = ctx.context.user_id
    with Session(engine) as session:
        statement = select(Task).where(Task.user_id == user_id)
        if status == "pending": statement = statement.where(Task.status == "pending")
        elif status == "completed": statement = statement.where(Task.status == "completed")
        if priority and priority in ("high", "medium", "low"): statement = statement.where(Task.priority == priority)
        tasks = session.exec(statement).all()
        if not tasks: return "No tasks found."
        task_list = []
        for t in tasks:
            icon = "done" if t.status == "completed" else "o"
            line = f"[{icon}] [ID: {t.id}] {t.title}"
            extras = []
            if t.priority != "medium": extras.append(t.priority)
            if t.tags: extras.append(f"tags: {','.join(t.tags)}")
            if t.due_date: extras.append(f"due: {t.due_date.strftime('%Y-%m-%d')}")
            if extras: line += f" ({', '.join(extras)})"
            task_list.append(line)
        return "Your Tasks:\n" + "\n".join(task_list)

@function_tool
def complete_task(ctx: RunContextWrapper[TaskMasterContext], task_id: int) -> str:
    """Mark a task as completed."""
    user_id = ctx.context.user_id
    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task or task.user_id != user_id: return f"Task {task_id} not found."
        task.status = "completed"
        task.updated_at = datetime.utcnow()
        session.commit()
        return f"Completed: '{task.title}'"

@function_tool
def delete_task(ctx: RunContextWrapper[TaskMasterContext], task_id: int) -> str:
    """Delete a task."""
    user_id = ctx.context.user_id
    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task or task.user_id != user_id: return f"Task {task_id} not found."
        title = task.title
        session.delete(task)
        session.commit()
        return f"Deleted: '{title}'"

@function_tool
def update_task(ctx: RunContextWrapper[TaskMasterContext], task_id: int, title: str = "", description: str = "", priority: str = "", tags: List[str] = [], due_date: str = "", recurring: str = "", reminders: List[str] = []) -> str:
    """Update a task's properties."""
    user_id = ctx.context.user_id
    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task or task.user_id != user_id: return f"Task {task_id} not found."
        if title: task.title = title
        if description: task.description = description
        if priority and priority in ("high", "medium", "low"): task.priority = priority
        if tags: task.tags = tags
        if due_date: task.due_date = datetime.fromisoformat(due_date.replace("Z", "+00:00"))
        if recurring and recurring in ("daily", "weekly", "monthly"): task.recurring = recurring
        if reminders: task.reminders = [datetime.fromisoformat(r.replace("Z", "+00:00")) for r in reminders if r]
        task.updated_at = datetime.utcnow()
        session.commit()
        return f"Updated: '{task.title}'"

def get_mcp_tools():
    return [add_task, list_tasks, complete_task, delete_task, update_task]
