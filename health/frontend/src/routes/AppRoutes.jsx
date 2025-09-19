import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import CommunityGroups from "../pages/CommunityGroups";
import GroupChat from "../pages/GroupChat";
import Emergency from "../pages/Emergency"; 
import ProtectedRoute from "../components/ProtectedRoute";
import Chatbot from "../pages/Chatbot";
import MoodInput  from "../pages/MoodInput";
import MoodDashboard from "../pages/MoodDash";
import AddFriend from "../pages/Addfriend";
import ChatPage from "../pages/ChatPage";
import ProfessionalHelpDashboard from "../pages/ProfessionalHelp";
import ExpertProfile from "../pages/ExpertProfile";


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
        {/* <Route path="/moodtracker" element={<ProtectedRoute><MoodTracker /></ProtectedRoute>} />
        <Route path="/moodcalendar" element={<ProtectedRoute><MoodCalendar /></ProtectedRoute>} /> */}
        <Route path="/community" element={<ProtectedRoute><CommunityGroups /></ProtectedRoute>} />
        <Route path="/groups/:groupId" element={<ProtectedRoute><GroupChat /></ProtectedRoute>} />
        <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
        <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
        <Route path="/mooddashboard" element={<ProtectedRoute><MoodDashboard /></ProtectedRoute>} />
        <Route path="/moodinput" element={<ProtectedRoute><MoodInput /></ProtectedRoute>} /> 
        <Route path="/addfriend" element={<ProtectedRoute><AddFriend /></ProtectedRoute>} />
        <Route path="/chat/:chatId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><ProfessionalHelpDashboard /></ProtectedRoute>} />
        <Route path="/expert/:expertId" element={<ExpertProfile />} /> 
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;

