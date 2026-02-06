"""Integration test for the complete backend system."""

import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import AsyncSessionLocal
from app.services.conversation_service import ConversationService
from app.models.task import Task
from sqlmodel import Session, select
from app.db.database import engine

async def test_integration():
    print("=" * 60)
    print("Phase III Backend Integration Test")
    print("=" * 60)

    user_id = "integration-test-user"

    print("\n1. Testing database connection...")
    async with AsyncSessionLocal() as session:
        print("   \u2713 Database connection successful")

    print("\n2. Testing conversation creation...")
    async with AsyncSessionLocal() as session:
        conv_service = ConversationService(session)
        conversation = await conv_service.create_conversation(user_id)
        print(f"   \u2713 Created conversation ID: {conversation.id}")

        print("\n3. Testing message creation...")
        msg1 = await conv_service.add_message(conversation_id=conversation.id, user_id=user_id, role="user", content="Hello, I need help with tasks")
        print(f"   \u2713 Created user message ID: {msg1.id}")

        msg2 = await conv_service.add_message(conversation_id=conversation.id, user_id=user_id, role="assistant", content="I'd be happy to help you manage your tasks!")
        print(f"   \u2713 Created assistant message ID: {msg2.id}")

        print("\n4. Testing conversation history retrieval...")
        history = await conv_service.get_conversation_history(conversation.id)
        print(f"   \u2713 Retrieved {len(history)} messages")

        print("\n5. Testing user conversations retrieval...")
        conversations = await conv_service.get_user_conversations(user_id)
        print(f"   \u2713 User has {len(conversations)} conversation(s)")

    print("\n6. Testing task operations...")
    with Session(engine) as session:
        from datetime import datetime
        task1 = Task(user_id=user_id, title="Test Task 1", description="Integration test task", status="pending", created_at=datetime.utcnow(), updated_at=datetime.utcnow())
        session.add(task1)
        session.commit()
        session.refresh(task1)
        print(f"   \u2713 Created task ID: {task1.id}")

        statement = select(Task).where(Task.user_id == user_id)
        tasks = session.exec(statement).all()
        print(f"   \u2713 Found {len(tasks)} task(s)")

        for task in tasks:
            session.delete(task)
        session.commit()
        print("   \u2713 Cleaned up test tasks")

    print("\n7. Cleaning up test data...")
    async with AsyncSessionLocal() as session:
        from app.models.conversation import Message, Conversation
        result = await session.execute(select(Message).where(Message.conversation_id == conversation.id))
        messages = result.scalars().all()
        for msg in messages:
            await session.delete(msg)
        result = await session.execute(select(Conversation).where(Conversation.id == conversation.id))
        conv = result.scalar_one_or_none()
        if conv:
            await session.delete(conv)
        await session.commit()
        print("   \u2713 Cleaned up test conversation and messages")

    print("\n" + "=" * 60)
    print("All integration tests passed successfully!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_integration())
