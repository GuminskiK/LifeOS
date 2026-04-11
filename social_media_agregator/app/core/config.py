from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///:memory:"
    REDIS_URL: str = "redis://localhost:6379/0"
    APP_NAME: str = "LifeOS-Auth"
    SECRET_KEY: str = "your-secret-key"
    ALGORITHM: str = "HS256"
    MEDIA_ROOT: str = "./data/media"

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True
    )


settings = Settings()
