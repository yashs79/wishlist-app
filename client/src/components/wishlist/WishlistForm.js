import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createWishlist, updateWishlist } from '../../utils/api';

const WishlistForm = ({ wishlist, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // If editing, populate form with wishlist data
  useEffect(() => {
    if (isEdit && wishlist) {
      setFormData({
        name: wishlist.name || '',
        description: wishlist.description || '',
        isPrivate: wishlist.isPrivate || false
      });
    }
  }, [isEdit, wishlist]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return setError('Wishlist name is required');
    }
    
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      if (isEdit && wishlist) {
        await updateWishlist(wishlist._id, formData);
        setSuccess('Wishlist updated successfully!');
        setTimeout(() => {
          navigate(`/wishlist/${wishlist._id}`);
        }, 1500);
      } else {
        const response = await createWishlist(formData);
        setSuccess('Wishlist created successfully!');
        setTimeout(() => {
          navigate(`/wishlist/${response.data._id}`);
        }, 1500);
      }
    } catch (error) {
      setError('Failed to save wishlist. Please try again.');
      console.error('Error saving wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {isEdit ? 'Edit Wishlist' : 'Create New Wishlist'}
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
      
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="name"
          label="Wishlist Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          autoFocus
        />
        
        <TextField
          margin="normal"
          fullWidth
          id="description"
          label="Description (optional)"
          name="description"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={3}
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={formData.isPrivate}
              onChange={handleChange}
              name="isPrivate"
              color="primary"
            />
          }
          label="Private Wishlist"
          sx={{ mt: 2 }}
        />
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEdit ? 'Update Wishlist' : 'Create Wishlist'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default WishlistForm;
