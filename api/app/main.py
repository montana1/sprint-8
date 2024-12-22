from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_keycloak_middleware import setup_keycloak_middleware

from config import settings
from routes import api_router
from security import keycloak_config, scope_mapper


app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.APIVersion}/openapi.json",
)

setup_keycloak_middleware(
    app,
    keycloak_configuration=keycloak_config,
    scope_mapper=scope_mapper,
)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.APIVersion)
