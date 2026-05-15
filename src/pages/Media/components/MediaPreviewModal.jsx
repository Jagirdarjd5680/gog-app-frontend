import React from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Button,
    Divider,
    useTheme,
    alpha
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import VideoPreview from '../../../components/Common/VideoPreview';
import { fixUrl } from '../../../utils/api';
import toast from 'react-hot-toast';

const MediaPreviewModal = ({ previewFile, setPreviewFile, formatSize, onDelete }) => {
    const theme = useTheme();

    return (
        <Drawer
            anchor="right"
            open={!!previewFile}
            onClose={() => setPreviewFile(null)}
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
                    <IconButton onClick={() => setPreviewFile(null)} size="small">
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
                    {previewFile?.type === 'video' ? (
                        <VideoPreview url={previewFile.url} height="100%" />
                    ) : (previewFile?.type === 'image' || ['heic', 'heif'].includes(previewFile?.format?.toLowerCase())) ? (
                        <img 
                            src={previewFile?.url ? `${fixUrl(previewFile.url)}${fixUrl(previewFile.url).includes('?') ? '&' : '?'}token=${localStorage.getItem('token')}` : ''} 
                            alt={previewFile?.name} 
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                        />
                    ) : (
                        <InsertDriveFileIcon sx={{ fontSize: 64, color: 'text.disabled', opacity: 0.5 }} />
                    )}
                </Box>

                {/* Details */}
                <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
                    <Typography variant="body1" fontWeight={800} sx={{ mb: 3, wordBreak: 'break-all' }}>
                        {previewFile?.name}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.disabled" fontWeight={700}>SIZE</Typography>
                            <Typography variant="body2" fontWeight={700}>{formatSize(previewFile?.size)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.disabled" fontWeight={700}>FORMAT</Typography>
                            <Typography variant="body2" fontWeight={700}>{previewFile?.format?.toUpperCase()}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.disabled" fontWeight={700}>TYPE</Typography>
                            <Typography variant="body2" fontWeight={700}>{previewFile?.type?.toUpperCase()}</Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Button 
                            variant="outlined" 
                            fullWidth 
                            startIcon={<ContentCopyIcon />}
                            onClick={() => {
                                const url = `${fixUrl(previewFile.url)}${fixUrl(previewFile.url).includes('?') ? '&' : '?'}token=${localStorage.getItem('token')}`;
                                navigator.clipboard.writeText(url);
                                toast.success('Public link copied!');
                            }}
                            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                        >
                            Copy Link
                        </Button>
                        <Button 
                            variant="contained" 
                            fullWidth 
                            href={previewFile?.url ? `${fixUrl(previewFile.url)}${fixUrl(previewFile.url).includes('?') ? '&' : '?'}token=${localStorage.getItem('token')}` : '#'} 
                            target="_blank"
                            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                        >
                            Open in New Tab
                        </Button>
                        <Button 
                            variant="outlined" 
                            color="error" 
                            fullWidth 
                            startIcon={<DeleteIcon />}
                            onClick={() => onDelete(previewFile)}
                            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, mt: 2 }}
                        >
                            Delete File
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Drawer>
    );
};

export default MediaPreviewModal;
