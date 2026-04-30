import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GoogleLoginButton from '../../components-google/GoogleLoginButton';
import { useToast } from '../../hooks/useToast';
import LightRays from '../../components/LightRays';
import SpotlightCard from '../../components/SpotlightCard';
import { Mail, Lock, LogIn, Loader2, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();

    const from = (location.state as any)?.from?.pathname || '/dashboard';

    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            await login(email, password);
            showToast('Login successful!', 'success');
            navigate(from, { replace: true });
        } catch (error: any) {
            if (error.response?.data?.non_field_errors) {
                showToast(error.response.data.non_field_errors[0], 'error');
            } else if (error.response?.data?.detail) {
                showToast(error.response.data.detail, 'error');
            } else {
                showToast('Login failed. Please check your credentials.', 'error');
            }
            console.error('Login failed', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-black text-gray-200 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <LightRays raysColor="#A855F7" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1),transparent_70%)]" />
            </div>

            <div className="relative z-10 w-full max-w-md px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black tracking-tighter text-white mb-2">
                        YOLO<span className="text-purple-500">PROJECT</span>
                    </h1>
                    <p className="text-gray-400 font-medium">Welcome back! Please enter your details.</p>
                </div>

                <SpotlightCard className="p-8" spotlightColor="rgba(168, 85, 247, 0.2)">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-center">
                        <LogIn className="mr-2 text-purple-500" size={24} />
                        Sign In
                    </h2>
                    
                    {location.state?.from && (
                        <div className="mb-6 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex items-start">
                            <AlertCircle className="text-purple-400 mr-3 shrink-0" size={18} />
                            <p className="text-purple-300 text-sm">Please login to access the requested page.</p>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-purple-500 text-gray-500">
                                    <Mail size={18} />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-medium text-gray-400">Password</label>
                                <Link to="#" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Forgot password?</Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-purple-500 text-gray-500">
                                    <Lock size={18} />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all duration-300 mt-4 ${
                                loading 
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 transform hover:-translate-y-1 active:translate-y-0'
                            }`}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                    
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-800"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-transparent px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>
                    
                    <div className="flex justify-center">
                        <GoogleLoginButton />
                    </div>
                    
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-bold text-purple-400 hover:text-purple-300 transition-colors">
                                Sign up for free
                            </Link>
                        </p>
                    </div>
                </SpotlightCard>
            </div>
        </div>
    );
};

export default Login;
