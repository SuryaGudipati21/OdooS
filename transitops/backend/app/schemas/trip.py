from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.trip import TripStatus


class TripCreate(BaseModel):
    source: str = Field(min_length=1, max_length=120)
    destination: str = Field(min_length=1, max_length=120)
    vehicle_id: int = Field(gt=0)
    driver_id: int = Field(gt=0)
    cargo_weight: float = Field(gt=0)
    planned_distance: float = Field(gt=0)


class TripComplete(BaseModel):
    actual_distance: Optional[float] = Field(default=None, ge=0)
    final_odometer: Optional[float] = Field(default=None, ge=0)
    fuel_consumed: Optional[float] = Field(default=None, ge=0)


class TripRead(BaseModel):
    id: int
    source: str
    destination: str
    vehicle_id: int
    driver_id: int
    cargo_weight: float
    planned_distance: float
    actual_distance: Optional[float]
    final_odometer: Optional[float]
    fuel_consumed: Optional[float]
    status: TripStatus
    created_at: datetime

    model_config = {"from_attributes": True}
