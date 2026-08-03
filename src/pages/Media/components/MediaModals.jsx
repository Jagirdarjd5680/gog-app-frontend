import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    TextField,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Divider
} from '@mui/material';
import api from '../../../utils/api';
import { toast } from 'react-toastify';

const MediaModals = (props) => {
    const isStatsOpen = Boolean(props.statsModalOpen || props.statsOpen);
    const closeStats = props.onStatsClose || (() => props.setStatsModalOpen && props.setStatsModalOpen(false));

    const isDeleteOpen = Boolean(props.deleteDialogOpen);
    const closeDelete = () => props.setDeleteDialogOpen && props.setDeleteDialogOpen(false);

    const isUrlImportOpen = Boolean(props.urlImportOpen || props.importOpen);
    const closeUrlImport = props.onImportClose || (() => props.setUrlImportOpen && props.setUrlImportOpen(false));

    const [importUrl, setImportUrl] = useState('');
    const [importTitle, setImportTitle] = useState('');
    const [importing, setImporting] = useState(false);

    const handleImportSubmit = async () => {
        if (!importUrl) return toast.error('URL is required');
        setImporting(true);
        try {
            await api.post('/upload/import-url', { url: importUrl, title: importTitle });
            toast.success('URL imported successfully');
            if (props.onImportSuccess) props.onImportSuccess();
            closeUrlImport();
            setImportUrl('');
            setImportTitle('');
        } catch (error) {
            console.error('Import URL failed:', error);
            toast.error(error.response?.data?.message || 'Failed to import URL');
        } finally {
            setImporting(false);
        }
    };

    const files = props.files || [];
    const imageCount = files.filter(f => f.mimetype?.startsWith('image') || f.type === 'image').length;
    const videoCount = files.filter(f => f.mimetype?.startsWith('video') || f.type === 'video').length;
    const otherCount = files.length - imageCount - videoCount;

    return (
        <>
            {/* Storage Stats Modal */}
            <Dialog open={isStatsOpen} onClose={closeStats} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Storage Statistics</DialogTitle>
                <DialogContent dividers>
                    <List>
                        <ListItem>
                            <ListItemText primary="TOTAL ASSETS" secondary={`${files.length} Files`} />
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemText primary="IMAGES & PHOTOS" secondary={`${imageCount} Files`} />
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemText primary="VIDEOS & CHUNKS" secondary={`${videoCount} Files`} />
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemText primary="DOCUMENTS & OTHER" secondary={`${otherCount} Files`} />
                        </ListItem>
                    </List>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={closeStats} variant="outlined">Close</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteOpen} onClose={() => !props.deleting && closeDelete()} PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Delete File?</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2">
                        Are you sure you want to permanently delete <b>{props.deleteFile?.name}</b>?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={closeDelete} disabled={props.deleting} variant="outlined">Cancel</Button>
                    <Button onClick={props.confirmDelete} color="error" variant="contained" disabled={props.deleting}>
                        {props.deleting ? <CircularProgress size={20} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* URL Import Modal */}
            <Dialog open={isUrlImportOpen} onClose={closeUrlImport} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Import External URL Asset</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
                        <TextField 
                            label="Title / Asset Name" 
                            fullWidth 
                            size="small"
                            value={props.importForm ? props.importForm.title : importTitle} 
                            onChange={(e) => props.setImportForm ? props.setImportForm({...props.importForm, title: e.target.value}) : setImportTitle(e.target.value)} 
                        />
                        <TextField 
                            label="Direct File URL" 
                            fullWidth 
                            size="small"
                            value={props.importForm ? props.importForm.url : importUrl} 
                            onChange={(e) => props.setImportForm ? props.setImportForm({...props.importForm, url: e.target.value}) : setImportUrl(e.target.value)} 
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={closeUrlImport} variant="outlined">Cancel</Button>
                    <Button onClick={props.handleUrlImport || handleImportSubmit} variant="contained" color="primary" disabled={props.importingUrl || importing}>
                        {(props.importingUrl || importing) ? <CircularProgress size={20} /> : 'Import Asset'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default MediaModals;
