import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CommentIcon from '@mui/icons-material/Comment';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { useAuth } from '../../context/AuthContext';
import { deleteProduct, addComment, addReaction } from '../../utils/api';

// Placeholder image for products without an image URL
const placeholderImage = 'https://via.placeholder.com/300x200?text=No+Image';

// Common emoji reactions
const emojis = ['👍', '❤️', '🎉', '😍', '🙌', '🔥'];

const ProductCard = ({ product, wishlistId, onEdit, onDelete, onReaction, onComment }) => {
  const { currentUser } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const isOwner = product.addedBy._id === currentUser._id;
  
  // Format price to display as currency
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(product.price);
  
  // Handle menu open/close
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  // Handle emoji menu open/close
  const handleOpenEmojiMenu = (event) => {
    setEmojiAnchorEl(event.currentTarget);
  };
  
  const handleCloseEmojiMenu = () => {
    setEmojiAnchorEl(null);
  };
  
  // Handle comment dialog open/close
  const handleOpenCommentDialog = () => {
    setCommentDialogOpen(true);
  };
  
  const handleCloseCommentDialog = () => {
    setCommentDialogOpen(false);
    setCommentText('');
  };
  
  // Handle edit product
  const handleEdit = () => {
    onEdit(product);
    handleCloseMenu();
  };
  
  // Handle delete product
  const handleDelete = async () => {
    try {
      await deleteProduct(product._id);
      onDelete(product._id);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
    handleCloseMenu();
  };
  
  // Handle adding a reaction
  const handleReaction = async (emoji) => {
    try {
      await addReaction(product._id, emoji);
      onReaction(product._id);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
    handleCloseEmojiMenu();
  };
  
  // Handle adding a comment
  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      setLoading(true);
      await addComment(product._id, commentText);
      onComment(product._id);
      handleCloseCommentDialog();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Count reactions by emoji
  const reactionCounts = product.reactions?.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={product.imageUrl || placeholderImage}
        alt={product.name}
        sx={{ objectFit: 'cover' }}
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {product.name}
          </Typography>
          
          <Box>
            <IconButton aria-label="settings" onClick={handleOpenMenu} size="small">
              <MoreVertIcon />
            </IconButton>
            <Menu
              id={`product-menu-${product._id}`}
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={handleEdit}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Edit" />
              </MenuItem>
              <MenuItem onClick={handleDelete}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Delete" />
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        <Typography variant="h6" color="primary" gutterBottom>
          {formattedPrice}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {product.description || 'No description provided'}
        </Typography>
        
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Added by: {product.addedBy.name}
          </Typography>
        </Box>
        
        {product.lastEditedBy && product.lastEditedBy._id !== product.addedBy._id && (
          <Typography variant="caption" color="text.secondary" display="block">
            Last edited by: {product.lastEditedBy.name}
          </Typography>
        )}
        
        {/* Display reaction counts */}
        {Object.keys(reactionCounts || {}).length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <Chip 
                key={emoji} 
                label={`${emoji} ${count}`} 
                size="small" 
                variant="outlined"
              />
            ))}
          </Box>
        )}
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Box>
          <Tooltip title="Add reaction">
            <IconButton onClick={handleOpenEmojiMenu} size="small">
              <EmojiEmotionsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Menu
            id={`emoji-menu-${product._id}`}
            anchorEl={emojiAnchorEl}
            keepMounted
            open={Boolean(emojiAnchorEl)}
            onClose={handleCloseEmojiMenu}
          >
            <Box sx={{ display: 'flex', p: 1 }}>
              {emojis.map((emoji) => (
                <IconButton 
                  key={emoji} 
                  onClick={() => handleReaction(emoji)}
                  size="small"
                >
                  {emoji}
                </IconButton>
              ))}
            </Box>
          </Menu>
          
          <Tooltip title="Add comment">
            <IconButton onClick={handleOpenCommentDialog} size="small">
              <CommentIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box>
          {product.comments && (
            <Chip 
              icon={<CommentIcon fontSize="small" />} 
              label={product.comments.length} 
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </CardActions>
      
      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen} onClose={handleCloseCommentDialog}>
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="comment"
            label="Your comment"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          
          {product.comments && product.comments.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Previous Comments
              </Typography>
              {product.comments.map((comment, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {comment.user.name}:
                  </Typography>
                  <Typography variant="body2">{comment.text}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(comment.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCommentDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitComment} 
            disabled={!commentText.trim() || loading}
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ProductCard;
