import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WishlistForm from '../components/wishlist/WishlistForm';
import { getWishlistById } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const EditWishlist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const response = await getWishlistById(id);
        const wishlistData = response.data;
        
        // Check if current user is the owner
        if (currentUser && wishlistData.owner._id !== currentUser._id) {
          setError('You do not have permission to edit this wishlist');
          return;
        }
        
        setWishlist(wishlistData);
      } catch (error) {
        setError('Failed to load wishlist. Please try again.');
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchWishlist();
    }
  }, [id, currentUser]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/wishlist/${id}`)}
        sx={{ mb: 2 }}
      >
        Back to Wishlist
      </Button>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1">
          Edit Wishlist
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : wishlist ? (
        <WishlistForm wishlist={wishlist} isEdit={true} />
      ) : !error && (
        <Alert severity="error">Wishlist not found</Alert>
      )}
    </Container>
  );
};

export default EditWishlist;
