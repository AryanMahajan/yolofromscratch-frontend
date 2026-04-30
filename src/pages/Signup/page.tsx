import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GoogleLoginButton from '../../components-google/GoogleLoginButton';
import { useToast } from '../../hooks/useToast';
import LightRays from '../../components/LightRays';
import SpotlightCard from '../../components/SpotlightCard';
import { User, Mail, Lock, UserPlus, Loader2 } from 'lucide-react';

const Signup: React.FC = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        if (password.length < 8) {
            showToast('Password must be at least 8 characters long', 'error');
            return;
        }

        setLoading(true);
        
        try {
            await register({
                first_name: firstName,
                last_name: lastName,
                email,
                password1: password,
                password2: confirmPassword,
            });
            showToast('Registration successful! Please check your email to verify your account.', 'success');
            navigate('/login');
        } catch (error: any) {
            if (error.response?.data) {
                const errorData = error.response.data;
                if (errorData.email) {
                    showToast(`Email: ${errorData.email[0]}`, 'error');
                } else if (errorData.password1) {
                    showToast(`Password: ${errorData.password1[0]}`, 'error');
                } else if (errorData.password2) {
                    showToast(`Password confirmation: ${errorData.password2[0]}`, 'error');
                } else if (errorData.non_field_errors) {
                    showToast(errorData.non_field_errors[0], 'error');
                } else {
                    const firstError = Object.values(errorData)[0];
                    if (Array.isArray(firstError)) {
                        showToast(firstError[0], 'error');
                    } else {
                        showToast('Registration failed. Please try again.', 'error');
                    }
                }
            } else {
                showToast('Registration failed. Please try again.', 'error');
            }
            console.error('Signup failed', error);
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

            <div className="relative z-10 w-full max-w-lg px-4 py-12">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black tracking-tighter text-white mb-2">
                        YOLO<span className="text-purple-500">PROJECT</span>
                    </h1>
                    <p className="text-gray-400 font-medium">Join us to start detecting objects in real-time.</p>
                </div>

                <SpotlightCard className="p-8" spotlightColor="rgba(168, 85, 247, 0.2)">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-center">
                        <UserPlus className="mr-2 text-purple-500" size={24} />
                        Create Account
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 ml-1">First Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-purple-500 text-gray-500">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="John"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white placeholder:text-gray-600"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 ml-1">Last Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-purple-500 text-gray-500">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Doe"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white placeholder:text-gray-600"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-purple-500 text-gray-500">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white placeholder:text-gray-600"
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-purple-500 text-gray-500">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white placeholder:text-gray-600"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-purple-500 text-gray-500">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white placeholder:text-gray-600"
                                    />
                                </div>
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
                                'Create Account'
                            )}
                        </button>
                    </form>
                    
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-800"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-transparent px-2 text-gray-500">Or sign up with</span>
                        </div>
                    </div>
                    
                    <div className="flex justify-center">
                        <GoogleLoginButton />
                    </div>
                    
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-purple-400 hover:text-purple-300 transition-colors">
                                Log in instead
                            </Link>
                        </p>
                    </div>
                </SpotlightCard>
            </div>
        </div>
    );
};

export default Signup;
