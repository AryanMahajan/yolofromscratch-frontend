import { Link } from "react-router-dom";

function DynamicNavbar() {
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="backdrop-blur-xl bg-black/40 text-white px-8 py-3 rounded-full shadow-lg flex items-center space-x-6 border border-white/20">
        <Link
          to="/"
          className="font-medium hover:text-indigo-400 transition-colors"
        >
          Home
        </Link>
        <Link
          to="/login"
          className="font-medium hover:text-indigo-400 transition-colors"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="font-medium hover:text-indigo-400 transition-colors"
        >
          Signup
        </Link>
        <Link
          to="/dashboard"
          className="font-medium hover:text-indigo-400 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}

export default DynamicNavbar;
