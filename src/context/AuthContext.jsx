import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import socket from '../utils/socket';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, CircularProgress } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

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
    const [forceLogoutData, setForceLogoutData] = useState(null);
    const [countdown, setCountdown] = useState(5);
    const timerRef = useRef(null);

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

    // ─── Socket Listener for Single Device Login ───────────────────────────
    useEffect(() => {
        if (!user?._id || user.role !== 'student') {
            if (socket.connected) socket.disconnect();
            return;
        }

        if (!socket.connected) {
            socket.connect();
        }
        socket.emit('setup', user._id);

        const handleForceLogout = (data) => {
            console.log('📣 Real-time Force Logout Event Received:', data);
            setForceLogoutData(data);
            setCountdown(5);
            
            // Start countdown
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        logout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        };

        socket.on('force_logout', handleForceLogout);

        return () => {
            socket.off('force_logout', handleForceLogout);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [user?._id, user?.role]);

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

    return (
        <AuthContext.Provider value={value}>
            {children}

            {/* Force Logout Dialog */}
            <Dialog 
                open={!!forceLogoutData} 
                maxWidth="xs" 
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                    <WarningAmberIcon color="error" fontSize="large" />
                    <Typography variant="h6" fontWeight="bold">Security Alert</Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                        {forceLogoutData?.message || 'You have been logged out because your account was logged in from another device.'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                            <CircularProgress 
                                variant="determinate" 
                                value={(countdown / 5) * 100} 
                                color="error" 
                                size={70} 
                                thickness={5}
                            />
                            <Box
                                sx={{
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                    position: 'absolute',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Typography variant="h5" component="div" fontWeight="bold" color="error">
                                    {countdown}
                                </Typography>
                            </Box>
                        </Box>
                        <Typography variant="caption" color="text.disabled">
                            Logging out automatically...
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button 
                        variant="contained" 
                        color="error" 
                        fullWidth 
                        onClick={() => {
                            if (timerRef.current) clearInterval(timerRef.current);
                            logout();
                        }}
                        sx={{ py: 1.2, fontWeight: 'bold' }}
                    >
                        Logout Now
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthContext.Provider>
    );
};

export { AuthProvider, useAuth };
