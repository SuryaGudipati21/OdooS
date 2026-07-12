"""
⚠️ SHARED FILE — everyone touches this, but only to add ONE import + ONE
include_router() line for their own router. Pull before you edit, push
right after, tell the group. Never rewrite someone else's line.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="TransitOps API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten before final deploy if time allows
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Register routers below, one line per person ---
from app.routers import auth
app.include_router(auth.router, prefix="/auth", tags=["auth"])

from app.routers import vehicles
app.include_router(vehicles.router, prefix="/vehicles", tags=["vehicles"])

# from app.routers import drivers
# app.include_router(drivers.router, prefix="/drivers", tags=["drivers"])

from app.routers import trips
app.include_router(trips.router, prefix="/trips", tags=["trips"])

from app.routers import maintenance
app.include_router(maintenance.router, prefix="/maintenance", tags=["maintenance"])

# from app.routers import fuel_expenses
# app.include_router(fuel_expenses.router, prefix="/fuel-expenses", tags=["fuel-expenses"])

# from app.routers import reports
# app.include_router(reports.router, prefix="/reports", tags=["reports"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
