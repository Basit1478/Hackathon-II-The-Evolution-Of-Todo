from app.routes.chat import router as chat_router
from app.routes.tasks import router as tasks_router
from app.routes.auth import router as auth_router

__all__ = ["chat_router", "tasks_router", "auth_router"]
