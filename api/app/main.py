import httpx
from jose import jwt, JWTError
from fastapi import Depends, Security, FastAPI, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Позволяет всем доменам обращаться к API
    allow_credentials=True,
    allow_methods=["*"],  # Позволяет все методы (GET, POST и т.д.)
    allow_headers=["*"],  # Позволяет все заголовки
)


KEYCLOAK_URL = "http://keycloak:8080"
REALM_NAME = "reports-realm"
CLIENT_ID = "reports-frontend"

# Получаем публичный ключ из Keycloak
async def get_keycloak_public_key():
    url = f"{KEYCLOAK_URL}/realms/{REALM_NAME}/protocol/openid-connect/certs"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        jwks = response.json()
        return jwks['keys'][1]

# Проверка токена
async def verify_token(jwt_token: str, audience: str):
    try:
        jwk = await get_keycloak_public_key()
        decoded_token = jwt.decode(
            jwt_token,
            jwk,
            algorithms=["RS256"],
            audience=audience
        )
        return decoded_token
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {e}"
        )

# Проверяем роль
async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(HTTPBearer())):
    token = credentials.credentials
    decoded_token = await verify_token(token, CLIENT_ID)
    roles = decoded_token.get("realm_access", {}).get("roles", [])
    if "prothetic_user" not in roles:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not enough permissions"
        )

    return decoded_token

def generate_report():
    return {"reports": "Это пример отчета", "status": "success"}

@app.get("/reports")
async def get_report(user: dict = Depends(get_current_user)):
    report = generate_report()
    return JSONResponse(content=report)
