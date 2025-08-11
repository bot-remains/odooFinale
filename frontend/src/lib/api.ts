import axios from "axios";

// API configuration
const API_BASE_URL = "http://localhost:3000/api";

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
  };
}

// Generic API error type
export interface ApiError {
  message: string;
  status?: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Helper function to handle API errors
export const handleApiError = (error: unknown): ApiError => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as {
      response: {
        data?: {
          message?: string;
          errors?: Array<{ field: string; message: string }>;
        };
        status: number;
      };
    };
    return {
      message: axiosError.response.data?.message || "An error occurred",
      status: axiosError.response.status,
      errors: axiosError.response.data?.errors,
    };
  } else if (error && typeof error === "object" && "request" in error) {
    return {
      message: "Network error - please check your connection",
    };
  } else {
    return {
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};

export default api;
