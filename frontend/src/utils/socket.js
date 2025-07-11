import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://matchpoint-i7tj.onrender.com';

export const socket = io(SOCKET_URL, {
  autoConnect: false, // connect manually after auth
  withCredentials: true,
}); 