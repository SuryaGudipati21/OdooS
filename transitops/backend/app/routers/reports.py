"""
Owner: Dev D
Module: Reports and Analytics
"""
import csv
import io

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_role
from app.database import get_db
from app.models.driver import Driver
from app.models.fuel_expense import Expense, FuelLog
from app.models.maintenance import MaintenanceLog
from app.models.trip import Trip
from app.models.user import User
from app.models.vehicle import Vehicle
from app.services import kpi_service

router = APIRouter()


def _csv_response(rows: list[dict], fieldnames: list[str], filename: str) -> StreamingResponse:
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    for row in rows:
        writer.writerow(row)
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _as_dicts(objects, fields: list[str]) -> list[dict]:
    return [{f: getattr(obj, f) for f in fields} for obj in objects]


# -------------------------------------------------
# Dashboard KPI Summary
# -------------------------------------------------

@router.get("/kpis")
def get_dashboard_kpis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    summary = kpi_service.get_dashboard_summary(db)
    summary["generated_by"] = current_user.email
    return summary


@router.get("/fuel-efficiency")
def get_fuel_efficiency_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {"vehicles": kpi_service.get_fuel_efficiency_by_vehicle(db)}


@router.get("/operational-cost")
def get_operational_cost_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("fleet_manager", "financial_analyst")),
):
    return {"vehicles": kpi_service.get_operational_cost_by_vehicle(db)}


@router.get("/roi")
def get_roi_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("fleet_manager", "financial_analyst")),
):
    # No revenue field exists in the schema yet (see kpi_service docstring) —
    # this returns operational cost + acquisition cost per vehicle, with
    # roi_percent left null until a revenue source is wired in.
    return {"vehicles": kpi_service.get_roi_by_vehicle(db)}


# -------------------------------------------------
# Vehicle / Driver / Trip / Fuel / Maintenance / User Reports
# -------------------------------------------------

@router.get("/vehicles")
def get_vehicle_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vehicles = db.query(Vehicle).all()
    return {"total_vehicles": len(vehicles), "vehicles": vehicles}


@router.get("/drivers")
def get_driver_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    drivers = db.query(Driver).all()
    return {"total_drivers": len(drivers), "drivers": drivers}


@router.get("/trips")
def get_trip_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trips = db.query(Trip).all()
    return {"total_trips": len(trips), "trips": trips}


@router.get("/fuel-expenses")
def get_fuel_expense_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expenses = db.query(FuelLog).all()
    total_cost = db.query(func.sum(FuelLog.cost)).scalar() or 0
    return {"total_records": len(expenses), "total_fuel_cost": float(total_cost), "fuel_expenses": expenses}


@router.get("/maintenance")
def get_maintenance_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    maintenance_records = db.query(MaintenanceLog).all()
    return {"total_records": len(maintenance_records), "maintenance": maintenance_records}


@router.get("/users")
def get_users_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("fleet_manager")),
):
    users = db.query(User).all()
    return {
        "generated_by": current_user.email,
        "total_users": len(users),
        "users": [
            {"id": u.id, "email": u.email, "role": u.role.value if hasattr(u.role, "value") else str(u.role)}
            for u in users
        ],
    }


# -------------------------------------------------
# CSV export — the roadmap's hard requirement
# -------------------------------------------------

@router.get("/export/vehicles.csv")
def export_vehicles_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fields = ["id", "registration_number", "name_model", "type", "max_load_capacity",
              "odometer", "acquisition_cost", "status"]
    rows = _as_dicts(db.query(Vehicle).all(), fields)
    for r in rows:
        r["status"] = r["status"].value
    return _csv_response(rows, fields, "vehicles.csv")


@router.get("/export/drivers.csv")
def export_drivers_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fields = ["id", "name", "license_number", "license_category", "license_expiry_date",
              "contact_number", "safety_score", "status"]
    rows = _as_dicts(db.query(Driver).all(), fields)
    for r in rows:
        r["status"] = r["status"].value
    return _csv_response(rows, fields, "drivers.csv")


@router.get("/export/trips.csv")
def export_trips_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fields = ["id", "source", "destination", "vehicle_id", "driver_id", "cargo_weight",
              "planned_distance", "actual_distance", "final_odometer", "fuel_consumed",
              "status", "created_at"]
    rows = _as_dicts(db.query(Trip).all(), fields)
    for r in rows:
        r["status"] = r["status"].value
    return _csv_response(rows, fields, "trips.csv")


@router.get("/export/fuel-expenses.csv")
def export_fuel_expenses_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fields = ["id", "vehicle_id", "liters", "cost", "date"]
    rows = _as_dicts(db.query(FuelLog).all(), fields)
    return _csv_response(rows, fields, "fuel-expenses.csv")


@router.get("/export/maintenance.csv")
def export_maintenance_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fields = ["id", "vehicle_id", "description", "is_active", "opened_at", "closed_at"]
    rows = _as_dicts(db.query(MaintenanceLog).all(), fields)
    return _csv_response(rows, fields, "maintenance.csv")