import React, { useState } from 'react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    return (
        <div className={`flex flex-col h-screen bg-gray-800 text-white transition-width duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className="flex items-center justify-between p-4">
                <span className={`${isCollapsed ? 'hidden' : 'block'}`}>My App</span>
                <button onClick={toggleSidebar} className="text-white">
                    {isCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
                </button>
            </div>
            <nav className="flex-grow p-4">
                {/* Menu items will go here */}
            </nav>
            <div className="p-4 border-t border-gray-700">
                <div className="relative">
                    <div className="flex items-center space-x-4 cursor-pointer" onClick={toggleDropdown}>
                        <img src="https://via.placeholder.com/40" alt="User" className="w-10 h-10 rounded-full" />
                        <span className={`${isCollapsed ? 'hidden' : 'block'}`}>User Name</span>
                    </div>
                    {isDropdownOpen && (
                        <div className="absolute bottom-full left-0 w-full bg-gray-700 rounded-md shadow-lg">
                            <ul className="py-2">
                                <li className="px-4 py-2 hover:bg-gray-600 cursor-pointer">View Detail</li>
                                <li className="px-4 py-2 hover:bg-gray-600 cursor-pointer" onClick={handleLogout}>Logout</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;