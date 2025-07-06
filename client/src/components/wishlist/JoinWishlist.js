import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { joinWishlistByInviteCode } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../auth/AuthModal';

const JoinWishlist = ({ onJoinSuccess }) => {
  const { currentUser } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingInviteCode, setPendingInviteCode] = useState('');

  // Effect to check for invite code in URL parameters when component mounts
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const codeFromUrl = queryParams.get('code');
    
    if (codeFromUrl) {
      console.log('Found invite code in URL:', codeFromUrl);
      setInviteCode(codeFromUrl);
      
      // If we have a code but no user, open auth modal
      if (!currentUser) {
        setPendingInviteCode(codeFromUrl);
        setAuthModalOpen(true);
      } else {
        // If user is already logged in, attempt to join automatically
        joinWishlistWithCode(codeFromUrl);
      }
      
      // Remove the code from URL to prevent repeated attempts
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [currentUser]);
  
  const joinWishlistWithCode = async (code) => {
    if (!code.trim()) {
      setError('Please enter an invite code');
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    console.log('Token available:', !!token);
    
    if (!token) {
      setPendingInviteCode(code);
      setAuthModalOpen(true);
      return;
    }
    
    if (!currentUser) {
      setPendingInviteCode(code);
      setAuthModalOpen(true);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Force token refresh before making the request
      localStorage.setItem('token', token); // Ensure token is properly set
      
      console.log('Attempting to join wishlist with code:', code.trim());
      console.log('Using auth token:', token.substring(0, 15) + '...');
      
      const response = await joinWishlistByInviteCode(code.trim());
      
      console.log('Join wishlist response:', response.data);
      setSuccess(`Successfully joined wishlist: ${response.data.name}`);
      setInviteCode('');
      
      // Call the callback function to refresh wishlists
      if (onJoinSuccess) {
        onJoinSuccess();
      }
    } catch (error) {
      console.error('Error joining wishlist:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token'); // Clear invalid token
        setError('Authentication failed. Please log out and log in again to refresh your session.');
      } else if (error.response?.status === 404) {
        setError('Invalid invite code. Please check and try again.');
      } else {
        setError(
          error.response?.data?.message || 
          'Failed to join wishlist. Please check your invite code and try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    joinWishlistWithCode(inviteCode);
  };
  
  // Handle successful authentication from the modal
  const handleAuthSuccess = (code) => {
    console.log('Authentication successful, joining wishlist with code:', code);
    setAuthModalOpen(false);
    
    // Wait a moment to ensure the token is properly set in localStorage
    // and the currentUser context is updated
    setTimeout(() => {
      // Double-check that we have a token before attempting to join
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Token is available after auth, proceeding with join');
        joinWishlistWithCode(code);
      } else {
        console.error('No token available after authentication');
        setError('Authentication succeeded but no token was found. Please try again.');
      }
    }, 1500); // Longer delay to ensure token is set
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Join a Wishlist
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Enter an invite code to join a shared wishlist
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      {!currentUser && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You need to be logged in to join a wishlist
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Invite Code"
          variant="outlined"
          size="small"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="Enter invite code (e.g., ABC123)"
          fullWidth
          disabled={loading}
        />
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Join Wishlist'}
        </Button>
      </Box>
      
      {!currentUser && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Please log in to join a wishlist
          </Typography>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => setAuthModalOpen(true)}
          >
            Login / Register
          </Button>
        </Box>
      )}
      
      {/* Authentication Modal */}
      <AuthModal 
        open={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        inviteCode={pendingInviteCode}
        onAuthSuccess={handleAuthSuccess}
      />
    </Paper>
  );
};

export default JoinWishlist;
