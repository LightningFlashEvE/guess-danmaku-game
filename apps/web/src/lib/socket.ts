import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * 获取全局唯一的 Socket.IO 连接。默认连同源（由 Vite 代理转发到后端）。
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io('/', {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });
  }
  return socket;
}
