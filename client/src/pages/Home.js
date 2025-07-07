import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Grid, Box, Button, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, Snackbar, Paper, Tabs, Tab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getMyWishlists, deleteWishlist, generateNewInviteCode } from '../utils/api';
import WishlistCard from '../components/wishlist/WishlistCard';
import QuickLogin from '../components/auth/QuickLogin';
import JoinWishlist from '../components/wishlist/JoinWishlist';

const Home = () => {
  const { currentUser } = useAuth();
  const { socket, connected } = useSocket();
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedWishlist, setSelectedWishlist] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Fetch user's wishlists
  const fetchWishlists = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if we have a token before trying to fetch wishlists
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No authentication token found, cannot fetch wishlists');
        setError('Please log in to view your wishlists');
        setLoading(false);
        return;
      }
      
      console.log('Fetching wishlists with token:', !!token);
      const response = await getMyWishlists();
      console.log('Wishlists fetched successfully:', response.data.length);
      setWishlists(response.data);
      
      if (response.data.length === 0) {
        console.log('No wishlists found for user');
      }
    } catch (error) {
      console.error('Error fetching wishlists:', error);
      if (error.response && error.response.status === 401) {
        setError('Authentication failed. Please log in again.');
        // Clear token if it's invalid
        localStorage.removeItem('token');
      } else {
        setError('Failed to load wishlists. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to fetch wishlists on component mount
  useEffect(() => {
    if (currentUser) {
      fetchWishlists();
    }
  }, [currentUser, fetchWishlists]);
  
  // Socket context is already imported at the top of the component
  
  // Set up socket event listeners for real-time updates
  // Set up socket event listeners for real-time updates
  useEffect(() => {
    // Create a memoized version of the fetchWishlists function to avoid dependency issues
    const handleWishlistUpdate = () => {
      console.log('Wishlist update received, refreshing wishlists');
      fetchWishlists();
    };
    
    if (socket && connected) {
      console.log('Setting up socket event listeners for wishlist updates');
      
      // Listen for collaborator added event
      socket.on('collaborator-added', handleWishlistUpdate);
      
      // Listen for wishlist updated event
      socket.on('wishlist-updated', handleWishlistUpdate);
      
      // Listen for product events
      socket.on('product-added', handleWishlistUpdate);
      socket.on('product-updated', handleWishlistUpdate);
      socket.on('product-deleted', handleWishlistUpdate);
      
      // Clean up event listeners on unmount
      return () => {
        console.log('Cleaning up socket event listeners');
        socket.off('collaborator-added', handleWishlistUpdate);
        socket.off('wishlist-updated', handleWishlistUpdate);
        socket.off('product-added', handleWishlistUpdate);
        socket.off('product-updated', handleWishlistUpdate);
        socket.off('product-deleted', handleWishlistUpdate);
      };
    }
  }, [socket, connected, fetchWishlists]);
  
  // Listen for authentication errors
  useEffect(() => {
    const handleAuthError = (event) => {
      setError(event.detail.message);
      setSnackbarMessage('Authentication failed. Please log in again.');
      setSnackbarOpen(true);
    };
    
    window.addEventListener('auth-error', handleAuthError);
    
    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, []);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (socket) {
      // Listen for wishlist created event
      socket.on('wishlist-created', (newWishlist) => {
        setWishlists(prev => [...prev, newWishlist]);
      });

      // Listen for wishlist updated event
      socket.on('wishlist-updated', (updatedWishlist) => {
        setWishlists(prev => 
          prev.map(wishlist => 
            wishlist._id === updatedWishlist._id ? updatedWishlist : wishlist
          )
        );
      });

      // Listen for wishlist deleted event
      socket.on('wishlist-deleted', (wishlistId) => {
        setWishlists(prev => 
          prev.filter(wishlist => wishlist._id !== wishlistId)
        );
      });

      return () => {
        socket.off('wishlist-created');
        socket.off('wishlist-updated');
        socket.off('wishlist-deleted');
      };
    }
  }, [socket]);

  // Handle wishlist deletion
  const handleDeleteWishlist = async (wishlistId) => {
    try {
      await deleteWishlist(wishlistId);
      setWishlists(prev => prev.filter(wishlist => wishlist._id !== wishlistId));
      setSnackbarMessage('Wishlist deleted successfully');
      setSnackbarOpen(true);
    } catch (error) {
      setError('Failed to delete wishlist');
      console.error('Error deleting wishlist:', error);
    }
  };

  // Handle sharing a wishlist
  const handleShareWishlist = (wishlist) => {
    setSelectedWishlist(wishlist);
    setShareDialogOpen(true);
  };

  // Generate new invite code
  const handleGenerateNewCode = async () => {
    try {
      const response = await generateNewInviteCode(selectedWishlist._id);
      setSelectedWishlist({
        ...selectedWishlist,
        inviteCode: response.data.inviteCode
      });
      setSnackbarMessage('New invite code generated successfully');
      setSnackbarOpen(true);
    } catch (error) {
      setError('Failed to generate new invite code');
      console.error('Error generating invite code:', error);
    }
  };

  // Copy invite link to clipboard
  const handleCopyInviteLink = () => {
    const inviteCode = selectedWishlist.inviteCode;
    navigator.clipboard.writeText(inviteCode);
    setSnackbarMessage('Invite code copied to clipboard');
    setSnackbarOpen(true);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Clear any errors when switching tabs
    setError('');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {!currentUser ? (
        // Show login form when user is not authenticated
        <Box sx={{ mb: 4 }}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Welcome to FlockShop
            </Typography>
            <Typography variant="body1" paragraph>
              FlockShop is a collaborative wishlist application that lets you create, share, and manage wishlists with friends and family.
              Please sign in or register to get started.
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              You need to be logged in to view and create wishlists.
            </Alert>
          </Paper>
          <QuickLogin />
        </Box>
      ) : (
        // Show wishlists when user is authenticated
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1">
              Wishlists
            </Typography>
            <Button
              component={RouterLink}
              to="/create-wishlist"
              variant="contained"
              startIcon={<AddIcon />}
            >
              Create Wishlist
            </Button>
          </Box>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              aria-label="wishlist tabs"
            >
              <Tab label="My Wishlists" />
              <Tab label="Join Wishlist" />
            </Tabs>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          {/* Tab 0: My Wishlists */}
          {activeTab === 0 && (
            <>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress />
                </Box>
              ) : wishlists.length === 0 ? (
                <Box sx={{ textAlign: 'center', mt: 8 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    You don't have any wishlists yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Create your first wishlist to get started
                  </Typography>
                  <Button
                    component={RouterLink}
                    to="/create-wishlist"
                    variant="contained"
                    startIcon={<AddIcon />}
                  >
                    Create Wishlist
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {wishlists.map((wishlist) => (
                    <Grid item key={wishlist._id} xs={12} sm={6} md={4}>
                      <WishlistCard 
                        wishlist={wishlist} 
                        onDelete={handleDeleteWishlist}
                        onShare={handleShareWishlist}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}

          {/* Tab 1: Join Wishlist */}
          {activeTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <JoinWishlist onJoinSuccess={fetchWishlists} />
              
              <Box sx={{ mt: 4, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  How to Join a Wishlist
                </Typography>
                <Typography variant="body2" paragraph>
                  To join a wishlist, you need an invite code from the wishlist owner. Ask them to share their wishlist with you.
                </Typography>
                <Typography variant="body2" paragraph>
                  Once you have the code, enter it in the form above and click "Join Wishlist".
                </Typography>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* Share Wishlist Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Wishlist: {selectedWishlist?.name}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Share this invite code with others to collaborate on your wishlist.
          </DialogContentText>
          
          <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Invite Code
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                value={selectedWishlist?.inviteCode || ''}
                InputProps={{
                  readOnly: true,
                  sx: { fontWeight: 'bold', letterSpacing: 1 }
                }}
              />
              <Button 
                variant="contained" 
                onClick={handleCopyInviteLink}
                color="primary"
              >
                Copy
              </Button>
            </Box>
          </Paper>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Anyone with this code can join your wishlist as a collaborator. They will be able to view, add, and edit items.
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            For security, you can generate a new code at any time. This will invalidate the old code.
          </Typography>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              onClick={handleGenerateNewCode}
              startIcon={<RefreshIcon />}
            >
              Generate New Code
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => {
                setActiveTab(1);
                setShareDialogOpen(false);
              }}
            >
              Go to Join Tab
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default Home;
