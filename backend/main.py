import os
import logging
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from keycloak import KeycloakOpenID
from jwcrypto import jwk  # Import jwcrypto for JWK conversion

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Read Keycloak configuration from environment variables
KEYCLOAK_SERVER_URL = os.getenv("KEYCLOAK_SERVER_URL", "http://keycloak:8080")
REALM_NAME = os.getenv("REALM_NAME", "reports-realm")
# This API uses the reports-api client configuration
CLIENT_ID = os.getenv("CLIENT_ID", "reports-api")
CLIENT_SECRET = os.getenv("CLIENT_SECRET", "IiePgosFlLulH7K9A8WEY0bKHZkKzqYg")

# Initialize Keycloak client
keycloak_openid = KeycloakOpenID(
    server_url=KEYCLOAK_SERVER_URL,
    client_id=CLIENT_ID,
    realm_name=REALM_NAME,
    client_secret_key=CLIENT_SECRET
)

# Cache for the public key as a JWK object
PUBLIC_JWK = None

def format_public_key(raw_key: str) -> str:
    """
    Formats the raw public key (typically a Base64 string) into a valid PEM format
    with line breaks every 64 characters.
    """
    raw_key = raw_key.strip()
    lines = [raw_key[i:i+64] for i in range(0, len(raw_key), 64)]
    pem_key = "-----BEGIN PUBLIC KEY-----\n" + "\n".join(lines) + "\n-----END PUBLIC KEY-----"
    return pem_key

def verify_token(authorization: str = Header(None)):
    """
    Extracts the token from the Authorization header and attempts to validate it.
    First, it uses introspection (logging any errors), then falls back to public-key
    decoding using a JWK-converted key.
    """
    if not authorization or not authorization.startswith("Bearer "):
        logger.error("Missing or improperly formatted Authorization header")
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.split("Bearer ")[1]
    logger.info("Received token for validation.")

    # Step 1: Attempt token introspection
    introspection_failed = False
    try:
        introspect_response = keycloak_openid.introspect(token)
        logger.info("Introspection response: %s", introspect_response)
        if not introspect_response.get("active", False):
            logger.error("Token introspection indicates token is inactive. Details: %s", introspect_response)
            introspection_failed = True
        else:
            logger.info("Token introspection successful; token is active.")
    except Exception as e:
        logger.exception("Error during token introspection: %s", e)
        introspection_failed = True

    if introspection_failed:
        logger.warning("Introspection failed or token inactive; falling back to public-key token decoding.")

    # Step 2: Public-key decoding of the token using a JWK object
    global PUBLIC_JWK
    try:
        if PUBLIC_JWK is None:
            raw_public_key = keycloak_openid.public_key()
            formatted_public_key = format_public_key(raw_public_key)
            logger.info("Formatted public key:\n%s", formatted_public_key)
            # Convert the PEM-formatted key into a JWK object
            jwk_obj = jwk.JWK.from_pem(formatted_public_key.encode("utf-8"))
            PUBLIC_JWK = jwk_obj
            logger.info("Converted public key to JWK object.")
        user_info = keycloak_openid.decode_token(token, key=PUBLIC_JWK)
        logger.info("Decoded token successfully: %s", user_info)
        return user_info
    except Exception as e:
        logger.exception("Token decoding failed: %s", e)
        raise HTTPException(status_code=401, detail="Invalid token (decoding error)")

@app.get("/reports")
async def get_reports(user: dict = Depends(verify_token)):
    """
    Protected endpoint that returns a generated file if the token (generated via reports-frontend)
    is valid and contains the 'prothetic_user' role.
    """
    roles = user.get("realm_access", {}).get("roles", [])
    logger.info("User roles from token: %s", roles)
    if "prothetic_user" not in roles:
        logger.error("User does not have the required 'prothetic_user' role.")
        raise HTTPException(status_code=403, detail="Forbidden: Missing prothetic_user role")

    file_path = "/tmp/test_data.txt"
    try:
        with open(file_path, "w") as f:
            f.write("This is a test file generated on the fly.\nData: 123456")
        logger.info("Test file generated successfully at %s", file_path)
    except Exception as e:
        logger.exception("Error generating test file: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error while generating file")

    return FileResponse(file_path, filename="test_data.txt", media_type="text/plain")
