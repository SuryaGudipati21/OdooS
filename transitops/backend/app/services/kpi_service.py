"""
Owner: Dev D
Aggregation queries for Dashboard + Reports.

Formulas (per the hackathon roadmap):
- Fleet Utilization % = (vehicles On Trip / total non-retired vehicles) * 100
- Fuel Efficiency      = total actual distance / total fuel liters, per vehicle
- Operational Cost     = total fuel cost + total expense amount, per vehicle
- ROI                  = (Revenue - Operational Cost) / Acquisition Cost

NOTE on ROI: the schema has no revenue/billing model (no fare, contract
value, or rate-per-trip field on Trip). Rather than fabricate a number,
`calculate_roi_by_vehicle` accepts an optional `revenue_by_vehicle` map and
returns None for any vehicle with no revenue supplied, alongside the
operational cost so the frontend can show "cost so far" even without ROI.
Wiring a real revenue figure in requires a schema change (e.g. a `rate`
field on Trip or a Contract/Invoice model) — flagged here rather than
silently defaulted to 0, which would make every vehicle's ROI look like -100%.
"""
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.driver import Driver, DriverStatus
from app.models.fuel_expense import Expense, FuelLog
from app.models.maintenance import MaintenanceLog
from app.models.trip import Trip, TripStatus
from app.models.vehicle import Vehicle, VehicleStatus


def get_fleet_utilization(db: Session) -> dict:
    total_non_retired = (
        db.query(Vehicle).filter(Vehicle.status != VehicleStatus.retired).count()
    )
    on_trip = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.on_trip).count()
    utilization_pct = (on_trip / total_non_retired * 100) if total_non_retired else 0.0
    return {
        "vehicles_on_trip": on_trip,
        "total_non_retired_vehicles": total_non_retired,
        "utilization_percent": round(utilization_pct, 2),
    }


def get_vehicle_status_breakdown(db: Session) -> dict:
    rows = (
        db.query(Vehicle.status, func.count(Vehicle.id))
        .group_by(Vehicle.status)
        .all()
    )
    breakdown = {status.value: 0 for status in VehicleStatus}
    for status, count in rows:
        breakdown[status.value] = count
    return breakdown


def get_dashboard_summary(db: Session) -> dict:
    """Everything the DashboardPage KPI cards need in one call."""
    utilization = get_fleet_utilization(db)
    return {
        "total_vehicles": db.query(Vehicle).count(),
        "available_vehicles": db.query(Vehicle).filter(
            Vehicle.status == VehicleStatus.available
        ).count(),
        "in_maintenance_vehicles": db.query(Vehicle).filter(
            Vehicle.status == VehicleStatus.in_shop
        ).count(),
        "active_trips": db.query(Trip).filter(
            Trip.status == TripStatus.dispatched
        ).count(),
        "pending_trips": db.query(Trip).filter(
            Trip.status == TripStatus.draft
        ).count(),
        "drivers_on_duty": db.query(Driver).filter(
            Driver.status == DriverStatus.on_trip
        ).count(),
        "fleet_utilization_percent": utilization["utilization_percent"],
        "vehicle_status_breakdown": get_vehicle_status_breakdown(db),
    }


def get_fuel_efficiency_by_vehicle(db: Session) -> list[dict]:
    """Distance/fuel per vehicle, using completed trips' actual_distance."""
    vehicles = db.query(Vehicle).all()
    results = []
    for vehicle in vehicles:
        total_distance = (
            db.query(func.coalesce(func.sum(Trip.actual_distance), 0.0))
            .filter(Trip.vehicle_id == vehicle.id, Trip.status == TripStatus.completed)
            .scalar()
        )
        total_fuel = (
            db.query(func.coalesce(func.sum(FuelLog.liters), 0.0))
            .filter(FuelLog.vehicle_id == vehicle.id)
            .scalar()
        )
        efficiency = (total_distance / total_fuel) if total_fuel else None
        results.append({
            "vehicle_id": vehicle.id,
            "registration_number": vehicle.registration_number,
            "total_distance_km": float(total_distance),
            "total_fuel_liters": float(total_fuel),
            "km_per_liter": round(efficiency, 2) if efficiency is not None else None,
        })
    return results


def get_operational_cost_by_vehicle(db: Session) -> list[dict]:
    """Fuel + expense cost per vehicle (maintenance labor isn't a costed
    field in MaintenanceLog, so it's captured via Expense rows with
    category='maintenance' instead)."""
    vehicles = db.query(Vehicle).all()
    results = []
    for vehicle in vehicles:
        fuel_cost = (
            db.query(func.coalesce(func.sum(FuelLog.cost), 0.0))
            .filter(FuelLog.vehicle_id == vehicle.id)
            .scalar()
        )
        expense_cost = (
            db.query(func.coalesce(func.sum(Expense.amount), 0.0))
            .filter(Expense.vehicle_id == vehicle.id)
            .scalar()
        )
        results.append({
            "vehicle_id": vehicle.id,
            "registration_number": vehicle.registration_number,
            "fuel_cost": float(fuel_cost),
            "expense_cost": float(expense_cost),
            "operational_cost": float(fuel_cost) + float(expense_cost),
        })
    return results


def get_roi_by_vehicle(
    db: Session, revenue_by_vehicle: Optional[dict[int, float]] = None
) -> list[dict]:
    """ROI = (Revenue - Operational Cost) / Acquisition Cost."""
    revenue_by_vehicle = revenue_by_vehicle or {}
    costs = get_operational_cost_by_vehicle(db)
    vehicles = {v.id: v for v in db.query(Vehicle).all()}

    results = []
    for row in costs:
        vehicle = vehicles[row["vehicle_id"]]
        revenue = revenue_by_vehicle.get(row["vehicle_id"])
        roi = None
        if revenue is not None and vehicle.acquisition_cost:
            roi = (revenue - row["operational_cost"]) / vehicle.acquisition_cost
        results.append({
            **row,
            "acquisition_cost": vehicle.acquisition_cost,
            "revenue": revenue,
            "roi_percent": round(roi * 100, 2) if roi is not None else None,
        })
    return results