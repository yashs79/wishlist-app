import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Only connect to socket if user is authenticated
    if (currentUser && !socket) {
      console.log('Initializing socket connection...');
      const token = localStorage.getItem('token');
      
      // Configure socket with better connection options
      console.log('Initializing socket with token:', token ? 'present' : 'missing');
      
      // Create socket with improved configuration
      // Use relative URL in production, localhost in development
      const socketURL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001';
      const newSocket = io(socketURL, {
        auth: { token },
        transports: ['polling'], // Use only polling to avoid WebSocket connection issues
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 30000,
        withCredentials: true,
        forceNew: true
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket server with ID:', newSocket.id);
        setConnected(true);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        // If auth error, try reconnecting with updated token
        if (error.message.includes('auth')) {
          const updatedToken = localStorage.getItem('token');
          if (updatedToken && updatedToken !== token) {
            newSocket.auth = { token: updatedToken };
            newSocket.connect();
          }
        }
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Disconnected from socket server:', reason);
        setConnected(false);
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        console.log('Cleaning up socket connection');
        newSocket.disconnect();
      };
    }

    // If user logs out, disconnect socket
    if (!currentUser && socket) {
      console.log('User logged out, disconnecting socket');
      socket.disconnect();
      setSocket(null);
      setConnected(false);
    }
  }, [currentUser, socket]);

  // Join a wishlist room to receive real-time updates
  const joinWishlist = (wishlistId) => {
    if (socket && connected) {
      socket.emit('join-wishlist', wishlistId);
    }
  };

  // Leave a wishlist room
  const leaveWishlist = (wishlistId) => {
    if (socket && connected) {
      socket.emit('leave-wishlist', wishlistId);
    }
  };

  const value = {
    socket,
    connected,
    joinWishlist,
    leaveWishlist
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}
