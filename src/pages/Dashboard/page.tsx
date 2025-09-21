import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

const Dashboard: React.FC = () => {
    return (
        <div className="flex h-screen bg-gray-900 text-white">
            <Sidebar />
            <main className="flex-grow p-8">
                <h2 className="text-3xl font-bold text-center text-white">Welcome to your Dashboard</h2>
                <div className="flex justify-center mt-8">
                    <Link to="/live-detection">
                        <button className="px-6 py-3 font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                            Go to Live Detection
                        </button>
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;