import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useToast } from '../hooks/useToast';

const ProtectedRoute: React.FC = () => {
    const token = localStorage.getItem('access_token');
    const { showToast } = useToast();

    if (!token) {
        showToast('You must be logged in to access this page.', 'error');
        return <Navigate to="/login" />;
    }

    return <Outlet />;
};

export default ProtectedRoute;