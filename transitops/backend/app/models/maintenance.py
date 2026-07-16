from datetime import date, datetime, timezone

from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey
from app.database import Base


class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    description = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)  # True = In Shop, False = closed
    opened_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    closed_at = Column(DateTime, nullable=True)

    # Added to match what the frontend maintenance form actually collects.
    maintenance_type = Column(String, nullable=True)
    cost = Column(Float, nullable=True)          # estimated cost, entered at creation
    service_center = Column(String, nullable=True)
    scheduled_date = Column(Date, nullable=True)
    notes = Column(String, nullable=True)
    final_cost = Column(Float, nullable=True)    # actual cost, entered at close
    completion_notes = Column(String, nullable=True)