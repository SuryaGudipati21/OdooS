from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class MaintenanceCreate(BaseModel):
    vehicle_id: int = Field(gt=0)
    description: str = Field(min_length=1, max_length=500)
    maintenance_type: Optional[str] = None
    cost: Optional[float] = Field(default=None, ge=0)
    service_center: Optional[str] = None
    scheduled_date: Optional[date] = None
    notes: Optional[str] = None


class MaintenanceClose(BaseModel):
    final_cost: Optional[float] = Field(default=None, ge=0)
    completion_notes: Optional[str] = None


class MaintenanceRead(BaseModel):
    id: int
    vehicle_id: int
    description: str
    is_active: bool
    opened_at: datetime
    closed_at: Optional[datetime]
    maintenance_type: Optional[str]
    cost: Optional[float]
    service_center: Optional[str]
    scheduled_date: Optional[date]
    notes: Optional[str]
    final_cost: Optional[float]
    completion_notes: Optional[str]

    model_config = {"from_attributes": True}