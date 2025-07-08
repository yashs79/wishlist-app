const axios = require('axios');

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

async function loginAndGetToken() {
  try {
    console.log('Attempting to login with test user...');
    const response = await axios.post('http://localhost:5001/api/auth/login', testUser);
    
    if (response.data && response.data.token) {
      console.log('Login successful!');
      console.log('Token:', response.data.token);
      console.log('\nTo use this token in your browser:');
      console.log('1. Open browser console (F12)');
      console.log('2. Run: localStorage.setItem("token", "' + response.data.token + '")');
      console.log('3. Refresh the page');
      
      // Test the token by fetching wishlists
      try {
        const wishlistResponse = await axios.get('http://localhost:5001/api/wishlists/my', {
          headers: {
            'Authorization': `Bearer ${response.data.token}`
          }
        });
        console.log('\nWishlists fetched successfully:');
        console.log(wishlistResponse.data);
      } catch (error) {
        console.error('\nError fetching wishlists:', error.message);
      }
      
    } else {
      console.log('Login failed - no token received');
    }
  } catch (error) {
    if (error.response) {
      console.error('Login failed:', error.response.data);
      
      // If user doesn't exist, try to register first
      if (error.response.status === 401) {
        console.log('\nAttempting to register test user first...');
        try {
          await axios.post('http://localhost:5001/api/auth/register', {
            ...testUser,
            name: 'Test User'
          });
          console.log('Registration successful, trying login again...');
          await loginAndGetToken();
        } catch (regError) {
          console.error('Registration failed:', regError.response?.data || regError.message);
        }
      }
    } else {
      console.error('Error:', error.message);
    }
  }
}

loginAndGetToken();
