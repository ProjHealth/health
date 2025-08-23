import { useState } from "react";
// import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
// import { auth, googleProvider } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import "./Register.css"; // Import the CSS file

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // You can add a name field if needed
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: email.split('@')[0] })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
      alert("Registration successful! You can now log in.");
    } catch (error) {
      alert(error.message + " !! Please enter valid credentials");
      console.error("Registration error:", error.message);
    }
  };

  // Google sign-in remains as is, or you can remove if not needed
  const handleGoogleSignIn = async () => {
    alert("Google sign-in is not implemented in the new backend.");
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

