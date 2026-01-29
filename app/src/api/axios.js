import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // ✅ allow cookies
});

export default api;
