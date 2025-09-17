import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "./Login.css"; // Import CSS

const GOOGLE_CLIENT_ID = "998669542963-tsi7j94uvq0g0vtn580p2v0emsl6e2tm.apps.googleusercontent.com"; // Replace with your Google client ID

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      // Store JWT and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
      alert("Login successful!");
    } catch (error) {
      alert(error.message + " !! Please enter valid credentials");
      console.error("Login error:", error.message);
    }
  };

  // Google OAuth handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Send credential to backend for verification and login
      const res = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential })
        
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google login failed");
      // Store JWT and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
      alert("Google login successful!");
    } catch (error) {
      alert(error.message + " !! Google login failed");
      console.error("Google login error:", error.message);
    }
  };

  const handleGoogleError = () => {
    alert("Google sign-in failed. Please try again.");
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="login-page"> {/* Full-page background */}
        <div className="login-box">
          <h2 className="login-title">Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="login-input" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="login-input" />
            <button type="submit" className="custom-button login">Login</button>
          </form>
          <div className="or-divider"><span>OR</span></div>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            width="300"
          />
          <p className="register-text">Don't have an account?{" "}
            <a href="/register" className="register-link">Register here</a>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;

