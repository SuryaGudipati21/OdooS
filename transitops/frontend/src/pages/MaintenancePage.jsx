import { useEffect, useMemo, useState } from "react";

import {
    Wrench,
    Plus,
    Search,
    RefreshCcw,
    CheckCircle,
    Clock,
    AlertTriangle,
    X,
} from "lucide-react";

import {
    getMaintenanceRecords,
    createMaintenance,
    closeMaintenance,
} from "../api/maintenanceApi";

import {
    getVehicles,
    getAvailableVehicles,
} from "../api/vehicleApi";

const MaintenancePage = () => {

    const [records, setRecords] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const [formData, setFormData] = useState({
        vehicleId: "",
        maintenanceType: "",
        description: "",
        cost: "",
        serviceCenter: "",
        scheduledDate: "",
        notes: "",
    });

    const [completionData, setCompletionData] = useState({
        completionNotes: "",
        finalCost: "",
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const [maintenanceRes, vehicleRes, availableRes] = await Promise.all([
                getMaintenanceRecords(),
                getVehicles(),
                getAvailableVehicles(),
            ]);
            setRecords(maintenanceRes.data);
            setVehicles(vehicleRes.data);
            setAvailableVehicles(availableRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Derive a display status from is_active, since the backend never had
    // a multi-state status field — only OPEN (active) / CLOSED (not active).
    const getStatus = (record) => (record.is_active ? "OPEN" : "CLOSED");

    const filteredRecords = useMemo(() => {
        return records.filter((item) => {
            const vehicle = vehicles.find((v) => v.id === item.vehicle_id);
            const vehicleName = vehicle?.registration_number || "";

            const matchesSearch =
                vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.maintenance_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === "" || getStatus(item) === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [records, vehicles, searchTerm, statusFilter]);

    const totalMaintenance = records.length;
    const activeMaintenance = records.filter((r) => r.is_active).length;
    const completedMaintenance = records.filter((r) => !r.is_active).length;
    const totalCost = records.reduce(
        (sum, r) => sum + Number(r.final_cost ?? r.cost ?? 0),
        0
    );

    const resetForm = () => {
        setFormData({
            vehicleId: "",
            maintenanceType: "",
            description: "",
            cost: "",
            serviceCenter: "",
            scheduledDate: "",
            notes: "",
        });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createMaintenance({
                vehicle_id: Number(formData.vehicleId),
                description: formData.description,
                maintenance_type: formData.maintenanceType || null,
                cost: formData.cost ? Number(formData.cost) : null,
                service_center: formData.serviceCenter || null,
                scheduled_date: formData.scheduledDate || null,
                notes: formData.notes || null,
            });
            setShowModal(false);
            resetForm();
            loadData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.detail || "Unable to create maintenance record.");
        }
    };

    const openCloseModal = (record) => {
        setSelectedRecord(record);
        setCompletionData({
            completionNotes: "",
            finalCost: record.cost || "",
        });
        setShowCloseModal(true);
    };

    const handleCloseMaintenance = async () => {
        try {
            await closeMaintenance(selectedRecord.id, {
                final_cost: completionData.finalCost ? Number(completionData.finalCost) : null,
                completion_notes: completionData.completionNotes || null,
            });
            setShowCloseModal(false);
            loadData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.detail || "Unable to close maintenance.");
        }
    };

    const getVehicleName = (id) => {
        const vehicle = vehicles.find((v) => v.id === id);
        return vehicle?.registration_number || id;
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Wrench />
                        Maintenance Management
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Manage vehicle maintenance records.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadData}
                        className="border rounded-lg px-5 py-2 flex items-center gap-2"
                    >
                        <RefreshCcw size={18} />
                        Refresh
                    </button>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="bg-purple-700 text-white px-5 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Maintenance
                    </button>
                </div>
            </div>

            {/* Dashboard Cards */}
            <div className="grid md:grid-cols-4 gap-5 mb-8">
                <div className="bg-white rounded-xl shadow p-5">
                    <div className="text-gray-500">Total Records</div>
                    <div className="text-3xl font-bold mt-2">{totalMaintenance}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-5">
                    <div className="text-gray-500">Active</div>
                    <div className="text-3xl font-bold text-yellow-600 mt-2">{activeMaintenance}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-5">
                    <div className="text-gray-500">Completed</div>
                    <div className="text-3xl font-bold text-green-600 mt-2">{completedMaintenance}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-5">
                    <div className="text-gray-500">Total Cost</div>
                    <div className="text-3xl font-bold mt-2">₹ {totalCost.toLocaleString()}</div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-xl shadow p-5 mb-8">
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search vehicle, type or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border rounded-lg px-4 py-2"
                    >
                        <option value="">All Status</option>
                        <option value="OPEN">Open</option>
                        <option value="CLOSED">Closed</option>
                    </select>

                    <button
                        onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("");
                        }}
                        className="border rounded-lg hover:bg-gray-100"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                {loading ? (
                    <div className="py-20 text-center text-gray-500">
                        Loading maintenance records...
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="py-20 text-center">
                        <AlertTriangle size={50} className="mx-auto text-gray-400 mb-4" />
                        <h2 className="text-xl font-semibold">No maintenance records found</h2>
                        <p className="text-gray-500 mt-2">
                            Try changing your search or create a new record.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left">Vehicle</th>
                                    <th className="px-6 py-3 text-left">Type</th>
                                    <th className="px-6 py-3 text-left">Description</th>
                                    <th className="px-6 py-3 text-left">Service Center</th>
                                    <th className="px-6 py-3 text-left">Scheduled</th>
                                    <th className="px-6 py-3 text-left">Cost</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                    <th className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.map((record) => {
                                    const status = getStatus(record);
                                    return (
                                        <tr key={record.id} className="border-t hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">
                                                {getVehicleName(record.vehicle_id)}
                                            </td>
                                            <td className="px-6 py-4">{record.maintenance_type || "-"}</td>
                                            <td className="px-6 py-4">{record.description}</td>
                                            <td className="px-6 py-4">{record.service_center || "-"}</td>
                                            <td className="px-6 py-4">
                                                {record.scheduled_date
                                                    ? new Date(record.scheduled_date).toLocaleDateString()
                                                    : "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                ₹{Number(record.final_cost ?? record.cost ?? 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {status === "OPEN" ? (
                                                    <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                                                        <Clock size={15} />
                                                        Open
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                                                        <CheckCircle size={15} />
                                                        Completed
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {status === "OPEN" && (
                                                    <button
                                                        onClick={() => openCloseModal(record)}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                                                    >
                                                        Close
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Create Maintenance Record</h2>
                            <button onClick={() => setShowModal(false)}>
                                <X />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-5">
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block mb-2 font-medium">Vehicle</label>
                                    <select
                                        required
                                        value={formData.vehicleId}
                                        onChange={(e) =>
                                            setFormData({ ...formData, vehicleId: e.target.value })
                                        }
                                        className="w-full border rounded-lg px-4 py-2"
                                    >
                                        <option value="">Select Vehicle</option>
                                        {availableVehicles.map((vehicle) => (
                                            <option key={vehicle.id} value={vehicle.id}>
                                                {vehicle.registration_number}
                                            </option>
                                        ))}
                                    </select>
                                    {availableVehicles.length === 0 && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            No vehicles are currently available for maintenance.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium">Maintenance Type</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.maintenanceType}
                                        onChange={(e) =>
                                            setFormData({ ...formData, maintenanceType: e.target.value })
                                        }
                                        className="w-full border rounded-lg px-4 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium">Estimated Cost</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.cost}
                                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                        className="w-full border rounded-lg px-4 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium">Service Center</label>
                                    <input
                                        type="text"
                                        value={formData.serviceCenter}
                                        onChange={(e) =>
                                            setFormData({ ...formData, serviceCenter: e.target.value })
                                        }
                                        className="w-full border rounded-lg px-4 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium">Scheduled Date</label>
                                    <input
                                        type="date"
                                        value={formData.scheduledDate}
                                        onChange={(e) =>
                                            setFormData({ ...formData, scheduledDate: e.target.value })
                                        }
                                        className="w-full border rounded-lg px-4 py-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">Notes</label>
                                <textarea
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="border px-5 py-2 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-2 rounded-lg"
                                >
                                    Create Maintenance
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Close Maintenance Modal */}
            {showCloseModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6">
                        <h2 className="text-2xl font-bold mb-6">Close Maintenance</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2 font-medium">Final Cost</label>
                                <input
                                    type="number"
                                    value={completionData.finalCost}
                                    onChange={(e) =>
                                        setCompletionData({ ...completionData, finalCost: e.target.value })
                                    }
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium">Completion Notes</label>
                                <textarea
                                    rows={4}
                                    value={completionData.completionNotes}
                                    onChange={(e) =>
                                        setCompletionData({
                                            ...completionData,
                                            completionNotes: e.target.value,
                                        })
                                    }
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowCloseModal(false)}
                                className="border px-5 py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCloseMaintenance}
                                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
                            >
                                Close Maintenance
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaintenancePage;