import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login/page';
import Signup from './pages/Signup/page';
import Home from './pages/Home/page';
import Dashboard from './pages/Dashboard/page';
import History from './pages/History/page';
import ProtectedRoute from './components/ProtectedRoute';
import UploadVideo from './pages/UploadVideo/page';
import LiveDetection from './pages/LiveDetection/page';
import EmailConfirmed from './pages/EmailConfirmed/page';
import Dock from './components/Dock';
import { Home as HomeIcon, User, ScanLine, LayoutDashboard, History as HistoryIcon, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DynamicNavbar from './components/dynamic-navbar';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const showDock = !['/', '/login', '/signup', '/email-confirmed', '/email-confirm-failed'].includes(location.pathname);
  const showNavbar = ['/', '/login', '/signup'].includes(location.pathname);

  const dockItems = [
    {
      icon: <HomeIcon />,
      label: 'Home',
      onClick: () => navigate('/'),
    },
    {
      icon: <User />,
      label: 'Profile',
      onClick: () => { },
    },
    {
      icon: <LayoutDashboard />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard'),
    },
    {
      icon: <ScanLine />,
      label: 'Live Detection',
      onClick: () => navigate('/live-detection'),
    },
    {
      icon: <Video />,
      label: 'Video',
      onClick: () => navigate('/upload-video'),
    },
    {
      icon: <HistoryIcon />,
      label: 'History',
      onClick: () => navigate('/history'),
    },
  ];

  return (
    <div className="min-h-screen bg-black relative">
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
      
      {showNavbar && <DynamicNavbar />}
      
      <main className={`min-h-screen ${showDock}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/email-confirmed" element={<EmailConfirmed />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/live-detection" element={<LiveDetection />} />
            <Route path="/history" element={<History />} />
            <Route path="/upload-video" element={<UploadVideo />} />
          </Route>
        </Routes>
      </main>
      
      {showDock && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <Dock
            items={dockItems}
            panelHeight={68}
            baseItemSize={50}
            magnification={70}
          />
        </div>
      )}
    </div>
  );
}

export default App;
