import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getMyWishlists, deleteWishlist, generateNewInviteCode } from '../utils/api';
import WishlistCard from '../components/wishlist/WishlistCard';

const Home = () => {
  const { currentUser } = useAuth();
  const { socket } = useSocket();
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedWishlist, setSelectedWishlist] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Fetch user's wishlists
  const fetchWishlists = async () => {
    try {
      setLoading(true);
      const response = await getMyWishlists();
      setWishlists(response.data);
      setError('');
    } catch (error) {
      setError('Failed to load wishlists. Please try again.');
      console.error('Error fetching wishlists:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (currentUser) {
      fetchWishlists();
    }
  }, [currentUser]);

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
    if (!selectedWishlist) return;
    
    try {
      const response = await generateNewInviteCode(selectedWishlist._id);
      setSelectedWishlist(prev => ({
        ...prev,
        inviteCode: response.data.inviteCode
      }));
    } catch (error) {
      console.error('Error generating invite code:', error);
    }
  };

  // Copy invite link to clipboard
  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join/${selectedWishlist.inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    setSnackbarMessage('Invite link copied to clipboard');
    setSnackbarOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Wishlists
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

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

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

      {/* Share Wishlist Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Wishlist</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Share this invite code or link with others to collaborate on your wishlist.
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Invite Code"
              value={selectedWishlist?.inviteCode || ''}
              InputProps={{
                readOnly: true,
              }}
            />
          </Box>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={handleGenerateNewCode}
            >
              Generate New Code
            </Button>
            <Button 
              variant="contained" 
              onClick={handleCopyInviteLink}
            >
              Copy Invite Link
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
