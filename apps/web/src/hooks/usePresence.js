import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext.jsx';

export function usePresence() {
  const { currentUser } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState({});
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    let socket;
    let idleTimer;
    
    const resetIdle = () => {
      if (socket?.connected) {
        socket.emit('user:online', { 
          userId: currentUser.id, 
          timestamp: new Date().toISOString() 
        });
        
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          socket.emit('user:offline', { 
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

      window.addEventListener('mousemove', resetIdle);
      window.addEventListener('keydown', resetIdle);
      resetIdle();

    } catch (err) {
      console.error('Presence tracking failed:', err);
    }

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      if (socket) socket.disconnect();
    };
  }, [currentUser]);

  return { 
    onlineUsers, 
    isOnline, 
    userPresence: onlineUsers[currentUser?.id] || null,
    lastSeen: onlineUsers[currentUser?.id]?.lastSeen || new Date().toISOString()
  };
}