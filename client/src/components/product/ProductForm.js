import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  InputAdornment
} from '@mui/material';
import { addProduct, updateProduct } from '../../utils/api';

const ProductForm = ({ product, wishlistId, isEdit = false, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    wishlistId: wishlistId || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // If editing, populate form with product data
  useEffect(() => {
    if (isEdit && product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        imageUrl: product.imageUrl || '',
        wishlistId: product.wishlist || wishlistId || ''
      });
    } else if (wishlistId) {
      setFormData(prev => ({
        ...prev,
        wishlistId
      }));
    }
  }, [isEdit, product, wishlistId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle price input to ensure it's a valid number
    if (name === 'price') {
      const numericValue = value.replace(/[^0-9.]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Product name is required');
      return false;
    }
    
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      setError('Valid price is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      const productData = {
        ...formData,
        price: parseFloat(formData.price)
      };
      
      if (isEdit && product) {
        await updateProduct(product._id, productData);
        setSuccess('Product updated successfully!');
      } else {
        await addProduct(productData);
        setSuccess('Product added successfully!');
        // Reset form after successful addition
        setFormData({
          name: '',
          description: '',
          price: '',
          imageUrl: '',
          wishlistId
        });
      }
      
      // Call the success callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    } catch (error) {
      setError('Failed to save product. Please try again.');
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" component="h3" gutterBottom>
        {isEdit ? 'Edit Product' : 'Add New Product'}
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
          label="Product Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          autoFocus
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          id="price"
          label="Price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
        
        <TextField
          margin="normal"
          fullWidth
          id="imageUrl"
          label="Image URL (optional)"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
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
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
          </Button>
          
          {isEdit && (
            <Button
              variant="outlined"
              onClick={onSuccess}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default ProductForm;
