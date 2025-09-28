import axios, { type AxiosInstance, type AxiosResponse, AxiosError } from 'axios';

// Types
export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  last_login: string | null;
  is_active: boolean;
}

export interface DetectionHistory {
  id: number;
  timestamp: string;
  formatted_timestamp: string;
  detection_type: 'image' | 'video' | 'live';
  objects_detected: number;
  confidence_threshold: number;
  detected_classes: string[];
  detection_data?: any;
  image_or_video_ref?: string;
}

export interface DetectionHistoryStats {
  detection_type_distribution: any;
  total_detections: number;
  detections_by_type: {
    image: number;
    video: number;
    live: number;
  };
  recent_activity: number;
  total_objects_detected: number;
  top_detected_classes: [string, number][];
  avg_objects_per_detection: number;
}

// Token management utilities
class TokenManager {
  private static ACCESS_TOKEN_KEY = 'access_token';
  private static REFRESH_TOKEN_KEY = 'refresh_token';

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }
}

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth header
  client.interceptors.request.use(
    (config) => {
      const token = TokenManager.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        
        const refreshToken = TokenManager.getRefreshToken();
        if (refreshToken) {
          try {
            const response = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/accounts/api/token/refresh/`,
              { refresh: refreshToken }
            );
            
            const { access } = response.data;
            TokenManager.setAccessToken(access);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            TokenManager.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        } else {
          // No refresh token, redirect to login
          window.location.href = '/login';
        }
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

// Create API client instance
export const apiClient = createApiClient();

// API methods
export const authApi = {
  // Login with email and password
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post('/api/auth/login/', {
      email,
      password,
    });
    
    const { access, refresh, user } = response.data;
    TokenManager.setTokens(access, refresh);
    
    return {
      access,
      refresh,
      user,
    };
  },

  // Register new user
  async register(userData: {
    first_name: string;
    last_name: string;
    email: string;
    password1: string;
    password2: string;
  }) {
    const response = await apiClient.post('/api/auth/registration/', {
      ...userData,
      username: userData.email, // Use email as username
    });
    return response.data;
  },

  // Google OAuth login
  async googleLogin(accessToken: string): Promise<LoginResponse> {
    const response = await apiClient.post('/accounts/google/', {
      access_token: accessToken,
    });
    
    const { access, refresh, user } = response.data;
    TokenManager.setTokens(access, refresh);
    
    return {
      access,
      refresh,
      user,
    };
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      TokenManager.clearTokens();
    }
  },

  // Get current user info
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/accounts/api/user/me/');
    return response.data;
  },

  // Update user info
  async updateUser(userData: Partial<User>): Promise<User> {
    const response = await apiClient.patch('/accounts/api/user/me/', userData);
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = TokenManager.getAccessToken();
    return token !== null && !TokenManager.isTokenExpired(token);
  },
};

export const historyApi = {
  // Get detection history list
  async getHistory(params?: {
    page?: number;
    page_size?: number;
    detection_type?: string;
  }): Promise<{ results: DetectionHistory[]; count: number; next: string | null; previous: string | null }> {
    const response = await apiClient.get('/api/history/', { params });
    return response.data;
  },

  // Get single detection history entry
  async getHistoryById(id: number): Promise<DetectionHistory> {
    const response = await apiClient.get(`/api/history/${id}/`);
    return response.data;
  },

  // Create new detection history entry
  async createHistory(data: {
    detection_data: any;
    detection_type: 'image' | 'video' | 'live';
    confidence_threshold?: number;
    image_or_video_ref?: string;
  }): Promise<DetectionHistory> {
    const response = await apiClient.post('/api/history/', data);
    return response.data;
  },

  // Delete detection history entry
  async deleteHistory(id: number): Promise<void> {
    await apiClient.delete(`/api/history/${id}/`);
  },

  // Get recent detection history (last 7 days)
  async getRecentHistory(): Promise<DetectionHistory[]> {
    const response = await apiClient.get('/api/history/recent/');
    return response.data;
  },

  // Get user statistics
  async getStats(): Promise<DetectionHistoryStats> {
    const response = await apiClient.get('/api/history/stats/');
    return response.data;
  },

  // Clear all history
  async clearHistory(): Promise<{ message: string }> {
    const response = await apiClient.delete('/api/history/clear_history/');
    return response.data;
  },

  // Search history
  async searchHistory(params: {
    class?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
  }): Promise<{ results: DetectionHistory[]; count: number; next: string | null; previous: string | null }> {
    const response = await apiClient.get('/api/history/search/', { params });
    return response.data;
  },
};

// Export token manager for use in other components
export { TokenManager };