from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class MaintenanceCreate(BaseModel):
    vehicle_id: int = Field(gt=0)
    description: str = Field(min_length=1, max_length=500)


class MaintenanceRead(BaseModel):
    id: int
    vehicle_id: int
    description: str
    is_active: bool
    opened_at: datetime
    closed_at: Optional[datetime]

    model_config = {"from_attributes": True}
