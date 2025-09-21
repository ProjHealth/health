import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  FaSmile, 
  FaRobot, 
  FaUsers, 
  FaExclamationTriangle, 
  FaUserMd, 
  FaUserPlus,
  FaHeart,
  FaStar,
  FaLeaf
} from "react-icons/fa";
import "./Dashboard.css";

const Dashboard = () => {
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Dynamic greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else if (hour < 21) setGreeting("Good Evening");
    else setGreeting("Good Night");

    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Dashboard items with enhanced data
  const dashboardItems = [
    {
      to: "/mooddashboard",
      icon: FaSmile,
      title: "Mood Tracking",
      subtitle: "Track your daily wellness",
      color: "mood",
      badge: null
    },
    {
      to: "/chatbot:chatid",
      icon: FaRobot,
      title: "AI Friend",
      subtitle: "24/7 companion support",
      color: "ai",
      badge: "NEW"
    },
    {
      to: "/community",
      icon: FaUsers,
      title: "Communities",
      subtitle: "Connect with others",
      color: "community",
      badge: null
    },
    {
      to: "/emergency",
      icon: FaExclamationTriangle,
      title: "Emergency",
      subtitle: "Immediate help & resources",
      color: "emergency",
      badge: "24/7"
    },
    {
      to: "/support",
      icon: FaUserMd,
      title: "Professional Support",
      subtitle: "Expert guidance",
      color: "support",
      badge: null
    },
    {
      to: "/addfriend",
      icon: FaUserPlus,
      title: "Connect & Follow",
      subtitle: "Build your support network",
      color: "add-friend",
      badge: null
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Decorative floating elements */}
      <div className="floating-elements">
        <div className="floating-element heart">
          <FaHeart />
        </div>
        <div className="floating-element star">
          <FaStar />
        </div>
        <div className="floating-element leaf">
          <FaLeaf />
        </div>
      </div>

      {/* Header Section */}
      <div className="dashboard-header">
        <div className="greeting-section">
          <h2 className="greeting">{greeting}! 👋</h2>
          <p className="time-display">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        
        <h1 className="app-title">
          <span className="title-main">AuraAlly</span>
          <div className="title-tagline">Your mind matters ✨</div>
        </h1>
      </div>

      {/* Quick Stats Bar */}
      <div className="quick-stats">
        <div className="stat-item">
          <FaHeart className="stat-icon" />
          <div className="stat-content">
            <span className="stat-number">7</span>
            <span className="stat-label">Days Active</span>
          </div>
        </div>
        <div className="stat-item">
          <FaSmile className="stat-icon" />
          <div className="stat-content">
            <span className="stat-number">Good</span>
            <span className="stat-label">Today's Mood</span>
          </div>
        </div>
        <div className="stat-item">
          <FaUsers className="stat-icon" />
          <div className="stat-content">
            <span className="stat-number">12</span>
            <span className="stat-label">Connections</span>
          </div>
        </div>
      </div>

      {/* Icons Grid */}
      <div className="dashboard-grid">
        {dashboardItems.map((item, index) => (
          <Link 
            key={index}
            to={item.to} 
            className={`dashboard-icon ${item.color === 'emergency' ? 'emergency-pulse' : ''}`}
          >
            {/* Badge */}
            {item.badge && (
              <div className={`icon-badge ${item.color === 'emergency' ? 'emergency-badge' : 'new-badge'}`}>
                {item.badge}
              </div>
            )}
            
            {/* Icon */}
            <div className="icon-container">
              <item.icon className={`icon ${item.color}`} />
              <div className="icon-glow"></div>
            </div>
            
            {/* Text Content */}
            <div className="icon-text">
              <p className="icon-title">{item.title}</p>
              <p className="icon-subtitle">{item.subtitle}</p>
            </div>
            
            {/* Hover Effect Overlay */}
            <div className="hover-overlay"></div>
          </Link>
        ))}
      </div>

      {/* Bottom Wellness Quote */}
      <div className="wellness-quote">
        <p>"Take care of your mind, it's the only place you have to live." 💙</p>
      </div>
    </div>
  );
};

export default Dashboard;