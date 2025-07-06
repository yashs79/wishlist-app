const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const auth = require('../middleware/auth.middleware');

// All routes require authentication
router.use(auth);

// Product routes
router.post('/', productController.addProduct);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Comment and reaction routes
router.post('/:id/comments', productController.addComment);
router.post('/:id/reactions', productController.addReaction);

module.exports = router;
