// frontend/src/api/vehicleApi.js

import axiosClient from "./axiosClient";

/**
 * Get all vehicles
 */
export const getVehicles = async (params = {}) => {
    return await axiosClient.get("/vehicles", {
        params,
    });
};

/**
 * Get vehicle by ID
 */
export const getVehicleById = async (id) => {
    return await axiosClient.get(`/vehicles/${id}`);
};

/**
 * Create vehicle
 */
export const createVehicle = async (vehicleData) => {
    return await axiosClient.post(
        "/vehicles",
        vehicleData
    );
};

/**
 * Update vehicle
 */
export const updateVehicle = async (
    id,
    vehicleData
) => {
    return await axiosClient.put(
        `/vehicles/${id}`,
        vehicleData
    );
};

/**
 * Delete vehicle
 */
export const deleteVehicle = async (id) => {
    return await axiosClient.delete(
        `/vehicles/${id}`
    );
};

/**
 * Search vehicles
 */
export const searchVehicles = async (keyword) => {
    return await axiosClient.get(
        "/vehicles/search",
        {
            params: {
                q: keyword,
            },
        }
    );
};

/**
 * Filter vehicles by status
 */
export const filterByStatus = async (status) => {
    return await axiosClient.get(
        "/vehicles",
        {
            params: {
                status,
            },
        }
    );
};

/**
 * Filter vehicles by type
 */
export const filterByType = async (type) => {
    return await axiosClient.get(
        "/vehicles",
        {
            params: {
                type,
            },
        }
    );
};

/**
 * Get available vehicles
 * (Used while creating Trips)
 */
export const getAvailableVehicles =
    async () => {
        return await axiosClient.get(
            "/vehicles/available"
        );
    };