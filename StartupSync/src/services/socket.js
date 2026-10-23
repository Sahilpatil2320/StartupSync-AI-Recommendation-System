
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

let socket = null;
let activeToken = null;

export const connectSocket = () => {
  const token = localStorage.getItem("startupsync_token");

  if (!token) {
    return null;
  }

  if (socket && activeToken === token) {
    if (!socket.connected) {
      socket.connect();
    }

    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  activeToken = token;

  socket = io(SOCKET_URL, {
    autoConnect: false,
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.connect();

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    activeToken = null;
  }
};

export const getSocket = () => socket;