import React from 'react';
import { 
    Box, Grid, Typography, Checkbox, Button, IconButton, Stack, Chip, 
    List, ListItemButton, CircularProgress, Card, Tooltip
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
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { format } from 'date-fns';
import { fixUrl } from '../../../utils/api';
import VideoPreview from '../../Common/VideoPreview';

export const FILE_TYPE_CONFIG = {
    folder: { icon: FolderIcon, color: '#FFB300', bg: 'rgba(255,179,0,0.12)', label: 'Folder' },
    pdf: { icon: PictureAsPdfIcon, color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'PDF Document' },
    video: { icon: VideoLibraryIcon, color: '#a855f7', bg: 'rgba(168,85,247,0.12)', label: 'Video' },
    audio: { icon: AudioFileIcon, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', label: 'Audio' },
    image: { icon: Image, color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Image' },
    code: { icon: CodeIcon, color: '#f97316', bg: 'rgba(249,115,22,0.12)', label: 'Code File' },
    link: { icon: LinkIcon, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Web Link' },
    zip: { icon: ArchiveIcon, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', label: 'Archive' },
    other: { icon: InsertDriveFileIcon, color: '#64748b', bg: 'rgba(100,116,139,0.12)', label: 'Document' },
};

export const FileIcon = ({ type, url, size = 36, color }) => {
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
                    borderRadius: '6px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(0,0,0,0.05)',
                    border: '1px solid rgba(0,0,0,0.08)',
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
    
    return <Icon sx={{ fontSize: size, color: color || cfg.color }} />;
};

const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getItemId = (item) => item?._id || item?.id;

const MaterialsView = ({
    filteredMaterials = [],
    selectedIds = [],
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
    viewMode = 'grid',
    isDark,
    borderColor,
    setUploadModalOpen,
    setFolderDialogOpen
}) => {
    const allSelected = filteredMaterials.length > 0 && selectedIds.length === filteredMaterials.length;
    const isSomeSelected = selectedIds.length > 0 && !allSelected;

    // File preview renderer
    if (previewItem) {
        const itemType = previewItem.type?.toLowerCase();
        const fullUrl = fixUrl(previewItem?.url);

        return (
            <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: isDark ? 'rgba(0,0,0,0.3)' : '#f8faee' }}>
                <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'background.paper' }}>
                    <Button 
                        startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />} 
                        onClick={() => setPreviewItem(null)}
                        size="small"
                        sx={{ textTransform: 'none', fontWeight: 600, fontSize: '13px' }}
                    >
                        Back to Explorer
                    </Button>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, noWrap: true, maxWidth: 300 }}>
                        {previewItem.name}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        {previewItem.url && (
                            <Button 
                                size="small" 
                                variant="contained" 
                                startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                                onClick={() => handleDownload(previewItem)}
                                disabled={downloading}
                                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '12px', borderRadius: '7px' }}
                            >
                                {downloading ? 'Downloading...' : 'Download'}
                            </Button>
                        )}
                    </Stack>
                </Box>

                <Box sx={{ flex: 1, overflow: 'auto', p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {itemType === 'image' ? (
                        <Box sx={{ maxWidth: '100%', maxHeight: '100%', textAlign: 'center' }}>
                            <img 
                                src={fullUrl} 
                                alt={previewItem.name}
                                style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', objectFit: 'contain' }}
                            />
                        </Box>
                    ) : itemType === 'video' ? (
                        <Box sx={{ width: '100%', maxWidth: 800, aspectRatio: '16/9' }}>
                            <VideoPreview url={fullUrl} title={previewItem.name} />
                        </Box>
                    ) : itemType === 'audio' ? (
                        <Box sx={{ p: 4, bgcolor: 'background.paper', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', textAlign: 'center', width: '100%', maxWidth: 450 }}>
                            <AudioFileIcon sx={{ fontSize: 56, color: '#06b6d4', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{previewItem.name}</Typography>
                            <audio controls src={fullUrl} style={{ width: '100%' }} />
                        </Box>
                    ) : itemType === 'pdf' ? (
                        <iframe 
                            src={fullUrl} 
                            title={previewItem.name}
                            style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        />
                    ) : itemType === 'link' ? (
                        <Box sx={{ p: 4, bgcolor: 'background.paper', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: 450 }}>
                            <LinkIcon sx={{ fontSize: 56, color: '#3b82f6', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{previewItem.name}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, wordBreak: 'break-all' }}>{previewItem.url}</Typography>
                            <Button 
                                variant="contained" 
                                component="a" 
                                href={previewItem.url} 
                                target="_blank" 
                                rel="noreferrer"
                                startIcon={<OpenInNewIcon />}
                                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                            >
                                Open External Link
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{ p: 4, bgcolor: 'background.paper', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: 450 }}>
                            <InsertDriveFileIcon sx={{ fontSize: 56, color: '#64748b', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{previewItem.name}</Typography>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                                Preview is not available for this file type.
                            </Typography>
                            <Button 
                                variant="contained" 
                                startIcon={<DownloadIcon />}
                                onClick={() => handleDownload(previewItem)}
                                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                            >
                                Download File
                            </Button>
                        </Box>
                    )}
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Top Selection Actions Bar */}
            <Box sx={{ 
                px: 2.5, py: 1, 
                borderBottom: `1px solid ${borderColor}`,
                bgcolor: selectedIds.length > 0 ? (isDark ? 'rgba(99,102,241,0.15)' : '#eef2ff') : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all 0.2s ease'
            }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Checkbox
                        size="small"
                        checked={allSelected}
                        indeterminate={isSomeSelected}
                        onChange={handleSelectAll}
                        sx={{ p: 0.5 }}
                    />
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'text.primary' }}>
                        {selectedIds.length > 0 
                            ? `${selectedIds.length} item(s) selected` 
                            : `${filteredMaterials.length} item(s)`}
                    </Typography>
                </Stack>

                {selectedIds.length > 0 && (
                    <Button
                        size="small"
                        color="error"
                        variant="contained"
                        startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
                        onClick={handleBulkDelete}
                        sx={{ 
                            textTransform: 'none', 
                            fontWeight: 700, 
                            fontSize: '12px',
                            borderRadius: '6px',
                            boxShadow: 'none'
                        }}
                    >
                        Delete Selected ({selectedIds.length})
                    </Button>
                )}
            </Box>

            {/* Main Content Explorer View */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10, gap: 2 }}>
                        <CircularProgress size={36} thickness={4} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Loading materials...
                        </Typography>
                    </Box>
                ) : filteredMaterials.length === 0 ? (
                    <Box sx={{ 
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10, 
                        border: '2px dashed', borderColor: 'divider', borderRadius: '12px', bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                        textAlign: 'center', px: 3
                    }}>
                        <FolderOpenIcon sx={{ fontSize: 56, color: 'text.secondary', opacity: 0.4, mb: 1.5 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                            This folder is empty
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mb: 3, fontSize: '13px' }}>
                            Upload files or create sub-folders to start organizing materials for this batch.
                        </Typography>
                        <Stack direction="row" spacing={1.5}>
                            <Button 
                                variant="contained" 
                                size="small" 
                                startIcon={<CloudUploadIcon />} 
                                onClick={() => setUploadModalOpen(true)}
                                sx={{ borderRadius: '7px', textTransform: 'none', fontWeight: 600 }}
                            >
                                Upload Files
                            </Button>
                            <Button 
                                variant="outlined" 
                                size="small" 
                                startIcon={<CreateNewFolderIcon />} 
                                onClick={() => setFolderDialogOpen(true)}
                                sx={{ borderRadius: '7px', textTransform: 'none', fontWeight: 600 }}
                            >
                                New Folder
                            </Button>
                        </Stack>
                    </Box>
                ) : viewMode === 'grid' ? (
                    /* Grid Layout */
                    <Grid container spacing={2}>
                        {filteredMaterials.map((item) => {
                            const id = getItemId(item);
                            const isSelected = selectedIds.includes(id);
                            const cfg = FILE_TYPE_CONFIG[item.type?.toLowerCase()] || FILE_TYPE_CONFIG.other;

                            return (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={id}>
                                    <Card
                                        elevation={0}
                                        onClick={() => handleItemClick(item)}
                                        onContextMenu={(e) => handleContextMenu(e, item)}
                                        sx={{
                                            p: 1.8,
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            bgcolor: isSelected 
                                                ? (isDark ? 'rgba(99,102,241,0.2)' : '#eef2ff') 
                                                : (isDark ? 'rgba(255,255,255,0.03)' : 'var(--color-vc-canvas, #ffffff)'),
                                            border: '1px solid',
                                            borderColor: isSelected ? 'primary.main' : borderColor,
                                            boxShadow: isSelected ? '0 4px 12px rgba(99,102,241,0.15)' : 'none',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                                                borderColor: 'primary.main',
                                                '& .item-checkbox': { opacity: 1 }
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Checkbox
                                                    className="item-checkbox"
                                                    size="small"
                                                    checked={isSelected}
                                                    onChange={(e) => handleToggleSelect(e, id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    sx={{ 
                                                        p: 0, 
                                                        opacity: isSelected ? 1 : 0.4,
                                                        transition: 'opacity 0.2s ease' 
                                                    }}
                                                />
                                                <Box sx={{
                                                    width: 38,
                                                    height: 38,
                                                    borderRadius: '8px',
                                                    bgcolor: cfg.bg,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <FileIcon type={item.type} url={item.url} size={22} />
                                                </Box>
                                            </Box>

                                            <IconButton 
                                                size="small" 
                                                onClick={(e) => handleContextMenu(e, item)}
                                                sx={{ color: 'text.secondary', p: 0.5 }}
                                            >
                                                <MoreVertIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Box>

                                        <Typography 
                                            sx={{ 
                                                fontWeight: 700, 
                                                fontSize: '13px', 
                                                fontFamily: 'inherit',
                                                lineHeight: 1.3,
                                                mb: 0.8,
                                                overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                                            }}
                                        >
                                            {item?.name || item?.title || 'Untitled'}
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                                            <Chip 
                                                label={cfg.label} 
                                                size="small" 
                                                sx={{ 
                                                    height: 18, 
                                                    fontSize: '10px', 
                                                    fontWeight: 600, 
                                                    bgcolor: cfg.bg, 
                                                    color: cfg.color 
                                                }} 
                                            />
                                            {item.size ? (
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px' }}>
                                                    {formatSize(item.size)}
                                                </Typography>
                                            ) : (
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px' }}>
                                                    Folder
                                                </Typography>
                                            )}
                                        </Box>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                ) : (
                    /* List Layout */
                    <List disablePadding sx={{ borderRadius: '10px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                        {filteredMaterials.map((item, idx) => {
                            const id = getItemId(item);
                            const isSelected = selectedIds.includes(id);
                            const cfg = FILE_TYPE_CONFIG[item.type?.toLowerCase()] || FILE_TYPE_CONFIG.other;

                            return (
                                <ListItemButton
                                    key={id}
                                    onClick={() => handleItemClick(item)}
                                    onContextMenu={(e) => handleContextMenu(e, item)}
                                    selected={isSelected}
                                    sx={{
                                        py: 1.2,
                                        px: 2,
                                        borderBottom: idx === filteredMaterials.length - 1 ? 'none' : `1px solid ${borderColor}`,
                                        bgcolor: isSelected ? (isDark ? 'rgba(99,102,241,0.15)' : '#eef2ff') : 'transparent',
                                        '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }
                                    }}
                                >
                                    <Checkbox
                                        size="small"
                                        checked={isSelected}
                                        onChange={(e) => handleToggleSelect(e, id)}
                                        onClick={(e) => e.stopPropagation()}
                                        sx={{ mr: 1.5, p: 0 }}
                                    />

                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '6px',
                                        bgcolor: cfg.bg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mr: 2
                                    }}>
                                        <FileIcon type={item.type} url={item.url} size={18} />
                                    </Box>

                                    <Typography sx={{ fontWeight: 600, fontSize: '13px', flex: 1, fontFamily: 'inherit', noWrap: true, mr: 2 }}>
                                        {item?.name || item?.title || 'Untitled'}
                                    </Typography>

                                    <Chip 
                                        label={cfg.label} 
                                        size="small" 
                                        sx={{ 
                                            height: 20, 
                                            fontSize: '11px', 
                                            fontWeight: 600, 
                                            bgcolor: cfg.bg, 
                                            color: cfg.color,
                                            mr: 3,
                                            display: { xs: 'none', sm: 'inline-flex' }
                                        }} 
                                    />

                                    <Typography variant="caption" sx={{ color: 'text.secondary', width: 80, display: { xs: 'none', md: 'block' }, textAlign: 'right', mr: 2 }}>
                                        {formatSize(item.size) || '—'}
                                    </Typography>

                                    <IconButton 
                                        size="small" 
                                        onClick={(e) => handleContextMenu(e, item)}
                                        sx={{ color: 'text.secondary', p: 0.5 }}
                                    >
                                        <MoreVertIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </ListItemButton>
                            );
                        })}
                    </List>
                )}
            </Box>
        </Box>
    );
};

export default MaterialsView;
