// Owner: Dev D

import Card from "../components/common/card.jsx";

export default function DashboardPage() {
  const kpis = [
    { title: "Total Vehicles", value: "24" },
    { title: "Active Drivers", value: "18" },
    { title: "Active Trips", value: "8" },
    { title: "Maintenance Due", value: "3" },
  ];

  return (
    <div style={{ padding: "30px" }}>
      <h1>TransitOps Dashboard</h1>

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
            <h1>{kpi.value}</h1>
          </Card>
        ))}
      </div>
    </div>
  );
}