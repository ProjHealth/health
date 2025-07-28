import { Link } from "react-router-dom";

const CommunityGroups = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      {/* Page Heading */}
      <h1 className="text-3xl font-bold text-indigo-600 mb-8 text-center">
        Community Support Groups
      </h1>

      {/* Support Groups List */}
      <div className="w-full max-w-sm space-y-6">
        {/* Anxiety Support Group */}
        <Link to="/group/Anxiety Support" className="group-box">
          Anxiety Support Group
        </Link>

        {/* Depression Support Group */}
        <Link to="/group/Depression Support" className="group-box">
          Depression Support Group
        </Link>
      </div>
    </div>
  );
};

export default CommunityGroups;

