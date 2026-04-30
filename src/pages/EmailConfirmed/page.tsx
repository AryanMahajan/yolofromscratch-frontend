import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import SpotlightCard from '../../components/SpotlightCard';
import LightRays from '../../components/LightRays';

const EmailConfirmed: React.FC = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/login');
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
        <div className="relative flex items-center justify-center min-h-screen bg-black text-white overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <LightRays raysColor="#10B981" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent_70%)]" />
            </div>

            <div className="relative z-10 w-full max-w-md px-4">
                <SpotlightCard className="p-8 text-center border border-emerald-500/20" spotlightColor="rgba(16, 185, 129, 0.2)">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-emerald-500" size={40} />
                    </div>
                    
                    <h2 className="text-3xl font-black text-white mb-2">Email Verified!</h2>
                    <p className="text-gray-400 font-medium mb-8">
                        Your account is now fully active and ready for object detection.
                    </p>
                    
                    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800 mb-8">
                        <div className="flex items-center justify-center gap-3 text-sm text-gray-500 mb-4 font-bold uppercase tracking-widest">
                            <Loader2 className="animate-spin text-emerald-500" size={16} />
                            Redirecting
                        </div>
                        <p className="text-sm text-gray-400">
                            Taking you to the login page in <span className="text-white font-black">{countdown}</span> seconds...
                        </p>
                    </div>
                    
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl flex items-center justify-center transition-all transform hover:-translate-y-1 shadow-lg shadow-emerald-500/20"
                    >
                        Go to Login Now
                        <ArrowRight className="ml-2" size={20} />
                    </button>
                </SpotlightCard>
            </div>
        </div>
    );
};

export default EmailConfirmed;
