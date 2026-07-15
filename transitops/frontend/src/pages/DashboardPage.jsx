// Owner: Dev D
import { useEffect, useState } from "react";
import { getTrips } from "../api/tripApi";
import Card from "../components/common/Card.jsx";
import Badge from "../components/common/Badge.jsx";
import { getDashboardKPIs } from "../api/kpiservices";

const STATUS_BADGE_MAP = {
  Draft: "default",
  Dispatched: "active",
  Completed: "available",
  Cancelled: "unavailable",
};

export default function DashboardPage() {
  const [vehicleType, setVehicleType] = useState("All");
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [kpiData, tripsResponse] = await Promise.all([
          getDashboardKPIs(),
          getTrips(),
        ]);
        setSummary(kpiData);
        setRecentTrips(tripsResponse.data.slice(0, 5));
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Unable to load dashboard data. Check whether the backend server is running.");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2>Dashboard Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  const kpis = [
    { title: "Total Vehicles", value: summary.total_vehicles, accent: "border-blue-500", valueColor: "text-blue-600" },
    { title: "Available Vehicles", value: summary.available_vehicles, accent: "border-green-500", valueColor: "text-green-600" },
    { title: "In Maintenance", value: summary.in_maintenance_vehicles, accent: "border-yellow-500", valueColor: "text-yellow-600" },
    { title: "Active Trips", value: summary.active_trips, accent: "border-blue-500", valueColor: "text-blue-600" },
    { title: "Pending Trips", value: summary.pending_trips, accent: "border-gray-400", valueColor: "text-gray-600" },
    { title: "Drivers On Duty", value: summary.drivers_on_duty, accent: "border-green-500", valueColor: "text-green-600" },
    { title: "Fleet Utilization", value: `${summary.fleet_utilization_percent}%`, accent: "border-purple-500", valueColor: "text-purple-600" },
  ];

  const breakdown = summary.vehicle_status_breakdown || {};
  const totalForBreakdown = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;
  const COLOR_MAP = {
    available: "bg-green-500",
    on_trip: "bg-blue-500",
    in_shop: "bg-yellow-500",
    retired: "bg-red-400",
  };
  const vehicleStatusBreakdown = Object.entries(breakdown).map(([label, count]) => ({
    label,
    count,
    total: totalForBreakdown,
    color: COLOR_MAP[label] || "bg-gray-400",
  }));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">TransitOps Dashboard</h1>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] border rounded-lg px-4 py-2 bg-white"
        />
        <select
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          className="border rounded-lg px-3 py-2 bg-white text-sm"
        >
          <option>All</option>
          <option>Van</option>
          <option>Truck</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 bg-white text-sm"
        >
          <option>All</option>
          <option>Available</option>
          <option>On Trip</option>
          <option>In Shop</option>
          <option>Retired</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <div className={`border-l-4 ${kpi.accent} pl-4`}>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.title}</h3>
              <p className={`text-3xl font-bold mt-2 ${kpi.valueColor}`}>{kpi.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recent Trips */}
      <div className="lg:col-span-2">
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Recent Trips</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b">
                <th className="pb-2 font-medium">Trip</th>
                <th className="pb-2 font-medium">Vehicle ID</th>
                <th className="pb-2 font-medium">Driver ID</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.map((trip) => (
                <tr key={trip.id} className="border-b last:border-0">
                  <td className="py-3 font-medium text-gray-700">TR{String(trip.id).padStart(3, "0")}</td>
                  <td className="py-3 text-gray-600">{trip.vehicle_id}</td>
                  <td className="py-3 text-gray-600">{trip.driver_id}</td>
                  <td className="py-3">
                    <Badge status={STATUS_BADGE_MAP[trip.status] || "default"}>{trip.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Vehicle Status Breakdown */}
      <div>
          <Card>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Vehicle Status</h2>
            <div className="space-y-4">
              {vehicleStatusBreakdown.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 capitalize">{item.label.replace("_", " ")}</span>
                    <span className="text-gray-400">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${(item.count / item.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}