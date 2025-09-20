import { Link } from "react-router-dom";

function DynamicNavbar() {
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 md:w-2/3">
      <div className="backdrop-blur-xl bg-black/40 text-white px-12 py-4 rounded-full shadow-lg flex items-center justify-between w-full border border-white/20">
        <div className="flex items-center space-x-6">
          <Link
            to="/"
            className="font-medium hover:text-purple-400 transition-colors"
          >
            Home
          </Link>
        </div>
        <div className="flex items-center space-x-6">
          <Link
            to="#"
            className="font-medium hover:text-purple-400 transition-colors"
          >
            Resources
          </Link>
          <Link
            to="/signup"
            className="font-medium hover:text-purple-400 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default DynamicNavbar;
