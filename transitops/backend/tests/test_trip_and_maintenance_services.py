from datetime import date, timedelta

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.driver import Driver, DriverStatus
from app.models.maintenance import MaintenanceLog
from app.models.trip import Trip, TripStatus
from app.models.vehicle import Vehicle, VehicleStatus
from app.services.maintenance_service import MaintenanceRuleError, close_maintenance, create_maintenance
from app.services.trip_service import TripRuleError, cancel_trip, complete_trip, create_trip, dispatch_trip


@pytest.fixture()
def db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()
    yield session
    session.close()


def vehicle(**overrides):
    values = dict(registration_number="VAN-05", name_model="Transit Van", type="Van",
                  max_load_capacity=500, odometer=1000, acquisition_cost=100000,
                  status=VehicleStatus.available)
    values.update(overrides)
    return Vehicle(**values)


def driver(**overrides):
    values = dict(name="Alex", license_number="DL-100", license_category="LMV",
                  license_expiry_date=date.today() + timedelta(days=30), contact_number="9999999999",
                  safety_score=95, status=DriverStatus.available)
    values.update(overrides)
    return Driver(**values)


def add_resources(db, *, vehicle_data=None, driver_data=None):
    fleet_vehicle = vehicle(**(vehicle_data or {}))
    fleet_driver = driver(**(driver_data or {}))
    db.add_all([fleet_vehicle, fleet_driver])
    db.commit()
    return fleet_vehicle, fleet_driver


def draft_trip(db, **overrides):
    fleet_vehicle, fleet_driver = add_resources(db)
    values = dict(source="Pune", destination="Mumbai", vehicle_id=fleet_vehicle.id,
                  driver_id=fleet_driver.id, cargo_weight=450, planned_distance=150)
    values.update(overrides)
    return create_trip(db, **values), fleet_vehicle, fleet_driver


def test_cargo_above_capacity_is_rejected(db):
    fleet_vehicle, fleet_driver = add_resources(db)
    with pytest.raises(TripRuleError, match="exceeds"):
        create_trip(db, source="A", destination="B", vehicle_id=fleet_vehicle.id,
                    driver_id=fleet_driver.id, cargo_weight=700, planned_distance=10)


def test_vehicle_already_on_trip_is_rejected(db):
    trip, fleet_vehicle, _ = draft_trip(db)
    fleet_vehicle.status = VehicleStatus.on_trip
    db.commit()
    with pytest.raises(TripRuleError, match="Vehicle"):
        dispatch_trip(db, trip.id)


def test_driver_already_on_trip_is_rejected(db):
    trip, _, fleet_driver = draft_trip(db)
    fleet_driver.status = DriverStatus.on_trip
    db.commit()
    with pytest.raises(TripRuleError, match="Driver"):
        dispatch_trip(db, trip.id)


def test_expired_or_suspended_driver_is_rejected(db):
    trip, _, fleet_driver = draft_trip(db)
    fleet_driver.license_expiry_date = date.today() - timedelta(days=1)
    db.commit()
    with pytest.raises(TripRuleError, match="expired"):
        dispatch_trip(db, trip.id)

    fleet_driver.license_expiry_date = date.today() + timedelta(days=1)
    fleet_driver.status = DriverStatus.suspended
    db.commit()
    with pytest.raises(TripRuleError, match="Suspended"):
        dispatch_trip(db, trip.id)


def test_dispatch_updates_trip_vehicle_and_driver_together(db):
    trip, fleet_vehicle, fleet_driver = draft_trip(db)
    dispatch_trip(db, trip.id)
    assert trip.status == TripStatus.dispatched
    assert fleet_vehicle.status == VehicleStatus.on_trip
    assert fleet_driver.status == DriverStatus.on_trip


def test_complete_restores_vehicle_and_driver_statuses(db):
    trip, fleet_vehicle, fleet_driver = draft_trip(db)
    dispatch_trip(db, trip.id)
    complete_trip(db, trip.id, actual_distance=155, final_odometer=1155, fuel_consumed=12)
    assert trip.status == TripStatus.completed
    assert fleet_vehicle.status == VehicleStatus.available
    assert fleet_driver.status == DriverStatus.available
    assert fleet_vehicle.odometer == 1155


def test_cancel_dispatched_trip_restores_statuses(db):
    trip, fleet_vehicle, fleet_driver = draft_trip(db)
    dispatch_trip(db, trip.id)
    cancel_trip(db, trip.id)
    assert trip.status == TripStatus.cancelled
    assert fleet_vehicle.status == VehicleStatus.available
    assert fleet_driver.status == DriverStatus.available


def test_creating_maintenance_sets_vehicle_in_shop(db):
    fleet_vehicle, _ = add_resources(db)
    log = create_maintenance(db, vehicle_id=fleet_vehicle.id, description="Oil change")
    assert log.is_active is True
    assert fleet_vehicle.status == VehicleStatus.in_shop


def test_closing_maintenance_restores_available_unless_retired(db):
    fleet_vehicle, _ = add_resources(db)
    log = create_maintenance(db, vehicle_id=fleet_vehicle.id, description="Oil change")
    close_maintenance(db, log.id)
    assert log.is_active is False
    assert fleet_vehicle.status == VehicleStatus.available

    log = create_maintenance(db, vehicle_id=fleet_vehicle.id, description="Inspection")
    fleet_vehicle.status = VehicleStatus.retired
    db.commit()
    close_maintenance(db, log.id)
    assert fleet_vehicle.status == VehicleStatus.retired


def test_maintenance_cannot_start_for_non_available_vehicle(db):
    fleet_vehicle, _ = add_resources(db, vehicle_data={"status": VehicleStatus.on_trip})
    with pytest.raises(MaintenanceRuleError, match="Available"):
        create_maintenance(db, vehicle_id=fleet_vehicle.id, description="Repair")
