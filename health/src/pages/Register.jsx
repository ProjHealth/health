import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import "./Register.css"; // Import the CSS file

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard"); // Redirect after successful registration
    } catch (error) {
      console.error("Registration error:", error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard"); // Redirect after Google Sign-In
    } catch (error) {
      console.error("Google Sign-In error:", error.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2 className="register-title">Register</h2>

        <form onSubmit={handleRegister}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="register-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="register-input"
          />

          <button type="submit" className="register-button">
            Register
          </button>
        </form>

        <div className="register-divider">
          <hr className="register-divider-line" />
          <span className="register-or">OR</span>
          <hr className="register-divider-line" />
        </div>

        <button onClick={handleGoogleSignIn} className="register-google">
          <img src="https://img.icons8.com/color/24/000000/google-logo.png" alt="Google" />
          Sign up with Google
        </button>

        <p className="register-text">
          Already have an account?{" "}
          <a href="/login" className="register-link">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;

