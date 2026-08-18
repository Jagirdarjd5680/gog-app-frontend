import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    Card,
    Button,
    Tabs,
    Tab,
    Divider,
    Stack,
    Alert,
    CircularProgress
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import api from '../../utils/api';
import { toast } from 'react-toastify';

// Fetches the real generated PDF (same template real receipts/registration letters use, with
// fabricated sample data) as a blob and renders it inline — replaces the old static screenshot
// gallery, which could drift from what the template actually produces.
const LivePdfPreviewCard = ({ type, title, description }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState(false);

    const loadPreview = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            // Cache-busting param — api.js caches GET responses for 5s, which would make
            // "Refresh Preview" (e.g. right after editing company/GST info) look like a no-op.
            const res = await api.get(`/settings/pdf-demo/${type}?_t=${Date.now()}`, { responseType: 'blob' });
            const url = URL.createObjectURL(res.data);
            setPreviewUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return url;
            });
        } catch (err) {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [type]);

    useEffect(() => {
        loadPreview();
        return () => {
            setPreviewUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
            });
        };
    }, [loadPreview]);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const res = await api.get(`/settings/pdf-demo/${type}?download=true`, { responseType: 'blob' });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `demo-${type}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            toast.error('Failed to download demo PDF');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>{title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 480 }}>
                        {description}
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1.5}>
                    <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={loadPreview} disabled={loading}>
                        Refresh Preview
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={downloading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
                        onClick={handleDownload}
                        disabled={downloading}
                    >
                        Download Demo PDF
                    </Button>
                </Stack>
            </Box>
            <Divider />
            <Box sx={{ bgcolor: 'grey.100', p: 2 }}>
                {error ? (
                    <Alert severity="error">Couldn't generate the preview. Check the backend logs.</Alert>
                ) : loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 500 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box
                        component="iframe"
                        src={previewUrl}
                        title={`${title} preview`}
                        sx={{
                            width: '100%',
                            height: 780,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            bgcolor: '#fff'
                        }}
                    />
                )}
            </Box>
            <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                <Typography variant="caption" color="text.secondary">
                    Company name, GST number, address, contact, logo, and terms &amp; conditions come from{' '}
                    <b>Settings → Company &amp; Policies</b> — update them there and refresh this preview.
                </Typography>
            </Box>
        </Card>
    );
};

const PDFFormatsSettings = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
            <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Typography variant="h6" fontWeight={700}>PDF Document Formats</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Choose and customize the design of your official documents.</Typography>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 2 }}>
                    <Tab icon={<ReceiptLongIcon />} iconPosition="start" label="Payment Receipts" />
                    <Tab icon={<AssignmentIcon />} iconPosition="start" label="Registration Letter" />
                    <Tab icon={<CardMembershipIcon />} iconPosition="start" label="Certificates" />
                </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
                {tabValue === 0 && (
                    <LivePdfPreviewCard
                        type="receipt"
                        title="Tax Invoice / Payment Receipt"
                        description="Live template — GST-split item table, amount in words, and the ₹ symbol render exactly like this on every real receipt a student downloads or receives by email."
                    />
                )}

                {tabValue === 1 && (
                    <LivePdfPreviewCard
                        type="registration"
                        title="Registration Confirmation Letter"
                        description="Live template — course + fee summary and terms, sent to a student the moment their registration is confirmed."
                    />
                )}

                {tabValue === 2 && (
                    <LivePdfPreviewCard
                        type="certificate"
                        title="Certificate of Completion"
                        description="Live template — dark themed, gold ornamental border, ISO seal. Student name, course, and signature come from real data on every issued certificate."
                    />
                )}
            </Box>
        </Paper>
    );
};

export default PDFFormatsSettings;
