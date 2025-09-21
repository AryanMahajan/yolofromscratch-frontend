import React from 'react';

const Dashboard: React.FC = () => {

    return (
        <div className="flex h-screen bg-black text-gray-200">
            <main className="flex-grow p-8">
                <h2 className="text-3xl font-bold text-center text-purple-400">Welcome to your Dashboard</h2>
            </main>
        </div>
    );
};

export default Dashboard;