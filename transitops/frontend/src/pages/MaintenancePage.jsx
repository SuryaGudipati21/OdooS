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
} from "../api/vehicleApi";

const MaintenancePage = () => {

    const [records, setRecords] = useState([]);

    const [vehicles, setVehicles] = useState([]);

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

            const [

                maintenanceRes,

                vehicleRes,

            ] = await Promise.all([

                getMaintenanceRecords(),

                getVehicles(),

            ]);

            setRecords(maintenanceRes.data);

            setVehicles(vehicleRes.data);

        }

        catch (err) {

            console.error(err);

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadData();

    }, []);

    const filteredRecords = useMemo(() => {

        return records.filter((item) => {

            const vehicle = vehicles.find(

                (v) => v.id === item.vehicleId

            );

            const vehicleName =

                vehicle?.registrationNumber ||

                vehicle?.registration ||

                "";

            const matchesSearch =

                vehicleName

                    .toLowerCase()

                    .includes(searchTerm.toLowerCase())

                ||

                item.maintenanceType

                    ?.toLowerCase()

                    .includes(searchTerm.toLowerCase())

                ||

                item.description

                    ?.toLowerCase()

                    .includes(searchTerm.toLowerCase());

            const matchesStatus =

                statusFilter === ""

                ||

                item.status === statusFilter;

            return matchesSearch && matchesStatus;

        });

    }, [

        records,

        vehicles,

        searchTerm,

        statusFilter,

    ]);

    const totalMaintenance = records.length;

    const activeMaintenance = records.filter(

        (r) =>

            r.status === "OPEN"

            ||

            r.status === "IN_PROGRESS"

    ).length;

    const completedMaintenance = records.filter(

        (r) =>

            r.status === "COMPLETED"

            ||

            r.status === "CLOSED"

    ).length;

    const totalCost = records.reduce(

        (sum, r) =>

            sum +

            Number(

                r.cost ||

                r.finalCost ||

                0

            ),

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

            await createMaintenance(formData);

            setShowModal(false);

            resetForm();

            loadData();

        }

        catch (err) {

            console.error(err);

            alert("Unable to create maintenance record.");

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

            await closeMaintenance(

                selectedRecord.id,

                completionData

            );

            setShowCloseModal(false);

            loadData();

        }

        catch (err) {

            console.error(err);

            alert("Unable to close maintenance.");

        }

    };

    const getVehicleName = (id) => {

        const vehicle = vehicles.find(

            (v) => v.id === id

        );

        return (

            vehicle?.registrationNumber ||

            vehicle?.registration ||

            vehicle?.vehicleNumber ||

            id

        );

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

                    <div className="text-gray-500">

                        Total Records

                    </div>

                    <div className="text-3xl font-bold mt-2">

                        {totalMaintenance}

                    </div>

                </div>

                <div className="bg-white rounded-xl shadow p-5">

                    <div className="text-gray-500">

                        Active

                    </div>

                    <div className="text-3xl font-bold text-yellow-600 mt-2">

                        {activeMaintenance}

                    </div>

                </div>

                <div className="bg-white rounded-xl shadow p-5">

                    <div className="text-gray-500">

                        Completed

                    </div>

                    <div className="text-3xl font-bold text-green-600 mt-2">

                        {completedMaintenance}

                    </div>

                </div>

                <div className="bg-white rounded-xl shadow p-5">

                    <div className="text-gray-500">

                        Total Cost

                    </div>

                    <div className="text-3xl font-bold mt-2">

                        ₹ {totalCost.toLocaleString()}
                    </div>

                </div>

            </div>
            {/* Search & Filters */}

            <div className="bg-white rounded-xl shadow p-5 mb-8">

                <div className="grid md:grid-cols-3 gap-4">

                    <div className="relative">

                        <Search
                            className="absolute left-3 top-3 text-gray-400"
                            size={18}
                        />

                        <input
                            type="text"
                            placeholder="Search vehicle, type or description..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                            className="w-full border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />

                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value)
                        }
                        className="border rounded-lg px-4 py-2"
                    >

                        <option value="">All Status</option>

                        <option value="OPEN">Open</option>

                        <option value="IN_PROGRESS">
                            In Progress
                        </option>

                        <option value="COMPLETED">
                            Completed
                        </option>

                        <option value="CLOSED">
                            Closed
                        </option>

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

                        <AlertTriangle
                            size={50}
                            className="mx-auto text-gray-400 mb-4"
                        />

                        <h2 className="text-xl font-semibold">

                            No maintenance records found

                        </h2>

                        <p className="text-gray-500 mt-2">

                            Try changing your search or create a new record.

                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="min-w-full">

                            <thead className="bg-gray-100">

                                <tr>

                                    <th className="px-6 py-3 text-left">

                                        Vehicle

                                    </th>

                                    <th className="px-6 py-3 text-left">

                                        Type

                                    </th>

                                    <th className="px-6 py-3 text-left">

                                        Description

                                    </th>

                                    <th className="px-6 py-3 text-left">

                                        Service Center

                                    </th>

                                    <th className="px-6 py-3 text-left">

                                        Scheduled

                                    </th>

                                    <th className="px-6 py-3 text-left">

                                        Cost

                                    </th>

                                    <th className="px-6 py-3 text-left">

                                        Status

                                    </th>

                                    <th className="px-6 py-3 text-center">

                                        Actions

                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredRecords.map((record) => (

                                    <tr
                                        key={record.id}
                                        className="border-t hover:bg-gray-50"
                                    >

                                        <td className="px-6 py-4 font-medium">

                                            {getVehicleName(
                                                record.vehicleId
                                            )}

                                        </td>

                                        <td className="px-6 py-4">

                                            {record.maintenanceType}

                                        </td>

                                        <td className="px-6 py-4">

                                            {record.description}

                                        </td>

                                        <td className="px-6 py-4">

                                            {record.serviceCenter}

                                        </td>

                                        <td className="px-6 py-4">

                                            {record.scheduledDate
                                                ? new Date(
                                                      record.scheduledDate
                                                  ).toLocaleDateString()
                                                : "-"}

                                        </td>

                                        <td className="px-6 py-4">

                                            ₹
                                            {Number(
                                                record.finalCost ??
                                                    record.cost ??
                                                    0
                                            ).toLocaleString()}

                                        </td>

                                        <td className="px-6 py-4">

                                            {record.status ===
                                                "OPEN" && (

                                                <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">

                                                    <Clock size={15} />

                                                    Open

                                                </span>

                                            )}

                                            {record.status ===
                                                "IN_PROGRESS" && (

                                                <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">

                                                    <RefreshCcw size={15} />

                                                    In Progress

                                                </span>

                                            )}

                                            {(record.status ===
                                                "COMPLETED" ||
                                                record.status ===
                                                    "CLOSED") && (

                                                <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">

                                                    <CheckCircle
                                                        size={15}
                                                    />

                                                    Completed

                                                </span>

                                            )}

                                        </td>

                                        <td className="px-6 py-4 text-center">

                                            {(record.status ===
                                                "OPEN" ||
                                                record.status ===
                                                    "IN_PROGRESS") && (

                                                <button
                                                    onClick={() =>
                                                        openCloseModal(
                                                            record
                                                        )
                                                    }
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                                                >

                                                    Close

                                                </button>

                                            )}

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {showModal && (

                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">

                        <div className="flex justify-between items-center mb-6">

                            <h2 className="text-2xl font-bold">

                                Create Maintenance Record

                            </h2>

                            <button
                                onClick={() => setShowModal(false)}
                            >
                                <X />
                            </button>

                        </div>

                        <form
                            onSubmit={handleCreate}
                            className="space-y-5"
                        >

                            <div className="grid md:grid-cols-2 gap-5">

                                <div>

                                    <label className="block mb-2 font-medium">

                                        Vehicle

                                    </label>

                                    <select
                                        required
                                        value={formData.vehicleId}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                vehicleId: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg px-4 py-2"
                                    >

                                        <option value="">

                                            Select Vehicle

                                        </option>

                                        {vehicles.map((vehicle) => (

                                            <option
                                                key={vehicle.id}
                                                value={vehicle.id}
                                            >

                                                {vehicle.registrationNumber ||
                                                    vehicle.registration ||
                                                    vehicle.vehicleNumber}

                                            </option>

                                        ))}

                                    </select>

                                </div>

                                <div>

                                    <label className="block mb-2 font-medium">

                                        Maintenance Type

                                    </label>

                                    <input
                                        required
                                        type="text"
                                        value={formData.maintenanceType}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                maintenanceType:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg px-4 py-2"
                                    />

                                </div>

                                <div>

                                    <label className="block mb-2 font-medium">

                                        Estimated Cost

                                    </label>

                                    <input
                                        required
                                        type="number"
                                        value={formData.cost}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                cost: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg px-4 py-2"
                                    />

                                </div>

                                <div>

                                    <label className="block mb-2 font-medium">

                                        Service Center

                                    </label>

                                    <input
                                        type="text"
                                        value={formData.serviceCenter}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                serviceCenter:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg px-4 py-2"
                                    />

                                </div>

                                <div>

                                    <label className="block mb-2 font-medium">

                                        Scheduled Date

                                    </label>

                                    <input
                                        type="date"
                                        value={formData.scheduledDate}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                scheduledDate:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg px-4 py-2"
                                    />

                                </div>

                            </div>

                            <div>

                                <label className="block mb-2 font-medium">

                                    Description

                                </label>

                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full border rounded-lg px-4 py-2"
                                />

                            </div>

                            <div>

                                <label className="block mb-2 font-medium">

                                    Notes

                                </label>

                                <textarea
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            notes: e.target.value,
                                        })
                                    }
                                    className="w-full border rounded-lg px-4 py-2"
                                />

                            </div>

                            <div className="flex justify-end gap-3 pt-4">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowModal(false)
                                    }
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

                        <h2 className="text-2xl font-bold mb-6">

                            Close Maintenance

                        </h2>

                        <div className="space-y-4">

                            <div>

                                <label className="block mb-2 font-medium">

                                    Final Cost

                                </label>

                                <input
                                    type="number"
                                    value={completionData.finalCost}
                                    onChange={(e) =>
                                        setCompletionData({
                                            ...completionData,
                                            finalCost:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full border rounded-lg px-4 py-2"
                                />

                            </div>

                            <div>

                                <label className="block mb-2 font-medium">

                                    Completion Notes

                                </label>

                                <textarea
                                    rows={4}
                                    value={
                                        completionData.completionNotes
                                    }
                                    onChange={(e) =>
                                        setCompletionData({
                                            ...completionData,
                                            completionNotes:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full border rounded-lg px-4 py-2"
                                />

                            </div>

                        </div>

                        <div className="flex justify-end gap-3 mt-6">

                            <button
                                onClick={() =>
                                    setShowCloseModal(false)
                                }
                                className="border px-5 py-2 rounded-lg"
                            >

                                Cancel

                            </button>

                            <button
                                onClick={
                                    handleCloseMaintenance
                                }
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