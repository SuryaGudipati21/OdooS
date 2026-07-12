import { useEffect, useState } from "react";
import Card from "../components/common/Card";
import { getDashboardKPIs } from "../api/kpiService";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadKPIs = async () => {
      try {
        const data = await getDashboardKPIs();

        console.log("Dashboard KPI data:", data);

        setDashboardData(data);
      } catch (err) {
        console.error("Failed to load dashboard KPIs:", err);
        setError("Unable to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadKPIs();
  }, []);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const kpis = [
    {
      title: "Total Vehicles",
      value: dashboardData?.total_vehicles ?? 0,
    },
    {
      title: "Active Drivers",
      value: dashboardData?.active_drivers ?? 0,
    },
    {
      title: "Active Trips",
      value: dashboardData?.active_trips ?? 0,
    },
    {
      title: "Maintenance Due",
      value: dashboardData?.maintenance_due ?? 0,
    },
  ];

  return (
    <div>
      <h2>TransitOps Dashboard</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginTop: "25px",
        }}
      >
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <h3>{kpi.title}</h3>
            <p>{kpi.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}