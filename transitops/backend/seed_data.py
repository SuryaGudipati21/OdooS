"""
Owner: Dev A
Run after migrations to populate demo data for the live evaluator walkthrough.
Safe to run multiple times — checks for existing records before inserting.
"""
from datetime import date, datetime, timedelta, timezone

from app.database import SessionLocal
from app.models.user import User, RoleEnum
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.driver import Driver, DriverStatus
from app.models.trip import Trip, TripStatus
from app.models.maintenance import MaintenanceLog
from app.models.fuel_expense import FuelLog, Expense
from app.core.security import hash_password

db = SessionLocal()

def get_or_create(model, defaults=None, **kwargs):
    instance = db.query(model).filter_by(**kwargs).first()
    if instance:
        return instance, False
    params = {**kwargs, **(defaults or {})}
    instance = model(**params)
    db.add(instance)
    db.commit()
    db.refresh(instance)
    return instance, True


# --- Users (one per role, so each teammate can log in as a different role) ---
users = [
    {"email": "manager@transitops.com", "password": "password123", "role": RoleEnum.fleet_manager},
    {"email": "driver@transitops.com", "password": "password123", "role": RoleEnum.driver},
    {"email": "safety@transitops.com", "password": "password123", "role": RoleEnum.safety_officer},
    {"email": "finance@transitops.com", "password": "password123", "role": RoleEnum.financial_analyst},
]
for u in users:
    get_or_create(User, email=u["email"], defaults={
        "hashed_password": hash_password(u["password"]),
        "role": u["role"],
    })

# --- Vehicles: varied statuses so every screen has something to show ---
vehicles_data = [
    {"registration_number": "VAN-05", "name_model": "Van-05", "type": "Van",
     "max_load_capacity": 500, "acquisition_cost": 15000, "odometer": 12000,
     "status": VehicleStatus.available},
    {"registration_number": "TRK-12", "name_model": "Truck-12", "type": "Truck",
     "max_load_capacity": 2000, "acquisition_cost": 45000, "odometer": 38000,
     "status": VehicleStatus.on_trip},
    {"registration_number": "VAN-08", "name_model": "Van-08", "type": "Van",
     "max_load_capacity": 500, "acquisition_cost": 16000, "odometer": 9000,
     "status": VehicleStatus.in_shop},
    {"registration_number": "TRK-03", "name_model": "Truck-03", "type": "Truck",
     "max_load_capacity": 1800, "acquisition_cost": 42000, "odometer": 61000,
     "status": VehicleStatus.retired},
    {"registration_number": "VAN-11", "name_model": "Van-11", "type": "Van",
     "max_load_capacity": 600, "acquisition_cost": 17000, "odometer": 5000,
     "status": VehicleStatus.available},
]
vehicles = {}
for v in vehicles_data:
    reg = v.pop("registration_number")
    vehicle, _ = get_or_create(Vehicle, registration_number=reg, defaults=v)
    vehicles[reg] = vehicle

# --- Drivers: include one expired license + one suspended, to demo rejection rules live ---
today = date.today()
drivers_data = [
    {"license_number": "DL-1001", "name": "Alex Kumar", "license_category": "LMV",
     "license_expiry_date": today + timedelta(days=365), "contact_number": "9000000001",
     "safety_score": 95, "status": DriverStatus.available},
    {"license_number": "DL-1002", "name": "Priya Sharma", "license_category": "HMV",
     "license_expiry_date": today + timedelta(days=200), "contact_number": "9000000002",
     "safety_score": 90, "status": DriverStatus.on_trip},
    {"license_number": "DL-1003", "name": "Rahul Verma", "license_category": "LMV",
     "license_expiry_date": today - timedelta(days=10),  # EXPIRED on purpose
     "contact_number": "9000000003", "safety_score": 80, "status": DriverStatus.available},
    {"license_number": "DL-1004", "name": "Sneha Iyer", "license_category": "HMV",
     "license_expiry_date": today + timedelta(days=100), "contact_number": "9000000004",
     "safety_score": 60, "status": DriverStatus.suspended},
    {"license_number": "DL-1005", "name": "Vikram Singh", "license_category": "LMV",
     "license_expiry_date": today + timedelta(days=300), "contact_number": "9000000005",
     "safety_score": 98, "status": DriverStatus.off_duty},
]
drivers = {}
for d in drivers_data:
    lic = d.pop("license_number")
    driver, _ = get_or_create(Driver, license_number=lic, defaults=d)
    drivers[lic] = driver

# --- One completed trip (Van-05 story from the spec's own example workflow) ---
existing_trip = db.query(Trip).filter(Trip.source == "Warehouse A").first()
if not existing_trip:
    trip = Trip(
        source="Warehouse A",
        destination="Distribution Center B",
        vehicle_id=vehicles["VAN-05"].id,
        driver_id=drivers["DL-1001"].id,
        cargo_weight=450,
        planned_distance=120,
        actual_distance=125,
        final_odometer=12125,
        fuel_consumed=15,
        status=TripStatus.completed,
        created_at=datetime.now(timezone.utc) - timedelta(days=2),
    )
    db.add(trip)
    db.commit()

# --- One active maintenance log (Van-08, matches its "In Shop" status above) ---
existing_maint = db.query(MaintenanceLog).filter(
    MaintenanceLog.vehicle_id == vehicles["VAN-08"].id, MaintenanceLog.is_active == True
).first()
if not existing_maint:
    maint = MaintenanceLog(
        vehicle_id=vehicles["VAN-08"].id,
        description="Oil change and brake inspection",
        is_active=True,
        opened_at=datetime.now(timezone.utc) - timedelta(hours=6),
    )
    db.add(maint)
    db.commit()

# --- Fuel logs + expenses (so Reports/ROI has real numbers to show) ---
if not db.query(FuelLog).filter(FuelLog.vehicle_id == vehicles["VAN-05"].id).first():
    db.add(FuelLog(vehicle_id=vehicles["VAN-05"].id, liters=15, cost=1500, date=today - timedelta(days=2)))
    db.add(Expense(vehicle_id=vehicles["VAN-05"].id, category="toll", amount=200, date=today - timedelta(days=2)))
    db.commit()

if not db.query(FuelLog).filter(FuelLog.vehicle_id == vehicles["TRK-12"].id).first():
    db.add(FuelLog(vehicle_id=vehicles["TRK-12"].id, liters=60, cost=6000, date=today - timedelta(days=1)))
    db.add(Expense(vehicle_id=vehicles["TRK-12"].id, category="maintenance", amount=3500, date=today - timedelta(days=1)))
    db.commit()

db.close()
print("Seed data inserted successfully.")