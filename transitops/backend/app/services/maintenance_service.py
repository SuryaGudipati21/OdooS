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


def create_maintenance(db: Session, *, vehicle_id: int, description: str) -> MaintenanceLog:
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle:
        raise MaintenanceRuleError("Vehicle not found")
    if vehicle.status == VehicleStatus.retired:
        raise MaintenanceRuleError("Retired vehicles cannot be put into maintenance")
    if vehicle.status != VehicleStatus.available:
        raise MaintenanceRuleError("Only Available vehicles can enter maintenance")

    log = MaintenanceLog(vehicle_id=vehicle_id, description=description, is_active=True)
    db.add(log)
    vehicle.status = VehicleStatus.in_shop
    _commit(db)
    db.refresh(log)
    return log


def close_maintenance(db: Session, maintenance_id: int) -> MaintenanceLog:
    log = db.get(MaintenanceLog, maintenance_id)
    if not log:
        raise MaintenanceRuleError("Maintenance record not found")
    if not log.is_active:
        raise MaintenanceRuleError("Maintenance record is already closed")
    vehicle = db.get(Vehicle, log.vehicle_id)
    if not vehicle:
        raise MaintenanceRuleError("Vehicle not found")

    from datetime import datetime, timezone
    log.is_active = False
    log.closed_at = datetime.now(timezone.utc)
    if vehicle.status != VehicleStatus.retired:
        vehicle.status = VehicleStatus.available
    _commit(db)
    db.refresh(log)
    return log


# Kept as an ergonomic alias for callers using the original roadmap terminology.
open_maintenance = create_maintenance
