import React from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Button,
    Divider,
    Stack,
    useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import VideoPreview from '../../../components/Common/VideoPreview';
import { fixUrl } from '../../../utils/api';
import toast from 'react-hot-toast';

const defaultFormatSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const MediaPreviewModal = (props) => {
    const theme = useTheme();
    const targetFile = props.file || props.previewFile;
    const handleClose = props.onClose || (() => props.setPreviewFile && props.setPreviewFile(null));
    const formatSizeFn = props.formatSize || defaultFormatSize;

    return (
        <Drawer
            anchor="right"
            open={Boolean(targetFile)}
            onClose={handleClose}
            sx={{
                '& .MuiDrawer-paper': {
                    width: 400,
                    boxSizing: 'border-box',
                    borderLeft: `1px solid ${theme.palette.divider}`,
                    boxShadow: '-10px 0 20px rgba(0,0,0,0.1)',
                    bgcolor: 'background.paper'
                },
            }}
        >
            <Box sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle1" fontWeight={800}>File Details</Typography>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Preview Area */}
                <Box sx={{ 
                    width: '100%', 
                    aspectRatio: '16/9', 
                    bgcolor: 'rgba(0,0,0,0.02)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    overflow: 'hidden',
                    borderBottom: `1px solid ${theme.palette.divider}`
                }}>
                    {targetFile?.type === 'video' ? (
                        <VideoPreview url={targetFile.url} height="100%" />
                    ) : (targetFile?.type === 'image' && !['heic', 'heif'].includes(targetFile?.format?.toLowerCase())) ? (
                        <img 
                            src={targetFile?.url ? fixUrl(targetFile.url) : ''} 
                            alt={targetFile?.name || 'Preview'} 
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                        />
                    ) : ['heic', 'heif'].includes(targetFile?.format?.toLowerCase()) ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3, width: '100%', height: '100%', background: 'linear-gradient(135deg, #E3F2FD 0%, #E8EAF6 100%)' }}>
                            <ImageIcon sx={{ fontSize: 64, color: '#3f51b5', mb: 1, opacity: 0.8 }} />
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#3f51b5', bgcolor: 'rgba(63, 81, 181, 0.1)', px: 2, py: 0.5, borderRadius: 2 }}>
                                HEIC Photo (Apple Format)
                            </Typography>
                        </Box>
                    ) : (
                        <InsertDriveFileIcon sx={{ fontSize: 64, color: 'text.disabled', opacity: 0.5 }} />
                    )}
                </Box>

                {/* Details */}
                <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
                    <Typography variant="body1" fontWeight={800} sx={{ mb: 3, wordBreak: 'break-all' }}>
                        {targetFile?.name || targetFile?.title || 'Unnamed File'}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.disabled" fontWeight={700}>SIZE</Typography>
                            <Typography variant="body2" fontWeight={700}>{formatSizeFn(targetFile?.size)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.disabled" fontWeight={700}>FORMAT</Typography>
                            <Typography variant="body2" fontWeight={700}>{(targetFile?.format || targetFile?.mimetype || 'FILE').toUpperCase()}</Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Stack spacing={2}>
                        <Button
                            variant="outlined"
                            startIcon={<ContentCopyIcon />}
                            onClick={() => {
                                if (targetFile?.url) {
                                    navigator.clipboard.writeText(fixUrl(targetFile.url));
                                    toast.success('Asset URL copied to clipboard!');
                                }
                            }}
                        >
                            Copy URL Link
                        </Button>

                        {props.onDelete && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => props.onDelete(targetFile.name)}
                            >
                                Delete Asset
                            </Button>
                        )}
                    </Stack>
                </Box>
            </Box>
        </Drawer>
    );
};

export default MediaPreviewModal;
