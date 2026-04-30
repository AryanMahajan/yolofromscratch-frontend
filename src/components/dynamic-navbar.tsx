import { Link, useNavigate } from "react-router-dom";
import { LogIn, UserPlus, LayoutDashboard, Home } from "lucide-react";

function DynamicNavbar() {
  const navigate = useNavigate();
  
  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <div className="backdrop-blur-xl bg-black/40 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center justify-between w-full border border-white/10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          {/* <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">Y</span>
          </div> */}
          <span className="font-black tracking-tighter text-lg hidden sm:block">
            YOLO<span className="text-purple-500">PROJECT</span>
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-6">
          <Link
            to="/"
            className="text-sm font-bold text-gray-400 hover:text-white transition-all flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5"
          >
            <Home size={16} />
            <span className="hidden md:block">Home</span>
          </Link>
          <Link
            to="/dashboard"
            className="text-sm font-bold text-gray-400 hover:text-white transition-all flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5"
          >
            <LayoutDashboard size={16} />
            <span className="hidden md:block">Dashboard</span>
          </Link>
          <div className="w-px h-4 bg-gray-800 mx-2 hidden sm:block" />
          <Link
            to="/signup"
            className="text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
          >
            <UserPlus size={16} />
            <span>Join</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default DynamicNavbar;
