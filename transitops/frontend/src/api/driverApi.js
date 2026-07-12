// frontend/src/api/driverApi.js

import axiosClient from "./axiosClient";

/**
 * Get all drivers
 */
export const getDrivers = async (params = {}) => {
    return await axiosClient.get("/drivers", {
        params,
    });
};

/**
 * Get driver by ID
 */
export const getDriverById = async (id) => {
    return await axiosClient.get(`/drivers/${id}`);
};

/**
 * Create driver
 */
export const createDriver = async (driverData) => {
    return await axiosClient.post(
        "/drivers",
        driverData
    );
};

/**
 * Update driver
 */
export const updateDriver = async (
    id,
    driverData
) => {
    return await axiosClient.put(
        `/drivers/${id}`,
        driverData
    );
};

/**
 * Delete driver
 */
export const deleteDriver = async (id) => {
    return await axiosClient.delete(
        `/drivers/${id}`
    );
};

/**
 * Search drivers
 */
export const searchDrivers = async (keyword) => {
    return await axiosClient.get(
        "/drivers/search",
        {
            params: {
                q: keyword,
            },
        }
    );
};

/**
 * Filter drivers by status
 */
export const filterDriversByStatus = async (status) => {
    return await axiosClient.get("/drivers", {
        params: {
            status,
        },
    });
};

/**
 * Get available drivers
 * (Used in Trip Assignment)
 */
export const getAvailableDrivers = async () => {
    return await axiosClient.get(
        "/drivers/available"
    );
};

/**
 * Get drivers with expiring licenses
 */
export const getExpiringLicenses = async (
    days = 30
) => {
    return await axiosClient.get(
        "/drivers/license-expiry",
        {
            params: {
                days,
            },
        }
    );
};

/**
 * Suspend driver
 */
export const suspendDriver = async (id) => {
    return await axiosClient.patch(
        `/drivers/${id}/suspend`
    );
};

/**
 * Activate driver
 */
export const activateDriver = async (id) => {
    return await axiosClient.patch(
        `/drivers/${id}/activate`
    );
};