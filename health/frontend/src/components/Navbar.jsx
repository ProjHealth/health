import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          MoodTrackr
        </Link>
        <div className="space-x-4">
          {!user ? (
            <>
              <Link to="/" className="text-gray-700 hover:text-indigo-600">
                Home
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Login
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600">
                Dashboard
              </Link>
              <Link to="/community" className="text-gray-700 hover:text-indigo-600">
                Communities
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
