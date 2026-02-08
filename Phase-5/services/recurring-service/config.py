import os

DAPR_HTTP_PORT = int(os.getenv("DAPR_HTTP_PORT", "3500"))
PUBSUB_NAME = os.getenv("PUBSUB_NAME", "taskmaster-pubsub")
BACKEND_URL = os.getenv("BACKEND_URL", "http://taskmaster-backend:8000")
