import { Link } from "react-router-dom";
import { FaSmile, FaRobot, FaUsers, FaExclamationTriangle, FaUserMd, FaUserPlus } from "react-icons/fa";
import "./Dashboard.css"; // Import the CSS file

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* App Name */}
      <h1 className="app-title">Mental Health App</h1>

      {/* Icons - Grid Layout */}
      <div className="dashboard-grid">
        {/* Mood Tracking */}
        <Link to="/moodtracker" className="dashboard-icon">
          <FaSmile className="icon mood" />
          <p>Mood Tracking</p>
        </Link>

        {/* AI Friend */}
        <Link to="/chatbot" className="dashboard-icon">
          <FaRobot className="icon ai" />
          <p>AI Friend</p>
        </Link>

        {/* Communities */}
        <Link to="/community" className="dashboard-icon">
          <FaUsers className="icon community" />
          <p>Communities</p>
        </Link>

        {/* Emergency */}
        <Link to="/emergency" className="dashboard-icon">
          <FaExclamationTriangle className="icon emergency" />
          <p>Emergency</p>
        </Link>

        {/* Professional Support */}
        <Link to="/support" className="dashboard-icon">
          <FaUserMd className="icon support" />
          <p>Professional Support</p>
        </Link>

        {/* Add Friend */}
        <Link to="/addfriend" className="dashboard-icon">
          <FaUserPlus className="icon add-friend" />
          <p>Add Friend</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
