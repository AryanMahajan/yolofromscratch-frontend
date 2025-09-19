import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton: React.FC = () => {
    const navigate = useNavigate();

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const response = await axios.post('http://localhost:8000/accounts/google/', {
                    access_token: tokenResponse.access_token,
                });
                localStorage.setItem('access_token', response.data.access_token);
                localStorage.setItem('refresh_token', response.data.refresh_token);
                navigate('/');
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error('Google login failed:', error.response?.data);
                } else {
                    console.error('Google login failed:', error);
                }
            }
        },
        onError: () => {
            console.log('Login Failed');
        },
    });

    return (
        <button onClick={() => login()}>
            Sign in with Google
        </button>
    );
};

export default GoogleLoginButton;
