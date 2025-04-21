from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt
import requests
import os
import random

from jose.jwk import construct

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

KEYCLOAK_URL = os.getenv("KEYCLOAK_URL", "http://keycloak:8080")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "reports-realm")

security = HTTPBearer()


def get_public_key():
    certs_url = f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/certs"
    response = requests.get(certs_url)
    response.raise_for_status()
    jwks = response.json()
    return jwks['keys'][0]


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        key = get_public_key()
        public_key = construct(key)
        payload = jwt.decode(
            token,
            key=public_key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

    roles = payload.get("realm_access", {}).get("roles", [])
    if "prothetic_user" not in roles:
        raise HTTPException(status_code=403, detail="Insufficient role")

    return payload


@app.get("/reports")
def get_reports(user=Depends(verify_token)):
    data = [
        {"id": i, "status": random.choice(["ready", "in_progress", "delayed"])}
        for i in range(1, 6)
    ]
    return {"user": user["preferred_username"], "reports": data}
