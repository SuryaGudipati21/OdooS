// Owner: Dev D

import { useEffect, useState } from "react";

import axiosClient from "../api/axiosClient";
import {
  getVehicleReport,
  getDriverReport,
  getTripReport,
  getFuelExpenseReport,
  getMaintenanceReport,
  getUsersReport,
} from "../api/kpiservices";

const EXPORTS = [
  { label: "Vehicles", path: "/reports/export/vehicles.csv", filename: "vehicles.csv" },
  { label: "Drivers", path: "/reports/export/drivers.csv", filename: "drivers.csv" },
  { label: "Trips", path: "/reports/export/trips.csv", filename: "trips.csv" },
  { label: "Fuel Expenses", path: "/reports/export/fuel-expenses.csv", filename: "fuel-expenses.csv" },
  { label: "Maintenance", path: "/reports/export/maintenance.csv", filename: "maintenance.csv" },
];

async function downloadCsv(path, filename) {
  const response = await axiosClient.get(path, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function ReportsPage() {
  const [reportData, setReportData] = useState({
    vehicles: null,
    drivers: null,
    trips: null,
    fuelExpenses: null,
    maintenance: null,
    users: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [
          vehicles,
          drivers,
          trips,
          fuelExpenses,
          maintenance,
          users,
        ] = await Promise.all([
          getVehicleReport(),
          getDriverReport(),
          getTripReport(),
          getFuelExpenseReport(),
          getMaintenanceReport(),
          getUsersReport(),
        ]);

        setReportData({
          vehicles: vehicles,
          drivers: drivers,
          trips: trips,
          fuelExpenses: fuelExpenses,
          maintenance: maintenance,
          users: users,
        });
      } catch (err) {
        console.error("Failed to load reports:", err);

        setError(
          "Unable to load reports. Check whether the backend server is running."
        );
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const handleExport = async (path, filename) => {
    setExportError("");
    try {
      await downloadCsv(path, filename);
    } catch (err) {
      console.error(`Failed to export ${filename}:`, err);
      setExportError(`Failed to export ${filename}.`);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2>Loading reports...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2>Reports Error</h2>

        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">
        Reports and Analytics
      </h1>

      {/* CSV Export */}
      <div className="flex flex-wrap gap-3 my-4">
        {EXPORTS.map((exp) => (
          <button
            key={exp.path}
            onClick={() => handleExport(exp.path, exp.filename)}
            className="border rounded-lg px-3 py-2 bg-white text-sm hover:bg-gray-50"
          >
            Export {exp.label} CSV
          </button>
        ))}
      </div>
      {exportError && <p className="text-red-600 text-sm mb-4">{exportError}</p>}

      <hr />

      {/* Vehicle Report */}

      <section>
        <h2>Vehicle Report</h2>

        <pre>
          {JSON.stringify(
            reportData.vehicles,
            null,
            2
          )}
        </pre>
      </section>

      <hr />

      {/* Driver Report */}

      <section>
        <h2>Driver Report</h2>

        <pre>
          {JSON.stringify(
            reportData.drivers,
            null,
            2
          )}
        </pre>
      </section>

      <hr />

      {/* Trip Report */}

      <section>
        <h2>Trip Report</h2>

        <pre>
          {JSON.stringify(
            reportData.trips,
            null,
            2
          )}
        </pre>
      </section>

      <hr />

      {/* Fuel Expense Report */}

      <section>
        <h2>Fuel Expense Report</h2>

        <pre>
          {JSON.stringify(
            reportData.fuelExpenses,
            null,
            2
          )}
        </pre>
      </section>

      <hr />

      {/* Maintenance Report */}

      <section>
        <h2>Maintenance Report</h2>

        <pre>
          {JSON.stringify(
            reportData.maintenance,
            null,
            2
          )}
        </pre>
      </section>

      <hr />

      {/* User Report */}

      <section>
        <h2>User Report</h2>

        <pre>
          {JSON.stringify(
            reportData.users,
            null,
            2
          )}
        </pre>
      </section>
    </div>
  );
}

export default ReportsPage;