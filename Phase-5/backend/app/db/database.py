from sqlmodel import SQLModel, create_engine, Session
from .config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=True,
    connect_args={
        "sslmode": "require"
    } if "postgresql" in settings.DATABASE_URL else {}
)


def get_session():
    with Session(engine) as session:
        yield session


def init_db():
    SQLModel.metadata.create_all(engine)
