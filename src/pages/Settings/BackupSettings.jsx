import { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Stack,
    CircularProgress,
    Alert,
    Divider
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import StorageIcon from '@mui/icons-material/Storage';
import WarningIcon from '@mui/icons-material/Warning';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const BackupSettings = () => {
    const [loading, setLoading] = useState(false);
    const [restoring, setRestoring] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            const response = await api.get('/backup/export', { responseType: 'blob' });
            
            // Create a link to download the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const timestamp = new Date().toISOString().split('T')[0];
            link.setAttribute('download', `gog_backup_${timestamp}.json`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            toast.success('Backup downloaded successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export backup');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                
                if (window.confirm('Are you sure? This will OVERWRITE existing data in the database with the backup data.')) {
                    setRestoring(true);
                    const response = await api.post('/backup/import', jsonData);
                    if (response.data.success) {
                        toast.success('Database restored successfully!');
                    } else {
                        toast.error(response.data.message || 'Restoration failed');
                    }
                }
            } catch (error) {
                console.error('Import error:', error);
                toast.error('Invalid backup file or restoration failed');
            } finally {
                setRestoring(false);
                // Reset file input
                event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
                Database Backup & Restore
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Export your entire database to a JSON file for backup, or restore data from a previous backup file.
            </Typography>

            <Stack spacing={3}>
                {/* Export Section */}
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <Box sx={{ p: 1, bgcolor: 'primary.light', borderRadius: 2, color: 'primary.main', display: 'flex' }}>
                                <CloudDownloadIcon />
                            </Box>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={700}>Download Full Backup</Typography>
                                <Typography variant="body2" color="text.secondary">Save all collections, users, courses, and transactions to your computer.</Typography>
                            </Box>
                        </Stack>
                        <Button
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudDownloadIcon />}
                            onClick={handleExport}
                            disabled={loading || restoring}
                            sx={{ borderRadius: 2, px: 4 }}
                        >
                            {loading ? 'Generating Backup...' : 'Download Backup (.json)'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Import Section */}
                <Card variant="outlined" sx={{ borderRadius: 3, border: '1px solid', borderColor: 'warning.light' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <Box sx={{ p: 1, bgcolor: 'warning.light', borderRadius: 2, color: 'warning.main', display: 'flex' }}>
                                <CloudUploadIcon />
                            </Box>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={700}>Restore from Backup</Typography>
                                <Typography variant="body2" color="text.secondary">Upload a previously downloaded JSON backup file to restore your database.</Typography>
                            </Box>
                        </Stack>
                        
                        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3, borderRadius: 2 }}>
                            <Typography variant="body2" fontWeight={700}>DANGER ZONE</Typography>
                            Restoring a backup will delete current data and replace it with the backup content. This action cannot be undone.
                        </Alert>

                        <Button
                            variant="outlined"
                            color="warning"
                            component="label"
                            startIcon={restoring ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                            disabled={loading || restoring}
                            sx={{ borderRadius: 2, px: 4 }}
                        >
                            {restoring ? 'Restoring Data...' : 'Upload & Restore Backup'}
                            <input
                                type="file"
                                hidden
                                accept=".json"
                                onChange={handleImport}
                            />
                        </Button>
                    </CardContent>
                </Card>

                {/* Info Section */}
                <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: 'action.hover', border: 'none' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                            <StorageIcon color="info" />
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700}>Migrating to a New Database?</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    If you change your MongoDB URL in the .env file, follow these steps:
                                    <ol style={{ paddingLeft: '20px', marginTop: '8px' }}>
                                        <li>Download the backup from the current database.</li>
                                        <li>Update the MONGO_URI in your backend .env file to the new URL.</li>
                                        <li>Restart the backend server.</li>
                                        <li>Come back here and use the "Restore" option to upload your backup file.</li>
                                    </ol>
                                </Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        </Box>
    );
};

export default BackupSettings;
