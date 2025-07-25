import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { joinWishlistByInviteCode } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/auth/AuthModal';

const JoinWishlist = () => {
  const { inviteCode: urlInviteCode } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [inviteCode, setInviteCode] = useState(urlInviteCode || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleJoinWishlist = useCallback(async (codeToUse) => {
    const codeToJoin = codeToUse || inviteCode;
    
    if (!codeToJoin.trim()) {
      return setError('Please enter an invite code');
    }
    
    // Check if user is authenticated
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      const response = await joinWishlistByInviteCode(codeToJoin);
      setSuccess('Successfully joined wishlist!');
      
      // Redirect to the wishlist after a short delay
      setTimeout(() => {
        navigate(`/wishlist/${response.data._id}`);
      }, 1500);
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        setAuthModalOpen(true);
      } else if (error.response?.status === 404) {
        setError('Invalid invite code. Please check and try again.');
      } else if (error.response?.status === 400) {
        setError(error.response.data.message || 'You cannot join this wishlist.');
      } else {
        setError('Failed to join wishlist. Please try again.');
      }
      console.error('Error joining wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, inviteCode, navigate, setAuthModalOpen, setError, setLoading, setSuccess]);

  // If invite code is in URL, join automatically or show auth modal
  useEffect(() => {
    let hasAttemptedJoin = false;
    
    if (urlInviteCode && !hasAttemptedJoin) {
      hasAttemptedJoin = true;
      if (currentUser) {
        handleJoinWishlist();
      } else {
        // Show auth modal if user is not authenticated
        setAuthModalOpen(true);
      }
    }
    
    return () => {
      hasAttemptedJoin = true;
    };
  }, [urlInviteCode, currentUser, handleJoinWishlist]);

  // Handle successful authentication from the modal
  const handleAuthSuccess = (code) => {
    console.log('Authentication successful, joining wishlist with code:', code || inviteCode);
    setAuthModalOpen(false);
    
    // Wait a moment to ensure the token is properly set in localStorage
    // and the currentUser context is updated
    setTimeout(() => {
      // Double-check that we have a token before attempting to join
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Token is available after auth, proceeding with join');
        handleJoinWishlist(code || inviteCode);
      } else {
        console.error('No token available after authentication');
        setError('Authentication succeeded but no token was found. Please try again.');
      }
    }, 1500); // Longer delay to ensure token is set
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Join a Wishlist
        </Typography>
        
        <Typography variant="body1" paragraph align="center">
          Enter the invite code to join a shared wishlist
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        {!currentUser && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            You need to be logged in to join a wishlist.
            <Box sx={{ mt: 1 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setAuthModalOpen(true)}
                size="small"
              >
                Login / Register
              </Button>
            </Box>
          </Alert>
        )}
        
        <Box sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Invite Code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            disabled={loading || !!success}
            placeholder="Enter invite code"
            variant="outlined"
            sx={{ mb: 3 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </Button>
            
            <Button
              variant="contained"
              onClick={() => handleJoinWishlist()}
              disabled={loading || !inviteCode.trim() || !!success}
            >
              {loading ? <CircularProgress size={24} /> : 'Join Wishlist'}
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Authentication Modal */}
      <AuthModal 
        open={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        inviteCode={inviteCode || urlInviteCode}
        onAuthSuccess={handleAuthSuccess}
      />
    </Container>
  );
};

export default JoinWishlist;
