// frontend/src/api/authApi.js

import axiosClient from "./axiosClient";
import api from"./axiosClient";
/**
 * Login User
 * POST /auth/login
 */
export const loginUser = async (credentials) => {
    return await axiosClient.post("/auth/login", credentials);
};

/**
 * Register User
 * POST /auth/signup
 */
export const signupUser = async (userData) => {
    return await axiosClient.post("/auth/signup", userData);
};

/**
 * Get Current Logged-in User
 * GET /auth/me
 */
export const getCurrentUser = async () => {
    return await axiosClient.get("/auth/me");
};

/**
 * Logout
 * (Backend logout is optional with JWT)
 */
export const logoutUser = async () => {
    return await axiosClient.post("/auth/logout");
};

/**
 * Refresh JWT Token (Optional)
 */
export const refreshToken = async () => {
    return await axiosClient.post("/auth/refresh");
};

/**
 * Change Password (Optional)
 */
export const changePassword = async (passwordData) => {
    return await axiosClient.post(
        "/auth/change-password",
        passwordData
    );
};

/**
 * Forgot Password (Optional)
 */
export const forgotPassword = async (email) => {
    return await axiosClient.post("/auth/forgot-password", {
        email,
    });
};

/**
 * Reset Password (Optional)
 */
export const resetPassword = async (resetData) => {
    return await axiosClient.post(
        "/auth/reset-password",
        resetData
    );
};
export default api;