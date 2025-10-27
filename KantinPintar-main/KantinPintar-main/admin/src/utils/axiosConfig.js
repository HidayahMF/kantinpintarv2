import axios from "axios";
import { clearToken } from "./auth";

const apiClient = axios.create({
  baseURL: ess.env.REACT_APP_API_URL || "http://localhost:4000/api",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
