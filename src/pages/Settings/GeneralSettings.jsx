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
import { uploadFile } from '../../utils/upload';
import MediaLibrary from '../Media/MediaLibrary';
import toast from 'react-hot-toast';

const GeneralSettings = ({ settings, onSave, isSaving }) => {
    const [formData, setFormData] = useState(settings?.general || {});
    const [libraryOpen, setLibraryOpen] = useState(false);
    const [activeField, setActiveField] = useState(null);

    useEffect(() => {
        if (settings?.general) {
            setFormData(settings.general);
        }
    }, [settings]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const loadingToast = toast.loading(`Uploading ${file.name}...`);
            const result = await uploadFile(file);
            
            if (result.success) {
                setFormData({ ...formData, [field]: result.url });
                toast.success('Upload successful', { id: loadingToast });
            } else {
                toast.error('Upload failed', { id: loadingToast });
            }
        } catch (err) {
            
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            if (e.target) e.target.value = '';
        }
    };

    const handleSelectFromLibrary = (file) => {
        if (activeField && file) {
            setFormData({ ...formData, [activeField]: file.url });
            setLibraryOpen(false);
            setActiveField(null);
        }
    };

    const openLibrary = (field) => {
        setActiveField(field);
        setLibraryOpen(true);
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
                                <Avatar variant="rounded" src={fixUrl(formData.siteLogo)} sx={{ width: 64, height: 64, bgcolor: 'action.hover' }} />
                                <Stack spacing={1}>
                                    <Button variant="outlined" component="label" size="small" startIcon={<CloudUploadIcon />} sx={{ textTransform: 'none' }}>
                                        Local Upload
                                        <input type="file" hidden accept="image/*,.svg" onChange={(e) => handleFileUpload(e, 'siteLogo')} />
                                    </Button>
                                    <Button variant="outlined" color="secondary" size="small" startIcon={<PhotoLibraryIcon />} onClick={() => openLibrary('siteLogo')} sx={{ textTransform: 'none' }}>
                                        From Library
                                    </Button>
                                </Stack>
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
                                <Avatar variant="rounded" src={fixUrl(formData.siteFavicon)} sx={{ width: 64, height: 64, bgcolor: 'action.hover' }} />
                                <Stack spacing={1}>
                                    <Button variant="outlined" component="label" size="small" startIcon={<CloudUploadIcon />} sx={{ textTransform: 'none' }}>
                                        Local Upload
                                        <input type="file" hidden accept="image/*,.svg" onChange={(e) => handleFileUpload(e, 'siteFavicon')} />
                                    </Button>
                                    <Button variant="outlined" color="secondary" size="small" startIcon={<PhotoLibraryIcon />} onClick={() => openLibrary('siteFavicon')} sx={{ textTransform: 'none' }}>
                                        From Library
                                    </Button>
                                </Stack>
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

                        <Grid item xs={12} md={3}>
                            <Typography variant="subtitle2" gutterBottom>Small Icon</Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar variant="rounded" src={fixUrl(formData.siteIcon)} sx={{ width: 64, height: 64, bgcolor: 'action.hover' }} />
                                <Stack spacing={1}>
                                    <Button variant="outlined" component="label" size="small" startIcon={<CloudUploadIcon />} sx={{ textTransform: 'none' }}>
                                        Local Upload
                                        <input type="file" hidden accept="image/*,.svg" onChange={(e) => handleFileUpload(e, 'siteIcon')} />
                                    </Button>
                                    <Button variant="outlined" color="secondary" size="small" startIcon={<PhotoLibraryIcon />} onClick={() => openLibrary('siteIcon')} sx={{ textTransform: 'none' }}>
                                        From Library
                                    </Button>
                                </Stack>
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

                        <Grid item xs={12} md={3}>
                            <Typography variant="subtitle2" gutterBottom color="info.main" fontWeight={700}>App Launcher Icon</Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar variant="rounded" src={fixUrl(formData.appLauncherIcon)} sx={{ width: 64, height: 64, bgcolor: 'action.hover' }} />
                                <Stack spacing={1}>
                                    <Button variant="outlined" color="info" component="label" size="small" startIcon={<CloudUploadIcon />} sx={{ textTransform: 'none' }}>
                                        Local Upload
                                        <input type="file" hidden accept="image/*,.png,.jpg" onChange={(e) => handleFileUpload(e, 'appLauncherIcon')} />
                                    </Button>
                                    <Button variant="outlined" color="secondary" size="small" startIcon={<PhotoLibraryIcon />} onClick={() => openLibrary('appLauncherIcon')} sx={{ textTransform: 'none' }}>
                                        From Library
                                    </Button>
                                </Stack>
                            </Stack>
                            <TextField
                                fullWidth
                                size="small"
                                label="App Icon URL"
                                name="appLauncherIcon"
                                value={formData.appLauncherIcon || ''}
                                onChange={handleChange}
                                sx={{ mt: 1 }}
                                placeholder="http://..."
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <Typography variant="subtitle2" gutterBottom color="primary.main" fontWeight={700}>PDF Receipt Logo</Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar variant="rounded" src={fixUrl(formData.pdfLogo)} sx={{ width: 64, height: 64, bgcolor: 'action.hover' }} />
                                <Stack spacing={1}>
                                    <Button variant="outlined" color="primary" component="label" size="small" startIcon={<CloudUploadIcon />} sx={{ textTransform: 'none' }}>
                                        Local Upload
                                        <input type="file" hidden accept="image/*,.svg" onChange={(e) => handleFileUpload(e, 'pdfLogo')} />
                                    </Button>
                                    <Button variant="outlined" color="secondary" size="small" startIcon={<PhotoLibraryIcon />} onClick={() => openLibrary('pdfLogo')} sx={{ textTransform: 'none' }}>
                                        From Library
                                    </Button>
                                </Stack>
                            </Stack>
                            <TextField
                                fullWidth
                                size="small"
                                label="PDF Logo URL"
                                name="pdfLogo"
                                value={formData.pdfLogo || ''}
                                onChange={handleChange}
                                sx={{ mt: 1 }}
                                placeholder="http://..."
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <Typography variant="subtitle2" gutterBottom color="primary.main" fontWeight={700}>PDF Cert. Signature</Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar variant="rounded" src={fixUrl(formData.pdfCertificateSignature)} sx={{ width: 64, height: 64, bgcolor: 'action.hover' }} />
                                <Button variant="outlined" color="primary" component="label" size="small" startIcon={<CloudUploadIcon />}>
                                    Upload
                                    <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'pdfCertificateSignature')} />
                                </Button>
                            </Stack>
                            <TextField
                                fullWidth
                                size="small"
                                label="Signature URL"
                                name="pdfCertificateSignature"
                                value={formData.pdfCertificateSignature || ''}
                                onChange={handleChange}
                                sx={{ mt: 1 }}
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <Typography variant="subtitle2" gutterBottom color="primary.main" fontWeight={700}>PDF Cert. Seal</Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar variant="rounded" src={fixUrl(formData.pdfCertificateSeal)} sx={{ width: 64, height: 64, bgcolor: 'action.hover' }} />
                                <Button variant="outlined" color="primary" component="label" size="small" startIcon={<CloudUploadIcon />}>
                                    Upload
                                    <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'pdfCertificateSeal')} />
                                </Button>
                            </Stack>
                            <TextField
                                fullWidth
                                size="small"
                                label="Seal URL"
                                name="pdfCertificateSeal"
                                value={formData.pdfCertificateSeal || ''}
                                onChange={handleChange}
                                sx={{ mt: 1 }}
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <Typography variant="subtitle2" gutterBottom color="primary.main" fontWeight={700}>PDF Cert. Badge</Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar variant="rounded" src={fixUrl(formData.pdfCertificateBadge)} sx={{ width: 64, height: 64, bgcolor: 'action.hover' }} />
                                <Button variant="outlined" color="primary" component="label" size="small" startIcon={<CloudUploadIcon />}>
                                    Upload
                                    <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'pdfCertificateBadge')} />
                                </Button>
                            </Stack>
                            <TextField
                                fullWidth
                                size="small"
                                label="Badge URL"
                                name="pdfCertificateBadge"
                                value={formData.pdfCertificateBadge || ''}
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

            {/* Media Library Dialog */}
            <Dialog 
                open={libraryOpen} 
                onClose={() => setLibraryOpen(false)} 
                maxWidth="lg" 
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, height: '90vh' }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, bgcolor: 'background.default' }}>
                    Select Media for {activeField?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: 'background.default' }}>
                    <MediaLibrary onSelect={handleSelectFromLibrary} />
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default GeneralSettings;
