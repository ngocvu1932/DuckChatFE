import {io} from 'socket.io-client';
const API_URL = import.meta.env.VITE_API_URL;

const socket = io(API_URL, {
  transports: ['websocket', 'polling'], // Dùng nhiều transport để fallback
  withCredentials: true, // Nếu backend có bật CORS
});

socket.on('connect', () => {
  console.log('✅ Connected to server:', socket.id);
});

socket.on('connect_error', (err) => {
  console.error('❌ Connection error:', JSON.stringify(err));
});

export default socket;
