import React from 'react';
import DashboardStats from '../../components/Dashboard/Stats';

const Dashboard: React.FC = () => {

    return (
        <div className="min-h-screen bg-black text-gray-200 pt-20">
            <main className="max-w-7xl mx-auto overflow-auto">
                <DashboardStats />
            </main>
        </div>
    );
};

export default Dashboard;
