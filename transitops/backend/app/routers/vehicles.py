from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.vehicle import Vehicle
from app.core.security import get_current_user
from pydantic import BaseModel

router = APIRouter()
#Vechicles
class VehicleCreate(BaseModel):
    registration_number: str
    name_model: str
    type: str
    max_load_capacity: float
    acquisition_cost: float
    odometer: float = 0

@router.post("/")
def create_vehicle(payload: VehicleCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if db.query(Vehicle).filter(Vehicle.registration_number == payload.registration_number).first():
        raise HTTPException(status_code=400, detail="Registration number already exists")
    vehicle = Vehicle(**payload.dict())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.get("/")
def list_vehicles(status: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Vehicle)
    if status:
        query = query.filter(Vehicle.status == status)
    return query.all()

@router.get("/{vehicle_id}")
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@router.put("/{vehicle_id}")
def update_vehicle(vehicle_id: int, payload: VehicleCreate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    for key, value in payload.dict().items():
        setattr(vehicle, key, value)
    db.commit()
    db.refresh(vehicle)
    return vehicle