import React from 'react';
import DashboardStats from '../../components/Dashboard/Stats';

const Dashboard: React.FC = () => {

    return (
        <div className="flex h-screen bg-black text-gray-200">
            <main className="flex-grow overflow-auto">
                <DashboardStats />
            </main>
        </div>
    );
};

export default Dashboard;