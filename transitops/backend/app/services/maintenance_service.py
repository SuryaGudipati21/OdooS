from datetime import date, datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.models.maintenance import MaintenanceLog
from app.models.vehicle import Vehicle, VehicleStatus


class MaintenanceRuleError(ValueError):
    """Raised when a maintenance workflow transition is invalid."""


def _commit(db: Session) -> None:
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise


def create_maintenance(
    db: Session,
    *,
    vehicle_id: int,
    description: str,
    maintenance_type: Optional[str] = None,
    cost: Optional[float] = None,
    service_center: Optional[str] = None,
    scheduled_date: Optional[date] = None,
    notes: Optional[str] = None,
) -> MaintenanceLog:
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle:
        raise MaintenanceRuleError("Vehicle not found")
    if vehicle.status == VehicleStatus.retired:
        raise MaintenanceRuleError("Retired vehicles cannot be put into maintenance")
    if vehicle.status != VehicleStatus.available:
        raise MaintenanceRuleError("Only Available vehicles can enter maintenance")

    log = MaintenanceLog(
        vehicle_id=vehicle_id,
        description=description,
        is_active=True,
        maintenance_type=maintenance_type,
        cost=cost,
        service_center=service_center,
        scheduled_date=scheduled_date,
        notes=notes,
    )
    db.add(log)
    vehicle.status = VehicleStatus.in_shop
    _commit(db)
    db.refresh(log)
    return log


def close_maintenance(
    db: Session,
    maintenance_id: int,
    *,
    final_cost: Optional[float] = None,
    completion_notes: Optional[str] = None,
) -> MaintenanceLog:
    log = db.get(MaintenanceLog, maintenance_id)
    if not log:
        raise MaintenanceRuleError("Maintenance record not found")
    if not log.is_active:
        raise MaintenanceRuleError("Maintenance record is already closed")
    vehicle = db.get(Vehicle, log.vehicle_id)
    if not vehicle:
        raise MaintenanceRuleError("Vehicle not found")

    log.is_active = False
    log.closed_at = datetime.now(timezone.utc)
    if final_cost is not None:
        log.final_cost = final_cost
    if completion_notes is not None:
        log.completion_notes = completion_notes
    if vehicle.status != VehicleStatus.retired:
        vehicle.status = VehicleStatus.available
    _commit(db)
    db.refresh(log)
    return log


# Kept as an ergonomic alias for callers using the original roadmap terminology.
open_maintenance = create_maintenance