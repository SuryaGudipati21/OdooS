import { useEffect, useState } from "react";
import Card from "../components/common/Card";

export default function DashboardPage() {
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [maintenanceDue, setMaintenanceDue] = useState(0);

  useEffect(() => {
    // Get vehicle data from backend
    fetch("http://127.0.0.1:8000/vehicles/")
      .then((response) => response.json())
      .then((data) => {
        setTotalVehicles(data.length);
      })
      .catch((error) => {
        console.error("Vehicle API error:", error);
      });

    // Get maintenance data from backend
    fetch("http://127.0.0.1:8000/maintenance")
      .then((response) => response.json())
      .then((data) => {
        setMaintenanceDue(data.length);
      })
      .catch((error) => {
        console.error("Maintenance API error:", error);
      });
  }, []);

  const kpis = [
    {
      title: "Total Vehicles",
      value: totalVehicles,
    },
    {
      title: "Active Drivers",
      value: 18,
    },
    {
      title: "Active Trips",
      value: 8,
    },
    {
      title: "Maintenance Due",
      value: maintenanceDue,
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