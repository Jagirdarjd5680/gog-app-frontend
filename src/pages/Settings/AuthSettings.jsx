import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    FormControlLabel,
    Switch,
    Button,
    Box,
    CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const AuthSettings = ({ settings, onSave, isSaving }) => {
    const [formData, setFormData] = useState(settings?.auth || {});

    useEffect(() => {
        if (settings?.auth) {
            setFormData(settings.auth);
        }
    }, [settings]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.checked });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ auth: formData });
    };

    return (
        <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>Login & Registration Settings</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Manage how users access and join your platform.
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.allowRegistration ?? true}
                                    onChange={handleChange}
                                    name="allowRegistration"
                                />
                            }
                            label="Allow New User Registration"
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                            If disabled, new users will not be able to create accounts.
                        </Typography>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.requireEmailVerification ?? false}
                                    onChange={handleChange}
                                    name="requireEmailVerification"
                                />
                            }
                            label="Require Email Verification"
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                            Users must verify their email address before they can log in.
                        </Typography>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.allowForgotPassword ?? true}
                                    onChange={handleChange}
                                    name="allowForgotPassword"
                                />
                            }
                            label="Allow Forgot Password"
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                            If enabled, users can reset their password via email OTP from the login page.
                        </Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.allowGoogleLogin ?? false}
                                    onChange={handleChange}
                                    name="allowGoogleLogin"
                                />
                            }
                            label="Allow Google Login"
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                            If enabled, users can register and login using their Google account.
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        type="submit"
                        startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        sx={{ mt: 4 }}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Updating...' : 'Update Auth Settings'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default AuthSettings;
