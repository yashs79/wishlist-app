const Product = require('../models/product.model');
const Wishlist = require('../models/wishlist.model');

// Add a product to a wishlist
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl, wishlistId } = req.body;
    
    // Check if wishlist exists and user has access
    const wishlist = await Wishlist.findById(wishlistId);
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Check if user is owner or collaborator
    const isOwner = wishlist.owner.toString() === req.user._id.toString();
    const isCollaborator = wishlist.collaborators.some(
      collab => collab.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create new product
    const product = new Product({
      name,
      description,
      price,
      imageUrl,
      wishlist: wishlistId,
      addedBy: req.user._id,
      lastEditedBy: req.user._id
    });

    await product.save();

    // Add product to wishlist
    await Wishlist.findByIdAndUpdate(wishlistId, {
      $push: { products: product._id }
    });

    // Populate user data
    await product.populate('addedBy', 'name email');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(wishlistId).emit('product-added', product);

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('addedBy', 'name email')
      .populate('lastEditedBy', 'name email')
      .populate('comments.user', 'name email')
      .populate('reactions.user', 'name email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has access to the wishlist
    const wishlist = await Wishlist.findById(product.wishlist);
    
    const isOwner = wishlist.owner.toString() === req.user._id.toString();
    const isCollaborator = wishlist.collaborators.some(
      collab => collab.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator && wishlist.isPrivate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has access to the wishlist
    const wishlist = await Wishlist.findById(product.wishlist);
    
    const isOwner = wishlist.owner.toString() === req.user._id.toString();
    const isCollaborator = wishlist.collaborators.some(
      collab => collab.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update product
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price) product.price = price;
    if (imageUrl) product.imageUrl = imageUrl;
    
    product.lastEditedBy = req.user._id;
    
    await product.save();
    
    // Populate user data
    await product.populate('addedBy', 'name email');
    await product.populate('lastEditedBy', 'name email');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(product.wishlist.toString()).emit('product-updated', product);

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has access to the wishlist
    const wishlist = await Wishlist.findById(product.wishlist);
    
    const isOwner = wishlist.owner.toString() === req.user._id.toString();
    const isCollaborator = wishlist.collaborators.some(
      collab => collab.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove product from wishlist
    await Wishlist.findByIdAndUpdate(product.wishlist, {
      $pull: { products: product._id }
    });

    await product.remove();

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(product.wishlist.toString()).emit('product-deleted', product._id);

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a comment to a product
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has access to the wishlist
    const wishlist = await Wishlist.findById(product.wishlist);
    
    const isOwner = wishlist.owner.toString() === req.user._id.toString();
    const isCollaborator = wishlist.collaborators.some(
      collab => collab.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add comment
    const comment = {
      text,
      user: req.user._id,
      createdAt: new Date()
    };
    
    product.comments.push(comment);
    await product.save();
    
    // Get the newly added comment with populated user
    const newComment = product.comments[product.comments.length - 1];
    await product.populate('comments.user', 'name email');
    
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(product.wishlist.toString()).emit('comment-added', {
      productId: product._id,
      comment: product.comments[product.comments.length - 1]
    });

    res.status(201).json(product.comments[product.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a reaction to a product
exports.addReaction = async (req, res) => {
  try {
    const { emoji } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has access to the wishlist
    const wishlist = await Wishlist.findById(product.wishlist);
    
    const isOwner = wishlist.owner.toString() === req.user._id.toString();
    const isCollaborator = wishlist.collaborators.some(
      collab => collab.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if user already reacted with this emoji
    const existingReaction = product.reactions.findIndex(
      r => r.user.toString() === req.user._id.toString() && r.emoji === emoji
    );

    if (existingReaction !== -1) {
      // Remove reaction if it already exists (toggle behavior)
      product.reactions.splice(existingReaction, 1);
    } else {
      // Add new reaction
      product.reactions.push({
        emoji,
        user: req.user._id
      });
    }
    
    await product.save();
    
    // Populate user data
    await product.populate('reactions.user', 'name email');
    
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(product.wishlist.toString()).emit('reaction-updated', {
      productId: product._id,
      reactions: product.reactions
    });

    res.status(200).json(product.reactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
