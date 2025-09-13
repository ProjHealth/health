import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import CommunityGroups from "../pages/CommunityGroups";
import GroupChat from "../pages/GroupChat";
import Emergency from "../pages/Emergency"; // ✅ Import Emergency Page
import ProtectedRoute from "../components/ProtectedRoute";
import Chatbot from "../pages/Chatbot";
import MoodInput  from "../pages/MoodInput";
import MoodDashboard from "../pages/MoodDash";


const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes (Requires Authentication) */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><CommunityGroups /></ProtectedRoute>} />
        <Route path="/groups/:groupId" element={<ProtectedRoute><GroupChat /></ProtectedRoute>} />
        <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
        <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
        <Route path="/mooddashboard" element={<ProtectedRoute><MoodDashboard /></ProtectedRoute>} />
        <Route path="/moodinput" element={<ProtectedRoute><MoodInput /></ProtectedRoute>} /> 
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;

