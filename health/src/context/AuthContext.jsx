import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { auth, googleProvider } from "../firebase/firebase";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";

// Create AuthContext
const AuthContext = createContext();

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Logout Function
  const logout = async () => {
    await signOut(auth);
  };

  // Google Sign-In
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Sign-In Error:", error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, loginWithGoogle }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Prop validation
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom Hook
export const useAuth = () => useContext(AuthContext);
