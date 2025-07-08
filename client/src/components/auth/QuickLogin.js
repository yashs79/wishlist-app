import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const QuickLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { signin, signup, currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      if (isLogin) {
        // For login, use our test user credentials if fields are empty
        const loginEmail = email || 'test@example.com';
        const loginPassword = password || 'password123';
        
        console.log(`Attempting to login with ${loginEmail}`);
        await signin(loginEmail, loginPassword);
        setSuccess(`Login successful as ${loginEmail}!`);
        console.log('Token after login:', localStorage.getItem('token'));
      } else {
        if (!name || !email || !password) {
          throw new Error('Please fill in all fields for registration');
        }
        await signup(name, email, password);
        setSuccess('Registration successful!');
        console.log('Token after signup:', localStorage.getItem('token'));
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleTestAuth = async () => {
    try {
      // Use relative URL in production, localhost in development
      const apiUrl = process.env.NODE_ENV === 'production' ? '/api/auth/check' : 'http://localhost:5001/api/auth/check';
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      console.log('Auth check result:', data);
      setSuccess(`Auth check: ${response.ok ? 'Success' : 'Failed'}`);
    } catch (error) {
      console.error('Auth check error:', error);
      setError('Failed to check authentication');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        {isLogin ? 'Login' : 'Register'} to FlockShop
      </Typography>
      
      {currentUser && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Already logged in as: {currentUser.email}
        </Alert>
      )}
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Box component="form" onSubmit={handleSubmit}>
        {!isLogin && (
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required={!isLogin}
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
        />
        
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth 
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {isLogin ? 'Login' : 'Register'}
        </Button>
        
        <Button 
          variant="text" 
          color="secondary" 
          fullWidth 
          sx={{ mt: 1 }}
          onClick={toggleMode}
          disabled={loading}
        >
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </Button>
        
        <Button 
          variant="outlined" 
          color="info" 
          fullWidth 
          sx={{ mt: 2 }}
          onClick={handleTestAuth}
          disabled={!localStorage.getItem('token')}
        >
          Test Authentication
        </Button>
      </Box>
    </Paper>
  );
};

export default QuickLogin;
