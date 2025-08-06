import { io } from 'socket.io-client';

let socket = null;

export const initializeSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }
  
  socket = io(import.meta.env.VITE_SOCKET_URL, {
    auth: {
      token
    },
    autoConnect: false
  });
  
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};