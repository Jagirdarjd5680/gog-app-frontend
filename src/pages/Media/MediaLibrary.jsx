import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    Skeleton,
    Tabs,
    Tab,
    useTheme,
    CircularProgress,
    LinearProgress,
    Checkbox,
    TablePagination,
    Alert,
    Collapse
} from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import api from '../../utils/api';
import { uploadFile } from '../../utils/upload';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

import MediaSidebar from './MediaSidebar';
import MediaCard from './MediaCard';

const MediaLibrary = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedFile, setSelectedFile] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { user } = useAuth();

    // Uploader Filtering
    const [uploaderTab, setUploaderTab] = useState('all');
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState('');

    // Pagination & Bulk Selection
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(12);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            let url = `/upload?page=${page + 1}&limit=${rowsPerPage}&`;
            if (user?.role === 'admin') {
                if (uploaderTab === 'admin') url += 'userRole=admin&';
                if (uploaderTab === 'teacher') {
                    url += 'userRole=teacher&';
                    if (selectedTeacherId) url += `userId=${selectedTeacherId}&`;
                }
            }

            const response = await api.get(url);
            if (response.data.success) {
                setFiles(response.data.files);
                setTotalCount(response.data.total || 0);
            }
        } catch (error) {
            console.error('Fetch Files Error:', error);
            toast.error('Failed to load media files');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await api.get('/users?role=teacher&limit=100');
            if (response.data.success) {
                setTeachers(response.data.data);
            }
        } catch (error) {
            console.error('Fetch Teachers Error:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchFiles();
            if (user.role === 'admin') {
                fetchTeachers();
            }
        }
    }, [user, uploaderTab, selectedTeacherId, page, rowsPerPage]);

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
        setSelectedFiles([]); // Clear selection on page change
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        setSelectedFiles([]);
    };

    const toggleFileSelection = (fileName) => {
        setSelectedFiles(prev =>
            prev.includes(fileName)
                ? prev.filter(name => name !== fileName)
                : [...prev, fileName]
        );
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedFiles(files.map(f => f.name));
        } else {
            setSelectedFiles([]);
        }
    };

    const handleBulkDelete = async () => {
        try {
            const response = await api.post('/upload/bulk-delete', { fileNames: selectedFiles });
            if (response.data.success) {
                toast.success(response.data.message);
                setSelectedFiles([]);
                setBulkDeleteDialogOpen(false);
                fetchFiles();
            }
        } catch (error) {
            console.error('Bulk Delete Error:', error);
            toast.error('Failed to delete selected files');
        }
    };

    const handleDelete = async () => {
        try {
            const response = await api.delete(`/upload/${selectedFile.name}`);
            if (response.data.success) {
                toast.success('File deleted successfully');
                setFiles(files.filter(f => f.name !== selectedFile.name));
                setDeleteDialogOpen(false);
            }
        } catch (error) {
            console.error('Delete Error:', error);
            toast.error('Failed to delete file');
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            setUploadProgress(0);

            const result = await uploadFile(file, (progress) => {
                setUploadProgress(progress);
            });

            if (result.success) {
                toast.success('File uploaded successfully');
                fetchFiles();
            } else {
                toast.error(result.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('An error occurred during upload');
        } finally {
            setUploading(false);
            setUploadProgress(0);
            // Reset input
            event.target.value = '';
        }
    };

    const copyToClipboard = (url) => {
        navigator.clipboard.writeText(url);
        toast.info('Link copied to clipboard');
    };

    const filteredFiles = files.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
        if (activeTab === 'all') return matchesSearch;
        if (activeTab === 'image') return matchesSearch && file.type === 'image';
        if (activeTab === 'video') return matchesSearch && file.type === 'video';
        if (activeTab === 'pdf') return matchesSearch && file.format === 'pdf';
        if (activeTab === 'other') return matchesSearch && !['image', 'video'].includes(file.type) && file.format !== 'pdf';
        return matchesSearch;
    });

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
            <MediaSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                uploaderTab={uploaderTab}
                setUploaderTab={setUploaderTab}
                teachers={teachers}
                selectedTeacherId={selectedTeacherId}
                setSelectedTeacherId={setSelectedTeacherId}
                user={user}
            />

            {/* Main Content Area */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 2, md: 4 }, bgcolor: 'action.hover' }}>
                {/* Bulk Action Bar */}
                <Collapse in={selectedFiles.length > 0}>
                    <Paper
                        elevation={4}
                        sx={{
                            mb: 3,
                            p: 2,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            bgcolor: 'primary.main',
                            color: 'white'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" fontWeight={700}>
                                {selectedFiles.length} items selected
                            </Typography>
                            <Button
                                variant="outlined"
                                color="inherit"
                                size="small"
                                onClick={() => setSelectedFiles([])}
                                sx={{ borderRadius: 1.5, textTransform: 'none' }}
                            >
                                Clear Selection
                            </Button>
                        </Box>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteSweepIcon />}
                            onClick={() => setBulkDeleteDialogOpen(true)}
                            sx={{ borderRadius: 1.5, fontWeight: 700 }}
                        >
                            Delete Selected
                        </Button>
                    </Paper>
                </Collapse>

                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Checkbox
                            indeterminate={selectedFiles.length > 0 && selectedFiles.length < files.length}
                            checked={files.length > 0 && selectedFiles.length === files.length}
                            onChange={handleSelectAll}
                            sx={{ p: 0 }}
                        />
                        <Box>
                            <Typography variant="h4" fontWeight={800} color="primary" sx={{ mb: 0.5 }}>
                                Media Library
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {totalCount} items total • Page {page + 1} of {Math.ceil(totalCount / rowsPerPage)}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: '4px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                width: { xs: '100%', sm: 300 },
                                borderRadius: 1.5,
                                border: `1px solid ${theme.palette.divider}`,
                                bgcolor: 'background.paper'
                            }}
                        >
                            <SearchIcon color="action" fontSize="small" />
                            <TextField
                                fullWidth
                                placeholder="Search your library..."
                                variant="standard"
                                InputProps={{ disableUnderline: true, sx: { px: 1, fontSize: '0.9rem' } }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Paper>

                        <input
                            type="file"
                            id="media-upload-input"
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                        <label htmlFor="media-upload-input">
                            <Button
                                variant="contained"
                                component="span"
                                startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                                disabled={uploading}
                                sx={{
                                    borderRadius: 1.5,
                                    textTransform: 'none',
                                    px: 3,
                                    py: 1.1,
                                    fontWeight: 700,
                                    boxShadow: theme.shadows[4],
                                    '&:hover': { boxShadow: theme.shadows[8] }
                                }}
                            >
                                {uploading ? `Uploading ${uploadProgress}%` : 'Upload New'}
                            </Button>
                        </label>
                    </Box>
                </Box>

                {uploading && (
                    <Box sx={{ mb: 4 }}>
                        <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${theme.palette.primary.light}`, bgcolor: 'primary.50' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="body2" fontWeight={700} color="primary">
                                    Uploading your file...
                                </Typography>
                                <Typography variant="caption" fontWeight={800} color="primary">
                                    {uploadProgress}%
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={uploadProgress}
                                sx={{ height: 8, borderRadius: 4 }}
                            />
                        </Paper>
                    </Box>
                )}

                {/* Mobile Filters (Only visible on small screens) */}
                <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, v) => setActiveTab(v)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab value="all" label="All" />
                        <Tab value="image" label="Images" />
                        <Tab value="video" label="Videos" />
                        <Tab value="pdf" label="PDFs" />
                        <Tab value="other" label="Others" />
                    </Tabs>
                </Box>

                {loading ? (
                    <Grid container spacing={3}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <Grid item xs={12} sm={6} lg={4} xl={3} key={n}>
                                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
                                <Box sx={{ pt: 1.5, px: 0.5 }}>
                                    <Skeleton width="90%" height={24} />
                                    <Skeleton width="50%" />
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                ) : filteredFiles.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 12 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                display: 'inline-flex',
                                p: 4,
                                borderRadius: '50%',
                                bgcolor: 'background.paper',
                                mb: 3,
                                boxShadow: theme.shadows[1]
                            }}
                        >
                            <InsertDriveFileIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
                        </Paper>
                        <Typography variant="h5" fontWeight={700} color="text.secondary" gutterBottom>
                            No matching files found
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={() => { setSearchTerm(''); setActiveTab('all'); }}
                            sx={{ borderRadius: 3, mt: 1 }}
                        >
                            Reset all filters
                        </Button>
                    </Box>
                ) : (
                    <Grid container spacing={4}>
                        {filteredFiles.map((file) => (
                            <Grid item xs={12} sm={6} lg={4} xl={3} key={file.name}>
                                <MediaCard
                                    file={file}
                                    isSelected={selectedFiles.includes(file.name)}
                                    onToggleSelection={toggleFileSelection}
                                    onDelete={(f) => {
                                        setSelectedFile(f);
                                        setDeleteDialogOpen(true);
                                    }}
                                    onCopy={copyToClipboard}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}

                {!loading && totalCount > 0 && (
                    <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
                        <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                            <TablePagination
                                component="div"
                                count={totalCount}
                                page={page}
                                onPageChange={handlePageChange}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleRowsPerPageChange}
                                rowsPerPageOptions={[12, 24, 48, 96]}
                                sx={{
                                    '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                                        fontWeight: 600,
                                        color: 'text.secondary'
                                    }
                                }}
                            />
                        </Paper>
                    </Box>
                )}
            </Box>

            {/* Bulk Delete Dialog */}
            <Dialog
                open={bulkDeleteDialogOpen}
                onClose={() => setBulkDeleteDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Bulk Delete</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2, borderRadius: 1.5 }}>
                        This action cannot be undone.
                    </Alert>
                    <Typography variant="body1">
                        Are you sure you want to delete <strong>{selectedFiles.length}</strong> selected files?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setBulkDeleteDialogOpen(false)} sx={{ borderRadius: 1.5 }}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleBulkDelete}
                        sx={{ borderRadius: 1.5, fontWeight: 700 }}
                    >
                        Delete All
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" color="text.secondary">
                        Are you sure you want to delete <strong>{selectedFile?.name}</strong>?
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: 'error.main', fontWeight: 600 }}>
                        This file will be permanently removed from the server.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ borderRadius: 1.5, px: 3 }}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDelete}
                        sx={{ borderRadius: 1.5, px: 3, fontWeight: 700, boxShadow: theme.shadows[4] }}
                    >
                        Delete Now
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MediaLibrary;
