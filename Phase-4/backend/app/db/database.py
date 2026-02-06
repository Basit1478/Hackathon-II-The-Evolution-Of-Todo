from sqlmodel import SQLModel, create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.config import get_settings

settings = get_settings()

async_engine = create_async_engine(settings.database_url, echo=False, pool_size=5, max_overflow=10)
AsyncSessionLocal = sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)

sync_database_url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")
engine = create_engine(sync_database_url, echo=False, pool_size=5, max_overflow=10)

async def get_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    async with async_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
