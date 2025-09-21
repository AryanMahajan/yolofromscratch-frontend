import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User, TokenManager } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    first_name: string;
    last_name: string;
    email: string;
    password1: string;
    password2: string;
  }) => Promise<void>;
  googleLogin: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated based on token presence and validity
  const isAuthenticated = user !== null && TokenManager.getAccessToken() !== null;

  // Initialize auth state on mount - non-blocking
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Only check if we have a token
        const token = TokenManager.getAccessToken();
        if (token && !TokenManager.isTokenExpired(token)) {
          setIsLoading(true);
          // Fetch current user data
          const userData = await authApi.getCurrentUser();
          setUser(userData);
        } else {
          // Clear any invalid tokens
          TokenManager.clearTokens();
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear tokens if there's an error fetching user data
        TokenManager.clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Only initialize if we have tokens
    if (TokenManager.getAccessToken()) {
      initializeAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    first_name: string;
    last_name: string;
    email: string;
    password1: string;
    password2: string;
  }): Promise<void> => {
    setIsLoading(true);
    try {
      await authApi.register(userData);
      // Note: User needs to confirm email before they can login
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (accessToken: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authApi.googleLogin(accessToken);
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      const updatedUser = await authApi.updateUser(userData);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const token = TokenManager.getAccessToken();
      if (token && !TokenManager.isTokenExpired(token)) {
        const userData = await authApi.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // If we can't fetch user data, user might need to re-login
      setUser(null);
      TokenManager.clearTokens();
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};