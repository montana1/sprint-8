from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from typing import Dict
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Keycloak public key
KEYCLOAK_PUBLIC_KEY = """-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnDgTbxwTHDrgWTM1RgsF
LKXTdkbqXarluqW8JATs8YvzfolGcUZY/8K21bFb25klUlAMmsNYfh4KCmAU2Nkq
CzQrUz7CwyOdnIjgz9MgmStGmGf1yXup8rd7xORySLRV4OIdhsSCtYBpAyZ17QlY
Cj7P5HvxxYmyLB9zH67W9LPlC9GQY/eJxgHoujvi1Je3wPtdsOO1gNx73hgxvBY3
JKNDK9TItouv7K5y3rmZy/hnpgFaIuqJA9l8Xf4wmYDy9zRT3XtrRqwBjfdl7Cxe
0+ewOVx4eJ/MQ2blF1FHq/wMUvCtYflN+brd6O++0Q3GIPJS7cnDszN7C282SrWX
XQIDAQAB
-----END PUBLIC KEY-----"""
ALGORITHM = "RS256"
ROLE_REQUIRED = "prothetic_user"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def decode_jwt(token: str) -> Dict:
    """
    Decode JWT token using the public key and verify the signature.

    Args:
        token (str): JWT token.

    Returns:
        Dict: Decoded token payload.

    Raises:
        HTTPException: If token is invalid.
    """
    try:
        payload = jwt.decode(token, KEYCLOAK_PUBLIC_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def validate_user_role(token: str = Depends(oauth2_scheme)):
    """
    Validate user role in the decoded JWT token.

    Args:
        token (str): JWT token.

    Raises:
        HTTPException: If the role is not valid.
    """
    payload = decode_jwt(token)
    roles = payload.get("realm_access", {}).get("roles", [])
    if ROLE_REQUIRED not in roles:
        raise HTTPException(status_code=403, detail="Insufficient role")

@app.get("/reports")
def get_report(validate: None = Depends(validate_user_role)):
    """
    Return a sample report for authorized users.

    Returns:
        Dict: Sample report data.
    """
    return {"report": "This is a very important report"}