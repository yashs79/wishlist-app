const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware - Headers:', req.headers);
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('Auth middleware - No token provided');
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log('Auth middleware - Token received, verifying...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Token verified, finding user...');
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log('Auth middleware - User not found');
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('Auth middleware - User authenticated:', user.email);
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth middleware - Authentication error:', error.message);
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

module.exports = auth;
