import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    Box, Typography, Button, Paper, Stack, IconButton, LinearProgress, Chip
} from '@mui/material';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import MediaSidebar from './components/MediaSidebar';
import MediaTopBar from './components/MediaTopBar';
import MediaFileList from './components/MediaFileList';
import MediaCard from './MediaCard';
import SelectionBar from './components/SelectionBar';
import MediaModals from './components/MediaModals';
import MediaPreviewModal from './components/MediaPreviewModal';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { uploadFile } from '../../utils/upload';
import { useAuth } from '../../context/AuthContext';

import MediaGridSkeleton from './components/MediaSkeleton';

const MediaLibrary = ({ onSelect }) => {
    const { user } = useAuth();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [uploaderTab, setUploaderTab] = useState('all');
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedFiles, setSelectedFiles] = useState([]);

    // Upload state
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    // Modal states
    const [previewFile, setPreviewFile] = useState(null);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [statsModalOpen, setStatsModalOpen] = useState(false);

    const fetchFiles = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const res = await api.get('/upload');
            const data = res.data?.files || res.data?.data || res.data || [];
            setFiles(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch media library:', error);
            if (!isSilent) toast.error('Failed to load media files');
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFiles();
        if (user?.role === 'admin') {
            api.get('/users?role=teacher').then(res => {
                setTeachers(res.data?.data || res.data || []);
            }).catch(() => {});
        }
    }, [fetchFiles, user]);

    // Continuous 1-second silent polling while any file is converting into HLS chunks in background
    useEffect(() => {
        const interval = setInterval(() => {
            setFiles(prevFiles => {
                const hasProcessing = prevFiles.some(f => ['processing', 'uploading', 'queued'].includes(f.status));
                if (hasProcessing) {
                    fetchFiles(true); // Silent update without loading spinner
                }
                return prevFiles;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [fetchFiles]);

    const handleFileUpload = async (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setUploading(true);
        setUploadProgress(0);
        try {
            const res = await uploadFile(selectedFile, (progress) => {
                setUploadProgress(progress);
            });
            toast.success('Media file uploaded successfully!');
            
            // Optimistic update so card renders immediately
            const rawUrl = res?.url || `/uploads/${selectedFile.name}`;
            const newMediaObj = {
                _id: res?.id || String(Date.now()),
                id: res?.id || String(Date.now()),
                name: selectedFile.name,
                title: selectedFile.name,
                url: rawUrl,
                fileUrl: rawUrl,
                type: selectedFile.type?.startsWith('video') ? 'video' : selectedFile.type?.startsWith('image') ? 'image' : 'raw',
                format: selectedFile.name.split('.').pop() || 'file',
                size: selectedFile.size,
                status: selectedFile.type?.startsWith('video') ? 'processing' : 'ready',
                processingProgress: 1,
                createdAt: new Date().toISOString()
            };
            setFiles(prev => [newMediaObj, ...prev.filter(f => f.name !== selectedFile.name)]);
            await fetchFiles(true);
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Upload failed');
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (fileName) => {
        if (!window.confirm('Delete this media asset?')) return;
        // Optimistic deletion from state so card vanishes immediately in real-time
        setFiles(prev => prev.filter(f => f.name !== fileName && f.title !== fileName && f.id !== fileName));
        setSelectedFiles(prev => prev.filter(name => name !== fileName));
        try {
            await api.delete(`/upload/${fileName}`);
            toast.success('Asset deleted');
            await fetchFiles(true);
        } catch (error) {
            console.error('Failed to delete file:', error);
            toast.error('Failed to delete file');
            await fetchFiles(true);
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedFiles.length} selected files?`)) return;
        const toDelete = [...selectedFiles];
        setFiles(prev => prev.filter(f => !toDelete.includes(f.name) && !toDelete.includes(f.id)));
        setSelectedFiles([]);
        try {
            await Promise.all(toDelete.map(name => api.delete(`/upload/${name}`)));
            toast.success('Selected files deleted');
            await fetchFiles(true);
        } catch (error) {
            console.error('Failed to bulk delete files:', error);
            toast.error('Failed to delete some files');
            await fetchFiles(true);
        }
    };

    const toggleFileSelection = (fileName) => {
        setSelectedFiles(prev =>
            prev.includes(fileName) ? prev.filter(n => n !== fileName) : [...prev, fileName]
        );
    };

    const filteredFiles = useMemo(() => {
        return files.filter(f => {
            const name = (f.name || f.title || '').toLowerCase();
            const term = searchQuery.toLowerCase().trim();
            const matchesSearch = name.includes(term);
            if (!matchesSearch) return false;

            const isImage = f.mimetype?.startsWith('image') || f.type === 'image' || f.name?.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i);
            const isVideo = f.mimetype?.startsWith('video') || f.type === 'video' || f.name?.match(/\.(mp4|mkv|avi|mov)$/i);
            const isPdf = f.mimetype === 'application/pdf' || f.format === 'pdf' || f.name?.endsWith('.pdf');

            if (activeTab === 'image' && !isImage) return false;
            if (activeTab === 'video' && !isVideo) return false;
            if (activeTab === 'pdf' && !isPdf) return false;
            return true;
        });
    }, [files, searchQuery, activeTab]);

    const metricsItems = useMemo(() => [
        { title: 'Total Assets', value: files.length, icon: <PermMediaIcon />, color: 'primary' },
        { title: 'Images & Photos', value: files.filter(f => f.mimetype?.startsWith('image') || f.type === 'image' || f.name?.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)).length, icon: <ImageIcon />, color: 'info' },
        { title: 'Video Chunks', value: files.filter(f => f.mimetype?.startsWith('video') || f.type === 'video' || f.name?.match(/\.(mp4|mkv|avi|mov)$/i)).length, icon: <VideoLibraryIcon />, color: 'success' }
    ], [files]);

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--color-vc-canvas)', minHeight: '100vh' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--color-vc-ink)', letterSpacing: -0.5 }}>
                    Media & File Manager
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                    Manage cloud media library, chunked video uploads, and course document attachments
                </Typography>
            </Box>

            <GenericMetrics items={metricsItems} />

            {uploading && (
                <Box sx={{ p: 2, mb: 2.5, bgcolor: 'var(--color-vc-canvas-soft)', borderRadius: '14px', border: '1px solid var(--color-vc-hairline)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight={800} sx={{ color: 'var(--color-vc-primary)', display: 'flex', alignItems: 'center', gap: 1 }}>
                            🚀 UPLOADING ASSET ({typeof uploadProgress === 'number' ? uploadProgress.toFixed(1) : uploadProgress}%)
                        </Typography>
                        <Typography variant="caption" fontWeight={700} sx={{ color: 'var(--color-vc-mute)' }}>
                            Real-Time AJAX Stream
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={typeof uploadProgress === 'number' ? uploadProgress : Number(uploadProgress) || 0}
                        sx={{ mt: 1, borderRadius: '6px', height: 8, bgcolor: 'rgba(56, 189, 248, 0.15)', '& .MuiLinearProgress-bar': { bgcolor: '#38bdf8' } }}
                    />
                </Box>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ display: 'none' }}
            />

            <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
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

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <MediaTopBar
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                            onSyncClick={fetchFiles}
                            onImportUrlClick={() => setImportModalOpen(true)}
                            onStatsClick={() => setStatsModalOpen(true)}
                        />
                        <Button
                            variant="contained"
                            startIcon={<CloudUploadIcon />}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 3, py: 1 }}
                        >
                            {uploading ? `Uploading ${uploadProgress}%...` : 'Upload Media'}
                        </Button>
                    </Box>

                    {selectedFiles.length > 0 && (
                        <SelectionBar
                            selectedCount={selectedFiles.length}
                            onClearSelection={() => setSelectedFiles([])}
                            onDeleteSelected={handleBulkDelete}
                        />
                    )}

                    {loading ? (
                        <MediaGridSkeleton count={8} />
                    ) : viewMode === 'list' ? (
                        <MediaFileList
                            files={filteredFiles}
                            loading={loading}
                            selectedFiles={selectedFiles}
                            onToggleSelection={toggleFileSelection}
                            onDelete={handleDelete}
                            onPreview={setPreviewFile}
                            onSelect={onSelect}
                        />
                    ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 2 }}>
                            {filteredFiles.map(file => (
                                <MediaCard
                                    key={file._id || file.id || file.name}
                                    file={file}
                                    isSelected={selectedFiles.includes(file.name)}
                                    onToggleSelection={() => toggleFileSelection(file.name)}
                                    onDelete={() => handleDelete(file.name)}
                                    onCopy={() => { navigator.clipboard.writeText(file.url); toast.success('URL Copied!'); }}
                                    onPreview={() => setPreviewFile(file)}
                                    onSelect={onSelect}
                                />
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>

            <MediaPreviewModal
                file={previewFile}
                onClose={() => setPreviewFile(null)}
                onDelete={(name) => { handleDelete(name); setPreviewFile(null); }}
            />

            <MediaModals
                importOpen={importModalOpen}
                onImportClose={() => setImportModalOpen(false)}
                statsOpen={statsModalOpen}
                onStatsClose={() => setStatsModalOpen(false)}
                files={files}
                onImportSuccess={fetchFiles}
            />
        </Box>
    );
};

export default MediaLibrary;
