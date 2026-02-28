import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    Button,
    Box,
    Divider,
    InputAdornment,
    IconButton,
    CircularProgress,
    Alert,
    Chip
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const IntegrationSettings = ({ settings, onSave, isSaving }) => {
    const [formData, setFormData] = useState(settings?.integrations || {});
    const [showZoomSecret, setShowZoomSecret] = useState(false);
    const [showGoogleSecret, setShowGoogleSecret] = useState(false);
    const [showRecaptchaSecret, setShowRecaptchaSecret] = useState(false);
    const [firebaseStatus, setFirebaseStatus] = useState(''); // 'valid', 'invalid', ''

    useEffect(() => {
        if (settings?.integrations) {
            setFormData(settings.integrations);
            // Check if a valid service account is saved
            if (settings.integrations.firebaseServiceAccount) {
                try {
                    const parsed = JSON.parse(settings.integrations.firebaseServiceAccount);
                    setFirebaseStatus(parsed.project_id ? 'valid' : 'invalid');
                } catch {
                    setFirebaseStatus('invalid');
                }
            }
        }
    }, [settings]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFirebaseJSONChange = (e) => {
        const value = e.target.value;
        setFormData({ ...formData, firebaseServiceAccount: value });
        try {
            const parsed = JSON.parse(value);
            setFirebaseStatus(parsed.project_id ? 'valid' : 'invalid');
        } catch {
            setFirebaseStatus(value ? 'invalid' : '');
        }
    };

    const handleFirebaseFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target.result;
            setFormData({ ...formData, firebaseServiceAccount: text });
            try {
                const parsed = JSON.parse(text);
                setFirebaseStatus(parsed.project_id ? 'valid' : 'invalid');
            } catch {
                setFirebaseStatus('invalid');
            }
        };
        reader.readAsText(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ integrations: formData });
    };

    const getFirebaseProjectId = () => {
        try {
            return JSON.parse(formData.firebaseServiceAccount)?.project_id || '';
        } catch {
            return '';
        }
    };

    return (
        <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>Integrations</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Connect external services like Zoom, Google Login, reCAPTCHA, and Firebase Push Notifications.
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Zoom */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">Zoom Integration</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Zoom Client ID / Key"
                                name="zoomKey"
                                value={formData.zoomKey || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Zoom Client Secret"
                                name="zoomSecret"
                                type={showZoomSecret ? 'text' : 'password'}
                                value={formData.zoomSecret || ''}
                                onChange={handleChange}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowZoomSecret(!showZoomSecret)} edge="end">
                                                {showZoomSecret ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                        {/* Google Login */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">Google Login (SSO)</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Google Client ID"
                                name="googleClientId"
                                value={formData.googleClientId || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Google Client Secret"
                                name="googleClientSecret"
                                type={showGoogleSecret ? 'text' : 'password'}
                                value={formData.googleClientSecret || ''}
                                onChange={handleChange}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowGoogleSecret(!showGoogleSecret)} edge="end">
                                                {showGoogleSecret ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                        {/* reCAPTCHA */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">Google reCAPTCHA v3</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Site Key"
                                name="recaptchaKey"
                                value={formData.recaptchaKey || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Secret Key"
                                name="recaptchaSecret"
                                type={showRecaptchaSecret ? 'text' : 'password'}
                                value={formData.recaptchaSecret || ''}
                                onChange={handleChange}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowRecaptchaSecret(!showRecaptchaSecret)} edge="end">
                                                {showRecaptchaSecret ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                        {/* Firebase Push Notifications */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <NotificationsActiveIcon color="primary" />
                                <Typography variant="subtitle1" fontWeight={600} color="primary">
                                    Firebase Push Notifications (FCM)
                                </Typography>
                                {firebaseStatus === 'valid' && (
                                    <Chip
                                        icon={<CheckCircleIcon />}
                                        label={`Connected — ${getFirebaseProjectId()}`}
                                        color="success"
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Paste your Firebase Service Account JSON below, or upload the JSON key file.
                                This is used <strong>only for sending push notifications</strong> (not for authentication).
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<CloudUploadIcon />}
                                    size="small"
                                    sx={{ textTransform: 'none', borderRadius: 2 }}
                                >
                                    Upload JSON Key File
                                    <input
                                        type="file"
                                        accept=".json"
                                        hidden
                                        onChange={handleFirebaseFileUpload}
                                    />
                                </Button>
                                <Typography variant="caption" color="text.secondary">
                                    Download from Firebase Console → Project Settings → Service Accounts → Generate New Key
                                </Typography>
                            </Box>

                            <TextField
                                fullWidth
                                multiline
                                rows={6}
                                label="Firebase Service Account JSON"
                                name="firebaseServiceAccount"
                                value={formData.firebaseServiceAccount || ''}
                                onChange={handleFirebaseJSONChange}
                                placeholder='{"type":"service_account","project_id":"your-project",...}'
                                error={firebaseStatus === 'invalid'}
                                helperText={
                                    firebaseStatus === 'invalid'
                                        ? 'Invalid JSON format. Please paste a valid Firebase service account JSON.'
                                        : firebaseStatus === 'valid'
                                            ? '✅ Valid Firebase service account detected.'
                                            : 'Paste the full contents of your Firebase service account JSON key file.'
                                }
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: 2, fontFamily: 'monospace', fontSize: '0.8rem' },
                                }}
                            />
                        </Grid>

                        {firebaseStatus === 'valid' && (
                            <Grid item xs={12}>
                                <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
                                    <strong>Note:</strong> Firebase is used <em>only for push notifications</em>.
                                    User authentication (login, register, OTP) is handled entirely by your backend — not Firebase.
                                </Alert>
                            </Grid>
                        )}

                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                type="submit"
                                startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Integrations'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </CardContent>
        </Card>
    );
};

export default IntegrationSettings;

