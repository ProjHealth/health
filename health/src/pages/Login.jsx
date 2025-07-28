import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Import CSS

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (error) {
      console.error("Google Sign-In error:", error.message);
    }
  };

  return (
    <div className="login-page"> {/* Full-page background */}
      <div className="login-box">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="login-input" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="login-input" />
          <button type="submit" className="custom-button login">Login</button>
        </form>
        <div className="or-divider"><span>OR</span></div>
        <button onClick={handleGoogleSignIn} className="custom-button google">
          <img src="https://img.icons8.com/color/24/000000/google-logo.png" alt="Google" /> Sign in with Google
        </button>
        <p className="register-text">Don't have an account?{" "}
          <a href="/register" className="register-link">Register here</a>
        </p>
      </div>
    </div>
  );
  
  


};

export default Login;

