import uvicorn
from fastapi import FastAPI, Depends, Request, HTTPException
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict
from fastapi_keycloak_middleware import CheckPermissions, AuthorizationMethod, KeycloakConfiguration, setup_keycloak_middleware
from fastapi.middleware.cors import CORSMiddleware
import logging
from fastapi.responses import JSONResponse

class Config(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )
    APP_KEYCLOAK_URL: str = "http://localhost:8080"
    APP_KEYCLOAK_REALM: str = "reports-realm"
    APP_KEYCLOAK_CLIENT_ID: str = "reports-api"
    APP_KEYCLOAK_CLIENT_SECRET: str = "client_secret"

configKeycloak = Config()
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

async def scope_mapper(claim_auth: dict):
    try:
       logging.debug(f"Received claim: {claim_auth}")
       permissions = []
       try:
           permissions = claim_auth["roles"]
       except KeyError:
           logging.warning("Unknown roles")
       return permissions
    except Exception as e:
        logging.debug(f"Received claim: {e}")
        if "403" in str(e):
            raise HTTPException(status_code=401, detail="Permission denied")
        else:
            raise  # Перебрасываем другие исключения

keycloakConfig = KeycloakConfiguration(
    url=configKeycloak.APP_KEYCLOAK_URL,
    realm=configKeycloak.APP_KEYCLOAK_REALM,
    client_id=configKeycloak.APP_KEYCLOAK_CLIENT_ID,
    client_secret=configKeycloak.APP_KEYCLOAK_CLIENT_SECRET,
    authorization_method=AuthorizationMethod.CLAIM,
    authorization_claim="realm_access"
)

app = FastAPI()

setup_keycloak_middleware(
    app,
    keycloak_configuration=keycloakConfig,
    scope_mapper=scope_mapper,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get(
    "/reports",
     dependencies=[Depends(CheckPermissions(["prothetic_user"]))],
)

def get_reports():
    reports = {
                  "status": True,
                  "list": [
                      {
                          "id": 1,
                          "value": "test1"
                      },
                      {
                          "id": 2,
                          "value": "test2"
                      },
                      {
                          "id": 3,
                          "value": "test3"
                      }
                  ]
              }
    return reports

@app.middleware("http")
async def change_403_to_401(request: Request, call_next):
    response = await call_next(request)
    if response.status_code == 403:
        return JSONResponse(status_code=401, content={"detail": "Unauthorized"})
    return response


if __name__ == '__main__':
    uvicorn.run('app:app', host="0.0.0.0", port=8000)