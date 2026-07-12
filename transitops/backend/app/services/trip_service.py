"""
Owner: Dev B
The Trip state machine lives here — keep all status-transition logic in one
place so Dev A's vehicle/driver status fields and this stay in sync.

States: Draft -> Dispatched -> Completed / Cancelled

Rules to enforce (from spec):
- Cargo weight must not exceed vehicle's max_load_capacity
- Only vehicles/drivers with status "Available" can be assigned
- Drivers with expired license or "Suspended" status cannot be assigned
- Dispatch: vehicle.status = driver.status = "On Trip" (atomic)
- Complete: vehicle.status = driver.status = "Available" (atomic)
- Cancel (from Dispatched): vehicle.status = driver.status = "Available" (atomic)
"""
from sqlalchemy.orm import Session

# TODO(Dev B): implement create_trip, dispatch_trip, complete_trip, cancel_trip
