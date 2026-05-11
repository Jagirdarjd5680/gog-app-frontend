import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Grid,
    Divider,
    InputAdornment,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Save as SaveIcon,
    Refresh as RefreshIcon,
    Android as AndroidIcon,
    Link as LinkIcon,
    Info as InfoIcon,
    Stars as StarsIcon,
    CurrencyRupee as CurrencyIcon
} from '@mui/icons-material';

const AppSettings = ({ settings, onSave, isSaving }) => {
    const [formData, setFormData] = useState({
        appVersion: '',
        appLink: '',
        signupCredits: 100,
        creditPrice: 100
    });
    const [originalData, setOriginalData] = useState({});

    useEffect(() => {
        if (settings) {
            const appSettings = {
                appVersion: settings.app?.version || '1.0.0',
                appLink: settings.app?.link || 'https://play.google.com/store/apps/details?id=com.godofgraphics.lms',
                signupCredits: settings.tutorSupport?.signupCredits || 100,
                creditPrice: settings.tutorSupport?.creditPrice || 100
            };
            setFormData(appSettings);
            setOriginalData(appSettings);
        }
    }, [settings]);

    const handleChange = (field) => (e) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.type === 'number' ? Number(e.target.value) : e.target.value
        }));
    };

    const handleSave = () => {
        const updatedSettings = {
            ...settings,
            app: {
                version: formData.appVersion,
                link: formData.appLink
            },
            tutorSupport: {
                ...settings.tutorSupport,
                signupCredits: formData.signupCredits,
                creditPrice: formData.creditPrice
            }
        };
        onSave(updatedSettings);
    };

    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

    return (
        <Box>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                App & Tutor Settings
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AndroidIcon color="primary" />
                                Mobile App Configuration
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Configure app version and download link. These settings will be displayed in the mobile app.
                            </Typography>

                            <Divider sx={{ my: 2 }} />

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="App Version"
                                        value={formData.appVersion}
                                        onChange={handleChange('appVersion')}
                                        placeholder="e.g., 1.0.0"
                                        helperText="Current version of the mobile app"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <InfoIcon fontSize="small" color="action" />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="App Download Link"
                                        value={formData.appLink}
                                        onChange={handleChange('appLink')}
                                        placeholder="https://play.google.com/store/apps/..."
                                        helperText="Link for 'Share App' and 'Rate App' buttons"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LinkIcon fontSize="small" color="action" />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <StarsIcon color="warning" />
                                Tutor Credit Configuration
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Set the default price for support credits and initial signup bonuses.
                            </Typography>

                            <Divider sx={{ my: 2 }} />

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Price Per Credit (₹)"
                                        value={formData.creditPrice}
                                        onChange={handleChange('creditPrice')}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CurrencyIcon fontSize="small" color="action" />
                                                </InputAdornment>
                                            )
                                        }}
                                        helperText="Standard price for a single credit purchase"
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Signup Credits Bonus"
                                        value={formData.signupCredits}
                                        onChange={handleChange('signupCredits')}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <StarsIcon fontSize="small" color="action" />
                                                </InputAdornment>
                                            )
                                        }}
                                        helperText="Free credits awarded to new users upon registration"
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    {hasChanges ? 'You have unsaved changes' : 'All changes saved'}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => setFormData(originalData)}
                        disabled={!hasChanges || isSaving}
                    >
                        Reset
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Box>
            </Box>

            <Card sx={{ mt: 3, borderRadius: 3, bgcolor: 'info.light', boxShadow: 'none' }}>
                <CardContent>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                        How it works:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        • <strong>Price Per Credit:</strong> Affects the dynamic calculation of purchase plans in the mobile app.<br/>
                        • <strong>Signup Bonus:</strong> Automatically given to users when they create a new account.<br/>
                        • Changes take effect immediately after saving.
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default AppSettings;
