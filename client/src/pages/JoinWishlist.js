import React, { useState, useEffect } from 'react';
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

const JoinWishlist = () => {
  const { inviteCode: urlInviteCode } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [inviteCode, setInviteCode] = useState(urlInviteCode || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // If invite code is in URL, join automatically
  useEffect(() => {
    if (urlInviteCode && currentUser) {
      handleJoinWishlist();
    }
  }, [urlInviteCode, currentUser]);

  const handleJoinWishlist = async () => {
    if (!inviteCode.trim()) {
      return setError('Please enter an invite code');
    }
    
    try {
      setError('');
      setLoading(true);
      const response = await joinWishlistByInviteCode(inviteCode);
      setSuccess('Successfully joined wishlist!');
      
      // Redirect to the wishlist after a short delay
      setTimeout(() => {
        navigate(`/wishlist/${response.data._id}`);
      }, 1500);
    } catch (error) {
      if (error.response?.status === 404) {
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
              onClick={handleJoinWishlist}
              disabled={loading || !inviteCode.trim() || !!success}
            >
              {loading ? <CircularProgress size={24} /> : 'Join Wishlist'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default JoinWishlist;
