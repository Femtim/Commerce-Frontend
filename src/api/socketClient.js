import { io } from 'socket.io-client';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const SOCKET_URL = apiBaseUrl.replace(/\/api\/v1\/?$/, '');

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000
});