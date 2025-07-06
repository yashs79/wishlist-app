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
      const newSocket = io('http://localhost:5001', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from socket server');
        setConnected(false);
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.disconnect();
      };
    }

    // If user logs out, disconnect socket
    if (!currentUser && socket) {
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
