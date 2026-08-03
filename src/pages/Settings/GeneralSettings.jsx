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
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    Tooltip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import { fixUrl } from '../../utils/api';
import UniversalUpload from '../../components/Common/UniversalUpload';
import toast from 'react-hot-toast';

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
                            <UniversalUpload
                                label="Site Logo"
                                value={formData.siteLogo || ''}
                                onChange={(url) => setFormData({ ...formData, siteLogo: url })}
                                type="image"
                                accept="image/*,.svg"
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <UniversalUpload
                                label="Favicon"
                                value={formData.siteFavicon || ''}
                                onChange={(url) => setFormData({ ...formData, siteFavicon: url })}
                                type="image"
                                accept="image/*,.svg"
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <UniversalUpload
                                label="Small Icon"
                                value={formData.siteIcon || ''}
                                onChange={(url) => setFormData({ ...formData, siteIcon: url })}
                                type="image"
                                accept="image/*,.svg"
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <UniversalUpload
                                label="App Launcher Icon"
                                value={formData.appLauncherIcon || ''}
                                onChange={(url) => setFormData({ ...formData, appLauncherIcon: url })}
                                type="image"
                                accept="image/*,.png,.jpg"
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <UniversalUpload
                                label="PDF Receipt Logo"
                                value={formData.pdfLogo || ''}
                                onChange={(url) => setFormData({ ...formData, pdfLogo: url })}
                                type="image"
                                accept="image/*,.svg"
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <UniversalUpload
                                label="PDF Cert. Signature"
                                value={formData.pdfCertificateSignature || ''}
                                onChange={(url) => setFormData({ ...formData, pdfCertificateSignature: url })}
                                type="image"
                                accept="image/*"
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <UniversalUpload
                                label="PDF Cert. Seal"
                                value={formData.pdfCertificateSeal || ''}
                                onChange={(url) => setFormData({ ...formData, pdfCertificateSeal: url })}
                                type="image"
                                accept="image/*"
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <UniversalUpload
                                label="PDF Cert. Badge"
                                value={formData.pdfCertificateBadge || ''}
                                onChange={(url) => setFormData({ ...formData, pdfCertificateBadge: url })}
                                type="image"
                                accept="image/*"
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
