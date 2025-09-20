import React from 'react';

const Home: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-white">Welcome to the Home Page</h2>
            </div>
        </div>
    );
};

export default Home;