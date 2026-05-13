import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Grid, 
    TextField, 
    Button, 
    Tabs, 
    Tab, 
    Divider, 
    Alert, 
    CircularProgress,
    Chip,
    Stack
} from '@mui/material';
import { 
    Save as SaveIcon, 
    CloudDone as CloudIcon,
    Storage as StorageIcon,
    Science as TestIcon
} from '@mui/icons-material';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const StorageSettings = ({ settings: parentSettings, onSave, isSaving }) => {
    const [settings, setSettings] = useState(parentSettings?.storage || {
        activeProvider: 'local',
        bunnycdn: { apiKey: '', storageZoneName: '', pullZoneUrl: '', streamLibraryId: '', accessKey: '' },
        aws: { accessKeyId: '', secretAccessKey: '', region: '', bucketName: '' },
        cloudinary: { cloudName: '', apiKey: '', apiSecret: '' },
        cloudflare: { accountId: '', apiToken: '', subdomain: '' }
    });
    const [tab, setTab] = useState(0);
    const [isTesting, setIsTesting] = useState(false);

    const handleSave = () => {
        onSave({ storage: settings });
    };

    const handleChange = (provider, field, value) => {
        setSettings(prev => ({
            ...prev,
            [provider]: {
                ...prev[provider],
                [field]: value
            }
        }));
    };

    const handleTest = async () => {
        setIsTesting(true);
        const providerNames = ['bunnycdn', 'aws', 'cloudinary', 'local', 'cloudflare'];
        const provider = providerNames[tab];
        
        try {
            const res = await api.post('/settings/test-storage', {
                provider,
                config: settings[provider]
            });
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Connection failed');
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>Storage & Management</Typography>
                    <Typography variant="body2" color="text.secondary">Configure cloud storage providers and HLS stream settings.</Typography>
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
                <Grid item xs={12} md={3}>
                    <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        <Tabs 
                            orientation="vertical" 
                            value={tab} 
                            onChange={(e, v) => setTab(v)}
                            sx={{
                                borderRight: 1, 
                                borderColor: 'divider',
                                '& .MuiTab-root': { alignItems: 'flex-start', textAlign: 'left', py: 2 }
                            }}
                        >
                            <Tab label="BunnyCDN" icon={<CloudIcon />} iconPosition="start" />
                            <Tab label="AWS S3" icon={<StorageIcon />} iconPosition="start" />
                            <Tab label="Cloudinary" icon={<CloudIcon />} iconPosition="start" />
                            <Tab label="Cloudflare Stream" icon={<CloudIcon />} iconPosition="start" />
                            <Tab label="Local VPS" icon={<StorageIcon />} iconPosition="start" />
                        </Tabs>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={9}>
                    {tab === 0 && (
                        <Paper sx={{ p: 4, borderRadius: 3 }}>
                            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h6" fontWeight={700}>BunnyCDN Configuration</Typography>
                                <Stack direction="row" spacing={1}>
                                    <Button 
                                        variant="outlined"
                                        color="info"
                                        size="small"
                                        startIcon={isTesting ? <CircularProgress size={16} /> : <TestIcon />}
                                        onClick={handleTest}
                                        disabled={isTesting}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Test API
                                    </Button>
                                    <Button 
                                        variant={settings.activeProvider === 'bunnycdn' ? "contained" : "outlined"}
                                        color="success"
                                        size="small"
                                        onClick={() => setSettings({...settings, activeProvider: 'bunnycdn'})}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        {settings.activeProvider === 'bunnycdn' ? "Primary Active" : "Set as Primary"}
                                    </Button>
                                </Stack>
                            </Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        BunnyCDN is recommended for fast static file delivery and HLS Video Streaming.
                                    </Alert>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField 
                                        fullWidth 
                                        label="Storage API Key" 
                                        size="small"
                                        value={settings.bunnycdn.apiKey}
                                        onChange={(e) => handleChange('bunnycdn', 'apiKey', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField 
                                        fullWidth 
                                        label="Storage Zone Name" 
                                        size="small"
                                        value={settings.bunnycdn.storageZoneName}
                                        onChange={(e) => handleChange('bunnycdn', 'storageZoneName', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField 
                                        fullWidth 
                                        label="Pull Zone URL (Public CDN Link)" 
                                        size="small"
                                        value={settings.bunnycdn.pullZoneUrl}
                                        onChange={(e) => handleChange('bunnycdn', 'pullZoneUrl', e.target.value)}
                                        placeholder="https://your-zone.b-cdn.net"
                                    />
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 1 }}>
                                        <Chip label="Bunny Stream (Video HLS)" size="small" />
                                    </Divider>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField 
                                        fullWidth 
                                        label="Stream Library ID" 
                                        size="small"
                                        value={settings.bunnycdn.streamLibraryId}
                                        onChange={(e) => handleChange('bunnycdn', 'streamLibraryId', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField 
                                        fullWidth 
                                        label="Stream Access Key (API Key)" 
                                        size="small"
                                        value={settings.bunnycdn.accessKey}
                                        onChange={(e) => handleChange('bunnycdn', 'accessKey', e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    )}

                    {tab === 1 && (
                        <Paper sx={{ p: 4, borderRadius: 3 }}>
                            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h6" fontWeight={700}>AWS S3 Configuration</Typography>
                                <Stack direction="row" spacing={1}>
                                    <Button 
                                        variant="outlined"
                                        color="info"
                                        size="small"
                                        startIcon={isTesting ? <CircularProgress size={16} /> : <TestIcon />}
                                        onClick={handleTest}
                                        disabled={isTesting}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Test S3
                                    </Button>
                                    <Button 
                                        variant={settings.activeProvider === 'aws' ? "contained" : "outlined"}
                                        color="success"
                                        size="small"
                                        onClick={() => setSettings({...settings, activeProvider: 'aws'})}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        {settings.activeProvider === 'aws' ? "Primary Active" : "Set as Primary"}
                                    </Button>
                                </Stack>
                            </Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField 
                                        fullWidth 
                                        label="Access Key ID" 
                                        size="small"
                                        value={settings.aws.accessKeyId}
                                        onChange={(e) => handleChange('aws', 'accessKeyId', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField 
                                        fullWidth 
                                        label="Secret Access Key" 
                                        size="small"
                                        type="password"
                                        value={settings.aws.secretAccessKey}
                                        onChange={(e) => handleChange('aws', 'secretAccessKey', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField 
                                        fullWidth 
                                        label="Region" 
                                        size="small"
                                        value={settings.aws.region}
                                        onChange={(e) => handleChange('aws', 'region', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField 
                                        fullWidth 
                                        label="Bucket Name" 
                                        size="small"
                                        value={settings.aws.bucketName}
                                        onChange={(e) => handleChange('aws', 'bucketName', e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    )}

                    {tab === 2 && (
                        <Paper sx={{ p: 4, borderRadius: 3 }}>
                            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h6" fontWeight={700}>Cloudinary Configuration</Typography>
                                <Stack direction="row" spacing={1}>
                                    <Button 
                                        variant="outlined"
                                        color="info"
                                        size="small"
                                        startIcon={isTesting ? <CircularProgress size={16} /> : <TestIcon />}
                                        onClick={handleTest}
                                        disabled={isTesting}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Test API
                                    </Button>
                                    <Button 
                                        variant={settings.activeProvider === 'cloudinary' ? "contained" : "outlined"}
                                        color="success"
                                        size="small"
                                        onClick={() => setSettings({...settings, activeProvider: 'cloudinary'})}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        {settings.activeProvider === 'cloudinary' ? "Primary Active" : "Set as Primary"}
                                    </Button>
                                </Stack>
                            </Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                    <TextField 
                                        fullWidth 
                                        label="Cloud Name" 
                                        size="small"
                                        value={settings.cloudinary.cloudName}
                                        onChange={(e) => handleChange('cloudinary', 'cloudName', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField 
                                        fullWidth 
                                        label="API Key" 
                                        size="small"
                                        value={settings.cloudinary.apiKey}
                                        onChange={(e) => handleChange('cloudinary', 'apiKey', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField 
                                        fullWidth 
                                        label="API Secret" 
                                        size="small"
                                        type="password"
                                        value={settings.cloudinary.apiSecret}
                                        onChange={(e) => handleChange('cloudinary', 'apiSecret', e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    )}

                    {tab === 3 && (
                        <Paper sx={{ p: 4, borderRadius: 3 }}>
                            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h6" fontWeight={700}>Cloudflare Stream Configuration</Typography>
                                <Stack direction="row" spacing={1}>
                                    <Button 
                                        variant="outlined"
                                        color="info"
                                        size="small"
                                        startIcon={isTesting ? <CircularProgress size={16} /> : <TestIcon />}
                                        onClick={handleTest}
                                        disabled={isTesting}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Test API
                                    </Button>
                                    <Button 
                                        variant={settings.activeProvider === 'cloudflare' ? "contained" : "outlined"}
                                        color="success"
                                        size="small"
                                        onClick={() => setSettings({...settings, activeProvider: 'cloudflare'})}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        {settings.activeProvider === 'cloudflare' ? "Primary Active" : "Set as Primary"}
                                    </Button>
                                </Stack>
                            </Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Alert severity="info">
                                        Cloudflare Stream provides high-quality video delivery and security. Enter your account details below.
                                    </Alert>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField 
                                        fullWidth 
                                        label="Account ID" 
                                        size="small"
                                        value={settings.cloudflare?.accountId || ''}
                                        onChange={(e) => handleChange('cloudflare', 'accountId', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField 
                                        fullWidth 
                                        label="API Token (Stream Edit Permission)" 
                                        size="small"
                                        type="password"
                                        value={settings.cloudflare?.apiToken || ''}
                                        onChange={(e) => handleChange('cloudflare', 'apiToken', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField 
                                        fullWidth 
                                        label="Custom Subdomain (Optional)" 
                                        size="small"
                                        value={settings.cloudflare?.subdomain || ''}
                                        onChange={(e) => handleChange('cloudflare', 'subdomain', e.target.value)}
                                        placeholder="customer-xxxx.cloudflarestream.com"
                                        helperText="Leave empty to use default Cloudflare URLs"
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    )}

                    {tab === 4 && (
                        <Paper sx={{ p: 4, borderRadius: 3 }}>
                            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h6" fontWeight={700}>Local Storage Configuration</Typography>
                                <Button 
                                    variant={settings.activeProvider === 'local' ? "contained" : "outlined"}
                                    color="success"
                                    size="small"
                                    onClick={() => setSettings({...settings, activeProvider: 'local'})}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {settings.activeProvider === 'local' ? "Primary Active" : "Set as Primary"}
                                </Button>
                            </Box>
                            <Alert severity="warning">
                                Local storage saves files directly on your server VPS. This is not recommended for high-traffic sites as it consumes your server bandwidth and storage.
                            </Alert>
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default StorageSettings;
