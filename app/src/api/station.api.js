import api from "./axios";

export const StationAPI = {
  getAll: () => api.get("/stations"),
  create: (data) => api.post("/stations", data),
  update: (id, data) => api.put(`/stations/${id}`, data),
  remove: (id) => api.delete(`/stations/${id}`),
};
