require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');

async function createCustomUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'yashs4783@gmail.com';
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists with this email');
      await mongoose.disconnect();
      return;
    }

    // Create custom user
    const customUser = new User({
      name: 'Yash',
      email: email,
      password: 'password123',
      firebaseUid: 'custom-firebase-uid'
    });

    await customUser.save();
    console.log('User created successfully');
    console.log('Email:', email);
    console.log('Password: password123');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }
}

createCustomUser();
