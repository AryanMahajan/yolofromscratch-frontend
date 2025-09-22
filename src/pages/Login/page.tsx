import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GoogleLoginButton from '../../components-google/GoogleLoginButton';
import { useToast } from '../../hooks/useToast';
import LightRays from '../../components/LightRays';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();

    // Get the intended destination or default to dashboard
    const from = (location.state as any)?.from?.pathname || '/dashboard';

    // Redirect if already authenticated
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
        <div className="relative flex items-center justify-center min-h-screen bg-black text-gray-200">
            <div className="absolute top-0 left-0 w-full h-full">
                <LightRays raysColor="#BA68C8" />
            </div>
            <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-purple-400">Login</h2>
                
                {location.state?.from && (
                    <div className="bg-blue-900 border border-blue-700 rounded-md p-3 text-sm">
                        <p className="text-blue-200">Please login to access the requested page.</p>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="sr-only">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 text-gray-200 bg-gray-800 border border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 text-gray-200 bg-gray-800 border border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center px-4 py-3 font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Login'}
                    </button>
                </form>
                
                <div className="mt-6 border-t border-gray-600 pt-6 flex justify-center">
                    <GoogleLoginButton />
                </div>
                
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-medium text-purple-400 hover:text-purple-500">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;