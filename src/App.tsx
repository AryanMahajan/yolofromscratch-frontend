import { Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login/page';
import Signup from './pages/Signup/page';
import Home from './pages/Home/page';
import Dashboard from './pages/Dashboard/page';
import ProtectedRoute from './components/ProtectedRoute';
import GoogleLoginButton from './components-google/GoogleLoginButton';
import DynamicNavbar from './components/dynamic-navbar';

import EmailConfirmed from './pages/EmailConfirmed/page';

function App() {
  return (
    <div>
      <ToastContainer />
      <DynamicNavbar />
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
