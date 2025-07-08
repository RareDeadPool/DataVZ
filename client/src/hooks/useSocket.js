import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useSocket(roomId, user, { onEdit, onPresence, onUserJoined } = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.on('connect', () => {
      socket.emit('join-room', roomId, user);
    });
    if (onEdit) socket.on('edit', onEdit);
    if (onPresence) socket.on('presence', onPresence);
    if (onUserJoined) socket.on('user-joined', onUserJoined);
    return () => {
      socket.disconnect();
    };
  }, [roomId, user, onEdit, onPresence, onUserJoined]);

  const sendEdit = (data) => {
    socketRef.current?.emit('edit', roomId, data);
  };
  const sendPresence = (presence) => {
    socketRef.current?.emit('presence', roomId, presence);
  };

  return { socket: socketRef.current, sendEdit, sendPresence };
} 