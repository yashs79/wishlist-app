import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const register = (userData) => api.post('/auth/register', userData);
export const login = (userData) => api.post('/auth/login', userData);
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (userData) => api.put('/auth/profile', userData);

// Wishlist API
export const createWishlist = (wishlistData) => api.post('/wishlists', wishlistData);
export const getMyWishlists = () => api.get('/wishlists/my');
export const getWishlistById = (id) => api.get(`/wishlists/${id}`);
export const updateWishlist = (id, wishlistData) => api.put(`/wishlists/${id}`, wishlistData);
export const deleteWishlist = (id) => api.delete(`/wishlists/${id}`);
export const joinWishlistByInviteCode = (inviteCode) => api.post('/wishlists/join', { inviteCode });
export const removeCollaborator = (wishlistId, userId) => api.delete(`/wishlists/${wishlistId}/collaborators/${userId}`);
export const generateNewInviteCode = (id) => api.post(`/wishlists/${id}/invite`);

// Product API
export const addProduct = (productData) => api.post('/products', productData);
export const getProductById = (id) => api.get(`/products/${id}`);
export const updateProduct = (id, productData) => api.put(`/products/${id}`, productData);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const addComment = (id, text) => api.post(`/products/${id}/comments`, { text });
export const addReaction = (id, emoji) => api.post(`/products/${id}/reactions`, { emoji });

export default api;
