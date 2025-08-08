import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: Set<string>;
  typingUsers: Map<string, string>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      const newSocket = io('http://localhost:5000', {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setSocket(newSocket);
      });

      newSocket.on('user_online', ({ userId, username }) => {
        setOnlineUsers(prev => new Set(prev).add(userId));
      });

      newSocket.on('user_offline', ({ userId }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      newSocket.on('user_typing', ({ userId, username }) => {
        setTypingUsers(prev => new Map(prev).set(userId, username));
      });

      newSocket.on('user_stopped_typing', ({ userId }) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(userId);
          return newMap;
        });
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      return () => {
        newSocket.close();
      };
    }
  }, [user, token]);

  return (
    <SocketContext.Provider value={{
      socket,
      onlineUsers,
      typingUsers
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};