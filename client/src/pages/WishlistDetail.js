import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Snackbar,
  Paper
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getWishlistById, removeCollaborator } from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import ProductForm from '../components/product/ProductForm';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';

const WishlistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { socket, joinWishlist, leaveWishlist } = useSocket();
  
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Fetch wishlist data
  const fetchWishlistData = async () => {
    try {
      setLoading(true);
      const response = await getWishlistById(id);
      setWishlist(response.data);
      setError('');
    } catch (error) {
      setError('Failed to load wishlist. Please try again.');
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (id) {
      fetchWishlistData();
    }
    
    return () => {
      if (id) {
        leaveWishlist(id);
      }
    };
  }, [id]);

  // Join socket room for real-time updates
  useEffect(() => {
    if (socket && id) {
      joinWishlist(id);
    }
  }, [socket, id, joinWishlist]);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (socket) {
      // Listen for product added event
      socket.on('product-added', (newProduct) => {
        setWishlist(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            products: [...prev.products, newProduct]
          };
        });
        setSnackbarMessage('New product added');
        setSnackbarOpen(true);
      });

      // Listen for product updated event
      socket.on('product-updated', (updatedProduct) => {
        setWishlist(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            products: prev.products.map(product => 
              product._id === updatedProduct._id ? updatedProduct : product
            )
          };
        });
      });

      // Listen for product deleted event
      socket.on('product-deleted', (productId) => {
        setWishlist(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            products: prev.products.filter(product => product._id !== productId)
          };
        });
        setSnackbarMessage('Product removed');
        setSnackbarOpen(true);
      });

      // Listen for comment added event
      socket.on('comment-added', ({ productId, comment }) => {
        setWishlist(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            products: prev.products.map(product => {
              if (product._id === productId) {
                return {
                  ...product,
                  comments: [...(product.comments || []), comment]
                };
              }
              return product;
            })
          };
        });
      });

      // Listen for reaction updated event
      socket.on('reaction-updated', ({ productId, reactions }) => {
        setWishlist(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            products: prev.products.map(product => {
              if (product._id === productId) {
                return {
                  ...product,
                  reactions
                };
              }
              return product;
            })
          };
        });
      });

      // Listen for collaborator added event
      socket.on('collaborator-added', ({ wishlistId, user }) => {
        if (wishlistId === id) {
          setWishlist(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              collaborators: [...prev.collaborators, user]
            };
          });
          setSnackbarMessage(`${user.name} joined the wishlist`);
          setSnackbarOpen(true);
        }
      });

      // Listen for collaborator removed event
      socket.on('collaborator-removed', ({ wishlistId, userId }) => {
        if (wishlistId === id) {
          setWishlist(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              collaborators: prev.collaborators.filter(collab => collab._id !== userId)
            };
          });
          setSnackbarMessage('Collaborator removed');
          setSnackbarOpen(true);
        }
      });

      return () => {
        socket.off('product-added');
        socket.off('product-updated');
        socket.off('product-deleted');
        socket.off('comment-added');
        socket.off('reaction-updated');
        socket.off('collaborator-added');
        socket.off('collaborator-removed');
      };
    }
  }, [socket, id]);

  // Handle product edit
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowAddProduct(true);
  };

  // Handle product delete
  const handleProductDeleted = (productId) => {
    setWishlist(prev => ({
      ...prev,
      products: prev.products.filter(product => product._id !== productId)
    }));
  };

  // Handle product form success
  const handleProductFormSuccess = () => {
    setShowAddProduct(false);
    setEditingProduct(null);
    fetchWishlistData();
  };

  // Handle product reaction update
  const handleProductReaction = (productId) => {
    fetchWishlistData();
  };

  // Handle product comment update
  const handleProductComment = (productId) => {
    fetchWishlistData();
  };

  // Handle removing a collaborator
  const handleRemoveCollaborator = async (userId) => {
    try {
      await removeCollaborator(id, userId);
      setWishlist(prev => ({
        ...prev,
        collaborators: prev.collaborators.filter(collab => collab._id !== userId)
      }));
      setSnackbarMessage('Collaborator removed successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error removing collaborator:', error);
    }
  };

  // Copy invite link to clipboard
  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join/${wishlist.inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    setSnackbarMessage('Invite link copied to clipboard');
    setSnackbarOpen(true);
  };

  // Check if current user is the owner
  const isOwner = wishlist && currentUser && wishlist.owner._id === currentUser._id;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        Back to Wishlists
      </Button>

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
        <>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" component="h1">
                {wishlist.name}
              </Typography>
              
              {isOwner && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/wishlist/edit/${id}`)}
                >
                  Edit Wishlist
                </Button>
              )}
            </Box>
            
            {wishlist.description && (
              <Typography variant="body1" paragraph>
                {wishlist.description}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mr: 1 }}>
                Owner:
              </Typography>
              <Chip
                avatar={<Avatar>{wishlist.owner.name.charAt(0)}</Avatar>}
                label={wishlist.owner.name}
                variant="outlined"
              />
            </Box>
            
            {wishlist.collaborators?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Collaborators:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {wishlist.collaborators.map(collaborator => (
                    <Chip
                      key={collaborator._id}
                      avatar={<Avatar>{collaborator.name.charAt(0)}</Avatar>}
                      label={collaborator.name}
                      variant="outlined"
                      onDelete={isOwner ? () => handleRemoveCollaborator(collaborator._id) : undefined}
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => setShowAddProduct(true)}
              >
                Add Product
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<PersonAddIcon />}
                onClick={() => setInviteDialogOpen(true)}
              >
                Invite Others
              </Button>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 4 }} />
          
          {showAddProduct && (
            <ProductForm
              product={editingProduct}
              wishlistId={id}
              isEdit={!!editingProduct}
              onSuccess={handleProductFormSuccess}
            />
          )}
          
          <Typography variant="h5" component="h2" gutterBottom>
            Products ({wishlist.products?.length || 0})
          </Typography>
          
          {wishlist.products?.length === 0 ? (
            <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" paragraph>
                No products in this wishlist yet.
              </Typography>
              <Button
                variant="contained"
                onClick={() => setShowAddProduct(true)}
              >
                Add First Product
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {wishlist.products.map((product) => (
                <Grid item key={product._id} xs={12} sm={6} md={4}>
                  <ProductCard
                    product={product}
                    wishlistId={id}
                    onEdit={handleEditProduct}
                    onDelete={handleProductDeleted}
                    onReaction={handleProductReaction}
                    onComment={handleProductComment}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      ) : (
        <Alert severity="error">Wishlist not found</Alert>
      )}

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)}>
        <DialogTitle>Invite Collaborators</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Share this invite code or link with others to collaborate on your wishlist.
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Invite Code"
              value={wishlist?.inviteCode || ''}
              InputProps={{
                readOnly: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCopyInviteLink} variant="contained">
            Copy Invite Link
          </Button>
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

export default WishlistDetail;
