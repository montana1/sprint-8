from fastapi import APIRouter, Depends
from fastapi_keycloak_middleware import CheckPermissions

from models import Report


api_router = APIRouter()


@api_router.get(
    "/reports",
    response_model=list[Report],
    dependencies=[Depends(CheckPermissions(["prothetic_user"]))],
)
def get_reports() -> list[Report]:
    reports = [Report(info="Some interesting data")]
    return reports
