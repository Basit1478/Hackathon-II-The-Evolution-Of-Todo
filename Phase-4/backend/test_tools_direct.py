"""Test database operations directly."""

from datetime import datetime
from sqlmodel import Session, select
from app.db.database import engine
from app.models.task import Task

user_id = "test-user-direct-123"

print("=" * 50)
print("Testing Database Operations Directly")
print("=" * 50)

with Session(engine) as session:
    print("\n1. Creating tasks...")
    task1 = Task(user_id=user_id, title="Buy groceries", description="Milk, eggs, bread", status="pending", created_at=datetime.utcnow(), updated_at=datetime.utcnow())
    session.add(task1)
    session.commit()
    session.refresh(task1)
    print(f"   Created: {task1.title} (ID: {task1.id})")

    task2 = Task(user_id=user_id, title="Call dentist", status="pending", created_at=datetime.utcnow(), updated_at=datetime.utcnow())
    session.add(task2)
    session.commit()
    session.refresh(task2)
    print(f"   Created: {task2.title} (ID: {task2.id})")

    print("\n2. Listing tasks...")
    statement = select(Task).where(Task.user_id == user_id)
    tasks = session.exec(statement).all()
    for t in tasks:
        print(f"   {'\u2713' if t.status == 'completed' else '\u25cb'} [ID: {t.id}] {t.title} - {t.status}")

    print(f"\n3. Completing task {task1.id}...")
    task1.status = "completed"
    task1.updated_at = datetime.utcnow()
    session.commit()
    print(f"   \u2713 Completed: {task1.title}")

    print(f"\n4. Updating task {task2.id}...")
    task2.title = "Call dentist for appointment"
    task2.description = "Ask about cleaning"
    task2.updated_at = datetime.utcnow()
    session.commit()
    print(f"   \u2713 Updated: {task2.title}")

    print("\n5. Listing tasks after updates...")
    tasks = session.exec(statement).all()
    for t in tasks:
        print(f"   {'\u2713' if t.status == 'completed' else '\u25cb'} [ID: {t.id}] {t.title} - {t.status}")

    print(f"\n6. Deleting task {task1.id}...")
    session.delete(task1)
    session.commit()
    print(f"   \u2717 Deleted: Buy groceries")

    print("\n7. Final task list...")
    tasks = session.exec(statement).all()
    for t in tasks:
        print(f"   {'\u2713' if t.status == 'completed' else '\u25cb'} [ID: {t.id}] {t.title} - {t.status}")

    print("\n8. Cleaning up test data...")
    for t in tasks:
        session.delete(t)
    session.commit()
    print("   \u2713 Test data cleaned up")

print("\n" + "=" * 50)
print("All database operations completed successfully!")
print("=" * 50)
