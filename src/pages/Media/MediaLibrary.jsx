import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, CircularProgress, useTheme, Pagination, alpha, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { uploadFile } from '../../utils/upload';

// Sub-components
import MediaSidebar from './components/MediaSidebar';
import MediaTopBar from './components/MediaTopBar';
import MediaFileList from './components/MediaFileList';
import MediaModals from './components/MediaModals';
import MediaPreviewModal from './components/MediaPreviewModal';
import SelectionBar from './components/SelectionBar';
import { MediaGridSkeleton, MediaListSkeleton, MediaSidebarSkeleton } from './components/MediaSkeleton';

const MediaLibrary = ({ onSelect }) => {
    const theme = useTheme();
    const { user } = useAuth();

    // State
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [viewMode, setViewMode] = useState('grid');
    const [activeFilter, setActiveFilter] = useState('all');
    const [uploaderTab, setUploaderTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Modal States
    const [previewFile, setPreviewFile] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteFile, setDeleteFile] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [urlImportOpen, setUrlImportOpen] = useState(false);
    const [importForm, setImportForm] = useState({ title: '', url: '', type: 'raw' });
    const [importingUrl, setImportingUrl] = useState(false);
    const [statsModalOpen, setStatsModalOpen] = useState(false);
    const [storageStats, setStorageStats] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const fetchFiles = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const params = {
                page,
                limit: 20,
                userRole: uploaderTab === 'admin' ? 'admin' : undefined
            };
            const res = await api.get('/upload', { params });
            if (res.data.success) {
                setFiles(res.data.files);
                setTotalPages(res.data.totalPages);
            }
        } catch (err) {
            if (!silent) toast.error('Failed to fetch media');
        } finally {
            if (!silent) setLoading(false);
        }
    }, [page, uploaderTab]);

    useEffect(() => { fetchFiles(); }, [fetchFiles]);

    // Poll if any file is processing
    useEffect(() => {
        const hasProcessing = files.some(f => f.status === 'processing');
        if (hasProcessing) {
            const timer = setTimeout(() => {
                fetchFiles(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [files, fetchFiles]);

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${['B', 'KB', 'MB', 'GB'][i]}`;
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await api.delete(`/upload/${deleteFile.name}`);
            setFiles(files.filter(f => f._id !== deleteFile._id));
            toast.success('File deleted');
            setDeleteDialogOpen(false);
            if (previewFile?._id === deleteFile._id) setPreviewFile(null);
        } catch (err) {
            toast.error('Delete failed');
        } finally {
            setDeleting(false);
        }
    };

    const handleSelectAll = () => {
        if (selectedFiles.length === files.length) {
            setSelectedFiles([]);
        } else {
            setSelectedFiles(files.map(f => f.name));
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Delete ${selectedFiles.length} files?`)) {
            try {
                setDeleting(true);
                const res = await api.post('/upload/bulk-delete', { fileNames: selectedFiles });
                if (res.data.success) {
                    toast.success(res.data.message || 'Selected files deleted');
                    setSelectedFiles([]);
                    fetchFiles();
                }
            } catch (err) {
                toast.error('Bulk deletion failed');
            } finally {
                setDeleting(false);
            }
        }
    };

    const handleSync = async () => {
        try {
            const syncToast = toast.loading('Syncing storage...');
            const res = await api.get('/upload/sync');
            if (res.data.success) {
                toast.success(res.data.message, { id: syncToast });
                fetchFiles();
            }
        } catch (err) {
            toast.error('Sync failed');
        }
    };

    const filteredFiles = files.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'all' || f.type === activeFilter || f.format === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const loadingToast = toast.loading(`Uploading ${file.name}... (0%)`);
            
            const result = await uploadFile(file, (progress) => {
                setUploadProgress(progress);
                toast.loading(`Uploading ${file.name}... (${progress}%)`, { id: loadingToast });
            });

            if (result.success) {
                toast.success('Upload successful', { id: loadingToast });
                fetchFiles();
            } else {
                toast.error(result.message || 'Upload failed', { id: loadingToast });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (e.target) e.target.value = '';
        }
    };

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden', bgcolor: '#f1f3f4' }}>
            {/* Sidebar — Skeleton while loading */}
            {loading && files.length === 0 
                ? <MediaSidebarSkeleton />
                : <MediaSidebar 
                    activeFilter={activeFilter} 
                    onFilterChange={setActiveFilter}
                    uploaderTab={uploaderTab}
                    onUploaderTabChange={setUploaderTab}
                    onUploadClick={handleUploadClick} 
                />}

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

                {/* Delete Overlay Spinner */}
                {deleting && (
                    <Box sx={{
                        position: 'absolute', inset: 0, zIndex: 100,
                        bgcolor: alpha('#fff', 0.7),
                        backdropFilter: 'blur(3px)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 2
                    }}>
                        <CircularProgress color="error" size={48} />
                        <Box sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'error.main' }}>
                            {selectedFiles.length > 1 ? `Deleting ${selectedFiles.length} files...` : 'Deleting file...'}
                        </Box>
                    </Box>
                )}

                {/* Uploading Overlay Spinner */}
                {uploading && (
                    <Box sx={{
                        position: 'absolute', inset: 0, zIndex: 100,
                        bgcolor: alpha('#fff', 0.7),
                        backdropFilter: 'blur(3px)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 2
                    }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                            <CircularProgress variant="determinate" value={uploadProgress} size={64} thickness={4} />
                            <Box
                                sx={{
                                    top: 0, left: 0, bottom: 0, right: 0,
                                    position: 'absolute',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <Typography variant="caption" component="div" color="text.secondary" fontWeight={800}>
                                    {`${Math.round(uploadProgress)}%`}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'primary.main' }}>Uploading file...</Box>
                    </Box>
                )}

                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, pb: 10 }}>
                    <MediaTopBar 
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        onSyncClick={handleSync}
                        onImportUrlClick={() => setUrlImportOpen(true)}
                        onStatsClick={async () => {
                            const res = await api.get('/upload/stats');
                            setStorageStats(res.data);
                            setStatsModalOpen(true);
                        }}
                    />

                    {/* Top Pagination */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                        <Pagination 
                            count={totalPages} 
                            page={page} 
                            onChange={(e, v) => setPage(v)} 
                            color="primary" 
                            size="small"
                        />
                    </Box>

                    {/* Content — Skeleton while loading, real list when ready */}
                    {loading
                        ? (viewMode === 'grid' 
                            ? <MediaGridSkeleton count={8} /> 
                            : <MediaListSkeleton count={8} />)
                        : <MediaFileList 
                            files={filteredFiles}
                            viewMode={viewMode}
                            selectedFiles={selectedFiles}
                            onToggleSelection={(name) => setSelectedFiles(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])}
                            onSelectAll={handleSelectAll}
                            onDelete={(file) => { setDeleteFile(file); setDeleteDialogOpen(true); }}
                            onCopy={(url) => { navigator.clipboard.writeText(url); toast.success('Link copied!'); }}
                            onPreview={setPreviewFile}
                            onSelect={onSelect}
                            formatSize={formatSize}
                        />}
                </Box>

                <MediaPreviewModal 
                    previewFile={previewFile} 
                    setPreviewFile={setPreviewFile} 
                    formatSize={formatSize}
                    onDelete={(file) => { setDeleteFile(file); setDeleteDialogOpen(true); }}
                />
            </Box>

            <SelectionBar 
                selectedCount={selectedFiles.length} 
                onClear={() => setSelectedFiles([])}
                onDelete={handleBulkDelete}
                onDownload={() => toast.info('Multi-download coming soon')}
            />

            <MediaModals 
                statsModalOpen={statsModalOpen} setStatsModalOpen={setStatsModalOpen} storageStats={storageStats}
                deleteDialogOpen={deleteDialogOpen} setDeleteDialogOpen={setDeleteDialogOpen} deleting={deleting} confirmDelete={handleDelete} deleteFile={deleteFile}
                urlImportOpen={urlImportOpen} setUrlImportOpen={setUrlImportOpen} importingUrl={importingUrl} importForm={importForm} setImportForm={setImportForm}
                handleUrlImport={async () => {
                    setImportingUrl(true);
                    await api.post('/upload/import-url', importForm);
                    setUrlImportOpen(false); fetchFiles(); setImportingUrl(false);
                }}
            />
        </Box>
    );
};

export default MediaLibrary;
