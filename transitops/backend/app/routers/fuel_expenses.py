"""
Owner: Dev A
"""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.fuel_expense import FuelLog, Expense
from app.models.vehicle import Vehicle
from app.core.security import get_current_user

router = APIRouter()


# ---------------- Fuel Logs ----------------

class FuelLogCreate(BaseModel):
    vehicle_id: int
    liters: float
    cost: float
    date: date


@router.post("/fuel")
def create_fuel_log(
    payload: FuelLogCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == payload.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if payload.liters <= 0:
        raise HTTPException(status_code=400, detail="Liters must be greater than 0")

    if payload.cost <= 0:
        raise HTTPException(status_code=400, detail="Cost must be greater than 0")

    fuel_log = FuelLog(**payload.dict())

    db.add(fuel_log)
    db.commit()
    db.refresh(fuel_log)

    return fuel_log


@router.get("/fuel")
def list_fuel_logs(db: Session = Depends(get_db)):
    return db.query(FuelLog).all()


# ---------------- Expenses ----------------

class ExpenseCreate(BaseModel):
    vehicle_id: int
    category: str
    amount: float
    date: date


@router.post("/expenses")
def create_expense(
    payload: ExpenseCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == payload.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")

    expense = Expense(**payload.dict())

    db.add(expense)
    db.commit()
    db.refresh(expense)

    return expense


@router.get("/expenses")
def list_expenses(db: Session = Depends(get_db)):
    return db.query(Expense).all()