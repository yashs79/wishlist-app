import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WishlistForm from '../components/wishlist/WishlistForm';

const CreateWishlist = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        Back to Wishlists
      </Button>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1">
          Create New Wishlist
        </Typography>
      </Box>
      
      <WishlistForm />
    </Container>
  );
};

export default CreateWishlist;
