"""
Owner: Dev D
Module: Reports and Analytics
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.user import User
from app.database import get_db
from app.core.security import get_current_user

router = APIRouter()


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
                "role": user.role.value
            }
            for user in users
        ]
    }