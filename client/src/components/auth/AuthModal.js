import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Typography, 
  Box, 
  Alert, 
  Tabs, 
  Tab,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const AuthModal = ({ open, onClose, inviteCode, onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { signin, signup } = useAuth();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      if (activeTab === 0) { // Login
        // For login, use our test user credentials if fields are empty
        const loginEmail = email || 'test@example.com';
        const loginPassword = password || 'password123';
        
        console.log(`Attempting to login with ${loginEmail}`);
        await signin(loginEmail, loginPassword);
        
        // Verify that we have a token after login
        const token = localStorage.getItem('token');
        console.log('Token after login:', token ? 'Token exists' : 'No token');
        
        if (!token) {
          throw new Error('Authentication succeeded but no token was received');
        }
        
        setSuccess(`Login successful as ${loginEmail}!`);
        
        // Call the success callback with a slight delay to allow context to update
        setTimeout(() => {
          if (onAuthSuccess) {
            onAuthSuccess(inviteCode);
          }
        }, 1000);
      } else { // Register
        if (!name || !email || !password) {
          throw new Error('Please fill in all fields for registration');
        }
        await signup(name, email, password);
        
        // Verify that we have a token after signup
        const token = localStorage.getItem('token');
        console.log('Token after signup:', token ? 'Token exists' : 'No token');
        
        if (!token) {
          throw new Error('Registration succeeded but no token was received');
        }
        
        setSuccess('Registration successful! You can now join the wishlist.');
        
        // Call the success callback with a slight delay to allow context to update
        setTimeout(() => {
          if (onAuthSuccess) {
            onAuthSuccess(inviteCode);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      console.log('Using quick login with test user');
      await signin('test@example.com', 'password123');
      
      // Verify that we have a token after login
      const token = localStorage.getItem('token');
      console.log('Token after quick login:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        throw new Error('Quick login succeeded but no token was received');
      }
      
      setSuccess('Login successful as test@example.com!');
      
      // Call the success callback with a slight delay to allow context to update
      setTimeout(() => {
        if (onAuthSuccess) {
          onAuthSuccess(inviteCode);
        }
      }, 1000);
    } catch (error) {
      console.error('Quick login error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Authentication Required
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" color="text.secondary" paragraph>
          You need to be logged in to join the wishlist with invite code: <strong>{inviteCode}</strong>
        </Typography>
        
        <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ mb: 2 }}>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit}>
          {activeTab === 1 && (
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={activeTab === 1}
              disabled={loading}
            />
          )}
          
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (activeTab === 0 ? 'Login' : 'Register')}
          </Button>
        </Box>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Or use our test account for quick access
          </Typography>
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={handleQuickLogin}
            disabled={loading}
          >
            Quick Login as Test User
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuthModal;
