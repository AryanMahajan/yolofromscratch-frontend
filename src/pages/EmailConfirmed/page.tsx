import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EmailConfirmed: React.FC = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/dashboard');
        }, 10000);

        const interval = setInterval(() => {
            setCountdown((prevCountdown) => prevCountdown - 1);
        }, 1000);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg text-center">
                <h2 className="text-3xl font-bold text-white">Email Confirmed!</h2>
                <p className="text-lg text-gray-400">Your email has been successfully verified.</p>
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="text-sm text-gray-500">You will be redirected to the dashboard in {countdown} seconds...</p>
            </div>
        </div>
    );
};

export default EmailConfirmed;