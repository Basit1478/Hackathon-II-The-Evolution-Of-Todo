"""Recurring Task Service - Kafka consumer via Dapr pub/sub.

Listens for tasks.completed events. If the completed task has a recurring
schedule (daily/weekly/monthly), creates a new task with the next due date.
"""

import logging
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from fastapi import FastAPI, Request
import httpx

from config import BACKEND_URL, DAPR_HTTP_PORT, PUBSUB_NAME

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("recurring-service")

app = FastAPI(title="Recurring Task Service")

INTERVAL_DELTA = {
    "daily": timedelta(days=1),
    "weekly": timedelta(weeks=1),
    "monthly": relativedelta(months=1),
}


@app.get("/dapr/subscribe")
async def subscribe():
    """Tell Dapr which topics this service subscribes to."""
    return [
        {
            "pubsubname": PUBSUB_NAME,
            "topic": "task-events",
            "route": "/events/task-completed",
        }
    ]


@app.post("/events/task-completed")
async def handle_task_completed(request: Request):
    """Handle tasks.completed events - create next recurring instance."""
    event = await request.json()
    data = event.get("data", {})
    event_type = event.get("type", "")

    if event_type != "tasks.completed":
        return {"status": "IGNORED"}

    recurring = data.get("recurring")
    if not recurring or recurring not in INTERVAL_DELTA:
        return {"status": "IGNORED"}

    user_id = data.get("user_id")
    title = data.get("title")
    due_date_str = data.get("due_date")

    if not user_id or not title:
        logger.warning("Missing user_id or title in event: %s", data)
        return {"status": "DROP"}

    # Calculate next due date
    if due_date_str:
        base = datetime.fromisoformat(due_date_str.replace("Z", "+00:00"))
    else:
        base = datetime.utcnow()

    delta = INTERVAL_DELTA[recurring]
    next_due = base + delta

    new_task = {
        "title": title,
        "description": data.get("description"),
        "priority": data.get("priority", "medium"),
        "tags": data.get("tags", []),
        "due_date": next_due.isoformat(),
        "recurring": recurring,
        "reminders": data.get("reminders", []),
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                f"{BACKEND_URL}/api/{user_id}/tasks",
                json=new_task,
            )
            resp.raise_for_status()
            logger.info(
                "Created recurring task for user=%s title='%s' next_due=%s",
                user_id,
                title,
                next_due.isoformat(),
            )
    except Exception:
        logger.exception("Failed to create recurring task")
        return {"status": "RETRY"}

    return {"status": "SUCCESS"}


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "recurring-service"}
