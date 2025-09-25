import React from 'react';

const Dashboard: React.FC = () => {

    return (
        <div className="flex h-screen bg-black text-gray-200">
            <main className="flex-grow p-8">
                <h2 className="text-3xl font-bold text-center text-purple-400"><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">Welcome to your Dashboard</span></h2>
            </main>
        </div>
    );
};

export default Dashboard;