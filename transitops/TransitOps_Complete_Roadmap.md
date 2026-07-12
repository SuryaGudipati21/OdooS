# TransitOps — Complete 8-Hour Hackathon Roadmap
### 4-Person Team | Folder Structure + Tool Stack + Hour-by-Hour Plan

> Replace Dev A/B/C/D with real names once assigned. Read Section 1 and 2 together as a team **before** anyone writes code — this is what prevents merge conflicts.

---

## 1. Tool Stack (what to use, and why)

| Layer | Tool | Why this one for an 8-hour hackathon |
|---|---|---|
| **Backend framework** | **FastAPI** (Python) | Auto-generates interactive API docs (`/docs`) for free — huge for a live evaluator demo; fast to write |
| **ORM** | **SQLAlchemy 2.0** | Pairs natively with FastAPI; handles all your relational entities (Vehicle↔Trip↔Driver) cleanly |
| **Migrations** | **Alembic** | Keeps schema changes tracked so 4 people don't hand-edit the DB differently |
| **Database** | **PostgreSQL** — via **Docker Compose** (one `docker-compose.yml`, everyone runs the same DB locally, zero "works on my machine") | If Docker setup eats time, fallback to **SQLite** for the hackathon — same SQLAlchemy code works with either, just swap the connection string |
| **Auth** | **JWT via `python-jose`** + **`passlib[bcrypt]`** for password hashing | Standard, fast to implement, no external auth service needed |
| **Backend validation** | **Pydantic** (ships with FastAPI) | Enforces your business rules (cargo weight, status enums) at the API boundary |
| **Backend testing** | **Pytest** | Dev B needs this to prove the Trip state machine actually works — this is your most-scrutinized logic |
| **Frontend framework** | **React + Vite** | Vite's dev server starts almost instantly — matters when you're iterating fast under time pressure |
| **Styling** | **Tailwind CSS** | No separate CSS files to merge-conflict over; utility classes live inline per component |
| **Routing** | **React Router** | Standard, minimal setup |
| **HTTP client** | **Axios** | Centralize all backend calls in one client instance |
| **Charts** | **Recharts** | Fastest to get a working bar/line chart on screen for Reports/Dashboard |
| **CSV export** | Python's built-in `csv` module, generated **server-side** and served as a file download | Simpler than doing it in the browser; one backend endpoint per report |
| **Deployment** | **Railway** (backend + Postgres) + **Vercel** (frontend static build) | Both have near-instant deploys from a GitHub push — good for a live evaluator link |
| **Version control** | **Git + GitHub**, one shared repo | See Section 3 for branch/merge strategy |

---

## 2. Folder Structure (agree on this before writing any code)

The core rule: **one file per module per person.** If Dev A and Dev C never need to open the same file, they can never merge-conflict on it.

```
transitops/
├── docker-compose.yml                  # Postgres — set up once, Hour 0
├── README.md                           # Everyone updates their own section
├── .gitignore
│
├── backend/
│   ├── requirements.txt
│   ├── alembic/                        # migrations — Dev A owns
│   ├── seed_data.py                    # Dev A — demo data script
│   └── app/
│       ├── main.py                    # ⚠️ SHARED — only add one `include_router()` line each, see Section 3
│       ├── database.py                # Dev A — DB session setup, Hour 0
│       ├── core/
│       │   ├── config.py              # Dev A
│       │   └── security.py            # Dev A — JWT + RBAC logic
│       ├── models/
│       │   ├── user.py                # Dev A
│       │   ├── vehicle.py             # Dev A
│       │   ├── driver.py              # Dev A
│       │   ├── trip.py                # Dev B
│       │   ├── maintenance.py         # Dev B
│       │   └── fuel_expense.py        # Dev A
│       ├── schemas/                    # Pydantic request/response models — mirrors models/ folder, same owners
│       ├── routers/
│       │   ├── auth.py                # Dev A
│       │   ├── vehicles.py            # Dev A
│       │   ├── drivers.py             # Dev A
│       │   ├── trips.py               # Dev B
│       │   ├── maintenance.py         # Dev B
│       │   ├── fuel_expenses.py       # Dev A
│       │   └── reports.py             # Dev D
│       └── services/
│           ├── trip_service.py        # Dev B — the state machine lives here
│           ├── maintenance_service.py # Dev B
│           └── kpi_service.py         # Dev D — dashboard aggregation queries
│
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx                    # ⚠️ SHARED — only add one <Route> line each, see Section 3
        ├── context/
        │   └── AuthContext.jsx        # Dev C
        ├── api/
        │   ├── axiosClient.js         # Dev D — set up once at Hour 0, shared by everyone after
        │   ├── authApi.js             # Dev C
        │   ├── vehicleApi.js          # Dev C
        │   ├── driverApi.js           # Dev C
        │   ├── tripApi.js             # Dev C
        │   ├── maintenanceApi.js      # Dev C
        │   └── reportsApi.js          # Dev D
        ├── components/
        │   └── common/                # Dev D owns this folder — Button, Card, Badge, Table
        └── pages/
            ├── LoginPage.jsx           # Dev C
            ├── SignupPage.jsx          # Dev C
            ├── VehicleRegistryPage.jsx # Dev C
            ├── DriverManagementPage.jsx# Dev C
            ├── TripManagementPage.jsx  # Dev C
            ├── MaintenancePage.jsx     # Dev C
            ├── FuelExpensePage.jsx     # Dev C
            ├── DashboardPage.jsx       # Dev D
            └── ReportsPage.jsx         # Dev D
```

**The only two shared files are `backend/app/main.py` and `frontend/src/App.jsx`.** Everyone touches these exactly once per feature — one import + one `include_router()`/`<Route>` line — never the whole file. Rule: **pull, add your one line, commit, push, tell the group** — don't sit on local changes to these two files.

---

## 3. Git Workflow (conflict-avoidance rules)

1. Hour 0: one person creates the repo with the full empty folder structure above (even empty placeholder files), pushes to `main`. Everyone clones from there.
2. Each dev works on their own branch: `dev-a`, `dev-b`, `dev-c`, `dev-d`.
3. **Merge to `main` at the top of every hour**, not just push to your own branch — the evaluator watches `main`.
4. Before merging, always `git pull origin main` first, then merge — resolve conflicts immediately while the context is fresh, not at Hour 7.
5. For the two shared files: whoever needs to add a line, does it as its own tiny commit (`feat(main): register trips router`), pushes immediately, and pings the group so the next person pulls before editing the same file.
6. Commit message format: `feat(module): what changed` / `fix(module): what changed`.

---

## 4. Must-Have vs Good-to-Have

**Must-Have:**
- Responsive web interface
- Authentication with RBAC
- CRUD for Vehicles and Drivers
- Trip Management with validations (cargo weight, availability, license/status checks)
- Automatic status transitions (Trip↔Vehicle/Driver, Maintenance↔Vehicle)
- Maintenance workflow
- Fuel & Expense tracking with auto cost rollup
- Dashboard with KPIs
- Charts and visual analytics
- CSV export (spec treats PDF as optional under section 3.8 despite listing it elsewhere — CSV is the hard requirement)

**Good-to-Have (only after must-haves are solid, don't start before Hour 6):**
- Email reminders for expiring licenses
- Vehicle document management
- Search, filters, sorting
- Dark mode
- PDF export

---

## 5. Hour-by-Hour Timeline

**H0:00–H0:15 — All 4 together:** Agree final schema fields, confirm folder structure above, one person scaffolds the repo (empty files per the tree) and pushes to `main`. Everyone clones.

### Dev A — Backend Core (owns: `models/user.py, vehicle.py, driver.py, fuel_expense.py`, `routers/auth.py, vehicles.py, drivers.py, fuel_expenses.py`, `core/`, `database.py`, `seed_data.py`)
| Time | Task | Push by |
|---|---|---|
| H0:15–H1:00 | `database.py`, all SQLAlchemy models, initial Alembic migration, Docker Compose Postgres running | H1:00 |
| H1:00–H2:00 | `core/security.py` (JWT + password hashing), `routers/auth.py` (signup/login), RBAC dependency | H2:00 |
| H2:00–H3:00 | `routers/vehicles.py` — CRUD + unique registration number validation | H3:00 |
| H3:00–H4:00 | `routers/drivers.py` — CRUD + license expiry/status validation | H4:00 |
| H4:00–H5:00 | Pair with Dev B: confirm shared status-update pattern works across `vehicles` and `trips` | H5:00 |
| H5:00–H6:00 | `routers/fuel_expenses.py` + per-vehicle cost aggregation query | H6:00 |
| H6:00–H7:00 | `seed_data.py` — realistic demo data for all entities | H7:00 |
| H7:00–H8:00 | Bug fixes, support integration testing | H8:00 |

### Dev B — Business Logic / Trip Engine (owns: `models/trip.py, maintenance.py`, `routers/trips.py, maintenance.py`, `services/trip_service.py, maintenance_service.py`, backend tests)
| Time | Task | Push by |
|---|---|---|
| H0:15–H1:00 | Design Trip state machine in `services/trip_service.py` (Draft→Dispatched→Completed→Cancelled); write validation rules as code stubs | H1:00 |
| H1:00–H2:00 | `routers/trips.py` creation endpoint: cargo weight ≤ capacity, only Available vehicle/driver selectable | H2:00 |
| H2:00–H3:00 | Dispatch transition: atomic update — vehicle + driver → On Trip together | H3:00 |
| H3:00–H4:00 | Complete/Cancel transitions: revert vehicle + driver → Available | H4:00 |
| H4:00–H5:00 | Pytest suite: over-capacity, double-assignment, expired license, suspended driver | H5:00 |
| H5:00–H6:00 | `maintenance_service.py` + `routers/maintenance.py`: active record → vehicle In Shop; close → Available | H6:00 |
| H6:00–H7:00 | KPI queries for Dev D's dashboard (active/available vehicles, trips, utilization %) + ROI formula | H7:00 |
| H7:00–H8:00 | Final edge-case fixes, rehearse the spec's 9-step demo workflow | H8:00 |

### Dev C — Frontend Core (owns: `context/AuthContext.jsx`, `api/authApi.js, vehicleApi.js, driverApi.js, tripApi.js, maintenanceApi.js`, all `pages/` except Dashboard/Reports)
| Time | Task | Push by |
|---|---|---|
| H0:15–H1:00 | App scaffold, `LoginPage.jsx`/`SignupPage.jsx` (UI, mock data) | H1:00 |
| H1:00–H2:00 | `AuthContext.jsx` + `authApi.js` wired to backend, protected routes, role-based nav | H2:00 |
| H2:00–H3:00 | `VehicleRegistryPage.jsx` + `vehicleApi.js`: list/create/edit, inline validation errors | H3:00 |
| H3:00–H4:00 | `DriverManagementPage.jsx` + `driverApi.js`: expiry date picker, status badges | H4:00 |
| H4:00–H5:00 | `TripManagementPage.jsx` + `tripApi.js`: filtered dropdowns, dispatch/complete/cancel actions | H5:00 |
| H5:00–H6:00 | `MaintenancePage.jsx` + `maintenanceApi.js` | H6:00 |
| H6:00–H7:00 | `FuelExpensePage.jsx` | H7:00 |
| H7:00–H8:00 | Responsive pass, loading/error states, polish | H8:00 |

### Dev D — Dashboard / Reports / DevOps (owns: `components/common/`, `api/axiosClient.js, reportsApi.js`, `pages/DashboardPage.jsx, ReportsPage.jsx`, `routers/reports.py`, `services/kpi_service.py`, deployment)
| Time | Task | Push by |
|---|---|---|
| H0:15–H1:00 | `axiosClient.js`, `components/common/` (Button, Card, Badge, Table), Recharts set up | H1:00 |
| H1:00–H2:00 | `DashboardPage.jsx` skeleton with KPI cards (placeholder data) | H2:00 |
| H2:00–H3:00 | Wire KPI cards to real endpoints as Dev A/B ship them | H3:00 |
| H3:00–H4:00 | `ReportsPage.jsx`: fuel efficiency, fleet utilization charts | H4:00 |
| H4:00–H5:00 | Operational cost + ROI report, `routers/reports.py` CSV export endpoint | H5:00 |
| H5:00–H6:00 | Search/filter/sort across Vehicle & Driver screens (stretch: dark mode) | H6:00 |
| H6:00–H7:00 | End-to-end test across all screens with Dev A's seed data | H7:00 |
| H7:00–H8:00 | Deploy backend to Railway, frontend to Vercel, record backup demo video, finalize README | H8:00 |

---

## 6. Final Hour Checklist (H7:00–H8:00, all 4 together)

- [ ] All branches merged into `main`, conflicts resolved
- [ ] Run the spec's own example workflow end-to-end (Van-05 → Alex → dispatch → complete → maintenance) live
- [ ] Confirm every must-have actually works, not just exists
- [ ] 2–3 minute demo script: RBAC, double-assignment prevention, automatic status cascades, ROI report
- [ ] Deployed URL live and tested in an incognito window
- [ ] Tag a `v1.0` release commit
- [ ] README has setup instructions + screenshots for the evaluator
