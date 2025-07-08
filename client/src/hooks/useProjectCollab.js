import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Always use explicit http protocol and port for local dev
const SOCKET_URL = 'http://localhost:5000';

export function useProjectCollab(projectId, user, { onDataEdit, onChartEdit, onPresence, onUserJoined } = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      forceNew: true,
      reconnectionAttempts: 5,
      timeout: 2000,
    });
    socketRef.current = socket;
    socket.on('connect', () => {
      console.log('[Socket.IO] Connected:', socket.id);
      socket.emit('join-room', projectId, user);
    });
    socket.on('connect_error', (err) => {
      console.error('[Socket.IO] Connect error:', err);
    });
    socket.on('disconnect', (reason) => {
      console.warn('[Socket.IO] Disconnected:', reason);
    });
    if (onDataEdit) socket.on('data-edit', onDataEdit);
    if (onChartEdit) socket.on('chart-edit', onChartEdit);
    if (onPresence) socket.on('presence', onPresence);
    if (onUserJoined) socket.on('user-joined', onUserJoined);
    return () => {
      socket.disconnect();
    };
  }, [projectId, user, onDataEdit, onChartEdit, onPresence, onUserJoined]);

  const sendDataEdit = (change) => {
    socketRef.current?.emit('data-edit', projectId, change);
  };
  const sendChartEdit = (chart) => {
    socketRef.current?.emit('chart-edit', projectId, chart);
  };
  const sendPresence = (presence) => {
    socketRef.current?.emit('presence', projectId, presence);
  };

  return { socket: socketRef.current, sendDataEdit, sendChartEdit, sendPresence };
} 