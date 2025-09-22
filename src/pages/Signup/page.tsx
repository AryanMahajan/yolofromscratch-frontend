import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GoogleLoginButton from '../../components-google/GoogleLoginButton';
import { useToast } from '../../hooks/useToast';
import LightRays from '../../components/LightRays';

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

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate passwords match
        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        // Validate password strength
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
            // Handle validation errors
            if (error.response?.data) {
                const errorData = error.response.data;
                
                // Handle field-specific errors
                if (errorData.email) {
                    showToast(`Email: ${errorData.email[0]}`, 'error');
                } else if (errorData.password1) {
                    showToast(`Password: ${errorData.password1[0]}`, 'error');
                } else if (errorData.password2) {
                    showToast(`Password confirmation: ${errorData.password2[0]}`, 'error');
                } else if (errorData.non_field_errors) {
                    showToast(errorData.non_field_errors[0], 'error');
                } else {
                    // Generic error message
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
        <div className="relative flex items-center justify-center min-h-screen bg-black text-gray-200">
            <div className="absolute top-0 left-0 w-full h-full">
                <LightRays raysColor="#BA68C8" />
            </div>
            <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-purple-400">Sign Up</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex space-x-4">
                        <div>
                            <label htmlFor="firstName" className="sr-only">
                                First Name
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className="w-full px-4 py-3 text-gray-200 bg-gray-800 border border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="sr-only">
                                Last Name
                            </label>
                            <input
                                id="lastName"
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className="w-full px-4 py-3 text-gray-200 bg-gray-800 border border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                    
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
                            placeholder="Password (min. 8 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            className="w-full px-4 py-3 text-gray-200 bg-gray-800 border border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="confirmPassword" className="sr-only">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                        ) : 'Sign Up'}
                    </button>
                </form>
                
                <div className="mt-6 border-t border-gray-600 pt-6 flex justify-center">
                    <GoogleLoginButton />
                </div>
                
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-purple-400 hover:text-purple-500">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;