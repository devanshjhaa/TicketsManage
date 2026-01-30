import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Add request interceptor to include JWT token in Authorization header
api.interceptors.request.use((config) => {
  // Only access localStorage on client side
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

console.log("API BASE:", process.env.NEXT_PUBLIC_API_URL);