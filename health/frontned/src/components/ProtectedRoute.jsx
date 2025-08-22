import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth(); // Use 'user' from AuthContext

  if (loading) return <div>Loading...</div>; // Show a loader while checking auth

  return user ? children : <Navigate to="/login" />;
};

// Prop validation
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
