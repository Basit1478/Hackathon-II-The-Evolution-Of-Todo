from app.db.database import engine
from sqlmodel import text

with engine.connect() as conn:
    result = conn.execute(text("SELECT tablename FROM pg_tables WHERE schemaname = 'public'"))
    tables = [row[0] for row in result]
    print("Database tables:", tables)

    # Check tasks table
    result = conn.execute(text("SELECT COUNT(*) FROM tasks"))
    count = result.scalar()
    print(f"Tasks count: {count}")

    # Check conversations table
    result = conn.execute(text("SELECT COUNT(*) FROM conversations"))
    count = result.scalar()
    print(f"Conversations count: {count}")

    # Check messages table
    result = conn.execute(text("SELECT COUNT(*) FROM messages"))
    count = result.scalar()
    print(f"Messages count: {count}")
