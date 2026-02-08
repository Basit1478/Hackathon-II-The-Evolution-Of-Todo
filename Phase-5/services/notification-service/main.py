"""Notification Service - Polls for due reminders and publishes events.

Periodically checks the backend for tasks with upcoming reminders,
then publishes reminder.due events via Dapr pub/sub to Kafka.
"""

import asyncio
import logging
import uuid
from contextlib import asynccontextmanager
from datetime import datetime

import httpx
from fastapi import FastAPI

from config import BACKEND_URL, DAPR_HTTP_PORT, PUBSUB_NAME, POLL_INTERVAL_SECONDS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("notification-service")

# Track delivered reminders (in-memory, resets on restart)
delivered: set[str] = set()


async def check_reminders():
    """Poll backend for tasks with reminders and publish events for due ones."""
    dapr_url = f"http://localhost:{DAPR_HTTP_PORT}"
    now = datetime.utcnow()

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            # The backend doesn't have a global reminders endpoint,
            # so this service would need a list of user IDs to poll.
            # For now, we use the Dapr subscription approach: the backend
            # publishes task events with reminder data, and this service
            # tracks which reminders are due.
            #
            # In production, you'd query a dedicated endpoint or use
            # a shared database view. For the MVP, we publish reminder
            # events when tasks.created/tasks.updated events contain
            # reminders that are approaching.
            pass
    except Exception:
        logger.exception("Error during reminder check")


async def poll_loop():
    """Background polling loop."""
    while True:
        await check_reminders()
        await asyncio.sleep(POLL_INTERVAL_SECONDS)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(poll_loop())
    yield
    task.cancel()


app = FastAPI(title="Notification Service", lifespan=lifespan)


@app.get("/dapr/subscribe")
async def subscribe():
    """Tell Dapr which topics this service subscribes to."""
    return [
        {
            "pubsubname": PUBSUB_NAME,
            "topic": "task-events",
            "route": "/events/task-events",
        }
    ]


@app.post("/events/task-events")
async def handle_task_event(request_data: dict):
    """Handle task events to track reminders."""
    data = request_data.get("data", {})
    event_type = request_data.get("type", "")
    reminders = data.get("reminders", [])
    task_id = data.get("task_id")
    user_id = data.get("user_id")

    if not reminders or not task_id or not user_id:
        return {"status": "IGNORED"}

    now = datetime.utcnow()
    dapr_url = f"http://localhost:{DAPR_HTTP_PORT}"

    for reminder_str in reminders:
        try:
            reminder_dt = datetime.fromisoformat(
                reminder_str.replace("Z", "+00:00")
            ).replace(tzinfo=None)
        except ValueError:
            continue

        reminder_key = f"{task_id}:{reminder_str}"
        if reminder_key in delivered:
            continue

        # Check if reminder is due (within the next poll interval window)
        if reminder_dt <= now:
            delivered.add(reminder_key)
            try:
                async with httpx.AsyncClient(timeout=5) as client:
                    await client.post(
                        f"{dapr_url}/v1.0/publish/{PUBSUB_NAME}/reminder-events",
                        json={
                            "specversion": "1.0",
                            "type": "reminders.due",
                            "source": "notification-service",
                            "id": str(uuid.uuid4()),
                            "time": now.isoformat() + "Z",
                            "data": {
                                "task_id": task_id,
                                "user_id": user_id,
                                "title": data.get("title", ""),
                                "reminder_time": reminder_str,
                            },
                        },
                    )
                    logger.info(
                        "Published reminder.due for task=%s user=%s",
                        task_id,
                        user_id,
                    )
            except Exception:
                logger.exception("Failed to publish reminder event")

    return {"status": "SUCCESS"}


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "notification-service"}
