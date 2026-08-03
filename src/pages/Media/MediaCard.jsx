import { useEffect } from 'react';
import {
    Box,
    Typography,
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
    LinearProgress
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { format } from 'date-fns';
import { fixUrl } from '../../utils/api';

const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (file) => {
    if (file.type === 'video') return <VideoLibraryIcon color="primary" />;
    if (file.type === 'image') return <ImageIcon color="secondary" />;
    if (file.format === 'pdf') return <PictureAsPdfIcon sx={{ color: '#ef4444' }} />;
    if (file.type === 'audio') return <AudioFileIcon color="info" />;
    if (['zip', 'rar', '7z'].includes(file.format)) return <ArchiveIcon sx={{ color: '#f59e0b' }} />;
    return <InsertDriveFileIcon color="action" />;
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
    useEffect(() => {
        if (file && ['failed', 'upload_failed'].includes(file.status)) {
            console.error(`❌ Media file "${file.name}" failed:`, file.failureReason || 'Unknown error');
        }
    }, [file.status, file.failureReason, file.name]);

    const isImage = file.mimetype?.startsWith('image') || file.type === 'image' || file.name?.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i);
    const isVideo = file.type === 'video' || file.format === 'm3u8' || file.name?.match(/\.(mp4|mkv|mov|avi)$/i);
    const isProcessing = ['processing', 'uploading', 'queued'].includes(file.status);

    const fileUrl = fixUrl(file.url || file.fileUrl || `/uploads/${file.name}`);
    const thumbnailUrl = file.thumbnailUrl ? fixUrl(file.thumbnailUrl) : (isImage ? fileUrl : null);
    const progressPct = file.processingProgress || 0;

    // When a form/modal is picking a file (onSelect provided), clicking the card should
    // just select it for that field — not toggle the bulk-delete checkbox, which is what
    // was happening before (onSelect was passed all the way down here but never called).
    const isPickerMode = Boolean(onSelect);

    return (
        <Card
            onClick={isPickerMode ? () => onSelect(file) : undefined}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                overflow: 'hidden',
                bgcolor: 'var(--color-vc-canvas-soft)',
                border: '1px solid var(--color-vc-hairline)',
                position: 'relative',
                cursor: isPickerMode ? 'pointer' : 'default',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px -10px rgba(0,0,0,0.15)',
                    borderColor: 'var(--color-vc-primary)'
                }
            }}
        >
            <Box sx={{ position: 'relative', pt: '65%', bgcolor: 'rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                {/* Selection Checkbox — bulk-delete only, so hidden in picker mode */}
                {!isPickerMode && (
                    <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}>
                        <Checkbox
                            checked={isSelected}
                            onChange={onToggleSelection}
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                                p: 0,
                                color: 'white',
                                '&.Mui-checked': { color: 'var(--color-vc-primary)' },
                                '& .MuiSvgIcon-root': {
                                    filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))',
                                    fontSize: '1.6rem'
                                }
                            }}
                            icon={<CheckBoxOutlineBlankIcon />}
                            checkedIcon={<CheckBoxIcon />}
                        />
                    </Box>
                )}

                {/* HLS Processing Overlay */}
                {isProcessing && (
                    <Box sx={{
                        position: 'absolute',
                        inset: 0,
                        bgcolor: 'rgba(15, 23, 42, 0.85)',
                        zIndex: 15,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 2,
                        textAlign: 'center',
                        backdropFilter: 'blur(6px)'
                    }}>
                        <CircularProgress size={32} sx={{ color: '#38bdf8', mb: 1.5 }} />
                        <Typography variant="caption" fontWeight={900} sx={{ color: '#f8fafc', letterSpacing: 0.5, mb: 1 }}>
                            {file.status === 'uploading'
                                ? 'UPLOADING...'
                                : `CONVERTING HLS CHUNKS ${progressPct > 0 ? `${progressPct}%` : ''} ⚙️`}
                        </Typography>
                        {progressPct > 0 && (
                            <Box sx={{ width: '80%' }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={progressPct}
                                    sx={{
                                        height: 6,
                                        borderRadius: '4px',
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        '& .MuiLinearProgress-bar': { bgcolor: '#38bdf8' }
                                    }}
                                />
                            </Box>
                        )}
                    </Box>
                )}

                {thumbnailUrl && !isProcessing ? (
                    <Box sx={{ position: 'absolute', inset: 0 }}>
                        <CardMedia
                            component="img"
                            image={thumbnailUrl}
                            alt={file.name}
                            sx={{
                                height: '100%',
                                width: '100%',
                                objectFit: 'cover'
                            }}
                        />
                        {isVideo && (
                            <Box sx={{
                                position: 'absolute',
                                inset: 0,
                                bgcolor: 'rgba(0,0,0,0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <PlayCircleOutlineIcon sx={{ fontSize: '3rem', color: 'rgba(255,255,255,0.9)', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }} />
                            </Box>
                        )}
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
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1
                        }}
                    >
                        {getFileIcon(file)}
                        <Chip
                            label={(file.format || file.type || 'FILE').toUpperCase()}
                            size="small"
                            sx={{ fontWeight: 800, fontSize: '0.65rem', borderRadius: '6px' }}
                        />
                    </Box>
                )}
            </Box>

            <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Typography variant="body2" fontWeight={700} noWrap sx={{ color: 'var(--color-vc-ink)' }} title={file.title || file.name}>
                    {file.title || file.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)', mt: 0.5 }}>
                    {formatSize(file.size)} • {file.createdAt ? format(new Date(file.createdAt), 'MMM dd, yyyy') : 'Recent'}
                </Typography>
            </CardContent>

            <Divider sx={{ borderColor: 'var(--color-vc-hairline)' }} />

            <CardActions sx={{ px: 1.5, py: 1, justifyContent: 'space-between' }}>
                <Tooltip title={isProcessing ? "Processing HLS..." : "Preview Details"}>
                    <span>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onPreview(e); }} disabled={isProcessing} sx={{ color: 'var(--color-vc-link)' }}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title="Copy Link">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onCopy(e); }} sx={{ color: 'var(--color-vc-mute)' }}>
                        <ContentCopyIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                {!isPickerMode && (
                    <Tooltip title="Delete">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(e); }} sx={{ color: 'var(--color-vc-error)' }}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </CardActions>
        </Card>
    );
};

export default MediaCard;
