import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  withCredentials: false,
});

// Attach JWT Token Automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
