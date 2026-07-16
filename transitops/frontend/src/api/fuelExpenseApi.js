// frontend/src/api/fuelExpenseApi.js
// Owner: Dev C (not listed in the original folder tree, but required by FuelExpensePage.jsx)

import axiosClient from "./axiosClient";

/**
 * Fuel Logs
 */
export const getFuelLogs = async (params = {}) => {
    return await axiosClient.get("/fuel-expenses/fuel", {
        params,
    });
};

export const createFuelLog = async (fuelData) => {
    return await axiosClient.post(
        "/fuel-expenses/fuel",
        fuelData
    );
};

export const deleteFuelLog = async (id) => {
    return await axiosClient.delete(
        `/fuel-expenses/fuel/${id}`
    );
};

/**
 * Expenses
 */
export const getExpenses = async (params = {}) => {
    return await axiosClient.get("/fuel-expenses/expenses", {
        params,
    });
};

export const createExpense = async (expenseData) => {
    return await axiosClient.post(
        "/fuel-expenses/expenses",
        expenseData
    );
};

export const deleteExpense = async (id) => {
    return await axiosClient.delete(
        `/fuel-expenses/expenses/${id}`
    );
};

/**
 * Per-vehicle cost rollup (fuel + expenses)
 */
export const getVehicleCostSummary = async (vehicleId) => {
    return await axiosClient.get(
        `/fuel-expenses/vehicle/${vehicleId}/summary`
    );
};
