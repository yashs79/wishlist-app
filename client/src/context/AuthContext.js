import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { auth } from '../utils/firebase';
import { register, login, getProfile } from '../utils/api';
import api from '../utils/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Register user with both Firebase and our backend
  const signup = async (name, email, password) => {
    try {
      setError('');
      let userCredential;
      let firebaseUid;
      
      try {
        // Try to create user in Firebase
        console.log('Creating user in Firebase...');
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update Firebase profile with name
        await firebaseUpdateProfile(userCredential.user, {
          displayName: name
        });
        
        firebaseUid = userCredential.user.uid;
        console.log('Firebase user created successfully with UID:', firebaseUid);
      } catch (firebaseError) {
        // If user already exists in Firebase, try to sign in instead
        if (firebaseError.code === 'auth/email-already-in-use') {
          console.log('User already exists in Firebase, attempting to sign in...');
          userCredential = await signInWithEmailAndPassword(auth, email, password);
          firebaseUid = userCredential.user.uid;
          console.log('Signed in to existing Firebase account with UID:', firebaseUid);
        } else {
          console.error('Firebase registration error:', firebaseError);
          throw firebaseError;
        }
      }
      
      // Register with our backend
      try {
        console.log('Registering user with backend...');
        await register({
          name,
          email,
          password,
          firebaseUid: firebaseUid
        });
        console.log('Backend registration successful');
      } catch (backendError) {
        // If user already exists in backend, we can continue
        if (backendError.response && backendError.response.status === 400 && 
            backendError.response.data.message.includes('already exists')) {
          console.log('User already exists in backend, proceeding with login...');
          // Try to login to get a token
          const loginResponse = await login({ email, password });
          localStorage.setItem('token', loginResponse.data.token);
          console.log('Backend login successful, token stored');
        } else {
          console.error('Backend registration error:', backendError);
          throw backendError;
        }
      }
      
      return userCredential.user;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || error.message);
      throw error;
    }
  };

  // Login user with both Firebase and our backend
  const signin = async (email, password) => {
    try {
      setError('');
      console.log('Attempting to sign in with backend directly...');
      
      // Check if this is the test user
      const isTestUser = email === 'test@example.com';
      
      // Login with our backend first
      const response = await login({ email, password });
      
      // Store JWT token
      console.log('Backend authentication successful, storing token');
      const token = response.data.token;
      localStorage.setItem('token', token);
      
      // Verify token is stored correctly
      const storedToken = localStorage.getItem('token');
      console.log('Token stored successfully:', !!storedToken);
      console.log('Token prefix:', token.substring(0, 10) + '...');
      
      // Validate the token format
      if (!token || token.trim() === '') {
        throw new Error('Invalid token received from server');
      }
      
      let userCredential;
      
      // Skip Firebase auth for test user
      if (isTestUser) {
        console.log('Using test user - skipping Firebase authentication');
        userCredential = { 
          user: { 
            email, 
            uid: 'test-user-id',
            displayName: 'Test User' 
          } 
        };
        // Set current user manually since we're skipping Firebase auth
        setCurrentUser(userCredential.user);
      } else {
        // For regular users, try Firebase auth
        console.log('Now signing in with Firebase...');
        try {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } catch (firebaseError) {
          console.warn('Firebase sign-in failed, but backend auth succeeded:', firebaseError.message);
          // Return a mock credential since we already have backend auth
          userCredential = { 
            user: { 
              email, 
              uid: 'firebase-auth-pending',
              displayName: email.split('@')[0]
            } 
          };
          // Set current user manually since Firebase auth failed
          setCurrentUser(userCredential.user);
        }
      }
      
      // Make a test API call to verify token works
      try {
        const testResponse = await api.get('/auth/verify-token');
        console.log('Token verification successful:', testResponse.data);
      } catch (verifyError) {
        console.warn('Token verification failed, but continuing:', verifyError);
      }
      
      console.log('Authentication completed successfully');
      return userCredential.user;
    } catch (error) {
      console.error('Authentication error:', error);
      // Clear any partial auth state
      localStorage.removeItem('token');
      setError(error.response?.data?.message || error.message);
      throw error;
    }
  };

  // Logout user
  const signout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      setCurrentUser(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Get user profile from our backend
  const fetchUserProfile = async () => {
    try {
      const response = await getProfile();
      setCurrentUser(prev => ({
        ...prev,
        ...response.data
      }));
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Check if token is valid and refresh if needed
  const validateToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found in localStorage');
      return false;
    }
    
    try {
      // Try to use the token to get user profile
      console.log('Validating token...');
      const profileResponse = await getProfile();
      console.log('Token is valid, user profile retrieved:', profileResponse.data.email);
      
      // Update current user with profile data if we don't have a current user yet
      if (!currentUser) {
        setCurrentUser({
          email: profileResponse.data.email,
          uid: profileResponse.data._id,
          displayName: profileResponse.data.name,
          profile: profileResponse.data
        });
      }
      
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      // If token is invalid, clear it
      if (error.response && error.response.status === 401) {
        console.warn('Token is invalid, clearing from storage');
        localStorage.removeItem('token');
      }
      return false;
    }
  };

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Validate token first
          const isTokenValid = await validateToken();
          
          if (!isTokenValid) {
            console.log('Token invalid or missing, attempting to refresh...');
            // If token is invalid, try to get a new one
            try {
              // Get a new token from backend
              const response = await login({
                email: user.email,
                firebaseUid: user.uid
              });
              
              localStorage.setItem('token', response.data.token);
              console.log('Token refreshed successfully');
            } catch (refreshError) {
              console.error('Failed to refresh token:', refreshError);
            }
          }
          
          // Get user profile from our backend
          const profileResponse = await getProfile();
          setCurrentUser({
            ...user,
            profile: profileResponse.data
          });
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem('token'); // Clear token when user signs out
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    signin,
    signout,
    fetchUserProfile,
    error,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
