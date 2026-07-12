import { useEffect, useState } from "react";

import {
    Search,
    Plus,
    Pencil,
    Trash2,
    User,
    RefreshCcw,
} from "lucide-react";

import {
    getDrivers,
    createDriver,
    updateDriver,
    deleteDriver,
} from "../api/driverApi";

const DriverManagementPage = () => {

    const [drivers, setDrivers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [statusFilter, setStatusFilter] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const rowsPerPage = 8;

    const [selectedDriver, setSelectedDriver] = useState(null);

    const [showModal, setShowModal] = useState(false);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const loadDrivers = async () => {

        try {

            setLoading(true);

            const response = await getDrivers();

            setDrivers(response.data);

        } catch (err) {

            setError("Unable to load drivers.");

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadDrivers();

    }, []);

    const handleRefresh = () => {

        loadDrivers();

    };

    const handleDelete = (driver) => {

        setSelectedDriver(driver);

        setShowDeleteDialog(true);

    };

    const confirmDelete = async () => {

        try {

            await deleteDriver(selectedDriver.id);

            setShowDeleteDialog(false);

            setSelectedDriver(null);

            loadDrivers();

        } catch (err) {

            alert(

                err.response?.data?.detail ||

                "Unable to delete driver."

            );

        }

    };

    const filteredDrivers = drivers.filter((driver) => {

        const matchesSearch =

            driver.name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())

            ||

            driver.license_number
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesStatus =

            statusFilter === "" ||

            driver.status === statusFilter;

        return matchesSearch && matchesStatus;

    });

    const totalPages = Math.ceil(

        filteredDrivers.length / rowsPerPage

    );

    const displayedDrivers = filteredDrivers.slice(

        (currentPage - 1) * rowsPerPage,

        currentPage * rowsPerPage

    );

    return (

        <div className="p-8">

            {/* Header */}

            <div className="flex flex-col lg:flex-row justify-between items-center mb-8">

                <div>

                    <h1 className="text-3xl font-bold flex items-center gap-3">

                        <User size={34} />

                        Driver Management

                    </h1>

                    <p className="text-gray-500 mt-2">

                        Manage all transport drivers.

                    </p>

                </div>

                <div className="flex gap-3 mt-5 lg:mt-0">

                    <button

                        onClick={handleRefresh}

                        className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg shadow hover:bg-gray-100"

                    >

                        <RefreshCcw size={18} />

                        Refresh

                    </button>

                    <button

                        onClick={() => {

                            setSelectedDriver(null);

                            setShowModal(true);

                        }}

                        className="flex items-center gap-2 bg-purple-700 text-white px-5 py-2 rounded-lg hover:bg-purple-800"

                    >

                        <Plus size={18} />

                        Add Driver

                    </button>

                </div>

            </div>

            {/* Search */}

            <div className="bg-white rounded-xl shadow p-5 mb-8">

                <div className="grid md:grid-cols-2 gap-4">

                    <div className="relative">

                        <Search

                            className="absolute left-3 top-3 text-gray-400"

                            size={18}

                        />

                        <input

                            placeholder="Search Driver..."

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

                            Off Duty

                        </option>

                        <option>

                            Suspended

                        </option>

                    </select>

                </div>

            </div>
            {/* Driver Table */}

            <div className="bg-white rounded-xl shadow overflow-hidden">

                {loading ? (

                    <div className="flex justify-center items-center py-16">

                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-700"></div>

                    </div>

                ) : error ? (

                    <div className="text-center py-12 text-red-600 font-semibold">

                        {error}

                    </div>

                ) : displayedDrivers.length === 0 ? (

                    <div className="text-center py-12 text-gray-500">

                        No drivers found.

                    </div>

                ) : (

                    <table className="min-w-full divide-y divide-gray-200">

                        <thead className="bg-gray-100">

                            <tr>

                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Driver
                                </th>

                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    License No.
                                </th>

                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Category
                                </th>

                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Expiry Date
                                </th>

                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Safety Score
                                </th>

                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Status
                                </th>

                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody className="divide-y divide-gray-100">

                            {displayedDrivers.map((driver) => {

                                const expiryDate = new Date(driver.license_expiry_date);

                                const isExpired = expiryDate < new Date();

                                return (

                                    <tr
                                        key={driver.id}
                                        className="hover:bg-gray-50 transition"
                                    >

                                        <td className="px-6 py-4">

                                            <div>

                                                <p className="font-semibold">

                                                    {driver.name}

                                                </p>

                                                <p className="text-sm text-gray-500">

                                                    {driver.contact_number}

                                                </p>

                                            </div>

                                        </td>

                                        <td className="px-6 py-4">

                                            {driver.license_number}

                                        </td>

                                        <td className="px-6 py-4">

                                            {driver.license_category}

                                        </td>

                                        <td className="px-6 py-4">

                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    isExpired
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-green-100 text-green-700"
                                                }`}
                                            >

                                                {driver.license_expiry_date}

                                            </span>

                                        </td>

                                        <td className="px-6 py-4">

                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                    driver.safety_score >= 90
                                                        ? "bg-green-100 text-green-700"
                                                        : driver.safety_score >= 70
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >

                                                {driver.safety_score}

                                            </span>

                                        </td>

                                        <td className="px-6 py-4">

                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                    driver.status === "Available"
                                                        ? "bg-green-100 text-green-700"
                                                        : driver.status === "On Trip"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : driver.status === "Off Duty"
                                                        ? "bg-gray-200 text-gray-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >

                                                {driver.status}

                                            </span>

                                        </td>

                                        <td className="px-6 py-4">

                                            <div className="flex justify-center gap-4">

                                                <button
                                                    onClick={() => {
                                                        setSelectedDriver(driver);
                                                        setShowModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >

                                                    <Pencil size={18} />

                                                </button>

                                                <button
                                                    onClick={() => handleDelete(driver)}
                                                    className="text-red-600 hover:text-red-800"
                                                >

                                                    <Trash2 size={18} />

                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                );

                            })}

                        </tbody>

                    </table>

                )}

            </div>

            {/* Pagination */}

            {!loading && totalPages > 1 && (

                <div className="flex justify-center items-center mt-8 gap-2">

                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="px-4 py-2 border rounded-lg disabled:opacity-40"
                    >

                        Previous

                    </button>

                    {Array.from({ length: totalPages }, (_, index) => (

                        <button
                            key={index}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`px-4 py-2 rounded-lg ${
                                currentPage === index + 1
                                    ? "bg-purple-700 text-white"
                                    : "border"
                            }`}
                        >

                            {index + 1}

                        </button>

                    ))}

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="px-4 py-2 border rounded-lg disabled:opacity-40"
                    >

                        Next

                    </button>

                </div>

            )}

            {/* Add/Edit Driver Modal */}

            {showModal && (

                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-8">

                        <h2 className="text-2xl font-bold mb-6">

                            {selectedDriver ? "Edit Driver" : "Add Driver"}

                        </h2>

                        <DriverForm

                            driver={selectedDriver}

                            onClose={() => {

                                setShowModal(false);

                                setSelectedDriver(null);

                                loadDrivers();

                            }}

                        />

                    </div>

                </div>

            )}

            {/* Delete Confirmation Dialog */}

{showDeleteDialog && (

    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8">

            <h2 className="text-2xl font-bold text-red-600">

                Delete Driver

            </h2>

            <p className="mt-4 text-gray-600">

                Are you sure you want to delete

                <span className="font-semibold">

                    {" "}

                    {selectedDriver?.name}

                </span>

                ?

            </p>

            <div className="flex justify-end gap-4 mt-8">

                <button

                    onClick={() => {

                        setShowDeleteDialog(false);

                        setSelectedDriver(null);

                    }}

                    className="border rounded-lg px-6 py-2"

                >

                    Cancel

                </button>

                <button

                    onClick={confirmDelete}

                    className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-6 py-2"

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

const DriverForm = ({ driver, onClose }) => {

    const isEdit = driver !== null;

    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({

        name: driver?.name || "",

        license_number: driver?.license_number || "",

        license_category: driver?.license_category || "LMV",

        license_expiry_date:
            driver?.license_expiry_date || "",

        contact_number:
            driver?.contact_number || "",

        safety_score:
            driver?.safety_score || 100,

        status:
            driver?.status || "Available",

    });

    const handleChange = (e) => {

        setForm({

            ...form,

            [e.target.name]: e.target.value,

        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setSaving(true);

        try {

            if (isEdit) {

                await updateDriver(driver.id, form);

            } else {

                await createDriver(form);

            }

            onClose();

        }

        catch (err) {

            alert(

                err.response?.data?.detail ||

                "Unable to save driver."

            );

        }

        setSaving(false);

    };

    return (

        <form
            onSubmit={handleSubmit}
            className="space-y-5"
        >

            <div className="grid md:grid-cols-2 gap-5">

                <div>

                    <label>Name</label>

                    <input

                        className="w-full border rounded-lg p-3 mt-2"

                        name="name"

                        value={form.name}

                        onChange={handleChange}

                        required

                    />

                </div>

                <div>

                    <label>Contact Number</label>

                    <input

                        className="w-full border rounded-lg p-3 mt-2"

                        name="contact_number"

                        value={form.contact_number}

                        onChange={handleChange}

                        required

                    />

                </div>

                <div>

                    <label>License Number</label>

                    <input

                        className="w-full border rounded-lg p-3 mt-2"

                        name="license_number"

                        value={form.license_number}

                        onChange={handleChange}

                        required

                    />

                </div>

                <div>

                    <label>License Category</label>

                    <select

                        className="w-full border rounded-lg p-3 mt-2"

                        name="license_category"

                        value={form.license_category}

                        onChange={handleChange}

                    >

                        <option>LMV</option>

                        <option>HMV</option>

                        <option>Transport</option>

                        <option>Heavy Goods</option>

                    </select>

                </div>

                <div>

                    <label>License Expiry Date</label>

                    <input

                        type="date"

                        className="w-full border rounded-lg p-3 mt-2"

                        name="license_expiry_date"

                        value={form.license_expiry_date}

                        onChange={handleChange}

                        required

                    />

                </div>

                <div>

                    <label>Safety Score</label>

                    <input

                        type="number"

                        min="0"

                        max="100"

                        className="w-full border rounded-lg p-3 mt-2"

                        name="safety_score"

                        value={form.safety_score}

                        onChange={handleChange}

                    />

                </div>

                <div>

                    <label>Status</label>

                    <select

                        className="w-full border rounded-lg p-3 mt-2"

                        name="status"

                        value={form.status}

                        onChange={handleChange}

                    >

                        <option>Available</option>

                        <option>On Trip</option>

                        <option>Off Duty</option>

                        <option>Suspended</option>

                    </select>

                </div>

            </div>

            <div className="flex justify-end gap-3 pt-6">

                <button

                    type="button"

                    onClick={onClose}

                    className="border px-6 py-3 rounded-lg"

                >

                    Cancel

                </button>

                <button

                    disabled={saving}

                    className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-lg"

                >

                    {saving

                        ? "Saving..."

                        : isEdit

                        ? "Update Driver"

                        : "Create Driver"}

                </button>

            </div>

        </form>

    );

};

export default DriverManagementPage;