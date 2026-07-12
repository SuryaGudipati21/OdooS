// frontend/src/api/tripApi.js

import axiosClient from "./axiosClient";

/**
 * Get all trips
 */
export const getTrips = async (params = {}) => {
    return await axiosClient.get("/trips", {
        params,
    });
};

/**
 * Get trip by ID
 */
export const getTripById = async (id) => {
    return await axiosClient.get(`/trips/${id}`);
};

/**
 * Create Trip
 */
export const createTrip = async (tripData) => {
    return await axiosClient.post(
        "/trips",
        tripData
    );
};

/**
 * Update Trip
 */
export const updateTrip = async (
    id,
    tripData
) => {
    return await axiosClient.put(
        `/trips/${id}`,
        tripData
    );
};

/**
 * Delete Trip
 */
export const deleteTrip = async (id) => {
    return await axiosClient.delete(
        `/trips/${id}`
    );
};

/**
 * Dispatch Trip
 */
export const dispatchTrip = async (id) => {
    return await axiosClient.patch(
        `/trips/${id}/dispatch`
    );
};

/**
 * Complete Trip
 */
export const completeTrip = async (
    id,
    completionData
) => {
    return await axiosClient.patch(
        `/trips/${id}/complete`,
        completionData
    );
};

/**
 * Cancel Trip
 */
export const cancelTrip = async (
    id,
    reason = ""
) => {
    return await axiosClient.patch(
        `/trips/${id}/cancel`,
        { reason }
    );
};

/**
 * Get Active Trips
 */
export const getActiveTrips = async () => {
    return await axiosClient.get(
        "/trips/active"
    );
};

/**
 * Get Pending Trips
 */
export const getPendingTrips = async () => {
    return await axiosClient.get(
        "/trips/pending"
    );
};

/**
 * Trip History
 */
export const getTripHistory = async () => {
    return await axiosClient.get(
        "/trips/history"
    );
};

/**
 * Search Trips
 */
export const searchTrips = async (keyword) => {
    return await axiosClient.get(
        "/trips/search",
        {
            params: {
                q: keyword,
            },
        }
    );
};

/**
 * Dashboard Trip Statistics
 */
export const getTripStatistics = async () => {
    return await axiosClient.get(
        "/trips/statistics"
    );
};