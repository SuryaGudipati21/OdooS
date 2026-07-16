import { useEffect, useMemo, useState } from "react";

import {
    Truck,
    Plus,
    Search,
    RefreshCcw,
    Play,
    CheckCircle,
    XCircle,
} from "lucide-react";

import {
    getTrips,
    createTrip,
    dispatchTrip,
    completeTrip,
    cancelTrip,
} from "../api/tripApi";

import { getAvailableVehicles, getVehicles } from "../api/vehicleApi";
import { getAvailableDrivers, getDrivers } from "../api/driverApi";

const TripManagementPage = () => {

    const [trips, setTrips] = useState([]);

    const [vehicles, setVehicles] = useState([]);

    const [drivers, setDrivers] = useState([]);

    const [allVehicles, setAllVehicles] = useState([]);

    const [allDrivers, setAllDrivers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");

    const [statusFilter, setStatusFilter] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [selectedTrip, setSelectedTrip] = useState(null);

    const [showCompleteModal, setShowCompleteModal] = useState(false);

    const loadData = async () => {

        try {

            setLoading(true);

            const [

                tripRes,

                vehicleRes,

                driverRes,

                allVehicleRes,

                allDriverRes,

            ] = await Promise.all([

                getTrips(),

                getAvailableVehicles(),

                getAvailableDrivers(),

                getVehicles(),

                getDrivers(),

            ]);

            setTrips(tripRes.data);

            setVehicles(vehicleRes.data);

            setDrivers(driverRes.data);

            setAllVehicles(allVehicleRes.data);

            setAllDrivers(allDriverRes.data);

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

    const getVehicleLabel = (vehicleId) => {
        const vehicle = allVehicles.find((v) => v.id === vehicleId);
        return vehicle?.registration_number || "-";
    };

    const getDriverLabel = (driverId) => {
        const driver = allDrivers.find((d) => d.id === driverId);
        return driver?.name || "-";
    };

    const filteredTrips = useMemo(() => {

        return trips.filter((trip) => {

            const matchesSearch =

                trip.source
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())

                ||

                trip.destination
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesStatus =

                statusFilter === ""

                ||

                trip.status === statusFilter;

            return matchesSearch && matchesStatus;

        });

    }, [trips, searchTerm, statusFilter]);

    return (

        <div className="p-8">

            <div className="flex justify-between items-center mb-8">

                <div>

                    <h1 className="text-3xl font-bold flex items-center gap-3">

                        <Truck />

                        Trip Management

                    </h1>

                    <p className="text-gray-500 mt-2">

                        Manage transport trips.

                    </p>

                </div>

                <div className="flex gap-3">

                    <button

                        onClick={loadData}

                        className="border rounded-lg px-5 py-2 flex gap-2 items-center"

                    >

                        <RefreshCcw size={18} />

                        Refresh

                    </button>

                    <button

                        onClick={() => {

                            setSelectedTrip(null);

                            setShowModal(true);

                        }}

                        className="bg-purple-700 text-white rounded-lg px-5 py-2 flex gap-2 items-center"

                    >

                        <Plus size={18} />

                        Create Trip

                    </button>

                </div>

            </div>

            <div className="bg-white rounded-xl shadow p-5 mb-6">

                <div className="grid md:grid-cols-2 gap-4">

                    <div className="relative">

                        <Search

                            size={18}

                            className="absolute left-3 top-4 text-gray-400"

                        />

                        <input

                            placeholder="Search Source / Destination"

                            className="w-full border rounded-lg p-3 pl-10"

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

                            Draft

                        </option>

                        <option>

                            Dispatched

                        </option>

                        <option>

                            Completed

                        </option>

                        <option>

                            Cancelled

                        </option>

                    </select>

                </div>

            </div>
            {/* Trip Table */}

            <div className="bg-white rounded-xl shadow overflow-hidden">

                {loading ? (

                    <div className="flex justify-center items-center py-20">

                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-700"></div>

                    </div>

                ) : filteredTrips.length === 0 ? (

                    <div className="text-center py-16 text-gray-500">

                        No trips available.

                    </div>

                ) : (

                    <table className="min-w-full divide-y divide-gray-200">

                        <thead className="bg-gray-100">

                            <tr>

                                <th className="px-6 py-4 text-left">

                                    Source

                                </th>

                                <th className="px-6 py-4 text-left">

                                    Destination

                                </th>

                                <th className="px-6 py-4 text-left">

                                    Vehicle

                                </th>

                                <th className="px-6 py-4 text-left">

                                    Driver

                                </th>

                                <th className="px-6 py-4 text-left">

                                    Cargo

                                </th>

                                <th className="px-6 py-4 text-left">

                                    Distance

                                </th>

                                <th className="px-6 py-4 text-left">

                                    Status

                                </th>

                                <th className="px-6 py-4 text-center">

                                    Actions

                                </th>

                            </tr>

                        </thead>

                        <tbody className="divide-y divide-gray-100">

                            {filteredTrips.map((trip) => (

                                <tr
                                    key={trip.id}
                                    className="hover:bg-gray-50 transition"
                                >

                                    <td className="px-6 py-4">

                                        {trip.source}

                                    </td>

                                    <td className="px-6 py-4">

                                        {trip.destination}

                                    </td>

                                    <td className="px-6 py-4">

                                        {getVehicleLabel(trip.vehicle_id)}

                                    </td>

                                    <td className="px-6 py-4">

                                        {getDriverLabel(trip.driver_id)}

                                    </td>

                                    <td className="px-6 py-4">

                                        {trip.cargo_weight} kg

                                    </td>

                                    <td className="px-6 py-4">

                                        {trip.planned_distance} km

                                    </td>

                                    <td className="px-6 py-4">

                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-semibold

                                            ${
                                                trip.status === "Draft"

                                                    ? "bg-yellow-100 text-yellow-700"

                                                : trip.status === "Dispatched"

                                                    ? "bg-blue-100 text-blue-700"

                                                : trip.status === "Completed"

                                                    ? "bg-green-100 text-green-700"

                                                : "bg-red-100 text-red-700"

                                            }`}
                                        >

                                            {trip.status}

                                        </span>

                                    </td>

                                    <td className="px-6 py-4">

                                        <div className="flex justify-center gap-2">

                                            {trip.status === "Draft" && (

                                                <button

                                                    onClick={async () => {

                                                        await dispatchTrip(trip.id);

                                                        loadData();

                                                    }}

                                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2"

                                                >

                                                    <Play size={16}/>

                                                </button>

                                            )}

                                            {trip.status === "Dispatched" && (

                                                <button

                                                    onClick={() => {

                                                        setSelectedTrip(trip);
                                                        setShowCompleteModal(true);

                                                    }}

                                                    className="bg-green-600 hover:bg-green-700 text-white rounded p-2"

                                                >

                                                    <CheckCircle size={16}/>

                                                </button>

                                            )}

                                            {trip.status === "Draft" ||

                                            trip.status === "Dispatched" ? (

                                                <button

                                                    onClick={async () => {

                                                        await cancelTrip(trip.id);

                                                        loadData();

                                                    }}

                                                    className="bg-red-600 hover:bg-red-700 text-white rounded p-2"

                                                >

                                                    <XCircle size={16}/>

                                                </button>

                                            ) : null}

                                        </div>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                )}

            </div>

            {/* Trip Modal */}

            {showModal && (

                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-8">

                        <h2 className="text-2xl font-bold mb-6">

                            Create Trip

                        </h2>

                        <TripForm
                            vehicles={vehicles}
                            drivers={drivers}
                            loadData={loadData}
                            onClose={() => {

                                setShowModal(false);

                                loadData();

                            }}
                        />

                    </div>

                </div>

            )}

            {/* Complete Trip Modal */}

            {showCompleteModal && selectedTrip && (

                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8">

                        <h2 className="text-2xl font-bold mb-6">
                            Complete Trip
                        </h2>

                        <CompleteTripForm
                            trip={selectedTrip}
                            onClose={() => {
                                setShowCompleteModal(false);
                                setSelectedTrip(null);
                                loadData();
                            }}
                        />

                    </div>

                </div>

            )}
                </div>

            );

        };

        const CompleteTripForm = ({ trip, onClose }) => {

            const [saving, setSaving] = useState(false);

            const [error, setError] = useState("");

            const [form, setForm] = useState({
                final_odometer: "",
                fuel_consumed: "",
            });

            const handleChange = (e) => {
                setForm({
                    ...form,
                    [e.target.name]: e.target.value,
                });
            };

            const handleSubmit = async (e) => {

                e.preventDefault();

                setError("");

                if (!form.final_odometer || !form.fuel_consumed) {
                    setError("Please fill in both fields.");
                    return;
                }

                try {

                    setSaving(true);

                    await completeTrip(trip.id, {
                        final_odometer: Number(form.final_odometer),
                        fuel_consumed: Number(form.fuel_consumed),
                    });

                    onClose();

                } catch (err) {

                    setError(
                        err.response?.data?.detail ||
                        "Unable to complete trip."
                    );

                } finally {

                    setSaving(false);

                }

            };

            return (

                <form onSubmit={handleSubmit} className="space-y-5">

                    {error && (
                        <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-3">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="font-medium">Final Odometer (km)</label>
                        <input
                            type="number"
                            className="w-full border rounded-lg p-3 mt-2"
                            name="final_odometer"
                            value={form.final_odometer}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="font-medium">Fuel Consumed (L)</label>
                        <input
                            type="number"
                            className="w-full border rounded-lg p-3 mt-2"
                            name="fuel_consumed"
                            value={form.fuel_consumed}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">

                        <button
                            type="button"
                            onClick={onClose}
                            className="border rounded-lg px-6 py-3"
                        >
                            Cancel
                        </button>

                        <button
                            disabled={saving}
                            className="bg-purple-700 hover:bg-purple-800 text-white rounded-lg px-6 py-3"
                        >
                            {saving ? "Completing..." : "Complete Trip"}
                        </button>

                    </div>

                </form>

            );

        };

        const TripForm = ({ vehicles, drivers, loadData, onClose }) => {

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [form, setForm] = useState({

        source: "",

        destination: "",

        vehicle_id: "",

        driver_id: "",

        cargo_weight: "",

        planned_distance: "",

    });

    const handleChange = (e) => {

        setForm({

            ...form,

            [e.target.name]: e.target.value,

        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        const vehicle = vehicles.find(

            (v) => String(v.id) === String(form.vehicle_id)

        );

        if (!vehicle) {

            setError("Please select a vehicle.");

            return;

        }

        if (

            Number(form.cargo_weight) >

            Number(vehicle.max_load_capacity)

        ) {

            setError(

                `Cargo exceeds vehicle capacity (${vehicle.max_load_capacity} kg).`

            );

            return;

        }

        try {

            setSaving(true);

            await createTrip({

                source: form.source,

                destination: form.destination,

                vehicle_id: Number(form.vehicle_id),

                driver_id: Number(form.driver_id),

                cargo_weight: Number(form.cargo_weight),

                planned_distance: Number(form.planned_distance),

            });

            loadData();

            onClose();

        }

        catch (err) {

            setError(

                err.response?.data?.detail ||

                "Unable to create trip."

            );

        }

        finally {

            setSaving(false);

        }

    };

    return (

        <form
            onSubmit={handleSubmit}
            className="space-y-5"
        >

            {error && (

                <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-3">

                    {error}

                </div>

            )}

            <div className="grid md:grid-cols-2 gap-5">

                <div>

                    <label className="font-medium">

                        Source

                    </label>

                    <input

                        className="w-full border rounded-lg p-3 mt-2"

                        name="source"

                        value={form.source}

                        onChange={handleChange}

                        required

                    />

                </div>

                <div>

                    <label className="font-medium">

                        Destination

                    </label>

                    <input

                        className="w-full border rounded-lg p-3 mt-2"

                        name="destination"

                        value={form.destination}

                        onChange={handleChange}

                        required

                    />

                </div>

                <div>

                    <label className="font-medium">

                        Vehicle

                    </label>

                    <select

                        className="w-full border rounded-lg p-3 mt-2"

                        name="vehicle_id"

                        value={form.vehicle_id}

                        onChange={handleChange}

                        required

                    >

                        <option value="">

                            Select Vehicle

                        </option>

                        {vehicles.map((vehicle) => (

                            <option
                                key={vehicle.id}
                                value={vehicle.id}
                            >

                                {vehicle.registration_number}

                            </option>

                        ))}

                    </select>

                </div>

                <div>

                    <label className="font-medium">

                        Driver

                    </label>

                    <select

                        className="w-full border rounded-lg p-3 mt-2"

                        name="driver_id"

                        value={form.driver_id}

                        onChange={handleChange}

                        required

                    >

                        <option value="">

                            Select Driver

                        </option>

                        {drivers.map((driver) => (

                            <option
                                key={driver.id}
                                value={driver.id}
                            >

                                {driver.name}

                            </option>

                        ))}

                    </select>

                </div>

                <div>

                    <label className="font-medium">

                        Cargo Weight (kg)

                    </label>

                    <input

                        type="number"

                        className="w-full border rounded-lg p-3 mt-2"

                        name="cargo_weight"

                        value={form.cargo_weight}

                        onChange={handleChange}

                        required

                    />

                </div>

                <div>

                    <label className="font-medium">

                        Planned Distance (km)

                    </label>

                    <input

                        type="number"

                        className="w-full border rounded-lg p-3 mt-2"

                        name="planned_distance"

                        value={form.planned_distance}

                        onChange={handleChange}

                        required

                    />

                </div>

            </div>

            <div className="flex justify-end gap-3 pt-6">

                <button

                    type="button"

                    onClick={onClose}

                    className="border rounded-lg px-6 py-3"

                >

                    Cancel

                </button>

                <button

                    disabled={saving}

                    className="bg-purple-700 hover:bg-purple-800 text-white rounded-lg px-6 py-3"

                >

                    {saving ? "Creating..." : "Create Trip"}

                </button>

            </div>

        </form>

    );

};

export default TripManagementPage;