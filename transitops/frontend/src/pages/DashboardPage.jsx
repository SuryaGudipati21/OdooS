// Owner: Dev D
// TODO(Dev D): replace the placeholder arrays below with real calls to
// kpi_service.py / reports.py once those are built. Structure is ready.
import { useState } from "react";
import Card from "../components/common/Card.jsx";
import Badge from "../components/common/Badge.jsx";

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

  // TODO(Dev D): replace with GET /reports/kpis or similar
  const kpis = [
    { title: "Active Vehicles", value: "7", accent: "border-blue-500", valueColor: "text-blue-600" },
    { title: "Available Vehicles", value: "2", accent: "border-green-500", valueColor: "text-green-600" },
    { title: "In Maintenance", value: "1", accent: "border-yellow-500", valueColor: "text-yellow-600" },
    { title: "Active Trips", value: "1", accent: "border-blue-500", valueColor: "text-blue-600" },
    { title: "Pending Trips", value: "0", accent: "border-gray-400", valueColor: "text-gray-600" },
    { title: "Drivers On Duty", value: "5", accent: "border-green-500", valueColor: "text-green-600" },
    { title: "Fleet Utilization", value: "20%", accent: "border-purple-500", valueColor: "text-purple-600" },
  ];

  // TODO(Dev D): replace with GET /trips?limit=5&sort=recent
  const recentTrips = [
    { id: "TR001", vehicle: "VAN-05", driver: "Alex Kumar", status: "Completed", eta: "—" },
    { id: "TR002", vehicle: "TRK-12", driver: "Priya Sharma", status: "Dispatched", eta: "45 min" },
    { id: "TR003", vehicle: "—", driver: "—", status: "Draft", eta: "Awaiting vehicle" },
  ];

  // TODO(Dev D): replace with a count of vehicles grouped by status
  const vehicleStatusBreakdown = [
    { label: "Available", count: 2, total: 7, color: "bg-green-500" },
    { label: "On Trip", count: 1, total: 7, color: "bg-blue-500" },
    { label: "In Shop", count: 1, total: 7, color: "bg-yellow-500" },
    { label: "Retired", count: 1, total: 7, color: "bg-red-400" },
  ];

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
                  <th className="pb-2 font-medium">Vehicle</th>
                  <th className="pb-2 font-medium">Driver</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">ETA</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.map((trip) => (
                  <tr key={trip.id} className="border-b last:border-0">
                    <td className="py-3 font-medium text-gray-700">{trip.id}</td>
                    <td className="py-3 text-gray-600">{trip.vehicle}</td>
                    <td className="py-3 text-gray-600">{trip.driver}</td>
                    <td className="py-3">
                      <Badge status={STATUS_BADGE_MAP[trip.status] || "default"}>{trip.status}</Badge>
                    </td>
                    <td className="py-3 text-gray-500">{trip.eta}</td>
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
                    <span className="text-gray-600">{item.label}</span>
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