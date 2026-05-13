import React from 'react';
import { 
    Box, DialogContent, Grid, Typography, Checkbox, Button, IconButton, Stack, Chip, 
    List, ListItemButton, CircularProgress
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import Image from '@mui/icons-material/Image';
import CodeIcon from '@mui/icons-material/Code';
import LinkIcon from '@mui/icons-material/Link';
import ArchiveIcon from '@mui/icons-material/Archive';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { format } from 'date-fns';
import { fixUrl } from '../../../utils/api';
import VideoPreview from '../../Common/VideoPreview';

export const FILE_TYPE_CONFIG = {
    folder: { icon: FolderIcon, color: '#FFB300', label: 'Folder' },
    pdf: { icon: PictureAsPdfIcon, color: '#F44336', label: 'PDF' },
    video: { icon: VideoLibraryIcon, color: '#9C27B0', label: 'Video' },
    audio: { icon: AudioFileIcon, color: '#00BCD4', label: 'Audio' },
    image: { icon: Image, color: '#4CAF50', label: 'Image' },
    code: { icon: CodeIcon, color: '#FF5722', label: 'Code' },
    link: { icon: LinkIcon, color: '#2196F3', label: 'Link' },
    zip: { icon: ArchiveIcon, color: '#795548', label: 'Archive' },
    other: { icon: InsertDriveFileIcon, color: '#607D8B', label: 'File' },
};

export const FileIcon = ({ type, url, size = 40 }) => {
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

const MaterialsView = ({
    filteredMaterials,
    selectedIds,
    handleSelectAll,
    handleBulkDelete,
    handleItemClick,
    handleToggleSelect,
    handleContextMenu,
    handleDownload,
    previewItem,
    setPreviewItem,
    loading,
    downloading,
    downloadProgress,
    viewMode,
    isDark,
    borderColor
}) => {
    const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#f8f9ff';
    const cardHover = isDark ? 'rgba(255,255,255,0.1)' : '#e8ecff';

    if (previewItem) {
        return (
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
                    ) : (previewItem.type === 'link' && (previewItem.url?.includes('youtube.com') || previewItem.url?.includes('youtu.be'))) ? (
                        <VideoPreview url={previewItem.url} height="100%" />
                    ) : previewItem.type === 'video' ? (
                        <VideoPreview url={previewItem.url} height="100%" />
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
        );
    }

    return (
        <DialogContent sx={{ flex: 1, overflow: 'auto', p: 0, position: 'relative', display: 'flex', flexDirection: 'column' }}>
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

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : filteredMaterials.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <FolderIcon sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">This folder is empty</Typography>
                </Box>
            ) : viewMode === 'grid' ? (
                <Grid container spacing={2} sx={{ p: 3 }}>
                    {filteredMaterials.map((item) => (
                        <Grid item xs={12} sm={6} md={6} lg={4} key={item._id}>
                            <Box
                                onClick={() => handleItemClick(item)}
                                sx={{
                                    p: 2, borderRadius: 2, border: `1px solid ${borderColor}`,
                                    bgcolor: cardBg, cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                                    '&:hover': {
                                        bgcolor: cardHover, borderColor: 'primary.main',
                                        transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(102,126,234,0.15)'
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
                                        size="small" checked={selectedIds.includes(item._id)}
                                        onChange={(e) => handleToggleSelect(e, item._id)}
                                        onClick={(e) => e.stopPropagation()}
                                        sx={{ position: 'absolute', top: 4, left: 4 }}
                                    />
                                    <FileIcon type={item.type} url={item.url} size={48} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', noWrap: true, maxWidth: '100%' }}>
                                        {item.name}
                                    </Typography>
                                    <Stack direction="row" spacing={0.5} justifyContent="center">
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
                <Box sx={{ minWidth: 600 }}>
                    <Box sx={{ 
                        display: 'flex', px: 3, py: 1.5, borderBottom: `1px solid ${borderColor}`,
                        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fcfcff', position: 'sticky', top: 0, zIndex: 1
                    }}>
                        <Typography variant="caption" sx={{ flex: 1.5, fontWeight: 700, color: 'text.disabled' }}>Name</Typography>
                        <Typography variant="caption" sx={{ flex: 1, fontWeight: 700, color: 'text.disabled' }}>Size</Typography>
                        <Typography variant="caption" sx={{ flex: 1, fontWeight: 700, color: 'text.disabled' }}>Date Modified</Typography>
                        <Box sx={{ width: 40 }} />
                    </Box>
                    <List disablePadding>
                        {filteredMaterials.map((item) => (
                            <ListItemButton
                                key={item._id} onClick={() => handleItemClick(item)}
                                sx={{ px: 3, py: 1, borderBottom: `1px solid ${borderColor}` }}
                            >
                                <Box sx={{ flex: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Checkbox 
                                        size="small" checked={selectedIds.includes(item._id)}
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
    );
};

export default MaterialsView;
