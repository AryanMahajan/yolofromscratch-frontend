import React, { useState } from 'react';
import { FaAngleLeft, FaAngleRight, FaUser, FaHistory, FaVideo, FaTachometerAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';

const Sidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // Add error boundary for auth context
    let authData;
    try {
        authData = useAuth();
    } catch (error) {
        console.error('Auth context error:', error);
        authData = { user: null, logout: async () => {}, isAuthenticated: false };
    }
    
    const { user, logout, isAuthenticated } = authData;
    const { showToast } = useToast();
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
        // Close dropdown when collapsing sidebar
        if (!isCollapsed) {
            setIsDropdownOpen(false);
        }
    };

    const toggleDropdown = () => {
        if (!isCollapsed) {
            setIsDropdownOpen(!isDropdownOpen);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            showToast('Logged out successfully', 'success');
            navigate('/login');
        } catch (error) {
            showToast('Error logging out', 'error');
        }
    };

    const getDisplayName = () => {
        if (!user) return 'Guest';
        if (user.first_name && user.last_name) {
            return `${user.first_name} ${user.last_name}`;
        }
        return user.username || user.email;
    };

    const getInitials = () => {
        if (!user) return 'G';
        if (user.first_name && user.last_name) {
            return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
        }
        return (user.username || user.email)[0].toUpperCase();
    };

    // Navigation items - only show if authenticated
    const navigationItems = isAuthenticated ? [
        {
            icon: FaTachometerAlt,
            label: 'Dashboard',
            path: '/dashboard',
        },
        {
            icon: FaVideo,
            label: 'Live Detection',
            path: '/live-detection',
        },
        {
            icon: FaHistory,
            label: 'History',
            path: '/history',
        },
    ] : [];

    return (
        <div className={`flex flex-col h-screen bg-gray-800 text-white transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <span className={`font-bold text-lg ${isCollapsed ? 'hidden' : 'block'}`}>
                    YOLO App
                </span>
                <button 
                    onClick={toggleSidebar} 
                    className="text-white hover:text-purple-400 transition-colors p-1"
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-grow p-4">
                <ul className="space-y-2">
                    {navigationItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors ${
                                    isCollapsed ? 'justify-center' : 'justify-start'
                                }`}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <item.icon className="text-lg" />
                                <span className={`ml-3 ${isCollapsed ? 'hidden' : 'block'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* User Section */}
            {isAuthenticated && user && (
                <div className="p-4 border-t border-gray-700">
                    <div className="relative">
                        <div 
                            className={`flex items-center cursor-pointer hover:bg-gray-700 rounded-lg p-2 transition-colors ${
                                isCollapsed ? 'justify-center' : 'space-x-3'
                            }`}
                            onClick={toggleDropdown}
                            title={isCollapsed ? getDisplayName() : undefined}
                        >
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-semibold">
                                {getInitials()}
                            </div>
                            
                            {/* User info - only show when expanded */}
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">
                                        {getDisplayName()}
                                    </div>
                                    <div className="text-xs text-gray-400 truncate">
                                        {user.email}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && !isCollapsed && (
                            <div className="absolute bottom-full left-0 w-full bg-gray-700 rounded-lg shadow-lg mb-2 z-50">
                                <div className="py-2">
                                    <div className="px-4 py-2 border-b border-gray-600">
                                        <div className="font-medium text-sm">{getDisplayName()}</div>
                                        <div className="text-xs text-gray-400">{user.email}</div>
                                    </div>
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-600 transition-colors flex items-center"
                                        onClick={() => {
                                            navigate('/profile');
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        <FaUser className="mr-2" />
                                        Profile Settings
                                    </button>
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-600 text-red-400 hover:text-red-300 transition-colors"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Tooltip for collapsed state */}
                        {isCollapsed && isDropdownOpen && (
                            <div className="absolute bottom-full left-full ml-2 bg-gray-700 rounded-lg shadow-lg mb-2 z-50 min-w-max">
                                <div className="py-2 px-3">
                                    <div className="font-medium text-sm whitespace-nowrap">{getDisplayName()}</div>
                                    <div className="text-xs text-gray-400 whitespace-nowrap">{user.email}</div>
                                    <hr className="my-2 border-gray-600" />
                                    <button
                                        className="text-sm hover:text-purple-400 transition-colors block w-full text-left py-1"
                                        onClick={() => {
                                            navigate('/profile');
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        Profile
                                    </button>
                                    <button
                                        className="text-sm text-red-400 hover:text-red-300 transition-colors block w-full text-left py-1"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Login prompt for non-authenticated users */}
            {!isAuthenticated && (
                <div className="p-4 border-t border-gray-700">
                    <Link
                        to="/login"
                        className={`flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 px-4 transition-colors ${
                            isCollapsed ? 'w-12 h-12' : 'w-full'
                        }`}
                        title={isCollapsed ? 'Login' : undefined}
                    >
                        <FaUser className={isCollapsed ? 'text-lg' : 'mr-2'} />
                        {!isCollapsed && 'Login'}
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Sidebar;