import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    TextField,
    InputAdornment,
    Skeleton,
    Chip,
    useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api, { fixUrl } from '../../utils/api';
import VideoPreview from '../Common/VideoPreview';
import Divider from '@mui/material/Divider';

const MediaPickerModal = ({ open, onClose, onSelect, type }) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const response = await api.get('/upload');
            if (response.data && response.data.success) {
                const rawFiles = response.data.data || response.data.files || (Array.isArray(response.data) ? response.data : []);
                let filteredFiles = Array.isArray(rawFiles) ? rawFiles : [];

                if (type) {
                    if (type === 'video') filteredFiles = filteredFiles.filter(f => f.type === 'video' || f.name?.match(/\.(mp4|mkv|mov|avi)$/i));
                    else if (type === 'image') filteredFiles = filteredFiles.filter(f => f.type === 'image' || f.name?.match(/\.(jpg|jpeg|png|webp|gif)$/i));
                    else if (type === 'pdf') filteredFiles = filteredFiles.filter(f => f.format === 'pdf' || f.name?.endsWith('.pdf'));
                    else if (type === 'audio') filteredFiles = filteredFiles.filter(f => f.type === 'audio' || f.name?.match(/\.(mp3|wav)$/i));
                }
                setFiles(filteredFiles);
            }
        } catch (error) {
            console.error('Failed to fetch picker files:', error);
            setFiles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchFiles();
            setSelectedFile(null);
        }
    }, [open]);

    const filteredFiles = files.filter(file =>
        (file.title || file.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getFileIcon = (file) => {
        if (file.type === 'video') return <VideoLibraryIcon color="primary" sx={{ fontSize: 40 }} />;
        if (file.type === 'image') return <ImageIcon color="secondary" sx={{ fontSize: 40 }} />;
        if (file.format === 'pdf') return <PictureAsPdfIcon sx={{ color: '#f44336', fontSize: 40 }} />;
        if (file.type === 'audio') return <AudioFileIcon color="info" sx={{ fontSize: 40 }} />;
        return <InsertDriveFileIcon color="action" sx={{ fontSize: 40 }} />;
    };

    const handleSelect = () => {
        if (selectedFile) {
            onSelect(selectedFile);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Select from Media Library
                <Chip label={`${filteredFiles.length} Available`} color="primary" size="small" variant="outlined" />
            </DialogTitle>
            <Divider />

            <DialogContent sx={{ p: 0, minHeight: '60vh', display: 'flex', flexDirection: 'column' }}>
                {/* Search Bar */}
                <Box sx={{ p: 2, bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search media files..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                {/* Main Content Area */}
                <Grid container sx={{ flexGrow: 1, minHeight: 0 }}>
                    {/* Left Column: Media Grid */}
                    <Grid item xs={12} md={selectedFile ? 8 : 12} sx={{ p: 2, borderRight: selectedFile ? '1px solid' : 'none', borderColor: 'divider', overflowY: 'auto', maxHeight: '55vh' }}>
                        {loading ? (
                            <Grid container spacing={2}>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                    <Grid item xs={12} sm={4} md={3} key={n}>
                                        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : filteredFiles.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <InsertDriveFileIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                <Typography color="text.secondary" fontWeight={600}>No files found</Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={2}>
                                {filteredFiles.map((file) => {
                                    const thumbUrl = file.thumbnailUrl ? fixUrl(file.thumbnailUrl) : (file.type === 'image' ? fixUrl(file.url || file.fileUrl) : null);
                                    const isSelected = selectedFile && (
                                        (file._id && selectedFile._id === file._id) || 
                                        (file.id && selectedFile.id === file.id) || 
                                        (file.name && selectedFile.name === file.name)
                                    );
                                    
                                    return (
                                        <Grid item xs={12} sm={4} md={selectedFile ? 4 : 3} key={file._id || file.id || file.name}>
                                            <Card
                                                onClick={() => setSelectedFile(file)}
                                                sx={{
                                                    cursor: 'pointer',
                                                    height: '100%',
                                                    position: 'relative',
                                                    borderRadius: '12px',
                                                    border: '2px solid',
                                                    borderColor: isSelected ? 'var(--color-vc-primary)' : 'var(--color-vc-hairline)',
                                                    transition: 'all 0.2s',
                                                    boxShadow: isSelected ? '0 4px 12px rgba(56, 189, 248, 0.2)' : 'none',
                                                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }
                                                }}
                                            >
                                                <Box sx={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'var(--color-vc-canvas-soft)', overflow: 'hidden', position: 'relative' }}>
                                                    {thumbUrl ? (
                                                        <CardMedia component="img" image={thumbUrl} sx={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                                                    ) : getFileIcon(file)}

                                                    {/* Selection Overlay */}
                                                    {isSelected && (
                                                        <Box sx={{
                                                            position: 'absolute',
                                                            top: 0, left: 0, right: 0, bottom: 0,
                                                            bgcolor: 'rgba(56, 189, 248, 0.15)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            backdropFilter: 'blur(1px)'
                                                        }}>
                                                            <CheckCircleIcon color="primary" sx={{ fontSize: 40, bgcolor: 'white', borderRadius: '50%' }} />
                                                        </Box>
                                                    )}
                                                </Box>
                                                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                                    <Typography variant="caption" noWrap display="block" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                                                        {file.title || file.name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)', fontSize: '0.65rem' }}>
                                                        {file.format ? file.format.toUpperCase() : 'FILE'}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        )}
                    </Grid>

                    {/* Right Column: Preview Panel */}
                    {selectedFile && (
                        <Grid item xs={12} md={4} sx={{
                            p: 3,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            bgcolor: 'background.paper',
                            maxHeight: '55vh',
                            overflowY: 'auto'
                        }}>
                            <Typography variant="subtitle2" fontWeight={800} gutterBottom color="primary">
                                Selected File Details
                            </Typography>

                            <Box sx={{ my: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', borderRadius: 2, p: 2 }}>
                                {selectedFile.type === 'image' ? (
                                    <Box component="img" src={fixUrl(selectedFile.url)} sx={{ maxWidth: '100%', maxHeight: 180, borderRadius: 1, objectFit: 'contain' }} />
                                ) : selectedFile.type === 'video' ? (
                                    <Box sx={{ width: '100%' }}>
                                        <VideoPreview url={selectedFile.url} height={160} />
                                    </Box>
                                ) : (
                                    getFileIcon(selectedFile)
                                )}
                            </Box>

                            <Typography variant="subtitle2" noWrap title={selectedFile.title || selectedFile.name} sx={{ fontWeight: 700 }}>
                                {selectedFile.title || selectedFile.name}
                            </Typography>

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Format: {(selectedFile.format || selectedFile.type || 'N/A').toUpperCase()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Size: {selectedFile.size ? `${(Number(selectedFile.size) / (1024 * 1024)).toFixed(2)} MB` : 'N/A'}
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>

            <Divider />
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} color="inherit" sx={{ fontWeight: 700 }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSelect}
                    variant="contained"
                    disabled={!selectedFile}
                    sx={{ fontWeight: 700, px: 3, borderRadius: '8px' }}
                >
                    Select File
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MediaPickerModal;
