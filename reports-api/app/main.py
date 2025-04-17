from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from random import randint, choice

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/reports")
def get_reports():
    fake_reports = [
        {
            "id": i,
            "name": f"Report {i}",
            "status": choice(["pending", "completed", "failed"]),
            "created_at": datetime.utcnow().isoformat(),
            "value": randint(100, 1000),
        }
        for i in range(1, 6)
    ]
    return {"reports": fake_reports}
