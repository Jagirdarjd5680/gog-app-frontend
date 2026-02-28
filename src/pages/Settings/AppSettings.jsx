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
    Info as InfoIcon
} from '@mui/icons-material';

const AppSettings = ({ settings, onSave, isSaving }) => {
    const [formData, setFormData] = useState({
        appVersion: '',
        appLink: ''
    });
    const [originalData, setOriginalData] = useState({});

    useEffect(() => {
        if (settings) {
            const appSettings = {
                appVersion: settings.app?.version || '1.0.0',
                appLink: settings.app?.link || 'https://play.google.com/store/apps/details?id=com.godofgraphics.lms'
            };
            setFormData(appSettings);
            setOriginalData(appSettings);
        }
    }, [settings]);

    const handleChange = (field) => (e) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    const handleSave = () => {
        const updatedSettings = {
            ...settings,
            app: {
                version: formData.appVersion,
                link: formData.appLink
            }
        };
        onSave(updatedSettings);
    };

    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

    return (
        <Box>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                App Settings
            </Typography>

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
                        {/* App Version */}
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

                        {/* App Link */}
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

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card sx={{ mt: 3, borderRadius: 3, bgcolor: 'info.light', boxShadow: 'none' }}>
                <CardContent>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                        How it works:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        • <strong>App Version:</strong> Displayed in the mobile app's Settings page<br/>
                        • <strong>App Link:</strong> Used when users click "Share App" or "Rate App" buttons<br/>
                        • Changes are immediately reflected in the mobile app after saving
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default AppSettings;
