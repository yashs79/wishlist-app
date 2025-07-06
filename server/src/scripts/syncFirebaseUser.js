require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');

async function syncFirebaseUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'yashs4783@gmail.com';
    const firebaseUid = 'firebase-uid-for-yashs4783'; // This will be replaced with actual Firebase UID
    
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      console.log('User already exists, updating Firebase UID');
      user.firebaseUid = firebaseUid;
      await user.save();
      console.log('User updated successfully');
    } else {
      // Create new user with existing Firebase credentials
      user = new User({
        name: 'Yash',
        email: email,
        password: 'password123', // This will be hashed automatically by the User model
        firebaseUid: firebaseUid
      });
      await user.save();
      console.log('User created successfully');
    }
    
    console.log('User details:');
    console.log('Email:', email);
    console.log('Password: password123');
    console.log('Firebase UID:', firebaseUid);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error syncing user:', error);
    process.exit(1);
  }
}

syncFirebaseUser();
