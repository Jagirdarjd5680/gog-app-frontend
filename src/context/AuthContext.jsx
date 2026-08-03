import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import socket, { connectSocket } from '../utils/socket';
import { connectSessionSocket, disconnectSessionSocket } from '../realtime/sessionSocket';
import { toast } from 'react-toastify';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, CircularProgress, TextField } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';

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
    // Mirrors native-app/src/screens/auth/referralCode/Screen.tsx — web signup never
    // asked new users for a referral code, only the mobile OTP flow did.
    const [needsReferralPrompt, setNeedsReferralPrompt] = useState(false);
    const [referralCodeInput, setReferralCodeInput] = useState('');
    const [applyingReferral, setApplyingReferral] = useState(false);

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

    // ─── Session socket: real-time force-logout when this account signs in ──
    // elsewhere (another browser, or the mobile app — single-device-login is
    // enforced per account, not per platform). Separate namespace/socket from
    // the one below on purpose: session.gateway.ts lives on '/session' and
    // emits 'force-logout' (hyphen), while the default-namespace `socket`
    // below only carries chat + realtime_update toasts.
    useEffect(() => {
        const userId = user?.id || user?._id;
        const token = localStorage.getItem('token');
        if (!userId || user.role !== 'student' || !token) {
            disconnectSessionSocket();
            return;
        }

        const REASON_MESSAGES = {
            new_device_login: 'You have been logged out because your account was just signed in from another device or the mobile app.',
            device_revoked_by_you: 'This device was signed out from your account settings.',
            session_revoked: 'You have been logged out because your session ended.',
        };

        const handleForceLogout = (reason) => {
            setForceLogoutData({ message: REASON_MESSAGES[reason] });
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

        connectSessionSocket(token, handleForceLogout);

        return () => {
            disconnectSessionSocket();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [user?.id, user?._id, user?.role]);

    // ─── Default-namespace socket: chat + generic realtime_update toasts ───
    useEffect(() => {
        const userId = user?.id || user?._id;
        if (!userId || user.role !== 'student') {
            if (socket.connected) socket.disconnect();
            return;
        }

        connectSocket();

        socket.on('realtime_update', (data) => {
            const { type } = data;
            let displayMsg = "Data updated";
            switch(type) {
                case 'ASSIGNMENT_SUBMITTED': displayMsg = "Assignment submitted successfully!"; break;
                case 'ASSIGNMENT_GRADED': displayMsg = "🎉 Your assignment has been graded!"; break;
                case 'EXAM_SUBMITTED': displayMsg = "Exam result saved!"; break;
                case 'CURRICULUM_UPDATED': displayMsg = "Course curriculum has been updated!"; break;
                case 'MATERIAL_ADDED': displayMsg = "New material added to the batch!"; break;
                case 'REVIEW_ADDED': displayMsg = "New review posted!"; break;
                case 'BATCH_UPDATED': displayMsg = "Batch details updated!"; break;
            }
            toast.info(displayMsg);
        });

        return () => {
            socket.off('realtime_update');
        };
    }, [user?.id, user?._id, user?.role]);

    const login = async (email, password, recaptchaToken = '') => {
        try {
            const response = await api.post('/auth/login', { email, password, recaptchaToken });

            if (response.data.success) {
                // 2FA-enabled accounts: password was correct but login() withheld the token and
                // emailed an OTP instead — the caller must show that step and call verifyTwoFactor.
                if (response.data.requiresTwoFactor) {
                    return { success: true, requiresTwoFactor: true, email: response.data.email };
                }

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

    /** Completes login for a 2FA-enabled account after login() returned requiresTwoFactor. */
    const verifyTwoFactor = async (email, otp) => {
        try {
            const response = await api.post('/auth/2fa/verify', { email, otp });
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
                message: error.response?.data?.message || 'Invalid or expired code'
            };
        }
    };

    /** Step 1 of mobile-number login — mirrors native-app's useSendOtp (src/api/auth/hooks.ts). */
    const sendOtp = async (phone) => {
        try {
            await api.post('/auth/send-otp', { phone });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to send OTP'
            };
        }
    };

    /** Step 2 — verifying the code logs the account in (creating it on first use), same as native-app's OTP flow. */
    const verifyOtpLogin = async (phone, otp) => {
        try {
            const response = await api.post('/auth/verify-otp', { phone, otp });
            if (response.data.success) {
                const { token, user: userData, needsReferralPrompt: needsReferral } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                if (needsReferral) setNeedsReferralPrompt(true);
                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Invalid or expired OTP'
            };
        }
    };

    const googleLogin = async (credential) => {
        try {
            // Backend only exposes POST /auth/google, which expects a passport-style
            // profile object rather than the raw id_token credential @react-oauth/google
            // hands back — decode the token's claims into that shape here (see the
            // matching comment in native-app/src/api/auth/useGoogleLogin.ts).
            const claims = JSON.parse(atob(credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            const profile = {
                emails: [{ value: claims.email }],
                displayName: claims.name,
                name: { givenName: claims.given_name, familyName: claims.family_name },
                photos: [{ value: claims.picture }],
            };
            const response = await api.post('/auth/google', { profile });

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
                if (response.data.needsReferralPrompt) setNeedsReferralPrompt(true);
                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const applyReferralCode = async () => {
        const code = referralCodeInput.trim();
        if (!code) {
            setNeedsReferralPrompt(false);
            return;
        }
        setApplyingReferral(true);
        try {
            const response = await api.post('/auth/apply-referral', { code });
            if (response.data.success) {
                toast.success('Referral code applied!');
            }
            setNeedsReferralPrompt(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid referral code');
        } finally {
            setApplyingReferral(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (updatedUserData) => {
        const newUser = { ...user, ...updatedUserData };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const refreshToken = async () => {
        try {
            const response = await api.get('/auth/refresh');
            if (response.data.success) {
                const { token, user: userData } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                
            }
        } catch (error) {
            
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
        verifyTwoFactor,
        register,
        googleLogin,
        sendOtp,
        verifyOtpLogin,
        logout,
        updateUser,
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

            {/* Referral Code Prompt — shown once after a fresh signup with no referral recorded yet */}
            <Dialog
                open={needsReferralPrompt}
                maxWidth="xs"
                fullWidth
                onClose={() => setNeedsReferralPrompt(false)}
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                    <CardGiftcardIcon color="primary" fontSize="large" />
                    <Typography variant="h6" fontWeight="bold">Got a referral code?</Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        Enter it now to help a friend earn their reward, or skip for now.
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Referral code (optional)"
                        value={referralCodeInput}
                        onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                        inputProps={{ style: { textTransform: 'uppercase' } }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => setNeedsReferralPrompt(false)} disabled={applyingReferral}>
                        Skip
                    </Button>
                    <Button
                        variant="contained"
                        onClick={applyReferralCode}
                        disabled={applyingReferral}
                        sx={{ fontWeight: 'bold' }}
                    >
                        {applyingReferral ? <CircularProgress size={20} color="inherit" /> : referralCodeInput.trim() ? 'Apply' : 'Continue'}
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthContext.Provider>
    );
};

export { AuthProvider, useAuth };
