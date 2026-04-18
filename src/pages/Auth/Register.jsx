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
    Paper,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useSettings } from '../../context/SettingsContext';

const Register = () => {
    const navigate = useNavigate();
    const { register, googleLogin } = useAuth();
    const { settings } = useSettings();
    const { executeRecaptcha } = useGoogleReCaptcha() ?? {};
    const theme = useTheme();
    
    // Dynamic Branding
    const primaryColor = settings?.theme?.primaryColor || '#C40C0C';
    const siteName = settings?.general?.siteName || 'God of Graphics';

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [allowGoogleLogin, setAllowGoogleLogin] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'student',
    });

    // Check if registration is allowed from settings
    useEffect(() => {
        if (settings?.auth) {
            if (settings.auth.allowRegistration === false) {
                toast.error('Registration is currently disabled by administrator');
                navigate('/login');
            }
            setAllowGoogleLogin(settings.auth.allowGoogleLogin ?? false);
        }
    }, [navigate, settings]);

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
            toast.success('Google Registration successful!');
            navigate('/');
        } else {
            toast.error(result.message);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // reCAPTCHA v3
        let recaptchaToken = '';
        if (executeRecaptcha && settings?.integrations?.recaptchaKey) {
            try {
                recaptchaToken = await executeRecaptcha('register');
            } catch (err) {
                console.warn('reCAPTCHA skipped:', err.message);
            }
        }

        setLoading(true);
        setError('');

        // Basic Validation
        if (!formData.name.trim()) {
            setError('Please enter your full name');
            setLoading(false);
            return;
        }

        const result = await register({ ...formData, recaptchaToken });

        if (result.success) {
            if (result.requireVerification) {
                toast.success(result.message);
                navigate('/verify-email', { state: { email: formData.email } });
            } else {
                toast.success('Registration successful!');
                navigate('/');
            }
        } else {
            setError(result.message);
            toast.error(result.message);
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

                {/* Right Panel - Register Form */}
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
                            Create account
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Enter your details to get started.
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2, py: 0, borderRadius: '12px', fontSize: '0.85rem' }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Box sx={{ mb: 1.5 }}>
                            <TextField
                                fullWidth
                                placeholder="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                variant="outlined"
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
                                placeholder="Phone Number"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                        backgroundColor: '#f8fafc',
                                        height: '48px',
                                    }
                                }}
                            />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <TextField
                                fullWidth
                                placeholder="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                variant="outlined"
                                autoComplete="new-password"
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

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ 
                                py: 1.6, 
                                borderRadius: '12px', 
                                bgcolor: primaryColor,
                                fontWeight: 700,
                                fontSize: '1rem',
                                textTransform: 'none',
                                boxShadow: `0 10px 15px -3px ${primaryColor}44`,
                                '&:hover': {
                                    bgcolor: primaryColor,
                                    filter: 'brightness(0.9)',
                                    boxShadow: `0 20px 25px -5px ${primaryColor}55`,
                                }
                            }}
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>

                        {allowGoogleLogin && settings?.integrations?.googleClientId && (
                            <>
                                <Box sx={{ display: 'flex', alignItems: 'center', my: 2.5 }}>
                                    <Box sx={{ flex: 1, height: '1px', bgcolor: '#e2e8f0' }} />
                                    <Typography variant="body2" sx={{ px: 2, color: '#94a3b8', fontWeight: 500 }}>OR</Typography>
                                    <Box sx={{ flex: 1, height: '1px', bgcolor: '#e2e8f0' }} />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => toast.error('Google registration failed')}
                                        theme="outline"
                                        shape="pill"
                                        size="large"
                                        text="signup_with"
                                        width="100%"
                                    />
                                </Box>
                            </>
                        )}

                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="#64748b">
                                Already have an account?{' '}
                                <Link
                                    component="button"
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    sx={{ 
                                        cursor: 'pointer', 
                                        color: primaryColor, 
                                        fontWeight: 700,
                                        textDecoration: 'none',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    Sign In
                                </Link>
                            </Typography>
                        </Box>
                    </form>
                    
                    <Typography variant="caption" sx={{ mt: 'auto', textAlign: 'center', color: '#94a3b8', pt: 3 }}>
                        © {new Date().getFullYear()} {siteName}. All rights reserved.
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default Register;
