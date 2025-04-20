from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2AuthorizationCodeBearer
import jwt
from jwt.exceptions import InvalidTokenError
from pydantic import BaseModel
from typing import Optional, List
from config import settings


class User(BaseModel):
    username: str
    roles: List[str] = []
    email: Optional[str] = None


oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=f"{settings.KEYCLOAK_SERVER_URL}/realms/{settings.REALM}/protocol/openid-connect/auth",
    tokenUrl=f"{settings.KEYCLOAK_SERVER_URL}/realms/{settings.REALM}/protocol/openid-connect/token",
)


async def get_user(token: str = Depends(oauth2_scheme)) -> User:
    try:
        payload = jwt.decode(
            token,
            options={"verify_signature": False},
        )
        
        username = payload.get("preferred_username", "")
        email = payload.get("email", "")
        
        realm_access = payload.get("realm_access", {})
        roles = realm_access.get("roles", [])
        
        return User(username=username, email=email, roles=roles)
        
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невалидный токен",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ошибка при авторизации",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_prothetic_user(user: User = Depends(get_user)) -> User:
    if "prothetic_user" not in user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав."
        )
    return user