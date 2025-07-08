import { io } from 'socket.io-client';

// Create a socket instance that connects to the server
// Use relative URL in production, localhost in development
const socketURL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001';
const socket = io(socketURL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket', 'polling']
});

// Connection event listeners
socket.on('connect', () => {
  console.log('Socket.io connected successfully');
});

socket.on('connect_error', (error) => {
  console.error('Socket.io connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Socket.io disconnected:', reason);
});

// Wishlist-specific events
export const joinWishlistRoom = (wishlistId) => {
  if (socket && socket.connected) {
    socket.emit('join-wishlist', wishlistId);
    console.log(`Joined wishlist room: ${wishlistId}`);
  } else {
    console.warn('Socket not connected, cannot join wishlist room');
  }
};

export const leaveWishlistRoom = (wishlistId) => {
  if (socket && socket.connected) {
    socket.emit('leave-wishlist', wishlistId);
    console.log(`Left wishlist room: ${wishlistId}`);
  }
};

// Add event listeners for wishlist updates
export const onCollaboratorAdded = (callback) => {
  socket.on('collaborator-added', callback);
};

export const onWishlistUpdated = (callback) => {
  socket.on('wishlist-updated', callback);
};

export const onProductAdded = (callback) => {
  socket.on('product-added', callback);
};

export const onProductUpdated = (callback) => {
  socket.on('product-updated', callback);
};

export const onProductDeleted = (callback) => {
  socket.on('product-deleted', callback);
};

// Clean up function to remove event listeners
export const removeSocketListeners = () => {
  socket.off('collaborator-added');
  socket.off('wishlist-updated');
  socket.off('product-added');
  socket.off('product-updated');
  socket.off('product-deleted');
};

// Export the socket instance as default
export default socket;
