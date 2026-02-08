from typing import Annotated
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from .utils import decode_token
from ..db.database import get_session
from sqlmodel import Session

security = HTTPBearer()


def get_current_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
) -> str:
    """
    Extract and validate the user ID from the JWT token.

    Raises:
        HTTPException: If token is invalid or missing.
    """
    token = credentials.credentials
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_id


def get_db_session() -> Session:
    """
    FastAPI dependency that provides a database session.

    Yields:
        Session: SQLModel session for database operations.
    """
    with get_session() as session:
        yield session
