import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Link,
    InputAdornment,
    IconButton,
    Alert,
    useTheme,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

import { useSettings } from '../../context/SettingsContext';

const Login = () => {
    const navigate = useNavigate();
    const { login, googleLogin } = useAuth();
    const { settings } = useSettings();
    // Hook is safe to call even without provider — but we guard usage below
    const { executeRecaptcha } = useGoogleReCaptcha() ?? {};
    const theme = useTheme();
    const primaryColor = theme.palette.primary.main;
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [unverifiedEmail, setUnverifiedEmail] = useState('');
    const [allowRegistration, setAllowRegistration] = useState(true);
    const [allowForgotPassword, setAllowForgotPassword] = useState(true);
    const [allowGoogleLogin, setAllowGoogleLogin] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const location = useLocation();

    useEffect(() => {
        if (settings?.auth) {
            setAllowRegistration(settings.auth.allowRegistration);
            setAllowForgotPassword(settings.auth.allowForgotPassword ?? true);
            setAllowGoogleLogin(settings.auth.allowGoogleLogin ?? false);
        }

        // Handle navigation state (e.g. from VerifyEmail)
        if (location.state?.email) {
            setFormData(prev => ({ ...prev, email: location.state.email }));
        }
        if (location.state?.message) {
            toast.success(location.state.message);
            window.history.replaceState({}, document.title);
        }
    }, [location, settings]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleGoogleSuccess = async (response) => {
        setLoading(true);
        const result = await googleLogin(response.credential);
        if (result.success) {
            toast.success('Google Login successful!');
            navigate('/');
        } else {
            toast.error(result.message);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // reCAPTCHA v3 — only run if provider is mounted AND key is configured
        let recaptchaToken = '';
        if (executeRecaptcha && settings?.integrations?.recaptchaKey) {
            try {
                recaptchaToken = await executeRecaptcha('login');
            } catch (err) {
                console.warn('reCAPTCHA skipped:', err.message);
            }
        }

        setLoading(true);
        setError('');

        const result = await login(formData.email, formData.password, recaptchaToken);

        if (result.success) {
            toast.success('Login successful!');
            navigate('/');
        } else {
            // Special handling for unverified email
            if (result.message?.toLowerCase().includes('not verified') || result.message?.toLowerCase().includes('verify')) {
                setUnverifiedEmail(formData.email);
                setError('');
            } else {
                setError(result.message);
                setUnverifiedEmail('');
                toast.error(result.message);
            }
        }

        setLoading(false);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${primaryColor}18 0%, ${primaryColor}40 100%)`,
                bgcolor: 'background.default',
                p: 2,
            }}
        >
            <Card
                sx={{
                    maxWidth: 450,
                    width: '100%',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h4" fontWeight={700} gutterBottom textAlign="center">
                        Welcome Back
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
                        Sign in to your LMS Admin account
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {unverifiedEmail && (
                        <Alert
                            severity="warning"
                            sx={{ mb: 2 }}
                            action={
                                <Button
                                    color="warning"
                                    size="small"
                                    variant="contained"
                                    onClick={() =>
                                        navigate('/verify-email', { state: { email: unverifiedEmail } })
                                    }
                                    sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                                >
                                    Verify Now
                                </Button>
                            }
                        >
                            Your email is not verified. Please verify your account to login.
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            margin="normal"
                            autoComplete="email"
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            required
                            margin="normal"
                            autoComplete="current-password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>

                        {allowGoogleLogin && settings?.integrations?.googleClientId && (
                            <>
                                <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                                    <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                                    <Typography variant="body2" sx={{ px: 2, color: 'text.secondary' }}>OR</Typography>
                                    <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                                </Box>
                                <Box sx={{ width: '100%', mb: 2 }}>
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => toast.error('Google login failed')}
                                        theme="filled_blue"
                                        size="large"
                                        width="400"
                                    />
                                </Box>
                            </>
                        )}

                        {/* Forgot Password link */}
                        {allowForgotPassword && (
                            <Box textAlign="right" sx={{ mt: 0.5, mb: 1.5 }}>
                                <Link
                                    component="button"
                                    type="button"
                                    onClick={() => navigate('/forgot-password')}
                                    sx={{ cursor: 'pointer', fontSize: '0.82rem', color: primaryColor }}
                                    underline="hover"
                                >
                                    Forgot Password?
                                </Link>
                            </Box>
                        )}

                        {allowRegistration && (
                            <Box textAlign="center">
                                <Typography variant="body2" color="text.secondary">
                                    Don't have an account?{' '}
                                    <Link
                                        component="button"
                                        type="button"
                                        onClick={() => navigate('/register')}
                                        sx={{ cursor: 'pointer', textDecoration: 'none' }}
                                    >
                                        Sign Up
                                    </Link>
                                </Typography>
                            </Box>
                        )}
                    </form>
                </CardContent>
            </Card>
        </Box >
    );
};

export default Login;
