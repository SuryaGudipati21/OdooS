// Owner: Dev C
import { useEffect, useState } from "react";

import {
    Fuel,
    Plus,
    RefreshCcw,
    Trash2,
    Receipt,
} from "lucide-react";

import {
    getFuelLogs,
    createFuelLog,
    deleteFuelLog,
    getExpenses,
    createExpense,
    deleteExpense,
} from "../api/fuelExpenseApi";

import { getVehicles } from "../api/vehicleApi";

const FuelExpensePage = () => {

    const [activeTab, setActiveTab] = useState("fuel");

    const [fuelLogs, setFuelLogs] = useState([]);

    const [expenses, setExpenses] = useState([]);

    const [vehicles, setVehicles] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);

    const loadData = async () => {

        try {

            setLoading(true);

            const [fuelRes, expenseRes, vehicleRes] = await Promise.all([
                getFuelLogs(),
                getExpenses(),
                getVehicles(),
            ]);

            setFuelLogs(fuelRes.data);

            setExpenses(expenseRes.data);

            setVehicles(vehicleRes.data);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadData();

    }, []);

    const vehicleLabel = (vehicleId) => {
        const match = vehicles.find((v) => v.id === vehicleId);
        return match?.registration_number || `Vehicle #${vehicleId}`;
    };

    const handleDeleteFuelLog = async (id) => {
        if (!confirm("Delete this fuel log?")) return;
        try {
            await deleteFuelLog(id);
            loadData();
        } catch (err) {
            alert(err.response?.data?.detail || "Unable to delete fuel log.");
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!confirm("Delete this expense?")) return;
        try {
            await deleteExpense(id);
            loadData();
        } catch (err) {
            alert(err.response?.data?.detail || "Unable to delete expense.");
        }
    };

    const totalFuelCost = fuelLogs.reduce((sum, log) => sum + Number(log.cost || 0), 0);

    const totalExpenseCost = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

    return (

        <div className="p-8">

            <div className="flex flex-col lg:flex-row justify-between items-center mb-8">

                <div>

                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Fuel size={34} />
                        Fuel & Expenses
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Track fuel usage and vehicle-related expenses.
                    </p>

                </div>

                <div className="flex gap-3 mt-5 lg:mt-0">

                    <button
                        onClick={loadData}
                        className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg shadow hover:bg-gray-100"
                    >
                        <RefreshCcw size={18} />
                        Refresh
                    </button>

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-purple-700 text-white px-5 py-2 rounded-lg hover:bg-purple-800"
                    >
                        <Plus size={18} />
                        {activeTab === "fuel" ? "Add Fuel Log" : "Add Expense"}
                    </button>

                </div>

            </div>

            <div className="grid md:grid-cols-2 gap-5 mb-8">

                <div className="bg-white rounded-xl shadow p-5">
                    <p className="text-sm text-gray-500">Total Fuel Cost</p>
                    <p className="text-3xl font-bold mt-1">₹{totalFuelCost.toFixed(2)}</p>
                </div>

                <div className="bg-white rounded-xl shadow p-5">
                    <p className="text-sm text-gray-500">Total Expenses</p>
                    <p className="text-3xl font-bold mt-1">₹{totalExpenseCost.toFixed(2)}</p>
                </div>

            </div>

            <div className="flex gap-2 mb-6">

                <button
                    onClick={() => setActiveTab("fuel")}
                    className={`px-5 py-2 rounded-lg font-medium flex items-center gap-2 ${
                        activeTab === "fuel"
                            ? "bg-purple-700 text-white"
                            : "bg-white border"
                    }`}
                >
                    <Fuel size={16} />
                    Fuel Logs
                </button>

                <button
                    onClick={() => setActiveTab("expenses")}
                    className={`px-5 py-2 rounded-lg font-medium flex items-center gap-2 ${
                        activeTab === "expenses"
                            ? "bg-purple-700 text-white"
                            : "bg-white border"
                    }`}
                >
                    <Receipt size={16} />
                    Expenses
                </button>

            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">

                {loading ? (

                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-700"></div>
                    </div>

                ) : activeTab === "fuel" ? (

                    fuelLogs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No fuel logs yet.</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Vehicle</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Liters</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Cost</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {fuelLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium">{vehicleLabel(log.vehicle_id)}</td>
                                        <td className="px-6 py-4">{log.date}</td>
                                        <td className="px-6 py-4">{log.liters} L</td>
                                        <td className="px-6 py-4">₹{log.cost}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => handleDeleteFuelLog(log.id)}
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
                    )

                ) : (

                    expenses.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No expenses yet.</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Vehicle</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {expenses.map((exp) => (
                                    <tr key={exp.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium">{vehicleLabel(exp.vehicle_id)}</td>
                                        <td className="px-6 py-4 capitalize">{exp.category}</td>
                                        <td className="px-6 py-4">{exp.date}</td>
                                        <td className="px-6 py-4">₹{exp.amount}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => handleDeleteExpense(exp.id)}
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
                    )

                )}

            </div>

            {/* Add Fuel/Expense Modal */}

            {showModal && (

                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-8">

                        <h2 className="text-2xl font-bold mb-6">
                            {activeTab === "fuel" ? "Add Fuel Log" : "Add Expense"}
                        </h2>

                        {activeTab === "fuel" ? (
                            <FuelLogForm
                                vehicles={vehicles}
                                onClose={() => {
                                    setShowModal(false);
                                    loadData();
                                }}
                            />
                        ) : (
                            <ExpenseForm
                                vehicles={vehicles}
                                onClose={() => {
                                    setShowModal(false);
                                    loadData();
                                }}
                            />
                        )}

                    </div>

                </div>

            )}

        </div>

    );

};

const FuelLogForm = ({ vehicles, onClose }) => {

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [form, setForm] = useState({
        vehicle_id: "",
        liters: "",
        cost: "",
        date: new Date().toISOString().slice(0, 10),
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        if (!form.vehicle_id || !form.liters || !form.cost || !form.date) {
            setError("Please fill all fields.");
            return;
        }

        try {

            setSaving(true);

            await createFuelLog({
                vehicle_id: Number(form.vehicle_id),
                liters: Number(form.liters),
                cost: Number(form.cost),
                date: form.date,
            });

            onClose();

        } catch (err) {

            setError(err.response?.data?.detail || "Unable to save fuel log.");

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
                <label className="font-medium">Vehicle</label>
                <select
                    className="w-full border rounded-lg p-3 mt-2"
                    name="vehicle_id"
                    value={form.vehicle_id}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Vehicle</option>
                    {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.registration_number}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid md:grid-cols-2 gap-5">

                <div>
                    <label className="font-medium">Liters</label>
                    <input
                        type="number"
                        className="w-full border rounded-lg p-3 mt-2"
                        name="liters"
                        value={form.liters}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label className="font-medium">Cost</label>
                    <input
                        type="number"
                        className="w-full border rounded-lg p-3 mt-2"
                        name="cost"
                        value={form.cost}
                        onChange={handleChange}
                        required
                    />
                </div>

            </div>

            <div>
                <label className="font-medium">Date</label>
                <input
                    type="date"
                    className="w-full border rounded-lg p-3 mt-2"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">

                <button type="button" onClick={onClose} className="border rounded-lg px-6 py-3">
                    Cancel
                </button>

                <button disabled={saving} className="bg-purple-700 hover:bg-purple-800 text-white rounded-lg px-6 py-3">
                    {saving ? "Saving..." : "Add Fuel Log"}
                </button>

            </div>

        </form>

    );

};

const ExpenseForm = ({ vehicles, onClose }) => {

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [form, setForm] = useState({
        vehicle_id: "",
        category: "toll",
        amount: "",
        date: new Date().toISOString().slice(0, 10),
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        if (!form.vehicle_id || !form.amount || !form.date) {
            setError("Please fill all fields.");
            return;
        }

        try {

            setSaving(true);

            await createExpense({
                vehicle_id: Number(form.vehicle_id),
                category: form.category,
                amount: Number(form.amount),
                date: form.date,
            });

            onClose();

        } catch (err) {

            setError(err.response?.data?.detail || "Unable to save expense.");

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
                <label className="font-medium">Vehicle</label>
                <select
                    className="w-full border rounded-lg p-3 mt-2"
                    name="vehicle_id"
                    value={form.vehicle_id}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Vehicle</option>
                    {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.registration_number}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid md:grid-cols-2 gap-5">

                <div>
                    <label className="font-medium">Category</label>
                    <select
                        className="w-full border rounded-lg p-3 mt-2"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                    >
                        <option value="toll">Toll</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="parking">Parking</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="font-medium">Amount</label>
                    <input
                        type="number"
                        className="w-full border rounded-lg p-3 mt-2"
                        name="amount"
                        value={form.amount}
                        onChange={handleChange}
                        required
                    />
                </div>

            </div>

            <div>
                <label className="font-medium">Date</label>
                <input
                    type="date"
                    className="w-full border rounded-lg p-3 mt-2"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">

                <button type="button" onClick={onClose} className="border rounded-lg px-6 py-3">
                    Cancel
                </button>

                <button disabled={saving} className="bg-purple-700 hover:bg-purple-800 text-white rounded-lg px-6 py-3">
                    {saving ? "Saving..." : "Add Expense"}
                </button>

            </div>

        </form>

    );

};

export default FuelExpensePage;
