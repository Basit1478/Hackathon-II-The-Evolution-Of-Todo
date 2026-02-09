from datetime import datetime
from typing import Optional, List
from sqlmodel import Field, SQLModel, Column
from sqlalchemy import String, DateTime, Index
from sqlalchemy.dialects.postgresql import ARRAY


class Task(SQLModel, table=True):
    __tablename__ = "tasks"
    __table_args__ = (
        Index("ix_tasks_tags", "tags", postgresql_using="gin"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None)
    status: str = Field(default="pending", index=True)
    priority: str = Field(default="medium", index=True)
    tags: List[str] = Field(
        default=[],
        sa_column=Column(ARRAY(String), nullable=False, server_default="{}"),
    )
    due_date: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True, index=True),
    )
    recurring: Optional[str] = Field(default=None)
    reminders: List[datetime] = Field(
        default=[],
        sa_column=Column(
            ARRAY(DateTime(timezone=True)), nullable=False, server_default="{}"
        ),
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
