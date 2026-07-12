from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.trip import Trip
from app.schemas.trip import TripComplete, TripCreate, TripRead
from app.services import trip_service

router = APIRouter()

def _rule_error(error: trip_service.TripRuleError) -> HTTPException:
    return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error))


@router.post("", response_model=TripRead, status_code=status.HTTP_201_CREATED)
def create_trip(payload: TripCreate, db: Session = Depends(get_db)):
    try:
        return trip_service.create_trip(db, **payload.model_dump())
    except trip_service.TripRuleError as error:
        raise _rule_error(error)


@router.get("", response_model=list[TripRead])
def list_trips(db: Session = Depends(get_db)):
    return db.query(Trip).order_by(Trip.created_at.desc()).all()


@router.get("/{trip_id}", response_model=TripRead)
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return trip


@router.put("/{trip_id}/dispatch", response_model=TripRead)
def dispatch_trip(trip_id: int, db: Session = Depends(get_db)):
    try:
        return trip_service.dispatch_trip(db, trip_id)
    except trip_service.TripRuleError as error:
        raise _rule_error(error)


@router.put("/{trip_id}/complete", response_model=TripRead)
def complete_trip(trip_id: int, payload: TripComplete, db: Session = Depends(get_db)):
    try:
        return trip_service.complete_trip(db, trip_id, **payload.model_dump())
    except trip_service.TripRuleError as error:
        raise _rule_error(error)


@router.put("/{trip_id}/cancel", response_model=TripRead)
def cancel_trip(trip_id: int, db: Session = Depends(get_db)):
    try:
        return trip_service.cancel_trip(db, trip_id)
    except trip_service.TripRuleError as error:
        raise _rule_error(error)
