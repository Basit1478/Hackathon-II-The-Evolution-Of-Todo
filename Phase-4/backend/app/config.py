from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://user:pass@localhost/taskmaster"
    groq_api_key: str = ""
    jwt_secret: str = "your-secret-key"
    jwt_algorithm: str = "HS256"
    cors_origins: list[str] = ["http://localhost:3000"]
    better_auth_secret: str = ""
    
    class Config:
        env_file = ".env"

@lru_cache
def get_settings() -> Settings:
    return Settings()
