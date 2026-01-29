import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.22:5000/api",
  withCredentials: true, // ✅ allow cookies
});

export default api;
