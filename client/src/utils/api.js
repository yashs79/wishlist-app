import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

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
      // Ensure the Authorization header is properly set
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      console.log('API Request with token:', config.url, 'Token prefix:', token.substring(0, 10) + '...');
    } else {
      console.warn('API Request without token:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('API Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response success:', response.config.url);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with a status code outside of 2xx range
      console.error('API Response error:', error.response.status, error.response.data, error.config.url);
      
      // Handle authentication errors
      if (error.response.status === 401) {
        console.warn('Authentication failed. Clearing token.');
        localStorage.removeItem('token');
        
        // Dispatch a custom event that components can listen for
        const authErrorEvent = new CustomEvent('auth-error', { 
          detail: { message: 'Your session has expired. Please log in again.' } 
        });
        window.dispatchEvent(authErrorEvent);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('API No response received:', error.request, error.config.url);
    } else {
      // Something happened in setting up the request
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const register = (userData) => api.post('/auth/register', userData);

// Login function - only send email and password to match server expectations
export const login = (userData) => {
  // Extract only email and password for login
  const { email, password } = userData;
  console.log('Sending login request with:', { email, password: '***' });
  return api.post('/auth/login', { email, password });
};

export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (userData) => api.put('/auth/profile', userData);

// Wishlist API
export const createWishlist = (wishlistData) => api.post('/wishlists', wishlistData);
export const getMyWishlists = () => api.get('/wishlists/my');
export const getWishlistById = (id) => api.get(`/wishlists/${id}`);
export const updateWishlist = (id, wishlistData) => api.put(`/wishlists/${id}`, wishlistData);
export const deleteWishlist = (id) => api.delete(`/wishlists/${id}`);
export const joinWishlistByInviteCode = (inviteCode) => {
  // Use the global axios interceptor for token handling
  return api.post('/wishlists/join', { inviteCode });
};
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
