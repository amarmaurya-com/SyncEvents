import api from "./api.js";

export const getCoordinators = async () => {
  const { data } = await api.get("/admin/users?role=coordinator");
  return data;
};

export const getAdmins = async () => {
  const { data } = await api.get("/admin/users?role=admin");
  return data;
};

export const createCoordinator = async (payload) => {
  const { data } = await api.post("/admin/users", payload);
  return data;
};

export const createAdmin = async (payload) => {
  const { data } = await api.post("/admin/users", payload);
  return data;
};
