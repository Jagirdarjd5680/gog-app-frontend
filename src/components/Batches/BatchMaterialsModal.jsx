import { useState, useEffect, useCallback } from 'react';
import {
    Dialog, DialogTitle, DialogContent, Box, Typography, IconButton,
    Button, TextField, MenuItem, Breadcrumbs, Link, Tooltip, Chip,
    Stack, Grid, CircularProgress, Menu, InputAdornment, Divider,
    Alert, LinearProgress, Drawer, List, ListItemButton, ListItemIcon,
    ListItemText, Collapse
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import ImageIcon from '@mui/icons-material/Image';
import CodeIcon from '@mui/icons-material/Code';
import LinkIcon from '@mui/icons-material/Link';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ArchiveIcon from '@mui/icons-material/Archive';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddLinkIcon from '@mui/icons-material/AddLink';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import CollectionsIcon from '@mui/icons-material/Collections';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import MediaPickerModal from '../Media/MediaPickerModal';

// File type icon + color map
const FILE_TYPE_CONFIG = {
    folder: { icon: FolderIcon, color: '#FFB300', label: 'Folder' },
    pdf: { icon: PictureAsPdfIcon, color: '#F44336', label: 'PDF' },
    video: { icon: VideoLibraryIcon, color: '#9C27B0', label: 'Video' },
    audio: { icon: AudioFileIcon, color: '#00BCD4', label: 'Audio' },
    image: { icon: ImageIcon, color: '#4CAF50', label: 'Image' },
    code: { icon: CodeIcon, color: '#FF5722', label: 'Code' },
    link: { icon: LinkIcon, color: '#2196F3', label: 'Link' },
    zip: { icon: ArchiveIcon, color: '#795548', label: 'Archive' },
    other: { icon: InsertDriveFileIcon, color: '#607D8B', label: 'File' },
};

const FileIcon = ({ type, size = 40 }) => {
    const cfg = FILE_TYPE_CONFIG[type] || FILE_TYPE_CONFIG.other;
    const Icon = cfg.icon;
    return <Icon sx={{ fontSize: size, color: cfg.color }} />;
};

const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const BatchMaterialsModal = ({ open, onClose, batch }) => {
    const { isDark } = useTheme();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Navigation
    const [currentParent, setCurrentParent] = useState(null);
    const [breadcrumbs, setBreadcrumbs] = useState([]); // [{id, name}]

    // Create folder dialog
    const [folderDialogOpen, setFolderDialogOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    // Add link dialog
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [newLinkName, setNewLinkName] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');

    // Context menu
    const [anchorEl, setAnchorEl] = useState(null);
    const [contextItem, setContextItem] = useState(null);

    // Folder Tree Sidebar
    const [allItems, setAllItems] = useState([]); // All files and folders for tree
    const [expandedFolders, setExpandedFolders] = useState({}); // {id: boolean}
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [previewItem, setPreviewItem] = useState(null);

    const fetchAllItems = useCallback(async () => {
        if (!batch?._id) return;
        try {
            const res = await api.get(`/batch-materials/${batch._id}/all`);
            if (res.data.success) {
                setAllItems(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch items:', error);
        }
    }, [batch?._id]);

    const fetchMaterials = useCallback(async (parentId = null) => {
        if (!batch?._id) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('parent', parentId || 'null');
            const res = await api.get(`/batch-materials/${batch._id}?${params}`);
            if (res.data.success) {
                setMaterials(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load materials');
        } finally {
            setLoading(false);
        }
    }, [batch?._id]);

    useEffect(() => {
        if (open && batch?._id) {
            setCurrentParent(null);
            setBreadcrumbs([]);
            fetchAllItems();
            fetchMaterials(null);
        }
    }, [open, batch?._id, fetchMaterials, fetchAllItems]);

    const getPathToItem = useCallback((itemId, items) => {
        const path = [];
        let current = items.find(f => f._id === itemId);
        while (current) {
            path.unshift({ id: current._id, name: current.name });
            const parentId = current.parent?._id || current.parent;
            current = items.find(f => f._id === parentId);
        }
        return path;
    }, []);

    const navigateToFolder = useCallback((item) => {
        setCurrentParent(item._id);
        // Build path from allItems to ensure no duplicates and correct hierarchy
        const newPath = getPathToItem(item._id, allItems);
        setBreadcrumbs(newPath);
        fetchMaterials(item._id);
    }, [allItems, getPathToItem, fetchMaterials]);

    const navigateToBreadcrumb = useCallback(async (index) => {
        let parentId = null;
        if (index === -1) {
            setCurrentParent(null);
            setBreadcrumbs([]);
            parentId = null;
        } else {
            const crumb = breadcrumbs[index];
            setCurrentParent(crumb.id);
            setBreadcrumbs(prev => prev.slice(0, index + 1));
            parentId = crumb.id;
        }
        fetchMaterials(parentId);
        
        // Auto-expand the parent in sidebar
        if (parentId) {
            setExpandedFolders(prev => ({ ...prev, [parentId]: true }));
        }
    }, [breadcrumbs, fetchMaterials]);

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        try {
            await api.post('/batch-materials', {
                batch: batch._id,
                name: newFolderName.trim(),
                type: 'folder',
                parent: currentParent || null
            });
            toast.success('Folder created');
            setNewFolderName('');
            setFolderDialogOpen(false);
            fetchMaterials(currentParent);
        } catch (error) {
            toast.error('Failed to create folder');
        }
    };

    const handleAddLink = async () => {
        if (!newLinkName.trim() || !newLinkUrl.trim()) return;
        try {
            await api.post('/batch-materials', {
                batch: batch._id,
                name: newLinkName.trim(),
                type: 'link',
                url: newLinkUrl.trim(),
                parent: currentParent || null
            });
            toast.success('Link added');
            setNewLinkName('');
            setNewLinkUrl('');
            setLinkDialogOpen(false);
            fetchMaterials(currentParent);
        } catch (error) {
            toast.error('Failed to add link');
        }
    };

    const handleMediaSelect = async (file) => {
        try {
            await api.post('/batch-materials/from-media', {
                batch: batch._id,
                mediaId: file._id || file.id,
                parent: currentParent || null
            });
            toast.success('Added from gallery successfully');
            fetchMaterials(currentParent);
        } catch (error) {
            toast.error('Failed to add from gallery');
        }
    };

    const handleFileUpload = async (e) => {
        const files = e.target.files;
        if (!files?.length) return;
        setUploading(true);
        setUploadProgress(0);
        let successCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('batch', batch._id);
            if (currentParent) formData.append('parent', currentParent);

            try {
                await api.post('/batch-materials/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total))
                });
                successCount++;
            } catch {
                toast.error(`Failed to upload: ${file.name}`);
            }
            setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        }

        if (successCount > 0) {
            toast.success(`${successCount} file(s) uploaded successfully`);
        }
        setUploading(false);
        setUploadProgress(0);
        fetchMaterials(currentParent);
        e.target.value = '';
    };

    const handleDeleteItem = async (item) => {
        if (!window.confirm(`Delete "${item.name}"${item.type === 'folder' ? ' and all its contents' : ''}?`)) return;
        try {
            await api.delete(`/batch-materials/${item._id}`);
            toast.success('Deleted successfully');
            fetchMaterials(currentParent);
        } catch {
            toast.error('Failed to delete');
        }
        setAnchorEl(null);
    };

    const handleContextMenu = (e, item) => {
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
        setContextItem(item);
    };

    const toggleFolderExpand = (e, folderId) => {
        e.stopPropagation();
        setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
    };

    const handleItemClick = (item) => {
        if (item.type === 'folder') {
            navigateToFolder(item);
            // Toggle expand if clicking folder again
            setExpandedFolders(prev => ({ ...prev, [item._id]: !prev[item._id] }));
        } else {
            // Set for inner preview instead of window.open
            setPreviewItem(item);
        }
    };

    const truncateWords = (str, count = 4) => {
        if (!str) return '';
        const words = str.split(' ');
        if (words.length <= count) return str;
        return words.slice(0, count).join(' ') + '...';
    };

    const renderFolderTree = (parentId = null, level = 0) => {
        const items = allItems.filter(f => {
            const pid = f.parent?._id || f.parent;
            return parentId === null ? !pid : pid === parentId;
        });

        if (items.length === 0 && level > 0) return null;

        // Sort: folders first, then files
        const sortedItems = [...items].sort((a, b) => {
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (a.type !== 'folder' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });

        return (
            <List component="div" disablePadding>
                {sortedItems.map((item) => {
                    const isExpanded = expandedFolders[item._id];
                    const isActive = currentParent === item._id;
                    const isFolder = item.type === 'folder';
                    const hasChildren = isFolder && allItems.some(f => (f.parent?._id || f.parent) === item._id);

                    return (
                        <Box key={item._id}>
                            <ListItemButton
                                selected={isActive}
                                onClick={() => handleItemClick(item)}
                                sx={{
                                    pl: level * 2 + 1.5,
                                    py: 0.5,
                                    borderRadius: 1,
                                    mx: 0.5,
                                    mb: 0.2,
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'primary.dark' },
                                        '& .MuiListItemIcon-root': { color: 'white' }
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 28 }}>
                                    {isFolder ? (
                                        <FolderIcon sx={{ fontSize: 18, color: isActive ? 'inherit' : '#FFB300' }} />
                                    ) : (
                                        <FileIcon type={item.type} size={18} color={isActive ? 'inherit' : undefined} />
                                    )}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={isFolder ? item.name : truncateWords(item.name)} 
                                    primaryTypographyProps={{ 
                                        variant: 'caption', 
                                        fontWeight: isActive ? 700 : 500,
                                        noWrap: true,
                                        sx: { fontSize: '0.75rem' }
                                    }} 
                                />
                                {hasChildren && (
                                    <IconButton 
                                        size="small" 
                                        onClick={(e) => toggleFolderExpand(e, item._id)}
                                        sx={{ color: 'inherit', p: 0.2 }}
                                    >
                                        {isExpanded ? <ExpandLess fontSize="small" sx={{ fontSize: 14 }} /> : <ExpandMore fontSize="small" sx={{ fontSize: 14 }} />}
                                    </IconButton>
                                )}
                            </ListItemButton>
                            {hasChildren && (
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    {renderFolderTree(item._id, level + 1)}
                                </Collapse>
                            )}
                        </Box>
                    );
                })}
            </List>
        );
    };

    const filteredMaterials = materials.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#f8f9ff';
    const cardHover = isDark ? 'rgba(255,255,255,0.1)' : '#e8ecff';
    const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 600, md: 800 },
                    height: '100vh',
                    bgcolor: isDark ? '#1a1a2e' : '#fafbff',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    borderLeft: `1px solid ${borderColor}`
                }
            }}
        >
            {/* Header */}
            <Box sx={{
                px: 3, py: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <FolderOpenIcon sx={{ color: 'white', fontSize: 28 }} />
                    <Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.2 }}>
                            Batch Materials
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                            {batch?.name} — File Manager
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Upload Progress */}
            {uploading && (
                <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
                    sx={{ height: 4 }}
                />
            )}

            {/* Toolbar */}
            <Box sx={{
                px: 3, py: 1,
                borderBottom: `1px solid ${borderColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'white'
            }}>
                {/* Breadcrumb */}
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ flex: 1 }}>
                    <Link
                        component="button"
                        underline="hover"
                        onClick={() => navigateToBreadcrumb(-1)}
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: currentParent ? 'primary.main' : 'text.primary', cursor: 'pointer' }}
                    >
                        <HomeIcon sx={{ fontSize: 16 }} />
                        Root
                    </Link>
                    {breadcrumbs.map((crumb, idx) => (
                        idx === breadcrumbs.length - 1 ? (
                            <Typography key={crumb.id} variant="body2" sx={{ fontWeight: 600 }}>
                                {crumb.name}
                            </Typography>
                        ) : (
                            <Link
                                key={crumb.id}
                                component="button"
                                underline="hover"
                                onClick={() => navigateToBreadcrumb(idx)}
                                sx={{ color: 'primary.main', cursor: 'pointer' }}
                            >
                                {crumb.name}
                            </Link>
                        )
                    ))}
                </Breadcrumbs>

                <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                        size="small"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><NavigateNextIcon sx={{ transform: 'rotate(90deg)', fontSize: 16 }} /></InputAdornment>,
                            sx: { borderRadius: 1.5, height: 32, fontSize: '0.8rem', width: 200 }
                        }}
                    />
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                    <Tooltip title="List View">
                        <IconButton size="small" onClick={() => setViewMode('list')} color={viewMode === 'list' ? 'primary' : 'default'}>
                            <MoreVertIcon sx={{ transform: 'rotate(90deg)' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Grid View">
                        <IconButton size="small" onClick={() => setViewMode('grid')} color={viewMode === 'grid' ? 'primary' : 'default'}>
                            <CollectionsIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>

            {/* Main Content Area with Sidebar */}
            <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Folder Tree Sidebar */}
                <Box sx={{
                    width: '30%',
                    minWidth: 260,
                    borderRight: `1px solid ${borderColor}`,
                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fcfcff',
                    overflowY: 'auto',
                    display: { xs: 'none', sm: 'flex' },
                    flexDirection: 'column',
                    py: 2
                }}>
                    {/* Add New Button Area */}
                    <Box sx={{ px: 2, mb: 3 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            startIcon={<UploadFileIcon />}
                            sx={{ 
                                bgcolor: '#0097a7', 
                                '&:hover': { bgcolor: '#00838f' },
                                borderRadius: 1.5,
                                textTransform: 'none',
                                fontWeight: 700
                            }}
                            component="label"
                        >
                            Upload Files
                            <input type="file" multiple hidden onChange={handleFileUpload} />
                        </Button>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                size="small"
                                onClick={() => setFolderDialogOpen(true)}
                                sx={{ borderRadius: 1, fontSize: '0.7rem', py: 0.5 }}
                            >
                                + Folder
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                size="small"
                                onClick={() => setLinkDialogOpen(true)}
                                sx={{ borderRadius: 1, fontSize: '0.7rem', py: 0.5, color: 'black', borderColor: 'black' }}
                            >
                                + Link
                            </Button>
                        </Stack>
                    </Box>

                    <Typography variant="overline" sx={{ px: 3, color: 'text.disabled', fontWeight: 700, fontSize: '0.65rem' }}>
                        FOLDER NAVIGATION
                    </Typography>
                    <Divider sx={{ mx: 2, mb: 1 }} />
                    {renderFolderTree(null)}
                </Box>

                {/* File Grid / List View / Inner Preview */}
                <DialogContent sx={{ flex: 1, overflow: 'auto', p: 0, position: 'relative' }}>
                    {previewItem ? (
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ px: 3, py: 1, borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Button startIcon={<NavigateNextIcon sx={{ transform: 'rotate(180deg)' }} />} onClick={() => setPreviewItem(null)}>
                                    Back
                                </Button>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{previewItem.name}</Typography>
                                <Button size="small" variant="outlined" onClick={() => window.open(previewItem.url.startsWith('http') ? previewItem.url : `${import.meta.env.VITE_API_URL || ''}${previewItem.url}`, '_blank')}>
                                    Open Externally
                                </Button>
                            </Box>
                            <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: isDark ? '#0a0a0a' : '#f0f0f0' }}>
                                {previewItem.type === 'image' ? (
                                    <img 
                                        src={previewItem.url.startsWith('http') ? previewItem.url : `${import.meta.env.VITE_API_URL || ''}${previewItem.url}`} 
                                        alt={previewItem.name}
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', margin: 'auto', display: 'block' }}
                                    />
                                ) : previewItem.type === 'pdf' ? (
                                    <iframe 
                                        src={previewItem.url.startsWith('http') ? previewItem.url : `${import.meta.env.VITE_API_URL || ''}${previewItem.url}#toolbar=0`} 
                                        width="100%" 
                                        height="100%" 
                                        style={{ border: 'none' }}
                                    />
                                ) : previewItem.type === 'video' ? (
                                    <video controls style={{ width: '100%', height: '100%' }}>
                                        <source src={previewItem.url.startsWith('http') ? previewItem.url : `${import.meta.env.VITE_API_URL || ''}${previewItem.url}`} />
                                    </video>
                                ) : (
                                    <Box sx={{ p: 4, textAlign: 'center' }}>
                                        <FileIcon type={previewItem.type} size={100} />
                                        <Typography variant="h6" sx={{ mt: 2 }}>{previewItem.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">Preview not available for this file type.</Typography>
                                        <Button variant="contained" sx={{ mt: 3 }} onClick={() => window.open(previewItem.url.startsWith('http') ? previewItem.url : `${import.meta.env.VITE_API_URL || ''}${previewItem.url}`, '_blank')}>
                                            Download / View Original
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    ) : loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : filteredMaterials.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <FolderIcon sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">This folder is empty</Typography>
                            <Typography variant="body2" color="text.disabled">
                                Create a folder, add a link, or upload files to get started.
                            </Typography>
                        </Box>
                    ) : viewMode === 'grid' ? (
                        <Grid container spacing={2} sx={{ p: 3 }}>
                            {filteredMaterials.map((item) => (
                                <Grid item xs={12} sm={6} md={6} lg={4} key={item._id}>
                                    <Box
                                        onClick={() => handleItemClick(item)}
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            border: `1px solid ${borderColor}`,
                                            bgcolor: cardBg,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            position: 'relative',
                                            '&:hover': {
                                                bgcolor: cardHover,
                                                borderColor: 'primary.main',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 4px 12px rgba(102,126,234,0.15)'
                                            }
                                        }}
                                    >
                                        <IconButton
                                            size="small"
                                            sx={{ position: 'absolute', top: 8, right: 8, opacity: 0.5, '&:hover': { opacity: 1 } }}
                                            onClick={(e) => handleContextMenu(e, item)}
                                        >
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
    
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, textAlign: 'center' }}>
                                            <FileIcon type={item.type} size={48} />
                                            <Typography
                                                variant="body2"
                                                sx={{ fontWeight: 600, fontSize: '0.82rem', wordBreak: 'break-word', lineHeight: 1.3, maxWidth: '100%' }}
                                            >
                                                {item.name}
                                            </Typography>
                                            <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap">
                                                <Chip
                                                    label={(FILE_TYPE_CONFIG[item.type] || FILE_TYPE_CONFIG.other).label}
                                                    size="small"
                                                    sx={{ fontSize: '0.65rem', height: 18, bgcolor: `${(FILE_TYPE_CONFIG[item.type] || FILE_TYPE_CONFIG.other).color}22`, color: (FILE_TYPE_CONFIG[item.type] || FILE_TYPE_CONFIG.other).color }}
                                                />
                                                {item.size > 0 && (
                                                    <Chip label={formatSize(item.size)} size="small" sx={{ fontSize: '0.65rem', height: 18 }} />
                                                )}
                                            </Stack>
                                        </Box>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        /* List View */
                        <Box sx={{ minWidth: 600 }}>
                            <Box sx={{ 
                                display: 'flex', 
                                px: 3, py: 1.5, 
                                borderBottom: `1px solid ${borderColor}`,
                                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fcfcff',
                                position: 'sticky', top: 0, zIndex: 1
                            }}>
                                <Typography variant="caption" sx={{ flex: 1.5, fontWeight: 700, color: 'text.disabled' }}>Name</Typography>
                                <Typography variant="caption" sx={{ flex: 1, fontWeight: 700, color: 'text.disabled' }}>Size</Typography>
                                <Typography variant="caption" sx={{ flex: 1, fontWeight: 700, color: 'text.disabled' }}>Date Modified</Typography>
                                <Box sx={{ width: 40 }} />
                            </Box>
                            <List disablePadding>
                                {filteredMaterials.map((item) => (
                                    <ListItemButton
                                        key={item._id}
                                        onClick={() => handleItemClick(item)}
                                        sx={{ 
                                            px: 3, py: 1, 
                                            borderBottom: `1px solid ${borderColor}`,
                                            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9ff' }
                                        }}
                                    >
                                        <Box sx={{ flex: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <FileIcon type={item.type} size={24} />
                                            <Typography variant="body2" sx={{ fontWeight: 500, noWrap: true }}>{item.name}</Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ flex: 1, color: 'text.secondary' }}>
                                            {item.size > 0 ? formatSize(item.size) : '--'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ flex: 1, color: 'text.secondary' }}>
                                            {item.createdAt ? format(new Date(item.createdAt), 'dd MMM yyyy') : '--'}
                                        </Typography>
                                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleContextMenu(e, item); }}>
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                    </ListItemButton>
                                ))}
                            </List>
                        </Box>
                    )}
                </DialogContent>
            </Box>

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{ sx: { borderRadius: 2, minWidth: 150 } }}
            >
                {contextItem?.url && contextItem?.type !== 'folder' && (
                    <MenuItem onClick={() => {
                        window.open(contextItem.url.startsWith('http') ? contextItem.url : `${import.meta.env.VITE_API_URL || ''}${contextItem.url}`, '_blank');
                        setAnchorEl(null);
                    }}>
                        <DriveFileMoveIcon sx={{ mr: 1, fontSize: 18 }} /> Open / Download
                    </MenuItem>
                )}
                <MenuItem onClick={() => handleDeleteItem(contextItem)} sx={{ color: 'error.main' }}>
                    <DeleteIcon sx={{ mr: 1, fontSize: 18 }} /> Delete
                </MenuItem>
            </Menu>

            {/* Create Folder Dialog */}
            <Dialog open={folderDialogOpen} onClose={() => setFolderDialogOpen(false)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CreateNewFolderIcon color="primary" />
                        New Folder
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Folder Name"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                        margin="dense"
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <Box sx={{ px: 3, pb: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button onClick={() => setFolderDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>Create</Button>
                </Box>
            </Dialog>

            {/* Add Link Dialog */}
            <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AddLinkIcon color="secondary" />
                        Add Link
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Link Name / Title"
                        value={newLinkName}
                        onChange={(e) => setNewLinkName(e.target.value)}
                        margin="dense"
                        sx={{ mt: 1 }}
                    />
                    <TextField
                        fullWidth
                        label="URL"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        margin="dense"
                        placeholder="https://"
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><LinkIcon sx={{ fontSize: 18 }} /></InputAdornment>
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                    />
                </DialogContent>
                <Box sx={{ px: 3, pb: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="secondary" onClick={handleAddLink} disabled={!newLinkName.trim() || !newLinkUrl.trim()}>
                        Add Link
                    </Button>
                </Box>
            </Dialog>

            <MediaPickerModal
                open={mediaPickerOpen}
                onClose={() => setMediaPickerOpen(false)}
                onSelect={handleMediaSelect}
            />
        </Drawer>
    );
};

export default BatchMaterialsModal;
