import React from 'react';
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

const MediaModals = ({
    statsModalOpen, setStatsModalOpen, storageStats,
    deleteDialogOpen, setDeleteDialogOpen, deleting, confirmDelete, deleteFile,
    bulkDeleteDialogOpen, setBulkDeleteDialogOpen, bulkDeleting, confirmBulkDelete, selectedFiles,
    urlImportOpen, setUrlImportOpen, importingUrl, importForm, setImportForm, handleUrlImport
}) => {
    return (
        <>
            {/* Storage Stats Modal */}
            <Dialog open={statsModalOpen} onClose={() => setStatsModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Storage Statistics</DialogTitle>
                <DialogContent>
                    <List>
                        {storageStats?.breakdown.map((item, index) => (
                            <React.Fragment key={item.type}>
                                <ListItem>
                                    <ListItemText 
                                        primary={item.type.toUpperCase()} 
                                        secondary={`${item.count} files - ${(item.size / (1024 * 1024)).toFixed(2)} MB`} 
                                    />
                                </ListItem>
                                {index < storageStats.breakdown.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatsModalOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteDialogOpen} onClose={() => !deleting && setDeleteDialogOpen(false)}>
                <DialogTitle>Delete File?</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to permanently delete <b>{deleteFile?.name}</b>?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained" disabled={deleting}>
                        {deleting ? <CircularProgress size={24} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* URL Import Modal */}
            <Dialog open={urlImportOpen} onClose={() => !importingUrl && setUrlImportOpen(false)}>
                <DialogTitle>Import External URL</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField 
                            label="Title" 
                            fullWidth 
                            value={importForm.title} 
                            onChange={(e) => setImportForm({...importForm, title: e.target.value})} 
                        />
                        <TextField 
                            label="URL" 
                            fullWidth 
                            value={importForm.url} 
                            onChange={(e) => setImportForm({...importForm, url: e.target.value})} 
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUrlImportOpen(false)}>Cancel</Button>
                    <Button onClick={handleUrlImport} variant="contained" disabled={importingUrl}>
                        {importingUrl ? <CircularProgress size={24} /> : 'Import'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default MediaModals;
