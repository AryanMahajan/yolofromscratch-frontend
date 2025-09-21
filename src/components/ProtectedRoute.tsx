import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const { showToast } = useToast();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Verifying authentication...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, show toast and redirect to login
    if (!isAuthenticated) {
        // Only show toast for protected routes, not for initial page loads
        if (location.pathname !== '/login' && location.pathname !== '/signup') {
            showToast('You must be logged in to access this page.', 'error');
        }
        // Pass the current location so user can be redirected back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated, render the protected component
    return <Outlet />;
};

export default ProtectedRoute;