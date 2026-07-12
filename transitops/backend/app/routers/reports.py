"""
Owner: Dev D
Module: Reports and Analytics
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.core.security import get_current_user

from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.trip import Trip
from app.models.maintenance import MaintenanceLog
from app.models.fuel_expense import FuelLog


router = APIRouter()


# -------------------------------------------------
# Dashboard KPI Summary
# -------------------------------------------------

@router.get("/kpis")
def get_dashboard_kpis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_vehicles = db.query(Vehicle).count()
    total_drivers = db.query(Driver).count()
    total_trips = db.query(Trip).count()

    total_fuel_cost = (
        db.query(func.sum(FuelLog.cost))
        .scalar()
        or 0
    )

    return {
        "total_vehicles": total_vehicles,
        "total_drivers": total_drivers,
        "total_trips": total_trips,
        "total_fuel_cost": float(total_fuel_cost),
        "generated_by": current_user.email
    }


# -------------------------------------------------
# Vehicle Report
# -------------------------------------------------

@router.get("/vehicles")
def get_vehicle_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vehicles = db.query(Vehicle).all()

    return {
        "total_vehicles": len(vehicles),
        "vehicles": vehicles
    }


# -------------------------------------------------
# Driver Report
# -------------------------------------------------

@router.get("/drivers")
def get_driver_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    drivers = db.query(Driver).all()

    return {
        "total_drivers": len(drivers),
        "drivers": drivers
    }


# -------------------------------------------------
# Trip Report
# -------------------------------------------------

@router.get("/trips")
def get_trip_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trips = db.query(Trip).all()

    return {
        "total_trips": len(trips),
        "trips": trips
    }


# -------------------------------------------------
# Fuel Expense Report
# -------------------------------------------------

@router.get("/fuel-expenses")
def get_fuel_expense_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expenses = db.query(FuelLog).all()

    total_cost = (
        db.query(func.sum(FuelLog.cost))
        .scalar()
        or 0
    )

    return {
        "total_records": len(expenses),
        "total_fuel_cost": float(total_cost),
        "fuel_expenses": expenses
    }


# -------------------------------------------------
# Maintenance Report
# -------------------------------------------------

@router.get("/maintenance")
def get_maintenance_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    maintenance_records = db.query(MaintenanceLog).all()

    return {
        "total_records": len(maintenance_records),
        "maintenance": maintenance_records
    }


# -------------------------------------------------
# User Report
# -------------------------------------------------

@router.get("/users")
def get_users_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = db.query(User).all()

    return {
        "generated_by": current_user.email,
        "total_users": len(users),
        "users": [
            {
                "id": user.id,
                "email": user.email,
                "role": (
                    user.role.value
                    if hasattr(user.role, "value")
                    else str(user.role)
                )
            }
            for user in users
        ]
    }