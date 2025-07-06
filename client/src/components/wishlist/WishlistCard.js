import React from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Button, 
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useAuth } from '../../context/AuthContext';

const WishlistCard = ({ wishlist, onDelete, onShare }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  const isOwner = wishlist.owner._id === currentUser._id;
  
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleView = () => {
    navigate(`/wishlist/${wishlist._id}`);
  };
  
  const handleEdit = () => {
    navigate(`/wishlist/edit/${wishlist._id}`);
    handleCloseMenu();
  };
  
  const handleDelete = () => {
    onDelete(wishlist._id);
    handleCloseMenu();
  };
  
  const handleShare = () => {
    onShare(wishlist);
    handleCloseMenu();
  };

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: 3
      }
    }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2" noWrap>
            {wishlist.name}
          </Typography>
          {isOwner && (
            <IconButton aria-label="settings" onClick={handleOpenMenu}>
              <MoreVertIcon />
            </IconButton>
          )}
          <Menu
            id={`wishlist-menu-${wishlist._id}`}
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
            <MenuItem onClick={handleShare}>
              <ListItemIcon>
                <ShareIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Share" />
            </MenuItem>
            <MenuItem onClick={handleDelete}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Delete" />
            </MenuItem>
          </Menu>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {wishlist.description || 'No description'}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Items: {wishlist.products?.length || 0}
          </Typography>
          <Chip 
            icon={wishlist.isPrivate ? <LockIcon /> : <LockOpenIcon />}
            label={wishlist.isPrivate ? 'Private' : 'Public'}
            size="small"
            color={wishlist.isPrivate ? 'default' : 'primary'}
          />
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Owner: {wishlist.owner.name}
          </Typography>
          {wishlist.collaborators?.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              Collaborators: {wishlist.collaborators.length}
            </Typography>
          )}
        </Box>
      </CardContent>
      
      <CardActions>
        <Button size="small" onClick={handleView}>View Wishlist</Button>
      </CardActions>
    </Card>
  );
};

export default WishlistCard;
