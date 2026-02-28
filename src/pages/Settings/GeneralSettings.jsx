import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    TextField,
    Button,
    Stack,
    IconButton,
    Avatar,
    Divider,
    CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';

const GeneralSettings = ({ settings, onSave, isSaving }) => {
    const [formData, setFormData] = useState(settings?.general || {});

    useEffect(() => {
        if (settings?.general) {
            setFormData(settings.general);
        }
    }, [settings]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileUpload = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, [field]: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ general: formData });
    };

    return (
        <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>General Settings</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Configure basic information about your platform.
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Admin Name"
                                name="adminName"
                                value={formData.adminName || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Admin Email"
                                name="adminEmail"
                                value={formData.adminEmail || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Mobile App Link"
                                name="mobileAppLink"
                                value={formData.mobileAppLink || ''}
                                onChange={handleChange}
                                placeholder="https://play.google.com/store/apps/details?id=..."
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Site Name"
                                name="siteName"
                                value={formData.siteName || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Site Description"
                                name="siteDescription"
                                value={formData.siteDescription || ''}
                                onChange={handleChange}
                                multiline
                                rows={1}
                            />
                        </Grid>

                        <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                        {/* Logo Uploads Section */}
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>Site Logo</Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar variant="rounded" src={formData.siteLogo} sx={{ width: 64, height: 64, bgcolor: 'action.hover' }} />
                                <Button variant="outlined" component="label" size="small" startIcon={<CloudUploadIcon />}>
                                    Upload
                                    <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'siteLogo')} />
                                </Button>
                            </Stack>
                            <TextField
                                fullWidth
                                size="small"
                                label="URL"
                                name="siteLogo"
                                value={formData.siteLogo || ''}
                                onChange={handleChange}
                                sx={{ mt: 1 }}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>Favicon</Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar variant="rounded" src={formData.siteFavicon} sx={{ width: 64, height: 64, bgcolor: 'action.hover' }} />
                                <Button variant="outlined" component="label" size="small" startIcon={<CloudUploadIcon />}>
                                    Upload
                                    <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'siteFavicon')} />
                                </Button>
                            </Stack>
                            <TextField
                                fullWidth
                                size="small"
                                label="URL"
                                name="siteFavicon"
                                value={formData.siteFavicon || ''}
                                onChange={handleChange}
                                sx={{ mt: 1 }}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>Small Icon</Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar variant="rounded" src={formData.siteIcon} sx={{ width: 64, height: 64, bgcolor: 'action.hover' }} />
                                <Button variant="outlined" component="label" size="small" startIcon={<CloudUploadIcon />}>
                                    Upload
                                    <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'siteIcon')} />
                                </Button>
                            </Stack>
                            <TextField
                                fullWidth
                                size="small"
                                label="URL"
                                name="siteIcon"
                                value={formData.siteIcon || ''}
                                onChange={handleChange}
                                sx={{ mt: 1 }}
                            />
                        </Grid>

                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                type="submit"
                                startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                size="large"
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save General Settings'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </CardContent>
        </Card>
    );
};

export default GeneralSettings;
