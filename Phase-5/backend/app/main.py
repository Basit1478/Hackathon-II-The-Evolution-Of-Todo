from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db import init_db
from app.routes import chat_router, tasks_router, auth_router

import logging

logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="TaskMaster Pro AI",
    description="Natural Language Task Management API",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(tasks_router)


@app.get("/")
async def root():
    return {"name": "TaskMaster Pro AI", "version": "2.0.0", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/dapr/subscribe")
async def dapr_subscribe():
    return [
        {
            "pubsubname": settings.pubsub_name,
            "topic": "reminder-events",
            "route": "/events/reminder-due",
        }
    ]


@app.post("/events/reminder-due")
async def handle_reminder_due(request: Request):
    event = await request.json()
    data = event.get("data", {})
    logger.info(
        "Reminder due: task_id=%s user_id=%s title='%s' at=%s",
        data.get("task_id"),
        data.get("user_id"),
        data.get("title"),
        data.get("reminder_time"),
    )
    return {"status": "SUCCESS"}
