"""
Owner: Dev D
Aggregation queries for Dashboard + Reports:
- Active/Available/In Shop vehicle counts, Active/Pending trips, Drivers On Duty
- Fleet Utilization % = (vehicles On Trip / total non-retired vehicles) * 100
- Fuel Efficiency = Distance / Fuel per vehicle
- Operational Cost = Fuel + Maintenance per vehicle
- ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
"""
from sqlalchemy.orm import Session

# TODO(Dev D): implement kpi + report aggregation functions here
