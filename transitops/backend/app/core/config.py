"""
Owner: Dev A
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://transitops:transitops@localhost:5432/transitops"
    JWT_SECRET_KEY: str = "change-me-before-demo"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 8  # covers the whole hackathon session

    class Config:
        env_file = ".env"


settings = Settings()
