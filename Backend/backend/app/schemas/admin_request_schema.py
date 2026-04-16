from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


class AdminRequestCreateResponse(BaseModel):
    message: str


class AdminRequestAction(BaseModel):
    action: Literal["approved", "rejected"]


class AdminRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    status: Literal["pending", "approved", "rejected"]
    requested_at: datetime
    reviewed_by: int | None = None
    reviewed_at: datetime | None = None
