import {
    Box,
    Typography,
    Button,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    IconButton,
    Tooltip,
    Checkbox,
    Chip,
    Divider,
    CircularProgress,
    useTheme
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import ArchiveIcon from '@mui/icons-material/Archive';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';
import VideoPreview from '../../components/Common/VideoPreview';
import { fixUrl } from '../../utils/api';
import { useEffect } from 'react';

const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (file) => {
    if (file.type === 'video') return <VideoLibraryIcon color="primary" />;
    if (file.type === 'image') return <ImageIcon color="secondary" />;
    if (file.format === 'pdf') return <PictureAsPdfIcon sx={{ color: '#f44336' }} />;
    if (file.type === 'audio') return <AudioFileIcon color="info" />;
    if (['zip', 'rar', '7z'].includes(file.format)) return <ArchiveIcon sx={{ color: '#ff9800' }} />;
    return <InsertDriveFileIcon color="action" />;
};

const getVideoThumbnail = (file) => {
    if (!file || !file.url) return '';
    if (file.thumbnailUrl) return fixUrl(file.thumbnailUrl);
    const videoId = file.url.match(/\/api\/media\/stream\/(video_[^\/]+)\//)?.[1];
    if (videoId) {
        return fixUrl(`/api/media/stream/${videoId}/thumbnail.jpg`);
    }
    return '';
};

const MediaCard = ({
    file,
    isSelected,
    onToggleSelection,
    onDelete,
    onCopy,
    onSelect,
    onPreview
}) => {
    const theme = useTheme();

    useEffect(() => {
        if (file && ['failed', 'upload_failed'].includes(file.status)) {
            
        }
    }, [file.status, file.failureReason, file.name]);

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 1, // Reduced rounding
                overflow: 'hidden',
                border: `1px solid ${theme.palette.divider}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                    borderColor: 'primary.main'
                }
            }}
        >
            <Box sx={{ position: 'relative', pt: '65%', bgcolor: 'background.default', overflow: 'hidden' }}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        zIndex: 10
                    }}
                >
                    <Checkbox
                        checked={isSelected}
                        onChange={() => onToggleSelection(file.name)}
                        sx={{
                            p: 0,
                            color: 'white',
                            '&.Mui-checked': { color: theme.palette.primary.main },
                            '& .MuiSvgIcon-root': {
                                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))',
                                fontSize: '1.8rem'
                            }
                        }}
                        icon={<CheckBoxOutlineBlankIcon />}
                        checkedIcon={<CheckBoxIcon />}
                    />
                </Box>

                {(file.type === 'image' && !['heic', 'heif'].includes(file.format?.toLowerCase())) ? (
                    <CardMedia
                        component="img"
                        image={`${fixUrl(file.url)}${fixUrl(file.url).includes('?') ? '&' : '?'}token=${localStorage.getItem('token')}`}
                        alt={file.name}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            width: '100%',
                            objectFit: 'cover'
                        }}
                    />
                ) : ['heic', 'heif'].includes(file.format?.toLowerCase()) ? (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #E3F2FD 0%, #E8EAF6 100%)',
                        }}
                    >
                        <ImageIcon sx={{ fontSize: '3rem', color: '#3f51b5', mb: 1, opacity: 0.8 }} />
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#3f51b5', bgcolor: 'rgba(63, 81, 181, 0.1)', px: 1.5, py: 0.5, borderRadius: 2 }}>
                            HEIC PHOTO
                        </Typography>
                    </Box>
                ) : (file.type === 'video' && (!file.status || file.status === 'ready')) ? (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', bgcolor: '#000' }}>
                        {getVideoThumbnail(file) ? (
                            <CardMedia
                                component="img"
                                image={`${getVideoThumbnail(file)}${getVideoThumbnail(file).includes('?') ? '&' : '?'}token=${localStorage.getItem('token')}`}
                                alt={file.name}
                                sx={{
                                    height: '100%',
                                    width: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <VideoLibraryIcon color="primary" sx={{ fontSize: '3rem', opacity: 0.6 }} />
                            </Box>
                        )}
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(0,0,0,0.15)',
                                transition: 'background-color 0.2s',
                                '&:hover': {
                                    bgcolor: 'rgba(0,0,0,0.3)',
                                    '& .play-icon': { transform: 'scale(1.15)' }
                                }
                            }}
                        >
                            <Box
                                className="play-icon"
                                sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                    transition: 'transform 0.2s'
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'rgba(0,0,0,0.02)'
                        }}
                    >
                        <Box sx={{ transform: 'scale(2.5)', opacity: 0.3 }}>
                            {getFileIcon(file)}
                        </Box>
                    </Box>
                )}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        display: 'flex',
                        gap: 0.5
                    }}
                >
                    <Chip
                        label={file.format.toUpperCase()}
                        size="small"
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.9)',
                            color: 'text.primary',
                            fontWeight: 800,
                            fontSize: '0.65rem',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}
                    />
                </Box>
                {['queued', 'processing', 'uploading', 'upload_failed', 'failed'].includes(file.status) && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            bgcolor: ['upload_failed', 'failed'].includes(file.status) ? 'rgba(211, 47, 47, 0.8)' : 'rgba(0,0,0,0.6)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 20,
                            backdropFilter: 'blur(4px)',
                            px: 1
                        }}
                    >
                        {!['upload_failed', 'failed'].includes(file.status) && <CircularProgress size={32} sx={{ mb: 1, color: 'white' }} />}
                        <Tooltip title={file.failureReason || 'Unknown failure reason'} arrow>
                            <Typography variant="caption" sx={{ color: 'white', fontWeight: 800, textAlign: 'center', cursor: 'help', textDecoration: 'underline dotted' }}>
                                {file.status === 'queued' ? 'QUEUED...' : 
                                 file.status === 'processing' ? `PROCESSING (${file.processingProgress || 0}%)` : 
                                 file.status === 'uploading' ? `UPLOADING (${file.totalChunks ? Math.round((file.uploadedChunks / file.totalChunks) * 100) : 0}%)` : 
                                 'UPLOAD FAILED'}
                            </Typography>
                        </Tooltip>
                        {(file.status === 'uploading' || file.status === 'upload_failed') && !!file.totalChunks && (
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.6rem', mt: 0.5 }}>
                                {file.uploadedChunks} / {file.totalChunks} chunks
                            </Typography>
                        )}
                    </Box>
                )}
            </Box>
            <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                <Typography
                    variant="body2"
                    noWrap
                    fontWeight={700}
                    title={file.name}
                    sx={{ mb: 1, color: 'text.primary' }}
                >
                    {file.name}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box component="span" sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                        {formatSize(file.size)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        {format(new Date(file.createdAt), 'dd MMM')}
                    </Typography>
                </Box>
            </CardContent>
            <Divider sx={{ opacity: 0.5 }} />
            <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1.5, bgcolor: 'background.paper' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {onSelect && (
                        <Button 
                            variant="contained" 
                            size="small" 
                            onClick={() => onSelect(file)}
                            sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 700 }}
                        >
                            Select
                        </Button>
                    )}
                    <Tooltip title="Copy Public Link">
                        <IconButton
                            size="small"
                            onClick={() => onCopy(fixUrl(file.url))}
                            sx={{ bgcolor: 'action.hover', '&:hover': { bgcolor: 'primary.light', color: 'primary.main' } }}
                        >
                            <ContentCopyIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Download">
                        <IconButton
                            size="small"
                            component="a"
                            href={fixUrl(file.url)}
                            download
                            sx={{ bgcolor: 'action.hover', '&:hover': { bgcolor: 'success.light', color: 'success.main' } }}
                        >
                            <DownloadIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Quick View">
                        <IconButton
                            size="small"
                            onClick={() => onPreview(file)}
                            sx={{ bgcolor: 'action.hover', '&:hover': { bgcolor: 'info.light', color: 'info.main' } }}
                        >
                            <VisibilityIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Tooltip title="Delete Permanently">
                    <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(file)}
                        sx={{ bgcolor: 'error.light', color: 'error.main', '&:hover': { bgcolor: 'error.main', color: 'white' } }}
                    >
                        <DeleteIcon fontSize="inherit" />
                    </IconButton>
                </Tooltip>
            </CardActions>
        </Card>
    );
};

export default MediaCard;
