const Wishlist = require('../models/wishlist.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');

// Create a new wishlist
exports.createWishlist = async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    
    const wishlist = new Wishlist({
      name,
      description,
      owner: req.user._id,
      isPrivate: isPrivate || false
    });

    await wishlist.save();

    // Add wishlist to user's wishlists
    await User.findByIdAndUpdate(req.user._id, {
      $push: { wishlists: wishlist._id }
    });

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('wishlist-created', wishlist);

    res.status(201).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all wishlists for current user
exports.getMyWishlists = async (req, res) => {
  try {
    const wishlists = await Wishlist.find({
      $or: [
        { owner: req.user._id },
        { collaborators: req.user._id }
      ]
    }).populate('owner', 'name email');

    res.status(200).json(wishlists);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single wishlist by ID
exports.getWishlistById = async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('collaborators', 'name email')
      .populate({
        path: 'products',
        populate: {
          path: 'addedBy',
          select: 'name email'
        }
      });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Check if user has access to this wishlist
    const isOwner = wishlist.owner._id.toString() === req.user._id.toString();
    const isCollaborator = wishlist.collaborators.some(
      collab => collab._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator && wishlist.isPrivate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a wishlist
exports.updateWishlist = async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    const wishlist = await Wishlist.findById(req.params.id);

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Check if user is the owner
    if (wishlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can update the wishlist' });
    }

    if (name) wishlist.name = name;
    if (description !== undefined) wishlist.description = description;
    if (isPrivate !== undefined) wishlist.isPrivate = isPrivate;

    await wishlist.save();

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(wishlist._id.toString()).emit('wishlist-updated', wishlist);

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a wishlist
exports.deleteWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id);

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Check if user is the owner
    if (wishlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can delete the wishlist' });
    }

    // Delete all products in the wishlist
    await Product.deleteMany({ wishlist: wishlist._id });

    // Remove wishlist from user's wishlists
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { wishlists: wishlist._id }
    });

    // Remove wishlist from collaborators' wishlists
    for (const collaboratorId of wishlist.collaborators) {
      await User.findByIdAndUpdate(collaboratorId, {
        $pull: { wishlists: wishlist._id }
      });
    }

    await wishlist.remove();

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(wishlist._id.toString()).emit('wishlist-deleted', wishlist._id);

    res.status(200).json({ message: 'Wishlist deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a collaborator to a wishlist by invite code
exports.joinWishlistByInviteCode = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    
    const wishlist = await Wishlist.findOne({ inviteCode });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    // Check if user is already a collaborator
    if (wishlist.collaborators.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already a collaborator' });
    }

    // Check if user is the owner
    if (wishlist.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You are the owner of this wishlist' });
    }

    // Add user as collaborator
    wishlist.collaborators.push(req.user._id);
    await wishlist.save();

    // Add wishlist to user's wishlists
    await User.findByIdAndUpdate(req.user._id, {
      $push: { wishlists: wishlist._id }
    });

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(wishlist._id.toString()).emit('collaborator-added', {
      wishlistId: wishlist._id,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove a collaborator from a wishlist
exports.removeCollaborator = async (req, res) => {
  try {
    const { wishlistId, userId } = req.params;
    
    const wishlist = await Wishlist.findById(wishlistId);
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Check if user is the owner or removing themselves
    if (wishlist.owner.toString() !== req.user._id.toString() && 
        userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Remove user from collaborators
    wishlist.collaborators = wishlist.collaborators.filter(
      id => id.toString() !== userId
    );
    
    await wishlist.save();

    // Remove wishlist from user's wishlists
    await User.findByIdAndUpdate(userId, {
      $pull: { wishlists: wishlist._id }
    });

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(wishlist._id.toString()).emit('collaborator-removed', {
      wishlistId: wishlist._id,
      userId
    });

    res.status(200).json({ message: 'Collaborator removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate a new invite code
exports.generateNewInviteCode = async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id);
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Check if user is the owner
    if (wishlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can generate a new invite code' });
    }

    // Generate new invite code
    wishlist.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    await wishlist.save();

    res.status(200).json({ inviteCode: wishlist.inviteCode });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
