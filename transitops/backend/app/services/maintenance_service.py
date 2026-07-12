"""
Owner: Dev B
Rules:
- Creating an active maintenance record -> vehicle.status = "In Shop"
- Closing maintenance -> vehicle.status = "Available" (unless Retired)
"""
from sqlalchemy.orm import Session

# TODO(Dev B): implement open_maintenance, close_maintenance
