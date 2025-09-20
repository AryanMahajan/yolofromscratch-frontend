import { Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login/page';
import Signup from './pages/Signup/page';
import Home from './pages/Home/page';
import Dashboard from './pages/Dashboard/page';
import ProtectedRoute from './components/ProtectedRoute';
import GoogleLoginButton from './components-google/GoogleLoginButton';

import EmailConfirmed from './pages/EmailConfirmed/page';

function App() {
  return (
    <div>
      <ToastContainer />
      <nav className="bg-gray-800 p-4 shadow-lg">
        <ul className="flex space-x-6">
          <li>
            <Link to="/" className="text-white font-semibold hover:text-indigo-400 transition-colors">Home</Link>
          </li>
          <li>
            <Link to="/login" className="text-white font-semibold hover:text-indigo-400 transition-colors">Login</Link>
          </li>
          <li>
            <Link to="/signup" className="text-white font-semibold hover:text-indigo-400 transition-colors">Signup</Link>
          </li>
          <li>
            <Link to="/dashboard" className="text-white font-semibold hover:text-indigo-400 transition-colors">Dashboard</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/email-confirmed" element={<EmailConfirmed />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
