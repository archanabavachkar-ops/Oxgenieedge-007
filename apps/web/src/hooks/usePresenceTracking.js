import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext.jsx';

export function usePresenceTracking() {
  const { currentUser } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState({});
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    let socket;
    let idleTimer;
    
    const handleVisibilityChange = () => {
      if (document.hidden && socket?.connected) {
        socket.emit('user:idle', { userId: currentUser.id, timestamp: new Date().toISOString() });
      } else if (!document.hidden && socket?.connected) {
        socket.emit('user:online', { userId: currentUser.id, timestamp: new Date().toISOString() });
      }
    };

    const resetIdle = () => {
      if (socket?.connected && !document.hidden) {
        socket.emit('user:online', { 
          userId: currentUser.id, 
          timestamp: new Date().toISOString() 
        });
        
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          socket.emit('user:idle', { 
            userId: currentUser.id, 
            timestamp: new Date().toISOString() 
          });
        }, 5 * 60 * 1000); // 5 minutes idle
      }
    };

    try {
      socket = io(window.location.origin, {
        path: '/hcgi/api/socket.io',
        transports: ['websocket', 'polling']
      });

      socket.on('connect', () => {
        setIsOnline(true);
        socket.emit('user:online', {
          userId: currentUser.id,
          socketId: socket.id,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('disconnect', () => {
        setIsOnline(false);
      });

      socket.on('user:online', (data) => {
        setOnlineUsers(prev => ({
          ...prev, 
          [data.userId]: { status: 'online', lastSeen: data.timestamp }
        }));
      });

      socket.on('user:offline', (data) => {
        setOnlineUsers(prev => ({
          ...prev, 
          [data.userId]: { status: 'offline', lastSeen: data.timestamp }
        }));
      });

      socket.on('user:idle', (data) => {
        setOnlineUsers(prev => ({
          ...prev, 
          [data.userId]: { status: 'idle', lastSeen: data.timestamp }
        }));
      });

      window.addEventListener('mousemove', resetIdle);
      window.addEventListener('keydown', resetIdle);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      resetIdle();

    } catch (err) {
      console.error('Presence tracking failed:', err);
    }

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (socket) socket.disconnect();
    };
  }, [currentUser]);

  const getPresenceStatus = (userId) => {
    return onlineUsers[userId]?.status || 'offline';
  };

  return { 
    onlineUsers, 
    isOnline, 
    userPresence: onlineUsers[currentUser?.id] || null,
    lastSeen: onlineUsers[currentUser?.id]?.lastSeen || new Date().toISOString(),
    getPresenceStatus
  };
}