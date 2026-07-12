"""
Owner: Dev A
"""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.driver import Driver

router = APIRouter()


class DriverCreate(BaseModel):
    name: str
    license_number: str
    license_category: str
    license_expiry_date: date
    contact_number: str
    safety_score: float = 100.0


@router.post("/")
def create_driver(
    payload: DriverCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    existing = (
        db.query(Driver)
        .filter(Driver.license_number == payload.license_number)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="License number already exists",
        )

    driver = Driver(**payload.dict())

    db.add(driver)
    db.commit()
    db.refresh(driver)

    return driver


@router.get("/")
def list_drivers(
    status: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Driver)

    if status:
        query = query.filter(Driver.status == status)

    return query.all()


@router.get("/{driver_id}")
def get_driver(
    driver_id: int,
    db: Session = Depends(get_db),
):
    driver = (
        db.query(Driver)
        .filter(Driver.id == driver_id)
        .first()
    )

    if not driver:
        raise HTTPException(
            status_code=404,
            detail="Driver not found",
        )

    return driver


@router.put("/{driver_id}")
def update_driver(
    driver_id: int,
    payload: DriverCreate,
    db: Session = Depends(get_db),
):
    driver = (
        db.query(Driver)
        .filter(Driver.id == driver_id)
        .first()
    )

    if not driver:
        raise HTTPException(
            status_code=404,
            detail="Driver not found",
        )

    for key, value in payload.dict().items():
        setattr(driver, key, value)

    db.commit()
    db.refresh(driver)

    return driver


@router.delete("/{driver_id}")
def delete_driver(
    driver_id: int,
    db: Session = Depends(get_db),
):
    driver = (
        db.query(Driver)
        .filter(Driver.id == driver_id)
        .first()
    )

    if not driver:
        raise HTTPException(
            status_code=404,
            detail="Driver not found",
        )

    db.delete(driver)
    db.commit()

    return {"message": "Driver deleted successfully"}
