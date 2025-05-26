import os
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware import Middleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi_keycloak_middleware import KeycloakMiddleware, get_user, KeycloakConfiguration, setup_keycloak_middleware

# Load environment variables
KEYCLOAK_SERVER_URL = os.getenv("KEYCLOAK_SERVER_URL")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM")
KEYCLOAK_CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID")

if not all([KEYCLOAK_SERVER_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID]):
    raise ValueError("Missing Keycloak configuration in environment variables.")

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow requests from this origin
    allow_credentials=True,
    allow_methods=["*"],  # Or specify only the needed HTTP methods
    allow_headers=["*"],  # Or specify only the needed headers
)

# Initialize Keycloak middleware

keycloak_config = KeycloakConfiguration(realm=KEYCLOAK_REALM, 
                                        url=KEYCLOAK_SERVER_URL, 
                                        client_id=KEYCLOAK_CLIENT_ID,
                                        client_secret="oNwoLQdvJAvRcL89SydqCWCe5ry1jMgq",
                                        validate_token=True)
print(f"{keycloak_config=}")

setup_keycloak_middleware(
     app,
     keycloak_configuration=keycloak_config
 )

# Public endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the secured FastAPI application!"}


from fastapi import Request

print("New version!")
async def get_user_with_diagnostics(request: Request):
    print(f"{request=}")
    print(f"{request.scope=}")
    return(get_user(request))


# Secured endpoint
@app.get("/reports")
def read_reports():
    #def read_reports(user: dict = Depends(get_user_with_diagnostics)):   
    return {
        "message": "You are authorized to access reports."
    }