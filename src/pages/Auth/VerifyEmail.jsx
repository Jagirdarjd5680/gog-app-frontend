import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Button,
    Typography,
    Alert,
    CircularProgress,
    useTheme,
} from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import api from '../../utils/api';
import { toast } from 'react-toastify';

// Mask email: raj***@gmail.com
const maskEmail = (email) => {
    if (!email) return 'your email';
    const [user, domain] = email.split('@');
    if (!domain) return email;
    const visible = user.slice(0, 3);
    return `${visible}${'*'.repeat(Math.max(3, user.length - 3))}@${domain}`;
};

const VerifyEmail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const primaryColor = theme.palette.primary.main;

    const email = location.state?.email || '';

    // Redirect if accessed directly without going through register
    useEffect(() => {
        if (!email) {
            toast.error('Please register first to access this page.');
            navigate('/register', { replace: true });
        }
    }, [email, navigate]);

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(30);
    const [resendLoading, setResendLoading] = useState(false);
    const inputRefs = useRef([]);

    // Countdown timer
    useEffect(() => {
        if (resendTimer <= 0) return;
        const interval = setInterval(() => {
            setResendTimer(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        setError('');

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        if (value && index === 5) {
            const fullCode = [...newOtp.slice(0, 5), value.slice(-1)].join('');
            if (fullCode.length === 6) {
                submitCode(fullCode);
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(''));
            inputRefs.current[5]?.focus();
            submitCode(pasted);
        }
    };

    const submitCode = async (code) => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/verify-email', { email, code });
            if (res.data.success) {
                toast.success('Email verified! Please login.');
                navigate('/login', { state: { email, message: '✅ Email verified! Please sign in.' } });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired code. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) {
            setError('Please enter all 6 digits.');
            return;
        }
        submitCode(code);
    };

    const handleResend = async () => {
        setResendLoading(true);
        try {
            await api.post('/auth/resend-verification', { email });
            toast.success('A new verification code has been sent!');
            setResendTimer(30);
            setOtp(['', '', '', '', '', '']);
            setError('');
            inputRefs.current[0]?.focus();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to resend code.');
        } finally {
            setResendLoading(false);
        }
    };

    if (!email) return null;

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
            <Card
                sx={{
                    maxWidth: 440,
                    width: '100%',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                }}
            >
                <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
                    {/* Icon */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Box
                            sx={{
                                width: 68,
                                height: 68,
                                borderRadius: 3,
                                bgcolor: primaryColor,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 6px 18px ${primaryColor}55`,
                                mb: 2,
                            }}
                        >
                            <MarkEmailReadIcon sx={{ color: '#fff', fontSize: 34 }} />
                        </Box>
                        <Typography variant="h5" fontWeight={800} gutterBottom>
                            Verify Your Email
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            We sent a 6-digit code to
                        </Typography>
                        <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{ color: primaryColor, mb: 0.5 }}
                        >
                            {maskEmail(email)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Enter the code below to verify your account.
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* OTP Boxes */}
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 1.2,
                                justifyContent: 'center',
                                mb: 4,
                            }}
                            onPaste={handlePaste}
                        >
                            {otp.map((digit, index) => (
                                <Box
                                    key={index}
                                    component="input"
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    disabled={loading}
                                    sx={{
                                        width: 44,
                                        height: 52,
                                        borderRadius: '8px',
                                        border: '2px solid',
                                        borderColor: digit ? primaryColor : 'divider',
                                        outline: 'none',
                                        textAlign: 'center',
                                        fontSize: '1.35rem',
                                        fontWeight: 700,
                                        color: digit ? primaryColor : 'text.primary',
                                        bgcolor: digit
                                            ? `${primaryColor}10`
                                            : 'background.paper',
                                        cursor: loading ? 'not-allowed' : 'text',
                                        transition: 'all 0.15s ease',
                                        boxShadow: digit
                                            ? `0 0 0 3px ${primaryColor}20`
                                            : 'none',
                                        '&:focus': {
                                            borderColor: primaryColor,
                                            boxShadow: `0 0 0 3px ${primaryColor}28`,
                                        },
                                        fontFamily: '"Inter", "Roboto", monospace',
                                    }}
                                />
                            ))}
                        </Box>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading || otp.join('').length < 6}
                            sx={{
                                py: 1.5,
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                bgcolor: primaryColor,
                                '&:hover': {
                                    bgcolor: primaryColor,
                                    filter: 'brightness(0.88)',
                                },
                                '&:disabled': {
                                    opacity: 0.5,
                                },
                            }}
                            startIcon={
                                loading ? <CircularProgress size={18} color="inherit" /> : null
                            }
                        >
                            {loading ? 'Verifying...' : 'Verify Account'}
                        </Button>

                        {/* Resend */}
                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                Didn't receive the code?
                            </Typography>
                            {resendTimer > 0 ? (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Resend in{' '}
                                    <Box
                                        component="span"
                                        sx={{ fontWeight: 800, color: primaryColor }}
                                    >
                                        {resendTimer}s
                                    </Box>
                                </Typography>
                            ) : (
                                <Button
                                    variant="text"
                                    size="small"
                                    onClick={handleResend}
                                    disabled={resendLoading}
                                    sx={{ fontWeight: 700, mt: 0.5, color: primaryColor }}
                                    startIcon={
                                        resendLoading ? <CircularProgress size={13} /> : null
                                    }
                                >
                                    {resendLoading ? 'Sending...' : 'Resend Code'}
                                </Button>
                            )}
                        </Box>

                        {/* Back to Login */}
                        <Box sx={{ textAlign: 'center', mt: 1.5 }}>
                            <Button
                                variant="text"
                                size="small"
                                onClick={() => navigate('/login')}
                                sx={{ color: 'text.secondary', fontSize: '0.78rem' }}
                            >
                                ← Back to Sign In
                            </Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default VerifyEmail;
