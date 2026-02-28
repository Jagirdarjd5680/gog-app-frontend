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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
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
    const primaryColor = theme.palette.primary.main;
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

        // reCAPTCHA v3 — only run if provider is mounted AND key is configured
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

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
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
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Box sx={{
                            width: 60, height: 60, borderRadius: 3, bgcolor: primaryColor,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 6px 18px ${primaryColor}55`, mb: 2,
                        }}>
                            <PersonAddIcon sx={{ color: '#fff', fontSize: 30 }} />
                        </Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Create Account
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Sign up for your account
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            margin="normal"
                        />

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
                            label="Phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            margin="normal"
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
                            autoComplete="new-password"
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
                            sx={{
                                mt: 3, mb: 2, py: 1.5,
                                fontWeight: 700,
                                bgcolor: primaryColor,
                                '&:hover': { bgcolor: primaryColor, filter: 'brightness(0.88)' }
                            }}
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
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
                                        useOneTap
                                        theme="filled_blue"
                                        size="large"
                                        width="400"
                                    />
                                </Box>
                            </>
                        )}

                        <Box textAlign="center">
                            <Typography variant="body2" color="text.secondary">
                                Already have an account?{' '}
                                <Link
                                    component="button"
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    sx={{ cursor: 'pointer', textDecoration: 'none', color: primaryColor, fontWeight: 600 }}
                                >
                                    Sign In
                                </Link>
                            </Typography>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Register;
