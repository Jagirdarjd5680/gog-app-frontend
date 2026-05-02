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
    Collapse,
    Stack,
    Tooltip,
    IconButton,
    Chip
} from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import api, { fixUrl } from '../../utils/api';
import { uploadFile } from '../../utils/upload';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

import MediaSidebar from './MediaSidebar';
import MediaCard from './MediaCard';
import ChatMediaLibrary from './ChatMediaLibrary';
import SdStorageIcon from '@mui/icons-material/SdStorage';
import LinkIcon from '@mui/icons-material/Link';
import StorageIcon from '@mui/icons-material/Storage';
import GridViewIcon from '@mui/icons-material/GridView';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

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
    const [deleting, setDeleting] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);
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
    const [viewMode, setViewMode] = useState('grid');
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    
    // Stats & URL Import
    const [stats, setStats] = useState(null);
    const [statsModalOpen, setStatsModalOpen] = useState(false);
    const [urlImportOpen, setUrlImportOpen] = useState(false);
    const [importingUrl, setImportingUrl] = useState(false);
    const [importForm, setImportForm] = useState({ title: '', url: '', type: 'video' });

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

    const fetchStats = async () => {
        try {
            const response = await api.get('/upload/stats');
            if (response.data.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Fetch Stats Error:', error);
        }
    };

    useEffect(() => {
        if (user && activeTab !== 'chat') {
            fetchFiles();
            fetchStats();
            if (user.role === 'admin') {
                fetchTeachers();
            }
        }
    }, [user, uploaderTab, selectedTeacherId, page, rowsPerPage, activeTab]);

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
            setBulkDeleting(true);
            const response = await api.post('/upload/bulk-delete', { fileNames: selectedFiles });
            if (response.data.success) {
                toast.success(response.data.message);
                setSelectedFiles([]);
                setBulkDeleteDialogOpen(false);
                fetchFiles();
                fetchStats();
            }
        } catch (error) {
            console.error('Bulk Delete Error:', error);
            toast.error('Failed to delete selected files');
        } finally {
            setBulkDeleting(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            const response = await api.delete(`/upload/${selectedFile.name}`);
            if (response.data.success) {
                toast.success('File deleted successfully');
                fetchFiles();
                fetchStats();
                setDeleteDialogOpen(false);
            }
        } catch (error) {
            console.error('Delete Error:', error);
            toast.error('Failed to delete file');
        } finally {
            setDeleting(false);
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

    const handleUrlImport = async () => {
        if (!importForm.url || !importForm.title) {
            toast.error('Please provide both title and URL');
            return;
        }

        try {
            setImportingUrl(true);
            const response = await api.post('/upload/import-url', importForm);
            if (response.data.success) {
                toast.success('Resource imported successfully');
                setUrlImportOpen(false);
                setImportForm({ title: '', url: '', type: 'video' });
                fetchFiles();
            }
        } catch (error) {
            console.error('Import Error:', error);
            toast.error(error.response?.data?.message || 'Failed to import URL');
        } finally {
            setImportingUrl(false);
        }
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const filteredFiles = files.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
        const codeExts = ['js', 'jsx', 'ts', 'tsx', 'py', 'html', 'css', 'cpp', 'c', 'java', 'php', 'json', 'sql', 'dart'];
        
        if (activeTab === 'all') return matchesSearch;
        if (activeTab === 'image') return matchesSearch && file.type === 'image';
        if (activeTab === 'video') return matchesSearch && file.type === 'video';
        if (activeTab === 'pdf') return matchesSearch && file.format === 'pdf';
        if (activeTab === 'code') return matchesSearch && codeExts.includes(file.format?.toLowerCase());
        if (activeTab === 'other') {
            const knownTypes = ['image', 'video'];
            return matchesSearch && !knownTypes.includes(file.type) && file.format !== 'pdf' && !codeExts.includes(file.format?.toLowerCase());
        }
        return matchesSearch;
    });

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 80px)', overflow: 'hidden', position: 'relative' }}>
            {/* Global Deletion Loader */}
            {(deleting || bulkDeleting) && (
                <Box sx={{ 
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                    bgcolor: 'rgba(255,255,255,0.7)', zIndex: 9999,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2
                }}>
                    <CircularProgress size={60} thickness={4} />
                    <Typography variant="h6" fontWeight={700} color="primary">Deleting Items...</Typography>
                    <Typography variant="body2" color="text.secondary">Please wait while we clean up your storage</Typography>
                </Box>
            )}

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
                {activeTab === 'chat' ? (
                    <ChatMediaLibrary />
                ) : (
                    <>
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

                        {/* Storage Stats Cards */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={4}>
                                <Paper 
                                    onClick={() => setStatsModalOpen(true)}
                                    sx={{ 
                                        p: 2.5, borderRadius: 3, cursor: 'pointer',
                                        bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
                                        transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4] }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                                        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'primary.50', color: 'primary.main' }}>
                                            <SdStorageIcon />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>Local Storage</Typography>
                                            <Typography variant="h6" fontWeight={800}>{formatSize(stats?.totalSize || 0)}</Typography>
                                        </Box>
                                    </Box>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={Math.min(((stats?.totalSize || 0) / (50 * 1024 * 1024 * 1024)) * 100, 100)} 
                                        sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover' }}
                                    />
                                    <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'right', fontWeight: 600 }}>
                                        {formatSize(stats?.totalSize || 0)} / 50 GB Used
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'success.50', color: 'success.main' }}>
                                            <LinkIcon />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>External Links</Typography>
                                            <Typography variant="h6" fontWeight={800}>{stats?.breakdown?.find(b => b.type === 'video' && !b.isLocal)?.count || 0} Assets</Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                                        YouTube, Vimeo & Cloud Links
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>

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

                                <Box sx={{ display: 'flex', bgcolor: 'background.paper', borderRadius: 1.5, border: `1px solid ${theme.palette.divider}`, p: 0.5 }}>
                                    <IconButton 
                                        size="small" 
                                        onClick={() => setViewMode('grid')}
                                        color={viewMode === 'grid' ? 'primary' : 'default'}
                                        sx={{ borderRadius: 1 }}
                                    >
                                        <GridViewIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton 
                                        size="small" 
                                        onClick={() => setViewMode('list')}
                                        color={viewMode === 'list' ? 'primary' : 'default'}
                                        sx={{ borderRadius: 1 }}
                                    >
                                        <FormatListBulletedIcon fontSize="small" />
                                    </IconButton>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<LinkIcon />}
                                        onClick={() => setUrlImportOpen(true)}
                                        sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 700 }}
                                    >
                                        Import URL
                                    </Button>

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
                                            {uploading ? `Uploading ${uploadProgress}%` : 'Upload'}
                                        </Button>
                                    </label>
                                </Box>
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
                        ) : viewMode === 'grid' ? (
                            <Grid container spacing={4}>
                                {filteredFiles.map((file, idx) => (
                                    <Grid item xs={12} sm={6} lg={4} xl={3} key={`${file.name}-${idx}`}>
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
                        ) : (
                            <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                                <Box sx={{ minWidth: 600 }}>
                                    {/* Table Header */}
                                    <Box sx={{ display: 'flex', px: 3, py: 2, borderBottom: `2px solid ${theme.palette.action.hover}`, bgcolor: 'action.hover' }}>
                                        <Box sx={{ width: 50 }} /> {/* For Checkbox */}
                                        <Typography sx={{ flex: 2, fontWeight: 700, fontSize: '0.85rem', color: 'text.secondary' }}>NAME</Typography>
                                        <Typography sx={{ flex: 1, fontWeight: 700, fontSize: '0.85rem', color: 'text.secondary' }}>TYPE</Typography>
                                        <Typography sx={{ flex: 1, fontWeight: 700, fontSize: '0.85rem', color: 'text.secondary' }}>SIZE</Typography>
                                        <Typography sx={{ flex: 1.5, fontWeight: 700, fontSize: '0.85rem', color: 'text.secondary' }}>DATE</Typography>
                                        <Typography sx={{ width: 100, textAlign: 'right', fontWeight: 700, fontSize: '0.85rem', color: 'text.secondary' }}>ACTIONS</Typography>
                                    </Box>

                                    {/* Table Body */}
                                    {filteredFiles.map((file, idx) => (
                                        <Box 
                                            key={`${file.name}-${idx}`}
                                            sx={{ 
                                                display: 'flex', px: 3, py: 1.5, alignItems: 'center',
                                                borderBottom: `1px solid ${theme.palette.divider}`,
                                                '&:hover': { bgcolor: 'action.hover' }
                                            }}
                                        >
                                            <Box sx={{ width: 50 }}>
                                                <Checkbox
                                                    size="small"
                                                    checked={selectedFiles.includes(file.name)}
                                                    onChange={() => toggleFileSelection(file.name)}
                                                />
                                            </Box>
                                            <Box sx={{ flex: 2, display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden' }}>
                                                <Box sx={{ 
                                                    width: 40, height: 40, borderRadius: 1.5, overflow: 'hidden', flexShrink: 0,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.selected'
                                                }}>
                                                    {file.type === 'image' ? (
                                                        <img src={fixUrl(file.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : file.type === 'video' ? (
                                                        <Box sx={{ color: 'primary.main' }}>🎥</Box>
                                                    ) : (
                                                        <InsertDriveFileIcon sx={{ color: 'text.disabled' }} />
                                                    )}
                                                </Box>
                                                <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: '100%' }}>
                                                    {file.name}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Chip label={file.type} size="small" variant="outlined" sx={{ borderRadius: 1, height: 20, fontSize: '0.65rem', textTransform: 'uppercase' }} />
                                            </Box>
                                            <Typography sx={{ flex: 1 }} variant="body2" color="text.secondary">
                                                {formatSize(file.size)}
                                            </Typography>
                                            <Typography sx={{ flex: 1.5 }} variant="body2" color="text.secondary">
                                                {new Date(file.createdAt).toLocaleDateString()}
                                            </Typography>
                                            <Box sx={{ width: 100, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                <Tooltip title="Copy Link">
                                                    <IconButton size="small" onClick={() => copyToClipboard(file.url)}>
                                                        <LinkIcon fontSize="inherit" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton 
                                                        size="small" 
                                                        color="error" 
                                                        onClick={() => {
                                                            setSelectedFile(file);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <DeleteSweepIcon fontSize="inherit" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Paper>
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
                    </>
                )}
            </Box>

            {/* Storage Breakdown Modal */}
            <Dialog 
                open={statsModalOpen} 
                onClose={() => setStatsModalOpen(false)}
                fullWidth maxWidth="xs"
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, textAlign: 'center' }}>Storage Breakdown</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ py: 2 }}>
                        {stats?.breakdown?.map((item) => (
                            <Paper key={item.type} variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
                                        {item.type === 'video' ? '🎥' : item.type === 'image' ? '🖼️' : item.type === 'audio' ? '🎧' : '📄'}
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'capitalize' }}>{item.type}s</Typography>
                                        <Typography variant="caption" color="text.secondary">{item.count} files</Typography>
                                    </Box>
                                </Box>
                                <Typography variant="body2" fontWeight={800}>{formatSize(item.size)}</Typography>
                            </Paper>
                        ))}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button onClick={() => setStatsModalOpen(false)} variant="contained" sx={{ borderRadius: 2, px: 4 }}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Single Delete Confirmation */}
            <Dialog 
                open={deleteDialogOpen} 
                onClose={() => !deleting && setDeleteDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>{selectedFile?.name}</strong>? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>Cancel</Button>
                    <Button 
                        onClick={handleDelete} 
                        variant="contained" 
                        color="error" 
                        disabled={deleting}
                        startIcon={deleting ? <CircularProgress size={18} color="inherit" /> : null}
                        sx={{ borderRadius: 2 }}
                    >
                        {deleting ? 'Deleting...' : 'Delete File'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Delete Confirmation */}
            <Dialog 
                open={bulkDeleteDialogOpen} 
                onClose={() => !bulkDeleting && setBulkDeleteDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Delete Multiple Items</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>{selectedFiles.length}</strong> items? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setBulkDeleteDialogOpen(false)} disabled={bulkDeleting}>Cancel</Button>
                    <Button 
                        onClick={handleBulkDelete} 
                        variant="contained" 
                        color="error" 
                        disabled={bulkDeleting}
                        startIcon={bulkDeleting ? <CircularProgress size={18} color="inherit" /> : null}
                        sx={{ borderRadius: 2 }}
                    >
                        {bulkDeleting ? 'Deleting...' : 'Delete Items'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* URL Import Modal */}
            <Dialog 
                open={urlImportOpen} 
                onClose={() => setUrlImportOpen(false)}
                fullWidth maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Import from URL</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Enter a direct link to a video, image, or PDF to add it to your library.
                    </Typography>
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label="Resource Title"
                            placeholder="e.g. Introduction Video"
                            value={importForm.title}
                            onChange={(e) => setImportForm({ ...importForm, title: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Resource URL"
                            placeholder="https://example.com/video.mp4"
                            value={importForm.url}
                            onChange={(e) => setImportForm({ ...importForm, url: e.target.value })}
                        />
                        <TextField
                            select
                            fullWidth
                            label="Resource Type"
                            value={importForm.type}
                            onChange={(e) => setImportForm({ ...importForm, type: e.target.value })}
                            SelectProps={{ native: true }}
                        >
                            <option value="video">Video</option>
                            <option value="image">Image</option>
                            <option value="raw">PDF / Other</option>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setUrlImportOpen(false)}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleUrlImport}
                        disabled={importingUrl}
                        startIcon={importingUrl ? <CircularProgress size={20} /> : null}
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        Import Now
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MediaLibrary;
