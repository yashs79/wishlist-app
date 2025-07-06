import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Avatar, 
  Menu, 
  MenuItem, 
  Tooltip,
  Container
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

const Navbar = () => {
  const { currentUser, signout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    try {
      await signout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
    handleCloseMenu();
  };
  
  const handleProfile = () => {
    navigate('/profile');
    handleCloseMenu();
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <ShoppingBagIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            FLOCKSHOP
          </Typography>
          
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {currentUser && (
              <>
                <Button
                  component={RouterLink}
                  to="/"
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  My Wishlists
                </Button>
                <Button
                  component={RouterLink}
                  to="/create-wishlist"
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  Create Wishlist
                </Button>
              </>
            )}
          </Box>
          
          <Box sx={{ flexGrow: 0 }}>
            {currentUser ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenMenu} sx={{ p: 0 }}>
                    <Avatar 
                      alt={currentUser.name || currentUser.displayName} 
                      src={currentUser.avatar || currentUser.photoURL} 
                    />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                >
                  <MenuItem onClick={handleProfile}>
                    <Typography textAlign="center">Profile</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex' }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  sx={{ color: 'white' }}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/signup"
                  sx={{ color: 'white' }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
