import { useState, useEffect, useCallback, useRef } from "react";
import config from "@/config/config";
import { getAuthToken } from "@/utils/storage";
import { Notification } from "@/types/notification";

interface UseWebSocketOptions {
  onMessage?: (notification: Notification) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Close intent controls what to do in onclose:
  // - "none": unexpected close → auto backoff reconnect
  // - "refresh": intentional one-shot reconnect
  // - "disconnect": intentional full stop
  const closeIntentRef = useRef<"none" | "refresh" | "disconnect">("none");

  const connect = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        console.log("No auth token available for WebSocket");
        return;
      }

      const wsUrl = `${config.BACKEND_SOCKET_ENDPOINT}/notifications/ws?token=${token}`;
      console.log("Connecting to WebSocket:", wsUrl);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        setIsConnected(true);
        setReconnectAttempts(0);
        options.onConnect?.();

        // Send ping every 30 seconds to keep connection alive
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send("ping");
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "notification") {
            console.log("📩 Notification received:", data);
            options.onMessage?.(data as Notification);
          } else if (data.type === "pong") {
            console.log("🏓 Pong received");
          } else if (data.type === "connection") {
            console.log("🔗 Connection confirmed:", data.message);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        options.onError?.(error);
      };

      ws.onclose = () => {
        console.log("🔌 WebSocket disconnected");
        setIsConnected(false);
        options.onDisconnect?.();

        wsRef.current = null;

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Decide next action based on close intent
        const intent = closeIntentRef.current;
        // Reset intent to default for future closes
        closeIntentRef.current = "none";
        if (intent === "disconnect") {
          // Do nothing further
          return;
        }
        if (intent === "refresh") {
          // One-shot reconnect
          connect();
          return;
        }

        // Attempt to reconnect
        const maxAttempts = 5;
        const backoffDelay = Math.min(
          1000 * Math.pow(2, reconnectAttempts),
          30000
        );

        if (reconnectAttempts < maxAttempts) {
          console.log(
            `Reconnecting in ${backoffDelay}ms (attempt ${
              reconnectAttempts + 1
            }/${maxAttempts})...`
          );
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1);
            connect();
          }, backoffDelay) as any;
        } else {
          console.log("Max reconnection attempts reached");
        }
      };
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
    }
  }, [reconnectAttempts, options]);

  const disconnect = useCallback(() => {
    // Prevent retries on this close
    closeIntentRef.current = "disconnect";
    // Clear pending timers/intervals
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const refresh = useCallback(() => {
    // Request a one-shot reconnect
    closeIntentRef.current = "refresh";
    // Clear pending timers/intervals for a clean slate
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
    } else {
      connect();
    }
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    reconnect: refresh,
    disconnect,
  };
}
