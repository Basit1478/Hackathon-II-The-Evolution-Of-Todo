from datetime import datetime
from typing import Optional
from pydantic import model_validator
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    username: str = Field(unique=True, index=True, max_length=100)
    hashed_password: str
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserCreate(SQLModel):
    """Schema for user registration. Accepts 'name' from frontend, maps to 'username'."""
    email: str = Field(max_length=255)
    name: Optional[str] = Field(default=None, min_length=3, max_length=100)
    username: Optional[str] = Field(default=None, min_length=3, max_length=100)
    password: str = Field(min_length=6, max_length=100)

    @model_validator(mode="after")
    def set_username_from_name(self):
        if self.username is None and self.name is not None:
            self.username = self.name
        if self.username is None:
            raise ValueError("Either 'name' or 'username' must be provided")
        return self


class UserLogin(SQLModel):
    """Schema for user login."""
    email: str
    password: str


class UserResponse(SQLModel):
    """Schema for user response (no password)."""
    id: int
    email: str
    username: str
    is_active: bool
    created_at: datetime


class Token(SQLModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
