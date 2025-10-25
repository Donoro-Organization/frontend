// API Hook for making HTTP requests
import { useState, useEffect } from "react";
import config from "@/config/config";
import { getAuthToken } from "@/utils/storage";

interface UseApiOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
  enabled?: boolean; // To control when the request should be made
  requiresAuth?: boolean; // Whether to include Authorization header (default: true)
}

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  mutate: (mutateBody?: any) => Promise<T>; // For manual mutations (POST, PUT, PATCH, DELETE)
}

export function useAPI<T = any>(
  endpoint: string,
  options: UseApiOptions = {}
): ApiResponse<T> {
  const {
    method = "GET",
    body = null,
    headers = {},
    enabled = true,
    requiresAuth = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const fetchData = async (fetchBody?: any) => {
    if (!enabled && !fetchBody) return;

    setLoading(true);
    setError(null);

    try {
      const url = `${config.BACKEND_API_ENDPOINT}${endpoint}`;

      const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        ...headers,
      };

      // Only add Authorization header if required
      if (requiresAuth) {
        const token = await getAuthToken();
        if (token) {
          requestHeaders["Authorization"] = `Bearer ${token}`;
        }
      }

      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
      };

      const bodyData = fetchBody !== undefined ? fetchBody : body;
      if (bodyData && method !== "GET") {
        requestOptions.body = JSON.stringify(bodyData);
      }

      const response = await fetch(url, requestOptions);
      const jsonData = await response.json();

      if (
        !response.ok ||
        (jsonData.status_code && jsonData.status_code >= 400)
      ) {
        throw new Error(
          jsonData.message ||
            jsonData.error ||
            `HTTP error! status: ${response.status}`
        );
      }

      setData(jsonData);
      return jsonData; // Return the data for use in mutate
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err; // Re-throw for mutate function
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (method === "GET") {
      fetchData();
    }
  }, [endpoint, refetchTrigger, enabled]);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  const mutate = async (mutateBody?: any): Promise<T> => {
    const result = await fetchData(mutateBody);
    return result as T;
  };

  return { data, loading, error, refetch, mutate };
}

// Helper function for manual API calls
export async function apiCall<T = any>(
  endpoint: string,
  options: UseApiOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body = null,
    headers = {},
    requiresAuth = true,
  } = options;

  const url = `${config.BACKEND_API_ENDPOINT}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  // Only set Content-Type if not FormData (FormData sets its own with boundary)
  const isFormData = body instanceof FormData;
  if (!isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }

  // Only add Authorization header if required
  if (requiresAuth) {
    const token = await getAuthToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== "GET") {
    // Don't stringify FormData, send it as-is
    requestOptions.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(url, requestOptions);
  const jsonData = await response.json();

  // Check if response is not ok OR if backend returned error status_code
  if (!response.ok || (jsonData.status_code && jsonData.status_code >= 400)) {
    throw new Error(
      jsonData.message ||
        jsonData.error ||
        `HTTP error! status: ${response.status}`
    );
  }

  return jsonData;
}
