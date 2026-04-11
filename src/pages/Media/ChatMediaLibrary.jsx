import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Button,
    Paper,
    Avatar,
    Checkbox,
    IconButton,
    InputAdornment,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
    Tooltip,
    Divider,
    Card,
    CardActionArea,
    CardContent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import GetAppIcon from '@mui/icons-material/GetApp';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const ChatMediaLibrary = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mediaLoading, setMediaLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMedia, setSelectedMedia] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        fetchMediaUsers();
    }, []);

    const fetchMediaUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/chat/media-users');
            if (res.data.success) {
                setUsers(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load chat users');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserMedia = async (userId) => {
        try {
            setMediaLoading(true);
            setSelectedMedia([]);
            const res = await api.get(`/chat/media-user/${userId}`);
            if (res.data.success) {
                setMedia(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load user media');
        } finally {
            setMediaLoading(false);
        }
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
        fetchUserMedia(user._id);
    };

    const toggleMediaSelection = (id) => {
        setSelectedMedia(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        try {
            const res = await api.post('/chat/media/bulk-delete', { messageIds: selectedMedia });
            if (res.data.success) {
                toast.success(res.data.message);
                setMedia(media.filter(m => !selectedMedia.includes(m._id)));
                setSelectedMedia([]);
                setDeleteDialogOpen(false);
                fetchMediaUsers(); // Refresh counts
            }
        } catch (error) {
            toast.error('Failed to delete media');
        }
    };

    const handleExportZip = async () => {
        if (!selectedUser) return;
        toast.info('Preparing ZIP file...');
        window.open(`${api.defaults.baseURL}/chat/media/export/${selectedUser._id}`, '_blank');
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ display: 'flex', height: '100%', gap: 3 }}>
            {/* Left Sidebar: Users List */}
            <Box sx={{ width: 320, borderRight: 1, borderColor: 'divider', overflowY: 'auto', pr: 2 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                />
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={30} /></Box>
                ) : (
                    <Grid container spacing={1}>
                        {filteredUsers.map((u) => (
                            <Grid item xs={12} key={u._id}>
                                <Card 
                                    elevation={selectedUser?._id === u._id ? 3 : 0}
                                    sx={{ 
                                        borderRadius: 2, 
                                        border: 1, 
                                        borderColor: selectedUser?._id === u._id ? 'primary.main' : 'divider',
                                        bgcolor: selectedUser?._id === u._id ? 'primary.50' : 'background.paper'
                                    }}
                                >
                                    <CardActionArea onClick={() => handleUserClick(u)}>
                                        <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar src={u.avatar} sx={{ width: 40, height: 40 }}>
                                                <PersonIcon />
                                            </Avatar>
                                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                                <Typography variant="body2" fontWeight={700} noWrap>
                                                    {u.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" noWrap display="block">
                                                    {u.mediaCount} files
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* Right Side: Media Grid */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {!selectedUser ? (
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                        <Typography variant="h6">Select a user to view chat media</Typography>
                    </Box>
                ) : (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box>
                                <Typography variant="h5" fontWeight={800}>{selectedUser.name}'s Chat Media</Typography>
                                <Typography variant="body2" color="text.secondary">{media.length} items found</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button 
                                    variant="outlined" 
                                    startIcon={<FolderZipIcon />}
                                    onClick={handleExportZip}
                                    disabled={media.length === 0}
                                >
                                    Export ZIP
                                </Button>
                                {selectedMedia.length > 0 && (
                                    <Button 
                                        variant="contained" 
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => setDeleteDialogOpen(true)}
                                    >
                                        Delete ({selectedMedia.length})
                                    </Button>
                                )}
                            </Box>
                        </Box>

                        {mediaLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
                        ) : (
                            <Grid container spacing={2}>
                                {media.map((item) => (
                                    <Grid item xs={6} sm={4} md={3} lg={2} key={item._id}>
                                        <Box 
                                            sx={{ 
                                                position: 'relative', 
                                                pt: '100%', 
                                                borderRadius: 2, 
                                                overflow: 'hidden',
                                                border: 1,
                                                borderColor: selectedMedia.includes(item._id) ? 'primary.main' : 'divider',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => toggleMediaSelection(item._id)}
                                        >
                                            <Box 
                                                component="img"
                                                src={`${api.defaults.baseURL.replace('/api','')}${item.image}`}
                                                sx={{ 
                                                    position: 'absolute', 
                                                    top: 0, left: 0, width: '100%', height: '100%', 
                                                    objectFit: 'cover' 
                                                }}
                                            />
                                            <Checkbox 
                                                checked={selectedMedia.includes(item._id)}
                                                sx={{ position: 'absolute', top: 5, left: 5, color: 'white', '&.Mui-checked': { color: 'primary.main' } }}
                                            />
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                )}
            </Box>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete {selectedMedia.length} media items? This will remove them from the chat permanently.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleBulkDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ChatMediaLibrary;
