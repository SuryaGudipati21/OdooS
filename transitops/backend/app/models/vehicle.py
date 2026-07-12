"""
Owner: Dev A
"""
import enum
from sqlalchemy import Column, Integer, String, Float, Enum
from app.database import Base


class VehicleStatus(str, enum.Enum):
    available = "Available"
    on_trip = "On Trip"
    in_shop = "In Shop"
    retired = "Retired"


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String, unique=True, index=True, nullable=False)
    name_model = Column(String, nullable=False)
    type = Column(String, nullable=False)
    max_load_capacity = Column(Float, nullable=False)
    odometer = Column(Float, default=0)
    acquisition_cost = Column(Float, nullable=False)
    status = Column(Enum(VehicleStatus), default=VehicleStatus.available, nullable=False)
