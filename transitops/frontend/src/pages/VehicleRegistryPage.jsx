import { useEffect, useState } from "react";

import {
    Search,
    Plus,
    Pencil,
    Trash2,
    Truck,
    Filter,
    RefreshCcw,
} from "lucide-react";

import {
    getVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
} from "../api/vehicleApi";

const VehicleRegistryPage = () => {

    const [vehicles, setVehicles] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [statusFilter, setStatusFilter] = useState("");

    const [typeFilter, setTypeFilter] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const rowsPerPage = 8;

    const [selectedVehicle, setSelectedVehicle] = useState(null);

    const [showModal, setShowModal] = useState(false);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const loadVehicles = async () => {

        try {

            setLoading(true);

            const response = await getVehicles();

            setVehicles(response.data);

        } catch (err) {

            setError("Unable to load vehicles.");

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadVehicles();

    }, []);

    const handleRefresh = () => {

        loadVehicles();

    };

    const handleDelete = (vehicle) => {

    setSelectedVehicle(vehicle);

    setShowDeleteDialog(true);

};

const confirmDelete = async () => {

    try {

        await deleteVehicle(selectedVehicle.id);

        setShowDeleteDialog(false);

        setSelectedVehicle(null);

        loadVehicles();

    } catch (err) {

        alert(

            err.response?.data?.detail ||

            "Unable to delete vehicle."

        );

    }

};

    const filteredVehicles = vehicles.filter((vehicle) => {

        const matchesSearch =
            vehicle.registration_number
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||

            vehicle.vehicle_name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "" ||
            vehicle.status === statusFilter;

        const matchesType =
            typeFilter === "" ||
            vehicle.type === typeFilter;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesType
        );

    });

    const totalPages = Math.ceil(
        filteredVehicles.length / rowsPerPage
    );

    const displayedVehicles =
        filteredVehicles.slice(
            (currentPage - 1) * rowsPerPage,
            currentPage * rowsPerPage
        );

    return (

        <div className="p-8">

            {/* Header */}

            <div className="flex flex-col lg:flex-row justify-between items-center mb-8">

                <div>

                    <h1 className="text-3xl font-bold flex items-center gap-3">

                        <Truck size={34} />

                        Vehicle Registry

                    </h1>

                    <p className="text-gray-500 mt-2">

                        Manage your transport fleet.

                    </p>

                </div>

                <div className="flex gap-3 mt-5 lg:mt-0">

                    <button

                        onClick={handleRefresh}

                        className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg shadow hover:bg-gray-100"

                    >

                        <RefreshCcw size={18}/>

                        Refresh

                    </button>

                    <button

                        onClick={() => {

                            setSelectedVehicle(null);

                            setShowModal(true);

                        }}

                        className="flex items-center gap-2 bg-purple-700 text-white px-5 py-2 rounded-lg hover:bg-purple-800"

                    >

                        <Plus size={18}/>

                        Add Vehicle

                    </button>

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

                            placeholder="Search vehicle..."

                            className="border rounded-lg w-full pl-10 p-3"

                            value={searchTerm}

                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }

                        />

                    </div>

                    <select

                        className="border rounded-lg p-3"

                        value={statusFilter}

                        onChange={(e) =>
                            setStatusFilter(e.target.value)
                        }

                    >

                        <option value="">

                            All Status

                        </option>

                        <option>

                            Available

                        </option>

                        <option>

                            On Trip

                        </option>

                        <option>

                            In Shop

                        </option>

                        <option>

                            Retired

                        </option>

                    </select>

                    <select

                        className="border rounded-lg p-3"

                        value={typeFilter}

                        onChange={(e) =>
                            setTypeFilter(e.target.value)
                        }

                    >

                        <option value="">

                            All Types

                        </option>

                        <option>

                            Truck

                        </option>

                        <option>

                            Van

                        </option>

                        <option>

                            Mini Truck

                        </option>

                        <option>

                            Trailer

                        </option>

                    </select>

                </div>

            </div>
            {/* Vehicle Table */}

            <div className="bg-white rounded-xl shadow overflow-hidden">

                {loading ? (

                    <div className="flex justify-center items-center py-16">

                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-700"></div>

                    </div>

                ) : error ? (

                    <div className="text-center py-12 text-red-600 font-semibold">

                        {error}

                    </div>

                ) : displayedVehicles.length === 0 ? (

                    <div className="text-center py-12 text-gray-500">

                        No vehicles found.

                    </div>

                ) : (

                    <table className="w-full">

                        <thead className="bg-gray-100">

                            <tr>

                                <th className="text-left p-4">
                                    Registration
                                </th>

                                <th className="text-left p-4">
                                    Vehicle
                                </th>

                                <th className="text-left p-4">
                                    Type
                                </th>

                                <th className="text-left p-4">
                                    Capacity (kg)
                                </th>

                                <th className="text-left p-4">
                                    Odometer
                                </th>

                                <th className="text-left p-4">
                                    Status
                                </th>

                                <th className="text-center p-4">
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {displayedVehicles.map((vehicle) => (

                                <tr
                                    key={vehicle.id}
                                    className="border-t hover:bg-gray-50 transition"
                                >

                                    <td className="p-4 font-medium">

                                        {vehicle.registration_number}

                                    </td>

                                    <td className="p-4">

                                        {vehicle.vehicle_name}

                                    </td>

                                    <td className="p-4">

                                        {vehicle.type}

                                    </td>

                                    <td className="p-4">

                                        {vehicle.maximum_load_capacity}

                                    </td>

                                    <td className="p-4">

                                        {vehicle.odometer} km

                                    </td>

                                    <td className="p-4">

                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-semibold

                                            ${
                                                vehicle.status === "Available"
                                                    ? "bg-green-100 text-green-700"

                                                : vehicle.status === "On Trip"
                                                    ? "bg-blue-100 text-blue-700"

                                                : vehicle.status === "In Shop"
                                                    ? "bg-yellow-100 text-yellow-700"

                                                : "bg-red-100 text-red-700"
                                            }`}
                                        >

                                            {vehicle.status}

                                        </span>

                                    </td>

                                    <td className="p-4">

                                        <div className="flex justify-center gap-3">

                                            <button

                                                onClick={() => {

                                                    setSelectedVehicle(vehicle);

                                                    setShowModal(true);

                                                }}

                                                className="text-blue-600 hover:text-blue-800"

                                            >

                                                <Pencil size={18} />

                                            </button>

                                            <button

                                                onClick={() =>
                                                    handleDelete(vehicle)
                                                }

                                                className="text-red-600 hover:text-red-800"

                                            >

                                                <Trash2 size={18} />

                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                )}

            </div>

            {/* Pagination */}

            {!loading && totalPages > 1 && (

                <div className="flex justify-center mt-8 gap-2">

                    <button

                        disabled={currentPage === 1}

                        onClick={() =>
                            setCurrentPage(currentPage - 1)
                        }

                        className="px-4 py-2 border rounded disabled:opacity-40"

                    >

                        Previous

                    </button>

                    {Array.from(
                        { length: totalPages },
                        (_, index) => (

                            <button

                                key={index}

                                onClick={() =>
                                    setCurrentPage(index + 1)
                                }

                                className={`px-4 py-2 rounded

                                ${
                                    currentPage === index + 1

                                        ? "bg-purple-700 text-white"

                                        : "border"
                                }`}

                            >

                                {index + 1}

                            </button>

                        )
                    )}

                    <button

                        disabled={
                            currentPage === totalPages
                        }

                        onClick={() =>
                            setCurrentPage(currentPage + 1)
                        }

                        className="px-4 py-2 border rounded disabled:opacity-40"

                    >

                        Next

                    </button>

                </div>

            )}

            {/* Add/Edit Vehicle Modal */}

{showModal && (

<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-8">

        <h2 className="text-2xl font-bold mb-6">

            {selectedVehicle ? "Edit Vehicle" : "Add Vehicle"}

        </h2>

        <VehicleForm

            vehicle={selectedVehicle}

            onClose={() => {

                setShowModal(false);

                setSelectedVehicle(null);

                loadVehicles();

            }}

        />

    </div>

</div>

)}

{/* Delete Confirmation Dialog */}

{showDeleteDialog && (

<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8">

        <h2 className="text-2xl font-bold text-red-600">

            Delete Vehicle

        </h2>

        <p className="mt-5 text-gray-600">

            Are you sure you want to delete

            <span className="font-bold">

                {" "}
                {selectedVehicle?.registration_number}
                {" "}

            </span>

            ?

        </p>

        <div className="flex justify-end gap-4 mt-8">

            <button

                onClick={() => {

                    setShowDeleteDialog(false);

                    setSelectedVehicle(null);

                }}

                className="border rounded-lg px-5 py-2"

            >

                Cancel

            </button>

            <button

                onClick={confirmDelete}

                className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-5 py-2"

            >

                Delete

            </button>

        </div>

    </div>

</div>

)}
</div>

);

};

export default VehicleRegistryPage;