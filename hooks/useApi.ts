// API Hook for making HTTP requests
import { useState, useEffect } from "react";
import config from "@/config/config";

// TODO: Replace with actual token from auth context/storage
const HARDCODED_JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg5NWMyMjAzLTlkNTAtNDFhOS04YWE1LTM4MThhZGU0NjAyMCIsInJvbGUiOiJnZW5lcmFsIiwiZXhwIjoxNzU5OTM0NDk5fQ.ht2ZRZXulaVUxrZUr4bOT26j4BhLO9IwXygLelwvUXE";

interface UseApiOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
  enabled?: boolean; // To control when the request should be made
}

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T = any>(
  endpoint: string,
  options: UseApiOptions = {}
): ApiResponse<T> {
  const { method = "GET", body = null, headers = {}, enabled = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const fetchData = async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const url = `${config.BACKEND_API_ENDPOINT}${endpoint}`;


      const requestOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HARDCODED_JWT_TOKEN}`,
          "ngrok-skip-browser-warning": "true",
          ...headers,
        },
      };

      if (body && method !== "GET") {
        requestOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      setData(jsonData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint, refetchTrigger, enabled]);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  return { data, loading, error, refetch };
}

// Helper function for manual API calls (for mutations)
export async function apiCall<T = any>(
  endpoint: string,
  options: UseApiOptions = {}
): Promise<T> {
  const { method = "GET", body = null, headers = {} } = options;

  const url = `${config.BACKEND_API_ENDPOINT}${endpoint}`;

  const requestOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HARDCODED_JWT_TOKEN}`,
      ...headers,
    },
  };

  if (body && method !== "GET") {
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, requestOptions);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
