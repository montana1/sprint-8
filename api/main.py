from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jose import jwt, jwk, JWTError
import os
import requests

KEYCLOAK_URL = os.environ.get("KEYCLOAK_URL", "http://localhost:8080")
KEYCLOAK_REALM = os.environ.get("KEYCLOAK_REALM", "reports-realm")
REQUIRED_ROLE = os.environ.get("REQUIRED_ROLE", "prothetic_user")
API_AUDIENCE = "reports-api"

KEYCLOAK_ISSUER = f"http://localhost:8080/realms/{KEYCLOAK_REALM}"
KEYCLOAK_CERTS_URL = f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/certs"


app = FastAPI()
bearer_scheme = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["authorization"],
)

def get_public_key(creds: str):
    try:
        user_kid = jwt.get_unverified_header(creds).get("kid")
        response = requests.get(KEYCLOAK_CERTS_URL).json()
        keys = response["keys"]
        key = next((k for k in keys if k["kid"] == user_kid), None)
        return jwk.construct(key)

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch public key: {str(e)}")


def get_user(token: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    try:
        public_key = get_public_key(token.credentials)
        payload = jwt.decode(
            token.credentials,
            key=public_key,
            algorithms=["RS256"],
            audience="reports-api",
            issuer=KEYCLOAK_ISSUER
        )
        roles = payload.get("realm_access", {}).get("roles", [])
        if REQUIRED_ROLE not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role")
        return payload.get("name", "unknown")

    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {str(e)}")


@app.get("/reports")
def get_reports(user: str = Depends(get_user)):
    return {
        "report": "sample report data",
        "user": user
    }