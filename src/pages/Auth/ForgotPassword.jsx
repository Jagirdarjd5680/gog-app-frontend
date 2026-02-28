import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Button,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
    useTheme,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const maskEmail = (email) => {
    if (!email) return '';
    const [user, domain] = email.split('@');
    if (!domain) return email;
    return `${user.slice(0, 3)}${'*'.repeat(Math.max(3, user.length - 3))}@${domain}`;
};

// Step 1 = enter email, Step 2 = enter OTP, Step 3 = enter new password
const ForgotPassword = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const primaryColor = theme.palette.primary.main;

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const inputRefs = useRef([]);

    // Countdown for resend
    useEffect(() => {
        if (resendTimer <= 0) return;
        const t = setInterval(() => setResendTimer(p => p - 1), 1000);
        return () => clearInterval(t);
    }, [resendTimer]);

    // ── Step 1: Send OTP ──
    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/forgot-password', { email: email.trim() });
            if (res.data.success) {
                toast.success(res.data.message);
                setStep(2);
                setResendTimer(30);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: OTP input handlers ──
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        setError('');
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
        if (value && index === 5) {
            const full = [...newOtp.slice(0, 5), value.slice(-1)].join('');
            if (full.length === 6) setStep(3);
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
        if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
        if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(''));
            inputRefs.current[5]?.focus();
            setStep(3);
        }
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) {
            setError('Please enter all 6 digits.');
            return;
        }
        setError('');
        setStep(3);
    };

    const handleResend = async () => {
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email: email.trim() });
            toast.success('New code sent!');
            setOtp(['', '', '', '', '', '']);
            setResendTimer(30);
            setError('');
            inputRefs.current[0]?.focus();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to resend code.');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 3: Reset password ──
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/reset-password', {
                email: email.trim(),
                code: otp.join(''),
                newPassword,
            });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate('/login', { state: { email: email.trim(), message: '✅ Password reset! Please sign in.' } });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
            if (err.response?.data?.message?.toLowerCase().includes('code')) {
                // Invalid/expired code — go back to OTP step
                setStep(2);
                setOtp(['', '', '', '', '', '']);
            }
        } finally {
            setLoading(false);
        }
    };

    const stepTitles = ['Forgot Password', 'Check Your Email', 'Set New Password'];
    const stepSubtitles = [
        'Enter your registered email to receive a reset code.',
        `We sent a 6-digit code to ${maskEmail(email)}`,
        'Enter a new password for your account.',
    ];

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${primaryColor}18 0%, ${primaryColor}35 100%)`,
                bgcolor: 'background.default',
                p: 2,
            }}
        >
            <Card sx={{ maxWidth: 440, width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}>
                <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
                    {/* Icon + Title */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Box sx={{
                            width: 68, height: 68, borderRadius: 3, bgcolor: primaryColor,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 6px 18px ${primaryColor}55`, mb: 2,
                        }}>
                            <LockResetIcon sx={{ color: '#fff', fontSize: 34 }} />
                        </Box>

                        {/* Step indicator */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                            {[1, 2, 3].map(s => (
                                <Box key={s} sx={{
                                    width: s === step ? 24 : 8, height: 8,
                                    borderRadius: 4,
                                    bgcolor: s <= step ? primaryColor : 'divider',
                                    transition: 'all 0.3s ease',
                                }} />
                            ))}
                        </Box>

                        <Typography variant="h5" fontWeight={800} gutterBottom>
                            {stepTitles[step - 1]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {stepSubtitles[step - 1]}
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    {/* ── STEP 1: Email ── */}
                    {step === 1 && (
                        <Box component="form" onSubmit={handleSendOtp}>
                            <TextField
                                fullWidth
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setError(''); }}
                                required
                                autoFocus
                                sx={{ mb: 3 }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{
                                    py: 1.5, fontWeight: 700, bgcolor: primaryColor,
                                    '&:hover': { bgcolor: primaryColor, filter: 'brightness(0.88)' }
                                }}
                                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                            >
                                {loading ? 'Sending Code...' : 'Send Reset Code'}
                            </Button>
                        </Box>
                    )}

                    {/* ── STEP 2: OTP ── */}
                    {step === 2 && (
                        <Box component="form" onSubmit={handleVerifyOtp}>
                            <Box sx={{ display: 'flex', gap: 1.2, justifyContent: 'center', mb: 4 }}
                                onPaste={handleOtpPaste}>
                                {otp.map((digit, index) => (
                                    <Box
                                        key={index}
                                        component="input"
                                        ref={el => (inputRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        autoFocus={index === 0}
                                        onChange={e => handleOtpChange(index, e.target.value)}
                                        onKeyDown={e => handleOtpKeyDown(index, e)}
                                        sx={{
                                            width: 44, height: 52,
                                            borderRadius: '8px',
                                            border: '2px solid',
                                            borderColor: digit ? primaryColor : 'divider',
                                            outline: 'none',
                                            textAlign: 'center',
                                            fontSize: '1.35rem',
                                            fontWeight: 700,
                                            color: digit ? primaryColor : 'text.primary',
                                            bgcolor: digit ? `${primaryColor}10` : 'background.paper',
                                            transition: 'all 0.15s ease',
                                            boxShadow: digit ? `0 0 0 3px ${primaryColor}20` : 'none',
                                            '&:focus': { borderColor: primaryColor, boxShadow: `0 0 0 3px ${primaryColor}28` },
                                            fontFamily: '"Inter", "Roboto", monospace',
                                        }}
                                    />
                                ))}
                            </Box>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading || otp.join('').length < 6}
                                sx={{
                                    py: 1.5, fontWeight: 700, bgcolor: primaryColor,
                                    '&:hover': { bgcolor: primaryColor, filter: 'brightness(0.88)' }
                                }}
                            >
                                Verify Code
                            </Button>

                            {/* Resend */}
                            <Box sx={{ textAlign: 'center', mt: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Didn't receive the code?
                                </Typography>
                                {resendTimer > 0 ? (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        Resend in <Box component="span" sx={{ fontWeight: 800, color: primaryColor }}>{resendTimer}s</Box>
                                    </Typography>
                                ) : (
                                    <Button variant="text" size="small" onClick={handleResend} disabled={loading}
                                        sx={{ fontWeight: 700, mt: 0.5, color: primaryColor }}
                                        startIcon={loading ? <CircularProgress size={13} /> : null}>
                                        {loading ? 'Sending...' : 'Resend Code'}
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    )}

                    {/* ── STEP 3: New Password ── */}
                    {step === 3 && (
                        <Box component="form" onSubmit={handleResetPassword}>
                            <TextField
                                fullWidth
                                label="New Password"
                                type={showPass ? 'text' : 'password'}
                                value={newPassword}
                                onChange={e => { setNewPassword(e.target.value); setError(''); }}
                                required
                                autoFocus
                                sx={{ mb: 2 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPass(p => !p)} edge="end">
                                                {showPass ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Confirm New Password"
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                                required
                                sx={{ mb: 3 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowConfirm(p => !p)} edge="end">
                                                {showConfirm ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{
                                    py: 1.5, fontWeight: 700, bgcolor: primaryColor,
                                    '&:hover': { bgcolor: primaryColor, filter: 'brightness(0.88)' }
                                }}
                                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </Box>
                    )}

                    {/* Back to Login */}
                    <Box sx={{ textAlign: 'center', mt: 2.5 }}>
                        <Button
                            variant="text"
                            size="small"
                            onClick={() => navigate('/login')}
                            sx={{ color: 'text.secondary', fontSize: '0.78rem' }}
                        >
                            ← Back to Sign In
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ForgotPassword;
