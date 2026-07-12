// frontend/src/api/maintenanceApi.js

import axiosClient from "./axiosClient";

/**
 * Get all maintenance records
 */
export const getMaintenanceRecords = async (params = {}) => {
    return await axiosClient.get("/maintenance", {
        params,
    });
};

/**
 * Get maintenance by ID
 */
export const getMaintenanceById = async (id) => {
    return await axiosClient.get(`/maintenance/${id}`);
};

/**
 * Create maintenance record
 */
export const createMaintenance = async (maintenanceData) => {
    return await axiosClient.post(
        "/maintenance",
        maintenanceData
    );
};

/**
 * Update maintenance record
 */
export const updateMaintenance = async (
    id,
    maintenanceData
) => {
    return await axiosClient.put(
        `/maintenance/${id}`,
        maintenanceData
    );
};

/**
 * Close maintenance
 */
export const closeMaintenance = async (
    id,
    completionData = {}
) => {
    return await axiosClient.patch(
        `/maintenance/${id}/close`,
        completionData
    );
};

/**
 * Delete maintenance record
 */
export const deleteMaintenance = async (id) => {
    return await axiosClient.delete(
        `/maintenance/${id}`
    );
};

/**
 * Search maintenance records
 */
export const searchMaintenance = async (keyword) => {
    return await axiosClient.get(
        "/maintenance/search",
        {
            params: {
                q: keyword,
            },
        }
    );
};

/**
 * Filter maintenance by status
 */
export const filterMaintenanceByStatus = async (
    status
) => {
    return await axiosClient.get(
        "/maintenance",
        {
            params: {
                status,
            },
        }
    );
};

/**
 * Vehicle maintenance history
 */
export const getVehicleMaintenanceHistory = async (
    vehicleId
) => {
    return await axiosClient.get(
        `/maintenance/vehicle/${vehicleId}`
    );
};

/**
 * Active maintenance
 */
export const getActiveMaintenance = async () => {
    return await axiosClient.get(
        "/maintenance/active"
    );
};

/**
 * Completed maintenance
 */
export const getCompletedMaintenance = async () => {
    return await axiosClient.get(
        "/maintenance/completed"
    );
};

/**
 * Upcoming maintenance
 */
export const getUpcomingMaintenance = async () => {
    return await axiosClient.get(
        "/maintenance/upcoming"
    );
};