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
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase profile with name
      await firebaseUpdateProfile(userCredential.user, { displayName: name });
      
      // Register user in our backend
      const response = await register({ 
        name, 
        email, 
        password,
        firebaseUid: userCredential.user.uid 
      });
      
      // Store JWT token
      localStorage.setItem('token', response.data.token);
      
      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Login user with both Firebase and our backend
  const signin = async (email, password) => {
    try {
      setError('');
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Login to our backend
      const response = await login({ email, password });
      
      // Store JWT token
      localStorage.setItem('token', response.data.token);
      
      return userCredential.user;
    } catch (error) {
      setError(error.message);
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

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
        
        // If we have a token, fetch additional user data from our backend
        if (localStorage.getItem('token')) {
          await fetchUserProfile();
        }
      } else {
        setCurrentUser(null);
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
