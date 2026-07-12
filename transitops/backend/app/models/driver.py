"""
Owner: Dev A
"""
import enum
from sqlalchemy import Column, Integer, String, Float, Date, Enum
from app.database import Base


class DriverStatus(str, enum.Enum):
    available = "Available"
    on_trip = "On Trip"
    off_duty = "Off Duty"
    suspended = "Suspended"


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    license_number = Column(String, unique=True, nullable=False)
    license_category = Column(String, nullable=False)
    license_expiry_date = Column(Date, nullable=False)
    contact_number = Column(String, nullable=False)
    safety_score = Column(Float, default=100)
    status = Column(Enum(DriverStatus), default=DriverStatus.available, nullable=False)
