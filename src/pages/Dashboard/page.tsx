import React from 'react';
import Sidebar from '../../components/Sidebar';

const Dashboard: React.FC = () => {
    return (
        <div className="flex h-screen bg-gray-900 text-white">
            <Sidebar />
            <main className="flex-grow p-8">
                <h2 className="text-3xl font-bold text-center text-white">Welcome to your Dashboard</h2>
            </main>
        </div>
    );
};

export default Dashboard;