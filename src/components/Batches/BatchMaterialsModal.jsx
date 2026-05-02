import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Dialog, DialogTitle, DialogContent, Box, Typography, IconButton,
    Button, TextField, MenuItem, Breadcrumbs, Link, Tooltip, Chip,
    Stack, Grid, CircularProgress, Menu, InputAdornment, Divider,
    Alert, LinearProgress, Drawer, List, ListItemButton, ListItemIcon,
    ListItemText, Collapse, Checkbox
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
import FolderZipIcon from '@mui/icons-material/FolderZip';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import CollectionsIcon from '@mui/icons-material/Collections';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '../../context/ThemeContext';
import api, { fixUrl } from '../../utils/api';
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

const FileIcon = ({ type, url, size = 40 }) => {
    const cfg = FILE_TYPE_CONFIG[type?.toLowerCase()] || FILE_TYPE_CONFIG.other;
    const Icon = cfg.icon;
    
    const isImageFile = type?.toLowerCase() === 'image' || 
                        (url && url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i));
    
    if (isImageFile && url) {
        return (
            <Box
                sx={{
                    width: size,
                    height: size,
                    borderRadius: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(0,0,0,0.05)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    position: 'relative'
                }}
            >
                <img
                    src={fixUrl(url)}
                    alt="preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    loading="lazy"
                    onError={(e) => { 
                        e.target.style.display = 'none'; 
                        const iconEl = e.target.parentElement.querySelector('.fallback-icon');
                        if (iconEl) iconEl.style.display = 'block';
                    }}
                />
                <Icon 
                    className="fallback-icon"
                    sx={{ 
                        fontSize: size * 0.6, 
                        color: cfg.color, 
                        display: 'none' 
                    }} 
                />
            </Box>
        );
    }
    
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
    const [searchParams, setSearchParams] = useSearchParams();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [downloading, setDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [selectedIds, setSelectedIds] = useState([]);

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
    const [typeFilter, setTypeFilter] = useState('all');
    const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [previewItem, setPreviewItem] = useState(null);

    // Filter Menu
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);

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
            const folderId = searchParams.get('folderId');
            const parentId = folderId || null;
            
            setCurrentParent(parentId);
            setSelectedIds([]); // Clear selection when opening or changing folder
            fetchAllItems().then(() => {
                if (parentId) {
                    // Update breadcrumbs from items once loaded
                    const items = allItems.length > 0 ? allItems : [];
                }
            });
            fetchMaterials(parentId);
        }
    }, [open, batch?._id]); // Only run on open or batch change

    // Breadcrumb sync when items load or parent changes
    useEffect(() => {
        if (open && allItems.length > 0) {
            if (currentParent) {
                const path = getPathToItem(currentParent, allItems);
                setBreadcrumbs(path);
                // Also expand parent folders
                const expansions = {};
                path.forEach(p => expansions[p.id] = true);
                setExpandedFolders(prev => ({ ...prev, ...expansions }));
            } else {
                setBreadcrumbs([]);
            }
        }
    }, [currentParent, allItems, open]);

    const updateUrl = (folderId) => {
        const newParams = new URLSearchParams(searchParams);
        if (folderId) {
            newParams.set('folderId', folderId);
        } else {
            newParams.delete('folderId');
        }
        setSearchParams(newParams);
    };

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
        updateUrl(item._id);
        fetchMaterials(item._id);
    }, [searchParams, fetchMaterials]);

    const navigateToBreadcrumb = useCallback(async (index) => {
        let parentId = null;
        if (index === -1) {
            setCurrentParent(null);
            updateUrl(null);
            parentId = null;
        } else {
            const crumb = breadcrumbs[index];
            setCurrentParent(crumb.id);
            updateUrl(crumb.id);
            parentId = crumb.id;
        }
        fetchMaterials(parentId);
        
        // Auto-expand the parent in sidebar
        if (parentId) {
            setExpandedFolders(prev => ({ ...prev, [parentId]: true }));
        }
    }, [breadcrumbs, fetchMaterials, searchParams]);

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
            fetchAllItems();
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
            fetchAllItems();
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
            fetchAllItems();
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
                console.log(`📤 Starting upload for: ${file.name} (${file.size} bytes)`);
                const response = await api.post('/batch-materials/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    timeout: 60000, // 60 seconds timeout
                    onUploadProgress: (p) => {
                        const prog = Math.round((p.loaded * 100) / p.total);
                        setUploadProgress(prog);
                        console.log(`⏳ Uploading ${file.name}: ${prog}%`);
                    }
                });
                console.log(`✅ Upload success for: ${file.name}`, response.data);
                successCount++;
            } catch (error) {
                console.error(`❌ Upload failed for: ${file.name}`);
                console.error('Error Details:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                const errorMsg = error.response?.data?.message || 'Upload failed';
                toast.error(`${file.name}: ${errorMsg}`);
            }
            setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        }

        if (successCount > 0) {
            toast.success(`${successCount} file(s) uploaded successfully`);
        }
        setUploading(false);
        setUploadProgress(0);
        fetchMaterials(currentParent);
        fetchAllItems();
        e.target.value = '';
    };

    const handleDeleteItem = async (item) => {
        if (!window.confirm(`Delete "${item.name}"${item.type === 'folder' ? ' and all its contents' : ''}?`)) return;
        try {
            await api.delete(`/batch-materials/${item._id}`);
            toast.success('Deleted successfully');
            
            // If we deleted the folder we are currently in, go back to root
            if (currentParent === item._id) {
                setCurrentParent(null);
                updateUrl(null);
                fetchMaterials(null);
            } else {
                fetchMaterials(currentParent);
            }
            fetchAllItems();
            
            // Clear selection if this item was selected
            setSelectedIds(prev => prev.filter(id => id !== item._id));
            
            // Clear preview if this item was being previewed
            if (previewItem?._id === item._id) {
                setPreviewItem(null);
            }
        } catch {
            toast.error('Failed to delete');
        }
        setAnchorEl(null);
    };

    const handleDownload = async (item) => {
        if (!item.url) return;
        setDownloading(true);
        setDownloadProgress(0);
        try {
            const url = fixUrl(item.url);
            const response = await api.get(url, {
                responseType: 'blob',
                onDownloadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setDownloadProgress(percentCompleted);
                }
            });

            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', item.name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
            toast.success('Download complete');
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to download file');
        } finally {
            setDownloading(false);
            setDownloadProgress(0);
        }
    };

    useEffect(() => {
        if (previewItem) {
            console.log('🖼️ Preview Item Updated:', {
                name: previewItem.name,
                url: previewItem.url,
                resolvedUrl: fixUrl(previewItem.url)
            });
        }
    }, [previewItem]);

    const handleContextMenu = (e, item) => {
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
        setContextItem(item);
    };

    const toggleFolderExpand = (e, folderId) => {
        e.stopPropagation();
        setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
    };

    const handleToggleSelect = (e, id) => {
        e.stopPropagation();
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(filteredMaterials.map(m => m._id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) return;

        try {
            setLoading(true);
            await api.post('/batch-materials/bulk-delete', { ids: selectedIds });
            toast.success('Items deleted successfully');
            
            // Check if our current folder was among the deleted items
            if (selectedIds.includes(currentParent)) {
                setCurrentParent(null);
                updateUrl(null);
                fetchMaterials(null);
            } else {
                fetchMaterials(currentParent);
            }
            
            fetchAllItems();
            setSelectedIds([]);
            
            // Clear preview if previewed item was deleted
            if (previewItem && selectedIds.includes(previewItem._id)) {
                setPreviewItem(null);
            }
        } catch (error) {
            toast.error('Failed to delete items');
        } finally {
            setLoading(false);
        }
    };

    const handleItemClick = (item) => {
        console.log('🔍 Item Clicked:', {
            id: item._id,
            name: item.name,
            type: item.type,
            url: item.url,
            fixedUrl: item.url ? fixUrl(item.url) : 'N/A'
        });

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
                                    pl: level * 1.5 + 0.5,
                                    py: 0.3,
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
                                <Checkbox 
                                    size="small" 
                                    checked={selectedIds.includes(item._id)}
                                    onChange={(e) => handleToggleSelect(e, item._id)}
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{ 
                                        p: 0.5, 
                                        mr: 0.5,
                                        color: isActive ? 'rgba(255,255,255,0.7)' : 'inherit',
                                        '&.Mui-checked': { color: isActive ? 'white' : 'primary.main' }
                                    }}
                                />
                                <ListItemIcon sx={{ minWidth: 24 }}>
                                    {isFolder ? (
                                        <FolderIcon sx={{ fontSize: 18, color: isActive ? 'inherit' : '#FFB300' }} />
                                    ) : (
                                        <FileIcon type={item.type} url={item.url} size={18} color={isActive ? 'inherit' : undefined} />
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

    const filteredMaterials = materials.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || m.type === typeFilter;
        return matchesSearch && matchesType;
    });

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

            {/* Progress Bars */}
            {(uploading || downloading) && (
                <Box sx={{ width: '100%', position: 'relative' }}>
                    <LinearProgress
                        variant="determinate"
                        value={uploading ? uploadProgress : downloadProgress}
                        color={uploading ? "primary" : "secondary"}
                        sx={{ height: 4 }}
                    />
                    <Box sx={{ 
                        position: 'absolute', top: 6, right: 12, zIndex: 10,
                        bgcolor: 'background.paper', px: 1, borderRadius: 1, 
                        boxShadow: 1, display: 'flex', alignItems: 'center', gap: 1
                    }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            {uploading ? `Uploading: ${uploadProgress}%` : `Downloading: ${downloadProgress}%`}
                        </Typography>
                    </Box>
                </Box>
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
                            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} /></InputAdornment>,
                            sx: { borderRadius: 1.5, height: 32, fontSize: '0.8rem', width: 160 }
                        }}
                    />
                    
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                        startIcon={<MoreVertIcon sx={{ transform: 'rotate(90deg)', fontSize: 16 }} />}
                        sx={{ height: 32, borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                    >
                        {typeFilter === 'all' ? 'All Files' : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
                    </Button>

                    <Menu
                        anchorEl={filterAnchorEl}
                        open={Boolean(filterAnchorEl)}
                        onClose={() => setFilterAnchorEl(null)}
                        PaperProps={{ sx: { borderRadius: 2, minWidth: 180, mt: 1, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' } }}
                    >
                        <MenuItem onClick={() => { setTypeFilter('all'); setFilterAnchorEl(null); }} selected={typeFilter === 'all'}>
                            <ListItemIcon><MoreVertIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="All Files" primaryTypographyProps={{ fontSize: '0.85rem' }} />
                        </MenuItem>
                        <Divider />
                        {[
                            { id: 'folder', name: 'Folders', icon: <FolderIcon fontSize="small" /> },
                            { id: 'image', name: 'Images', icon: <CollectionsIcon fontSize="small" /> },
                            { id: 'video', name: 'Videos', icon: <UploadFileIcon fontSize="small" /> },
                            { id: 'pdf', name: 'PDF Documents', icon: <PictureAsPdfIcon fontSize="small" /> },
                            { id: 'code', name: 'Code Files', icon: <InsertDriveFileIcon fontSize="small" /> },
                            { id: 'zip', name: 'Archives (ZIP)', icon: <FolderZipIcon fontSize="small" /> },
                        ].map((filter) => (
                            <MenuItem 
                                key={filter.id} 
                                onClick={() => { setTypeFilter(filter.id); setFilterAnchorEl(null); }} 
                                selected={typeFilter === filter.id}
                            >
                                <ListItemIcon>{filter.icon}</ListItemIcon>
                                <ListItemText primary={filter.name} primaryTypographyProps={{ fontSize: '0.85rem' }} />
                            </MenuItem>
                        ))}
                    </Menu>

                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                    <Tooltip title="List View">
                        <IconButton size="small" onClick={() => setViewMode('list')} color={viewMode === 'list' ? 'primary' : 'default'}>
                            <MoreVertIcon sx={{ transform: 'rotate(90deg)', fontSize: 20 }} />
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
                <DialogContent sx={{ flex: 1, overflow: 'auto', p: 0, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    {/* Bulk Action Bar */}
                    {!previewItem && (
                        <Box sx={{ 
                            px: 3, py: 1, 
                            borderBottom: `1px solid ${borderColor}`, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fafbfe'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Checkbox 
                                    size="small" 
                                    checked={filteredMaterials.length > 0 && selectedIds.length === filteredMaterials.length}
                                    indeterminate={selectedIds.length > 0 && selectedIds.length < filteredMaterials.length}
                                    onChange={handleSelectAll}
                                />
                                <Typography variant="caption" fontWeight={700} color="text.secondary">
                                    {selectedIds.length > 0 ? `${selectedIds.length} Selected` : 'Select All'}
                                </Typography>
                            </Box>
                            
                            {selectedIds.length > 0 && (
                                <Button 
                                    size="small" 
                                    variant="contained" 
                                    color="error" 
                                    startIcon={<DeleteIcon />}
                                    onClick={handleBulkDelete}
                                    sx={{ borderRadius: 1.5, textTransform: 'none', px: 2, py: 0.5 }}
                                >
                                    Delete {selectedIds.length} items
                                </Button>
                            )}
                        </Box>
                    )}

                    {previewItem ? (
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ px: 3, py: 1, borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Button startIcon={<NavigateNextIcon sx={{ transform: 'rotate(180deg)' }} />} onClick={() => setPreviewItem(null)}>
                                    Back
                                </Button>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{previewItem.name}</Typography>
                                <Button 
                                    size="small" 
                                    variant="outlined" 
                                    onClick={() => handleDownload(previewItem)}
                                    disabled={downloading}
                                >
                                    {downloading ? 'Downloading...' : 'Download File'}
                                </Button>
                            </Box>
                            <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: isDark ? '#0a0a0a' : '#f0f0f0' }}>
                                {previewItem.type === 'image' ? (
                                    <img 
                                        src={fixUrl(previewItem?.url)} 
                                        alt={previewItem.name}
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', margin: 'auto', display: 'block' }}
                                    />
                                ) : previewItem.type === 'pdf' ? (
                                    <iframe 
                                        src={`${fixUrl(previewItem?.url)}#toolbar=0`} 
                                        width="100%" 
                                        height="100%" 
                                        style={{ border: 'none' }}
                                    />
                                ) : previewItem.type === 'video' ? (
                                    <video controls style={{ width: '100%', height: '100%' }}>
                                        <source src={fixUrl(previewItem?.url)} />
                                    </video>
                                ) : (
                                    <Box sx={{ p: 4, textAlign: 'center' }}>
                                        <FileIcon type={previewItem.type} url={previewItem.url} size={100} />
                                        <Typography variant="h6" sx={{ mt: 2 }}>{previewItem.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">Preview not available for this file type.</Typography>
                                        <Button 
                                            variant="contained" 
                                            sx={{ mt: 3 }} 
                                            onClick={() => handleDownload(previewItem)}
                                            disabled={downloading}
                                        >
                                            {downloading ? `Downloading ${downloadProgress}%` : 'Download File'}
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
                                            <Checkbox 
                                                size="small" 
                                                checked={selectedIds.includes(item._id)}
                                                onChange={(e) => handleToggleSelect(e, item._id)}
                                                onClick={(e) => e.stopPropagation()}
                                                sx={{ position: 'absolute', top: 4, left: 4 }}
                                            />
                                            <FileIcon type={item.type} url={item.url} size={48} />
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
                                            <Checkbox 
                                                size="small" 
                                                checked={selectedIds.includes(item._id)}
                                                onChange={(e) => handleToggleSelect(e, item._id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <FileIcon type={item.type} url={item.url} size={24} />
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
                        handleDownload(contextItem);
                        setAnchorEl(null);
                    }} disabled={downloading}>
                        <DriveFileMoveIcon sx={{ mr: 1, fontSize: 18 }} /> {downloading ? 'Downloading...' : 'Download File'}
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
