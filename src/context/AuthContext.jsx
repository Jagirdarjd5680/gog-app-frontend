import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token) {
                try {
                    // Try to fetch latest user data to keep permissions in sync
                    const response = await api.get('/auth/me');
                    if (response.data.success) {
                        const userData = response.data.data;
                        setUser(userData);
                        localStorage.setItem('user', JSON.stringify(userData));
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    // If 401, clear storage
                    if (error.response?.status === 401) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setUser(null);
                    } else if (storedUser) {
                        // If network error but we have stored user, use it temporarily
                        setUser(JSON.parse(storedUser));
                    }
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password, recaptchaToken = '') => {
        try {
            const response = await api.post('/auth/login', { email, password, recaptchaToken });

            if (response.data.success) {
                // Backend returns { success, token, user } at the top level
                const { token, user: userData } = response.data;

                // Store token and user data
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));

                setUser(userData);
                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const googleLogin = async (credential) => {
        try {
            const response = await api.post('/auth/google-login', { credential });

            if (response.data.success) {
                const { token, user: userData } = response.data;

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));

                setUser(userData);
                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Google login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);

            if (response.data.success) {
                // Check if verification is required
                if (response.data.requireVerification) {
                    return {
                        success: true,
                        requireVerification: true,
                        message: response.data.message
                    };
                }

                const { token, ...user } = response.data.data;

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                setUser(user);
                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const refreshToken = async () => {
        try {
            const response = await api.get('/auth/refresh');
            if (response.data.success) {
                const { token, user: userData } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                console.log('Token refreshed successfully');
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            if (error.response?.status === 401) {
                logout();
            }
        }
    };

    // Auto-refresh token every 6 days (if user is active)
    useEffect(() => {
        if (!user) return;

        const refreshInterval = setInterval(() => {
            refreshToken();
        }, 6 * 24 * 60 * 60 * 1000); // 6 days

        return () => clearInterval(refreshInterval);
    }, [user]);

    const value = {
        user,
        login,
        register,
        googleLogin,
        logout,
        refreshToken,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isTeacher: user?.role === 'teacher',
        isStudent: user?.role === 'student',
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthProvider, useAuth };
