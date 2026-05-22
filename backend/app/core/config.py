from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres123@db:5432/antidesperdicio"
    REDIS_URL: str = "redis://redis:6379"
    SECRET_KEY: str = "dev-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    OPENAI_API_KEY: str = ""
    APP_ENV: str = "development"
    APP_PORT: int = 8000

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
