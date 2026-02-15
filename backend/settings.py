from pydantic_settings import BaseSettings
from typing import Optional
from pydantic import Field


class Settings(BaseSettings):
    # Database settings
    database_url: str = Field(default="", alias="DATABASE_URL")
    neon_database_url: str = Field(default="", alias="NEON_DATABASE_URL")

    # API settings
    api_host: str = Field(default="127.0.0.1", alias="API_HOST")
    api_port: int = Field(default=8000, alias="API_PORT")
    api_reload: bool = Field(default=True, alias="API_RELOAD")

    # JWT settings
    secret_key: str = Field(default="your-super-secret-key-change-in-production", alias="SECRET_KEY")
    better_auth_jwt_secret: str = Field(default="default-shared-secret-change-me", alias="BETTER_AUTH_JWT_SECRET")
    algorithm: str = Field(default="HS256", alias="ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, alias="ACCESS_TOKEN_EXPIRE_MINUTES")

    # Debug setting
    debug: bool = Field(default=True, alias="DEBUG")

    class Config:
        env_file = ".env"
        populate_by_name = True  # This allows both alias and field name
        case_sensitive = False
        extra = "ignore"  # This will ignore extra variables in the env file


# Create a single instance of settings
settings = Settings()