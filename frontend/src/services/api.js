import axios from "axios";

const defaultBaseURL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8081/api"
    : "https://syncevents.onrender.com/api";

const baseURL = import.meta.env.VITE_API_URL || defaultBaseURL;

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
