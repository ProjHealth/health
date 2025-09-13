import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
// import { auth, googleProvider } from "../firebase/firebase";
// import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";

// Create AuthContext
const AuthContext = createContext();

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    // On mount, check localStorage for user and token
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  // Logout Function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  // Google Sign-In (not implemented)
  const loginWithGoogle = async () => {
    alert("Google sign-in is not implemented in the new backend.");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, logout, loginWithGoogle }}>
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
