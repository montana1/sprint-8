from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env.shared",
        env_ignore_empty=True,
        extra="ignore",
    )
    APIVersion: str = ""
    APP_NAME: str = "Reporter"
    KEYCLOAK_URL: str = "http://localhost:8080"
    KEYCLOAK_REALM: str = "reports-realm"
    KEYCLOAK_CLIENT_ID: str = "client"
    KEYCLOAK_CLIENT_SECRET: str = "secret"


settings = Settings()
