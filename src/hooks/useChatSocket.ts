"use client";

import { useEffect, useRef } from "react";

import { getChatSocketUrl } from "@/lib/apis/messages/messages";
import type { MessageWsEvent } from "@/lib/apis/messages/schema";

type Status = "idle" | "connecting" | "open" | "closed";

interface Options {
  enabled: boolean;
  onMessage: (event: MessageWsEvent) => void;
  onStatusChange?: (status: Status) => void;
}

/**
 * Opens a WebSocket to the project chat endpoint while `enabled` is true.
 * - Token is read from localStorage (`auth:token`) at connect time.
 * - Reconnects with exponential backoff (max 10s) until disabled.
 * - Sends keep-alive pings every 25s; any text frame from the server is fine.
 */
export function useChatSocket({ enabled, onMessage, onStatusChange }: Options) {
  const onMessageRef = useRef(onMessage);
  const onStatusRef = useRef(onStatusChange);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onStatusRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let socket: WebSocket | null = null;
    let pingTimer: number | null = null;
    let reconnectTimer: number | null = null;
    let attempt = 0;
    let cancelled = false;

    const setStatus = (s: Status) => onStatusRef.current?.(s);

    const clearTimers = () => {
      if (pingTimer != null) {
        window.clearInterval(pingTimer);
        pingTimer = null;
      }
      if (reconnectTimer != null) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    const connect = () => {
      if (cancelled) return;
      const token = localStorage.getItem("auth:token");
      if (!token) {
        setStatus("closed");
        return;
      }

      let url: string;
      try {
        url = getChatSocketUrl(token);
      } catch {
        setStatus("closed");
        return;
      }

      setStatus("connecting");
      socket = new WebSocket(url);

      socket.addEventListener("open", () => {
        attempt = 0;
        setStatus("open");
        pingTimer = window.setInterval(() => {
          try {
            socket?.send("ping");
          } catch {
            // Ignore — close handler will run if socket dropped.
          }
        }, 25_000);
      });

      socket.addEventListener("message", (event) => {
        if (typeof event.data !== "string") return;
        try {
          const parsed = JSON.parse(event.data) as MessageWsEvent;
          if (parsed?.type === "message" && parsed.data) {
            onMessageRef.current(parsed);
          }
        } catch {
          // Ignore non-JSON frames (e.g. pongs).
        }
      });

      socket.addEventListener("close", () => {
        clearTimers();
        setStatus("closed");
        if (cancelled) return;
        attempt += 1;
        const delay = Math.min(10_000, 500 * 2 ** Math.min(attempt, 5));
        reconnectTimer = window.setTimeout(connect, delay);
      });

      socket.addEventListener("error", () => {
        try {
          socket?.close();
        } catch {
          // The close listener will pick up reconnect logic.
        }
      });
    };

    connect();

    return () => {
      cancelled = true;
      clearTimers();
      if (socket) {
        try {
          socket.close();
        } catch {
          // Connection may already be closed.
        }
      }
      setStatus("closed");
    };
  }, [enabled]);
}
