from pydantic import BaseModel


class Report(BaseModel):
    info: str
