const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const auth = require('../middleware/auth.middleware');

// All routes require authentication
router.use(auth);

// Wishlist routes
router.post('/', wishlistController.createWishlist);
router.get('/my', wishlistController.getMyWishlists);
router.get('/:id', wishlistController.getWishlistById);
router.put('/:id', wishlistController.updateWishlist);
router.delete('/:id', wishlistController.deleteWishlist);

// Collaborator routes
router.post('/join', wishlistController.joinWishlistByInviteCode);
router.delete('/:wishlistId/collaborators/:userId', wishlistController.removeCollaborator);
router.post('/:id/invite', wishlistController.generateNewInviteCode);

module.exports = router;
