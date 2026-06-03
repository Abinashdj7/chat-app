import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import type { Socket } from "socket.io-client";
import type { User } from "../types";

const ENDPOINT = import.meta.env.VITE_API_URL ?? "http://localhost:5050";

export function useSocket(user: User | null) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!user?._id) return;
    const socket = io(ENDPOINT);
    socketRef.current = socket;
    socket.emit("setup", user);
    socket.on("connected", () => setConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // intentionally keyed on user._id only — reconnect only when identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  return { socketRef, connected, isTyping };
}
