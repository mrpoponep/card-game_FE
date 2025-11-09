import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";

export function useOnlineSocket(applyOnlineCount) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || typeof socket.on !== "function") return;
    const h = (count) => applyOnlineCount(Number(count) || 0);
    socket.on('online_count_update', h);
    return () => socket.off('online_count_update', h);
  }, [socket, applyOnlineCount]);
}
