"""
Owner: Dev D
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter()

# TODO(Dev D): implement KPI/report endpoints + CSV export here
