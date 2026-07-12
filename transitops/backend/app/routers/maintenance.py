
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.maintenance import MaintenanceLog
from app.schemas.maintenance import MaintenanceCreate, MaintenanceRead
from app.services import maintenance_service

router = APIRouter()

def _rule_error(error: maintenance_service.MaintenanceRuleError) -> HTTPException:
    return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error))


@router.post("", response_model=MaintenanceRead, status_code=status.HTTP_201_CREATED)
def create_maintenance(
    payload: MaintenanceCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    try:
        return maintenance_service.create_maintenance(db, **payload.model_dump())
    except maintenance_service.MaintenanceRuleError as error:
        raise _rule_error(error)


@router.put("/{maintenance_id}/close", response_model=MaintenanceRead)
def close_maintenance(maintenance_id: int, db: Session = Depends(get_db)):
    try:
        return maintenance_service.close_maintenance(db, maintenance_id)
    except maintenance_service.MaintenanceRuleError as error:
        raise _rule_error(error)


@router.get("", response_model=list[MaintenanceRead])
def list_maintenance(db: Session = Depends(get_db)):
    return db.query(MaintenanceLog).order_by(MaintenanceLog.opened_at.desc()).all()
