import api from "./authApi";

export const getDashboardKPIs = async () => {
  const response = await api.get("/reports/kpis");
  return response.data;
};

export const getVehicleReport = async () => {
  const response = await api.get("/reports/vehicles");
  return response.data;
};

export const getDriverReport = async () => {
  const response = await api.get("/reports/drivers");
  return response.data;
};

export const getTripReport = async () => {
  const response = await api.get("/reports/trips");
  return response.data;
};

export const getFuelExpenseReport = async () => {
  const response = await api.get("/reports/fuel-expenses");
  return response.data;
};

export const getMaintenanceReport = async () => {
  const response = await api.get("/reports/maintenance");
  return response.data;
};

export const getUsersReport = async () => {
  const response = await api.get("/reports/users");
  return response.data;
};