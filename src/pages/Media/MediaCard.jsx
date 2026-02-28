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
import { format } from 'date-fns';
import VideoPreview from '../../components/Common/VideoPreview';

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

const MediaCard = ({
    file,
    isSelected,
    onToggleSelection,
    onDelete,
    onCopy
}) => {
    const theme = useTheme();

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${theme.palette.divider}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
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

                {file.type === 'image' ? (
                    <CardMedia
                        component="img"
                        image={file.url}
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
                ) : file.type === 'video' ? (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                        <VideoPreview url={file.url} height="100%" />
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
                    <Tooltip title="Copy Public Link">
                        <IconButton
                            size="small"
                            onClick={() => onCopy(file.url)}
                            sx={{ bgcolor: 'action.hover', '&:hover': { bgcolor: 'primary.light', color: 'primary.main' } }}
                        >
                            <ContentCopyIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Download File">
                        <IconButton
                            size="small"
                            component="a"
                            href={file.url}
                            download
                            sx={{ bgcolor: 'action.hover', '&:hover': { bgcolor: 'success.light', color: 'success.main' } }}
                        >
                            <DownloadIcon fontSize="inherit" />
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
