import React, { useState } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Grid, 
    Button, 
    Alert, 
    CircularProgress,
    Stack
} from '@mui/material';
import { 
    Save as SaveIcon, 
    Storage as StorageIcon,
    Security as SecurityIcon
} from '@mui/icons-material';

const StorageSettings = ({ settings: parentSettings, onSave, isSaving }) => {
    const [settings, setSettings] = useState(parentSettings?.storage || {
        activeProvider: 'local'
    });

    const handleSave = () => {
        onSave({ storage: { activeProvider: 'local' } });
    };

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>Storage & Security</Typography>
                    <Typography variant="body2" color="text.secondary">Manage how your files and videos are stored and secured locally.</Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={isSaving}
                    sx={{ borderRadius: 2, px: 4 }}
                >
                    Save Changes
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 4, borderRadius: 3 }}>
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h6" fontWeight={700}>Local Secure Storage</Typography>
                            <Button 
                                variant="contained"
                                color="success"
                                size="small"
                                sx={{ borderRadius: 2 }}
                                startIcon={<SecurityIcon />}
                            >
                                Active & Secure
                            </Button>
                        </Box>
                        
                        <Stack spacing={3}>
                            <Alert severity="success">
                                All media files (Images, PDFs, Documents) are currently stored locally on your server and are protected behind authentication.
                            </Alert>

                            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                    Video Security (HLS Encryption)
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Videos are automatically converted to encrypted HLS segments upon upload. This prevents direct downloads and ensures that only authorized users can stream your content.
                                </Typography>
                            </Box>

                            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                    File Protection
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Non-video files are served through a secure backend gateway. Direct access to the storage directory is disabled for the public.
                                </Typography>
                            </Box>

                            <Alert severity="info">
                                Using local storage ensures full privacy and control over your data, with no dependency on third-party cloud providers.
                            </Alert>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default StorageSettings;
