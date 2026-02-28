import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    Button,
    Box,
    InputAdornment,
    IconButton,
    CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const SMTPSettings = ({ settings, onSave, isSaving }) => {
    const [formData, setFormData] = useState(settings?.smtp || {});
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (settings?.smtp) {
            setFormData(settings.smtp);
        }
    }, [settings]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ smtp: formData });
    };

    return (
        <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>SMTP Security Settings</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Configure your email server for sending notifications and system alerts.
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth
                                label="SMTP Host"
                                name="host"
                                value={formData.host || ''}
                                onChange={handleChange}
                                placeholder="smtp.gmail.com"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="SMTP Port"
                                name="port"
                                value={formData.port || ''}
                                onChange={handleChange}
                                placeholder="587"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="SMTP User"
                                name="user"
                                value={formData.user || ''}
                                onChange={handleChange}
                                placeholder="your-email@gmail.com"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="SMTP Password"
                                name="pass"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.pass || ''}
                                onChange={handleChange}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Mail From Address"
                                name="from"
                                value={formData.from || ''}
                                onChange={handleChange}
                                placeholder="no-reply@yourdomain.com"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                type="submit"
                                startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Updating...' : 'Update SMTP Configuration'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </CardContent>
        </Card>
    );
};

export default SMTPSettings;
