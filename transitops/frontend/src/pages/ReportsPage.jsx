// Owner: Dev D

import { useEffect, useState } from "react";

import {
  getVehicleReport,
  getDriverReport,
  getTripReport,
  getFuelExpenseReport,
  getMaintenanceReport,
  getUsersReport,
} from "../api/kpiService";

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