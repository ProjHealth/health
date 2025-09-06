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
// import MoodTracker from "../pages/MoodTracker";
// import MoodCalendar from "../pages/MoodCalendar";
import MoodInput  from "../pages/MoodInput";
import MoodDash from "../pages/MoodDash";
import AddFriend from "../pages/Addfriend";
import ChatPage from "../pages/ChatPage";

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
        <Route path="/group/:groupId" element={<ProtectedRoute><GroupChat /></ProtectedRoute>} />
        <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
        <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
        <Route path="/mooddash" element={<ProtectedRoute><MoodDash /></ProtectedRoute>} />
        <Route path="/moodinput" element={<ProtectedRoute><MoodInput /></ProtectedRoute>} /> 
        <Route path="/addfriend" element={<ProtectedRoute><AddFriend /></ProtectedRoute>} />
        <Route path="/chat/:chatId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;

