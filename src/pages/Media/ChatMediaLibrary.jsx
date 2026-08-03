import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Typography, IconButton, Stack, Avatar, Checkbox, Card, CardContent
} from '@mui/material';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import ChatIcon from '@mui/icons-material/Chat';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import DeleteIcon from '@mui/icons-material/Delete';
import GetAppIcon from '@mui/icons-material/GetApp';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const ChatMediaLibrary = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mediaLoading, setMediaLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMedia, setSelectedMedia] = useState([]);

    const fetchMediaUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/chat/media-users');
            if (res.data?.success) {
                setUsers(res.data.data || []);
            }
        } catch (error) {
            console.error('Failed to load chat users:', error);
            toast.error('Failed to load chat media users');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMediaUsers();
    }, [fetchMediaUsers]);

    const fetchUserMedia = async (user) => {
        setSelectedUser(user);
        setSelectedMedia([]);
        setMediaLoading(true);
        try {
            const res = await api.get(`/chat/media-user/${user._id || user.id}`);
            if (res.data?.success) {
                setMedia(res.data.data || []);
            }
        } catch (error) {
            toast.error('Failed to load user chat media');
        } finally {
            setMediaLoading(false);
        }
    };

    const toggleMediaSelection = (id) => {
        setSelectedMedia(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (!selectedMedia.length || !window.confirm(`Delete ${selectedMedia.length} chat media items?`)) return;
        try {
            const res = await api.post('/chat/media/bulk-delete', { messageIds: selectedMedia });
            if (res.data?.success) {
                toast.success('Media items deleted');
                setMedia(prev => prev.filter(m => !selectedMedia.includes(m._id)));
                setSelectedMedia([]);
                fetchMediaUsers();
            }
        } catch (error) {
            toast.error('Failed to delete media');
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const name = (u.name || '').toLowerCase();
            const email = (u.email || '').toLowerCase();
            const term = searchTerm.toLowerCase().trim();
            return name.includes(term) || email.includes(term);
        });
    }, [users, searchTerm]);

    const metricsItems = useMemo(() => [
        { title: 'Chat Users', value: users.length, icon: <ChatIcon />, color: 'primary' },
        { title: 'Media Messages', value: media.length, icon: <PermMediaIcon />, color: 'info' }
    ], [users, media]);

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--color-vc-canvas)', minHeight: '100vh' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--color-vc-ink)', letterSpacing: -0.5 }}>
                    Chat Media & Attachment Library
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                    Review, download, and manage media attachments shared across 1-on-1 student chat threads
                </Typography>
            </Box>

            <GenericMetrics items={metricsItems} />

            <GenericTableHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchPlaceholder="Search chat participant name or email..."
                totalCount={filteredUsers.length}
                actionButtonText={selectedMedia.length > 0 ? `Delete Selected (${selectedMedia.length})` : undefined}
                actionButtonIcon={<DeleteIcon fontSize="small" />}
                onActionClick={handleBulkDelete}
            />

            <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                {/* User List Sidebar */}
                <Box sx={{ width: 280, minWidth: 280, borderRadius: '16px', bgcolor: 'var(--color-vc-canvas-soft)', border: '1px solid var(--color-vc-hairline)', p: 2 }}>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>
                        CHAT PARTICIPANTS
                    </Typography>
                    {filteredUsers.map(u => {
                        const isSel = selectedUser?._id === u._id;
                        return (
                            <Stack
                                key={u._id}
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                                onClick={() => fetchUserMedia(u)}
                                sx={{
                                    p: 1.2,
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    mb: 0.5,
                                    bgcolor: isSel ? 'var(--color-vc-primary-light, rgba(99,102,241,0.1))' : 'transparent',
                                    border: isSel ? '1px solid var(--color-vc-primary)' : '1px solid transparent',
                                    '&:hover': { bgcolor: 'var(--color-vc-canvas)' }
                                }}
                            >
                                <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: 'primary.main' }}>
                                    {(u.name || 'U').charAt(0).toUpperCase()}
                                </Avatar>
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography variant="body2" fontWeight={700} noWrap sx={{ color: 'var(--color-vc-ink)' }}>{u.name}</Typography>
                                    <Typography variant="caption" noWrap sx={{ color: 'var(--color-vc-mute)' }}>{u.email}</Typography>
                                </Box>
                            </Stack>
                        );
                    })}
                </Box>

                {/* Media Attachment Grid */}
                <Box sx={{ flexGrow: 1 }}>
                    {!selectedUser ? (
                        <Typography variant="body2" color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>
                            Select a chat participant to view shared media attachments
                        </Typography>
                    ) : mediaLoading ? (
                        <Typography variant="body2" color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>
                            Loading attachments...
                        </Typography>
                    ) : media.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>
                            No media attachments shared by this user.
                        </Typography>
                    ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                            {media.map(item => {
                                const isSel = selectedMedia.includes(item._id);
                                return (
                                    <Card
                                        key={item._id}
                                        sx={{
                                            borderRadius: '12px',
                                            bgcolor: 'var(--color-vc-canvas-soft)',
                                            border: '1px solid var(--color-vc-hairline)',
                                            p: 1.5,
                                            position: 'relative'
                                        }}
                                    >
                                        <Checkbox
                                            checked={isSel}
                                            onChange={() => toggleMediaSelection(item._id)}
                                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                                            sx={{ position: 'absolute', top: 4, left: 4, zIndex: 5, color: 'white' }}
                                        />
                                        <Box sx={{ height: 120, borderRadius: '8px', overflow: 'hidden', bgcolor: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                            {item.fileUrl?.match(/\.(jpg|png|webp|gif)$/i) ? (
                                                <Box component="img" src={item.fileUrl} alt="Attachment" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <PermMediaIcon color="primary" />
                                            )}
                                        </Box>
                                        <Typography variant="caption" fontWeight={700} noWrap sx={{ color: 'var(--color-vc-ink)', display: 'block' }}>
                                            {item.fileName || 'Attachment'}
                                        </Typography>
                                    </Card>
                                );
                            })}
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default ChatMediaLibrary;
