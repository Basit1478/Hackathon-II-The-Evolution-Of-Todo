import logging
import uuid
from datetime import datetime
from typing import Any, Dict

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)


class EventService:
    def __init__(self):
        settings = get_settings()
        self.dapr_url = f"http://localhost:{settings.dapr_http_port}"
        self.pubsub_name = settings.pubsub_name

    async def publish_event(
        self, topic: str, event_type: str, data: Dict[str, Any]
    ) -> None:
        url = f"{self.dapr_url}/v1.0/publish/{self.pubsub_name}/{topic}"
        event = {
            "specversion": "1.0",
            "type": event_type,
            "source": "/api/tasks",
            "id": str(uuid.uuid4()),
            "time": datetime.utcnow().isoformat() + "Z",
            "datacontenttype": "application/json",
            "data": data,
        }
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(
                    url,
                    json=event,
                    headers={"Content-Type": "application/cloudevents+json"},
                )
                if resp.status_code >= 400:
                    logger.warning(
                        "Dapr publish failed: %s %s", resp.status_code, resp.text
                    )
        except Exception as e:
            logger.warning("Failed to publish event to %s: %s", topic, e)
