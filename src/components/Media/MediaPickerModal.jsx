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
    IconButton,
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
import api from '../../utils/api';
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
            if (response.data.success) {
                // Filter by type if provided
                let filteredFiles = response.data.files;
                if (type) {
                    if (type === 'video') filteredFiles = filteredFiles.filter(f => f.type === 'video');
                    else if (type === 'image') filteredFiles = filteredFiles.filter(f => f.type === 'image');
                    else if (type === 'pdf') filteredFiles = filteredFiles.filter(f => f.format === 'pdf');
                    else if (type === 'audio') filteredFiles = filteredFiles.filter(f => f.type === 'audio');
                }
                setFiles(filteredFiles);
            }
        } catch (error) {
            console.error('Fetch Files Error:', error);
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
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Select from Media Library
                <TextField
                    size="small"
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 2 }
                    }}
                />
            </DialogTitle>
            <DialogContent dividers sx={{ bgcolor: 'action.hover', p: 0 }}>
                <Grid container sx={{ height: 500 }}>
                    {/* Left Column: File List */}
                    <Grid item xs={12} md={selectedFile ? 8 : 12} sx={{
                        p: 2,
                        height: '100%',
                        overflowY: 'auto',
                        borderRight: selectedFile ? '1px solid' : 'none',
                        borderColor: 'divider',
                        transition: 'all 0.3s ease'
                    }}>
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
                                <Typography color="text.secondary">No files found</Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={2}>
                                {filteredFiles.map((file) => (
                                    <Grid item xs={12} sm={4} md={selectedFile ? 4 : 3} key={file.name}>
                                        <Card
                                            onClick={() => setSelectedFile(file)}
                                            sx={{
                                                cursor: 'pointer',
                                                height: '100%',
                                                position: 'relative',
                                                borderRadius: 2,
                                                border: '2px solid',
                                                borderColor: selectedFile?.name === file.name ? 'primary.main' : 'transparent',
                                                transition: 'all 0.2s',
                                                '&:hover': { transform: 'scale(1.02)' }
                                            }}
                                        >
                                            <Box sx={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
                                                {file.type === 'image' ? (
                                                    <CardMedia component="img" image={file.url} sx={{ height: '100%', objectFit: 'cover' }} />
                                                ) : getFileIcon(file)}
                                            </Box>
                                            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                                <Typography variant="caption" noWrap display="block" fontWeight={600}>
                                                    {file.name}
                                                </Typography>
                                            </CardContent>
                                            {selectedFile?.name === file.name && (
                                                <CheckCircleIcon
                                                    color="primary"
                                                    sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'white', borderRadius: '50%' }}
                                                />
                                            )}
                                        </Card>
                                    </Grid>
                                ))}
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
                            animation: 'fadeIn 0.3s'
                        }}>
                            <Typography variant="subtitle2" fontWeight={800} gutterBottom color="primary">
                                PREVIEW
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{
                                    width: '100%',
                                    height: 200,
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    bgcolor: 'black',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: theme.shadows[4]
                                }}>
                                    {selectedFile.type === 'image' ? (
                                        <img
                                            src={selectedFile.url}
                                            alt="Preview"
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        />
                                    ) : selectedFile.type === 'video' ? (
                                        <VideoPreview url={selectedFile.url} height={200} />
                                    ) : (
                                        <Box sx={{ textAlign: 'center' }}>
                                            {getFileIcon(selectedFile)}
                                            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                                                No visual preview
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="body2" fontWeight={700} noWrap>
                                        {selectedFile.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Type: {selectedFile.type.toUpperCase()}
                                    </Typography>
                                    {selectedFile.size && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} sx={{ borderRadius: 1.5 }}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSelect}
                    disabled={!selectedFile}
                    sx={{ borderRadius: 1.5, px: 4, fontWeight: 700 }}
                >
                    Select File
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MediaPickerModal;
