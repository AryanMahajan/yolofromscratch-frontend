import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login/page';
import Signup from './pages/Signup/page';
import Home from './pages/Home/page';
import Dashboard from './pages/Dashboard/page';
import History from './pages/History/page';
import ProtectedRoute from './components/ProtectedRoute';
import DynamicNavbar from './components/dynamic-navbar';
import LiveDetection from './pages/LiveDetection/page';
import EmailConfirmed from './pages/EmailConfirmed/page';

function App() {
  return (
    <div>
      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <DynamicNavbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/email-confirmed" element={<EmailConfirmed />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/live-detection" element={<LiveDetection />} />
          <Route path="/history" element={<History />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
