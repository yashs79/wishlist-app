const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Generate a random invite code when creating a new wishlist
wishlistSchema.pre('save', function(next) {
  if (this.isNew && !this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
