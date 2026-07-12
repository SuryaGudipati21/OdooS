from datetime import date
from typing import Optional

from sqlalchemy.orm import Session

from app.models.driver import Driver, DriverStatus
from app.models.trip import Trip, TripStatus
from app.models.vehicle import Vehicle, VehicleStatus


class TripRuleError(ValueError):
    """Raised when an operation would violate a transport business rule."""


def _get_trip(db: Session, trip_id: int) -> Trip:
    trip = db.get(Trip, trip_id)
    if not trip:
        raise TripRuleError("Trip not found")
    return trip


def _get_vehicle(db: Session, vehicle_id: int) -> Vehicle:
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle:
        raise TripRuleError("Vehicle not found")
    return vehicle


def _get_driver(db: Session, driver_id: int) -> Driver:
    driver = db.get(Driver, driver_id)
    if not driver:
        raise TripRuleError("Driver not found")
    return driver


def _validate_cargo(vehicle: Vehicle, cargo_weight: float) -> None:
    if cargo_weight <= 0:
        raise TripRuleError("Cargo weight must be greater than zero")
    if cargo_weight > vehicle.max_load_capacity:
        raise TripRuleError("Cargo weight exceeds the vehicle's maximum load capacity")


def _validate_dispatch_resources(vehicle: Vehicle, driver: Driver) -> None:
    if vehicle.status != VehicleStatus.available:
        raise TripRuleError("Vehicle must be Available to be dispatched")
    if driver.status == DriverStatus.suspended:
        raise TripRuleError("Suspended drivers cannot be assigned to trips")
    if driver.license_expiry_date < date.today():
        raise TripRuleError("Driver license has expired")
    if driver.status != DriverStatus.available:
        raise TripRuleError("Driver must be Available to be dispatched")


def _commit(db: Session) -> None:
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise


def create_trip(
    db: Session, *, source: str, destination: str, vehicle_id: int, driver_id: int,
    cargo_weight: float, planned_distance: float,
) -> Trip:
    """Create a draft trip after checking its vehicle and load are valid."""
    if planned_distance <= 0:
        raise TripRuleError("Planned distance must be greater than zero")
    vehicle = _get_vehicle(db, vehicle_id)
    driver = _get_driver(db, driver_id)
    _validate_cargo(vehicle, cargo_weight)
    _validate_dispatch_resources(vehicle, driver)
    trip = Trip(source=source, destination=destination, vehicle_id=vehicle_id,
                driver_id=driver_id, cargo_weight=cargo_weight,
                planned_distance=planned_distance, status=TripStatus.draft)
    db.add(trip)
    _commit(db)
    db.refresh(trip)
    return trip


def dispatch_trip(db: Session, trip_id: int) -> Trip:
    """Atomically dispatch a draft trip and reserve its vehicle and driver."""
    trip = _get_trip(db, trip_id)
    if trip.status != TripStatus.draft:
        raise TripRuleError("Only Draft trips can be dispatched")
    vehicle = _get_vehicle(db, trip.vehicle_id)
    driver = _get_driver(db, trip.driver_id)
    _validate_cargo(vehicle, trip.cargo_weight)
    _validate_dispatch_resources(vehicle, driver)

    trip.status = TripStatus.dispatched
    vehicle.status = VehicleStatus.on_trip
    driver.status = DriverStatus.on_trip
    _commit(db)
    db.refresh(trip)
    return trip


def complete_trip(
    db: Session, trip_id: int, *, actual_distance: Optional[float] = None,
    final_odometer: Optional[float] = None, fuel_consumed: Optional[float] = None,
) -> Trip:
    """Complete a dispatched trip and return its resources to the available pool."""
    trip = _get_trip(db, trip_id)
    if trip.status != TripStatus.dispatched:
        raise TripRuleError("Only Dispatched trips can be completed")
    if actual_distance is not None and actual_distance < 0:
        raise TripRuleError("Actual distance cannot be negative")
    if fuel_consumed is not None and fuel_consumed < 0:
        raise TripRuleError("Fuel consumed cannot be negative")

    vehicle = _get_vehicle(db, trip.vehicle_id)
    driver = _get_driver(db, trip.driver_id)
    if final_odometer is not None and final_odometer < vehicle.odometer:
        raise TripRuleError("Final odometer cannot be lower than the current odometer")

    trip.actual_distance = actual_distance
    trip.final_odometer = final_odometer
    trip.fuel_consumed = fuel_consumed
    trip.status = TripStatus.completed
    if final_odometer is not None:
        vehicle.odometer = final_odometer
    vehicle.status = VehicleStatus.available
    driver.status = DriverStatus.available
    _commit(db)
    db.refresh(trip)
    return trip


def cancel_trip(db: Session, trip_id: int) -> Trip:
    """Cancel a draft or dispatched trip; dispatched resources are released."""
    trip = _get_trip(db, trip_id)
    if trip.status not in (TripStatus.draft, TripStatus.dispatched):
        raise TripRuleError("Only Draft or Dispatched trips can be cancelled")
    if trip.status == TripStatus.dispatched:
        vehicle = _get_vehicle(db, trip.vehicle_id)
        driver = _get_driver(db, trip.driver_id)
        vehicle.status = VehicleStatus.available
        driver.status = DriverStatus.available
    trip.status = TripStatus.cancelled
    _commit(db)
    db.refresh(trip)
    return trip
