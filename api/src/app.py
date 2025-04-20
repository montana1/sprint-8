import uvicorn
from fastapi import FastAPI, Depends, Response
from fastapi.middleware.cors import CORSMiddleware
import ujson
from config import settings
from auth import get_prothetic_user, User


app = FastAPI(
    title="Reports API",
    description="API for reports management",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/reports")
def reports(
    user: User = Depends(get_prothetic_user),
) -> Response:
    data = {
        "message": f"Welcome, user: {user.username}",
        "user_info": user.model_dump(),
    }
    json_data = ujson.dumps(data)
    return Response(
        content=json_data,
        media_type="application/json",
        headers={
            "Content-Disposition": "attachment; filename=report.json",
            "Content-Length": str(len(json_data))
        }
    )


@app.get("/healthcheck")
def healthcheck():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("app:app", host=settings.APP_HOST, port=settings.APP_PORT)
