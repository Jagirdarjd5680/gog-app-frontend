import { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Link,
    InputAdornment,
    IconButton,
    Alert,
    useTheme,
    Checkbox,
    FormControlLabel,
    Paper,
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
    const { executeRecaptcha } = useGoogleReCaptcha() ?? {};
    const theme = useTheme();
    
    // Dynamic Primary Color from settings
    const primaryColor = settings?.theme?.primaryColor || '#C40C0C'; 
    const siteName = settings?.general?.siteName || 'God of Graphics';
    
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
                background: `linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)`,
                p: { xs: 2, md: 4 },
                fontFamily: "'Outfit', sans-serif",
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background Decorative Circles */}
            <Box sx={{ position: 'absolute', top: '-10%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: `${primaryColor}08`, zIndex: 0 }} />
            <Box sx={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: `${primaryColor}05`, zIndex: 0 }} />

            <Paper
                elevation={0}
                sx={{
                    maxWidth: 850,
                    width: '100%',
                    display: 'flex',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                    bgcolor: '#ffffff',
                    flexDirection: { xs: 'column', md: 'row' },
                }}
            >
                {/* Left Panel - Image/Illustration Only */}
                <Box
                    sx={{
                        flex: 1,
                        background: `linear-gradient(135deg, ${primaryColor} 0%, #1a1a1a 100%)`,
                        p: 0,
                        display: { xs: 'none', md: 'flex' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        component="img"
                        src="https://app.mdconsultancy.in/images/auth/auth-cover-login-bg.svg"
                        sx={{
                            width: '100%',
                            maxWidth: 400,
                            padding: 3,
                            zIndex: 2
                        }}
                    />
                    
                    {/* Background decorative elements */}
                    <Box sx={{ position: 'absolute', top: '-10%', right: '-10%', width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', zIndex: 1 }} />
                    <Box sx={{ position: 'absolute', bottom: '5%', left: '-5%', width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', zIndex: 1 }} />
                </Box>

                {/* Right Panel - Login Form */}
                <Box
                    sx={{
                        flex: 1,
                        p: { xs: 3, md: 5 },
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        bgcolor: '#ffffff',
                    }}
                >
                    {/* Logo & Header */}
                    <Box sx={{ mb: 3 }}>
                        {settings?.general?.siteLogo ? (
                            <Box
                                component="img"
                                src={settings.general.siteLogo}
                                sx={{ height: 35, mb: 1.5 }}
                                alt="Logo"
                            />
                        ) : (
                            <Typography variant="h6" fontWeight={900} sx={{ color: primaryColor, mb: 1, letterSpacing: -1 }}>
                                {siteName}
                            </Typography>
                        )}
                        <Typography variant="h5" fontWeight={800} sx={{ color: '#1a1a1a', mb: 0.5, letterSpacing: -0.5 }}>
                            Sign in
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Welcome back! Please enter your details.
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2, py: 0, borderRadius: '12px', fontSize: '0.85rem' }}>
                            {error}
                        </Alert>
                    )}

                    {unverifiedEmail && (
                        <Alert
                            severity="warning"
                            sx={{ mb: 2, py: 0, borderRadius: '12px', fontSize: '0.85rem' }}
                            action={
                                <Button
                                    color="warning"
                                    size="small"
                                    variant="contained"
                                    onClick={() =>
                                        navigate('/verify-email', { state: { email: unverifiedEmail } })
                                    }
                                    sx={{ fontWeight: 700, whiteSpace: 'nowrap', borderRadius: '8px', py: 0.3 }}
                                >
                                    Verify Now
                                </Button>
                            }
                        >
                            Your email is not verified.
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Box sx={{ mb: 1.5 }}>
                            <TextField
                                fullWidth
                                placeholder="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                variant="outlined"
                                autoComplete="email"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                        backgroundColor: '#f8fafc',
                                        height: '48px',
                                    }
                                }}
                            />
                        </Box>

                        <Box sx={{ mb: 1.5 }}>
                            <TextField
                                fullWidth
                                placeholder="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                variant="outlined"
                                autoComplete="current-password"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                size="small"
                                            >
                                                {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                        backgroundColor: '#f8fafc',
                                        height: '48px',
                                    }
                                }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <FormControlLabel
                                control={<Checkbox size="small" sx={{ color: '#cbd5e1', '&.Mui-checked': { color: primaryColor } }} />}
                                label={<Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>Keep me logged in</Typography>}
                            />
                            {allowForgotPassword && (
                                <Link
                                    component="button"
                                    type="button"
                                    onClick={() => navigate('/forgot-password')}
                                    sx={{ 
                                        cursor: 'pointer', 
                                        fontSize: '0.78rem', 
                                        color: primaryColor, 
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    Forgot Password?
                                </Link>
                            )}
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ 
                                py: 1.8, 
                                borderRadius: '12px', 
                                bgcolor: primaryColor,
                                fontWeight: 700,
                                fontSize: '1rem',
                                textTransform: 'none',
                                boxShadow: `0 10px 15px -3px rgba(196, 12, 12, 0.3)`,
                                '&:hover': {
                                    bgcolor: '#a00a0a',
                                    boxShadow: `0 20px 25px -5px rgba(196, 12, 12, 0.4)`,
                                }
                            }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>

                        {allowGoogleLogin && settings?.integrations?.googleClientId && (
                            <>
                                <Box sx={{ display: 'flex', alignItems: 'center', my: 3.5 }}>
                                    <Box sx={{ flex: 1, height: '1px', bgcolor: '#e2e8f0' }} />
                                    <Typography variant="body2" sx={{ px: 2, color: '#94a3b8', fontWeight: 500 }}>OR</Typography>
                                    <Box sx={{ flex: 1, height: '1px', bgcolor: '#e2e8f0' }} />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => toast.error('Google login failed')}
                                        theme="outline"
                                        shape="pill"
                                        size="large"
                                        text="continue_with"
                                        width="100%"
                                    />
                                </Box>
                            </>
                        )}

                        {allowRegistration && (
                            <Box sx={{ mt: 4, textAlign: 'center' }}>
                                <Typography variant="body2" color="#64748b">
                                    Don't have an account?{' '}
                                    <Link
                                        component="button"
                                        type="button"
                                        onClick={() => navigate('/register')}
                                        sx={{ 
                                            cursor: 'pointer', 
                                            color: primaryColor, 
                                            fontWeight: 700,
                                            textDecoration: 'none',
                                            '&:hover': { textDecoration: 'underline' }
                                        }}
                                    >
                                        Create Account
                                    </Link>
                                </Typography>
                            </Box>
                        )}
                    </form>
                    
                    <Typography variant="caption" sx={{ mt: 'auto', textAlign: 'center', color: '#94a3b8', pt: 4 }}>
                        © {new Date().getFullYear()} {siteName}. All rights reserved.
                    </Typography>
                </Box>
            </Paper>
        </Box >
    );
};

export default Login;
