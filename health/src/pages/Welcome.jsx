import { Link } from "react-router-dom";

const Welcome = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-indigo-600">Welcome to the Mental Health App</h1>
        <p className="text-gray-600 mt-2">Your safe space to track your mood and find support.</p>
        <div className="mt-4 flex gap-4">
          <Link to="/signin" className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow">
            Sign In
          </Link>
          <Link to="/signup" className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
