import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const storedAuth = localStorage.getItem("primetrade_auth");

  if (storedAuth) {
    try {
      const { token } = JSON.parse(storedAuth);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      localStorage.removeItem("primetrade_auth");
    }
  }

  return config;
});

export function getApiError(error, fallbackMessage) {
  if (error?.code === "ECONNABORTED") {
    return "The server took too long to respond. Please check whether the backend is running correctly.";
  }

  if (error?.message === "Network Error") {
    return "Unable to reach the API. Please make sure the backend is running and CORS is configured.";
  }

  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    fallbackMessage ||
    "Something went wrong. Please try again."
  );
}

export default api;
