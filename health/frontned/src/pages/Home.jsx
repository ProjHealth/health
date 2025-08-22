import { Link } from "react-router-dom";
import "./Homepage.css"; // Import the CSS file

const Home = () => {
  return (
    <div className="home-container">
      {/* Overlay for better readability */}
      <div className="home-overlay"></div>

      <div className="home-card">
        <h1 className="home-title">CodeStorm Wellness</h1>
        <p className="home-text">
         Your AI Friend, 24/7 Professional Support, Mood Tracker, and Emergency Help, because your mind matters.
        </p>

        <div className="home-buttons">
          <Link to="/login">
            <button className="button-blue">Login</button>
          </Link>
          <Link to="/register">
            <button className="button-green">Register</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;




