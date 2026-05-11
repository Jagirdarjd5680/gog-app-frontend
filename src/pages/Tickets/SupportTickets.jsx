import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import socket from '../../utils/socket';
import { 
    Box, 
    Typography, 
    Paper, 
    Grid, 
    Avatar, 
    Button, 
    IconButton, 
    TextField, 
    Chip, 
    Divider, 
    List, 
    ListItem, 
    ListItemAvatar, 
    ListItemText, 
    ListItemButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    useTheme,
    Badge,
    Tooltip,
    CircularProgress,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    InputAdornment,
    Stack,
    Collapse
} from '@mui/material';
import { 
    SupportAgent as SupportIcon, 
    Add as PlusIcon, 
    Send as SendIcon, 
    AttachFile as FileIcon, 
    Search as SearchIcon,
    FilterList as FilterIcon,
    MoreVert as MoreIcon,
    Visibility as ViewIcon,
    Delete as DeleteIcon,
    CheckCircle as DoneIcon,
    Schedule as PendingIcon,
    KeyboardArrowDown as DownIcon,
    KeyboardArrowUp as UpIcon,
    Download as DownloadIcon,
    FormatBold as BoldIcon,
    FormatItalic as ItalicIcon,
    FormatUnderlined as UnderlineIcon,
    FormatListBulleted as ListIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

const SupportTickets = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const { ticketId } = useParams();
    const navigate = useNavigate();
    
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [message, setMessage] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'chat'
    const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'medium', category: 'General' });

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        if (ticketId && tickets.length > 0) {
            const ticket = tickets.find(t => t._id === ticketId);
            if (ticket) {
                setSelectedTicket(ticket);
                setViewMode('chat');
            }
        } else if (!ticketId) {
            setViewMode('list');
        }
    }, [ticketId, tickets]);

    useEffect(() => {
        if (!user?._id) return;
        socket.connect();
        socket.emit('setup', user._id);
        const handleTicketUpdate = (data) => {
            fetchTickets();
            if (selectedTicket?._id === data.ticketId) {
                setSelectedTicket(data.updatedTicket);
            }
        };
        socket.on('ticket_update', handleTicketUpdate);
        return () => socket.off('ticket_update', handleTicketUpdate);
    }, [user?._id, selectedTicket?._id]);

    const fetchTickets = async () => {
        try {
            const res = await api.get('/tickets');
            setTickets(res.data.data || []);
        } catch (error) {
            toast.error('Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        try {
            const res = await api.post(`/tickets/${selectedTicket._id}/reply`, { message });
            setSelectedTicket(res.data.data);
            setMessage('');
            fetchTickets();
        } catch (error) {
            toast.error('Failed to send reply');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return '#4caf50';
            case 'pending': return '#ff9800';
            case 'closed': return '#9e9e9e';
            default: return '#2196f3';
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchesTab = tabValue === 0 ? t.status !== 'closed' : t.status === 'closed';
        const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (t.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    if (loading) return <Box sx={{ p: 8, textAlign: 'center' }}><CircularProgress /></Box>;

    // ---------------- LIST VIEW (Image 1 Style) ----------------
    const renderListView = () => (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight={900}>All Support Tickets</Typography>
                <Stack direction="row" spacing={2}>
                    <Box sx={{ display: 'flex', bgcolor: 'white', borderRadius: 3, p: 0.5, border: '1px solid', borderColor: 'divider' }}>
                        <Button 
                            onClick={() => setTabValue(0)}
                            sx={{ 
                                px: 3, borderRadius: 2.5, textTransform: 'none', fontWeight: 800,
                                bgcolor: tabValue === 0 ? '#f1f5f9' : 'transparent',
                                color: tabValue === 0 ? 'primary.main' : 'text.secondary'
                            }}
                        >
                            Opened ({tickets.filter(t => t.status !== 'closed').length})
                        </Button>
                        <Button 
                            onClick={() => setTabValue(1)}
                            sx={{ 
                                px: 3, borderRadius: 2.5, textTransform: 'none', fontWeight: 800,
                                bgcolor: tabValue === 1 ? '#f1f5f9' : 'transparent',
                                color: tabValue === 1 ? 'primary.main' : 'text.secondary'
                            }}
                        >
                            Closed ({tickets.filter(t => t.status === 'closed').length})
                        </Button>
                    </Box>
                    <TextField 
                        size="small" 
                        placeholder="Search tickets..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{ 
                            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small"/></InputAdornment>,
                            sx: { borderRadius: 3, bgcolor: 'white', width: 250 } 
                        }} 
                    />
                    <IconButton sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}><FilterIcon/></IconButton>
                </Stack>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                <Table sx={{ minWidth: 800 }}>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2 }}>TICKET ID</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>TITLE</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>CATEGORY</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>USER NAME</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>STATUS</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary' }}>ACTIONS</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTickets.map((t) => (
                            <TableRow key={t._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.85rem' }}>
                                    #{t._id.substring(t._id.length - 6).toUpperCase()}
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={900} sx={{ color: '#0f172a' }}>{t.subject}</Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                        {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={t.category} 
                                        size="small" 
                                        sx={{ borderRadius: 1.5, fontWeight: 800, fontSize: 10, bgcolor: '#f1f5f9', color: '#475569' }} 
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={800} sx={{ color: '#334155' }}>{t.user?.name || 'Unknown'}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={t.status.toUpperCase()} 
                                        size="small" 
                                        sx={{ 
                                            borderRadius: 2, fontWeight: 900, fontSize: 10, px: 1,
                                            bgcolor: t.status === 'open' ? '#dcfce7' : t.status === 'pending' ? '#fef9c3' : '#f1f5f9',
                                            color: t.status === 'open' ? '#166534' : t.status === 'pending' ? '#854d0e' : '#475569',
                                            border: '1px solid',
                                            borderColor: t.status === 'open' ? '#bbf7d0' : t.status === 'pending' ? '#fef08a' : '#e2e8f0'
                                        }} 
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => navigate(`/support-tickets/${t._id}`)}><ViewIcon fontSize="small"/></IconButton>
                                    <IconButton><MoreIcon fontSize="small"/></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    // ---------------- CHAT VIEW (Image 2 Style) ----------------
    const renderChatView = () => (
        <Grid container sx={{ height: 'calc(100vh - 64px)', bgcolor: '#f8fafc' }}>
            {/* Left Sidebar: Recent Tickets */}
            <Grid item xs={12} md={3.5} sx={{ borderRight: '1px solid', borderColor: 'divider', bgcolor: 'white', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={900} gutterBottom>Recent Tickets</Typography>
                    <TextField 
                        fullWidth size="small" placeholder="Search" 
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon/></InputAdornment>, sx: { borderRadius: 3, bgcolor: '#f1f5f9', border: 'none' } }} 
                    />
                </Box>
                <Box sx={{ px: 3, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={800} color="text.secondary">My Open tickets ({tickets.filter(t => t.status !== 'closed').length})</Typography>
                    <IconButton size="small"><DownIcon/></IconButton>
                </Box>
                <List sx={{ flexGrow: 1, overflowY: 'auto', px: 2 }}>
                    {tickets.map(t => (
                        <ListItemButton 
                            key={t._id} 
                            selected={selectedTicket?._id === t._id}
                            onClick={() => setSelectedTicket(t)}
                            sx={{ 
                                borderRadius: 4, mb: 1.5, p: 2, 
                                border: '1px solid', borderColor: selectedTicket?._id === t._id ? 'primary.main' : 'transparent',
                                bgcolor: selectedTicket?._id === t._id ? 'rgba(33, 150, 243, 0.04)' : 'transparent'
                            }}
                        >
                            <Box sx={{ width: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', fontSize: 12 }}>{t.user?.name?.substring(0,2).toUpperCase()}</Avatar>
                                        <Typography variant="subtitle2" fontWeight={800}>{t.user?.name}</Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">2 mins ago</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1.5 }}>{t.description}</Typography>
                                <Stack direction="row" spacing={1}>
                                    <Chip label="Open" size="small" sx={{ height: 20, fontSize: 10, bgcolor: '#e8f5e9', color: '#4caf50', fontWeight: 800, borderRadius: 1 }} />
                                    <Chip label="High Priority" size="small" sx={{ height: 20, fontSize: 10, bgcolor: '#ffebee', color: '#f44336', fontWeight: 800, borderRadius: 1 }} />
                                </Stack>
                            </Box>
                        </ListItemButton>
                    ))}
                </List>
            </Grid>

            {/* Right Side: Conversation Area */}
            <Grid item xs={12} md={8.5} sx={{ display: 'flex', flexDirection: 'column' }}>
                {selectedTicket ? (
                    <>
                        <Box sx={{ p: 2, px: 3, bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6" fontWeight={900}>{selectedTicket.subject}</Typography>
                                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                    <Chip label={selectedTicket.status.toUpperCase()} size="small" sx={{ 
                                        bgcolor: selectedTicket.status === 'open' ? '#e8f5e9' : selectedTicket.status === 'pending' ? '#fff3e0' : '#f1f5f9', 
                                        color: selectedTicket.status === 'open' ? '#4caf50' : selectedTicket.status === 'pending' ? '#ff9800' : '#475569', 
                                        fontWeight: 800, borderRadius: 1 
                                    }} />
                                    <Chip label={selectedTicket.priority?.toUpperCase() || 'MEDIUM'} size="small" sx={{ bgcolor: '#ffebee', color: '#f44336', fontWeight: 800, borderRadius: 1 }} />
                                    <Chip label={selectedTicket.category} size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 800, borderRadius: 1 }} />
                                </Stack>
                            </Box>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <Select
                                        value={selectedTicket.status}
                                        onChange={async (e) => {
                                            try {
                                                const res = await api.put(`/tickets/${selectedTicket._id}/status`, { status: e.target.value });
                                                setSelectedTicket(res.data.data);
                                                fetchTickets();
                                                toast.success('Status updated');
                                            } catch (err) { toast.error('Failed to update status'); }
                                        }}
                                        sx={{ borderRadius: 2, fontWeight: 700, fontSize: '0.8rem' }}
                                    >
                                        <MenuItem value="open">Open</MenuItem>
                                        <MenuItem value="pending">Pending</MenuItem>
                                        <MenuItem value="resolved">Resolved</MenuItem>
                                        <MenuItem value="closed">Closed</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button 
                                    variant="outlined" 
                                    color={selectedTicket.student?.isBlockedFromSupport ? "success" : "error"}
                                    size="small"
                                    onClick={async () => {
                                        try {
                                            const res = await api.post(`/tickets/block/${selectedTicket.student?._id || selectedTicket.student}`);
                                            toast.success(res.data.message);
                                            fetchTickets();
                                            // Refresh selected ticket student info
                                            setSelectedTicket({ ...selectedTicket, student: { ...selectedTicket.student, isBlockedFromSupport: res.data.isBlocked } });
                                        } catch (err) { toast.error('Failed to toggle block'); }
                                    }}
                                    sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none' }}
                                >
                                    {selectedTicket.student?.isBlockedFromSupport ? 'Unblock Student' : 'Block Student'}
                                </Button>
                            </Stack>
                        </Box>

                        <Box sx={{ flexGrow: 1, p: 4, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, bgcolor: '#f1f5f9' }}>
                            {/* Original Student Message */}
                            <Box sx={{ display: 'flex', gap: 2, alignSelf: 'flex-start', maxWidth: '80%' }}>
                                <Avatar src={selectedTicket.student?.avatar} sx={{ bgcolor: '#fce4ec', color: '#e91e63' }}>
                                    {selectedTicket.student?.name?.substring(0,1).toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Paper elevation={0} sx={{ p: 2, borderRadius: '0px 16px 16px 16px', border: '1px solid', borderColor: 'divider' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Typography variant="subtitle2" fontWeight={900}>{selectedTicket.student?.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{new Date(selectedTicket.createdAt).toLocaleString()}</Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>{selectedTicket.description}</Typography>
                                        
                                        {/* Real Attachments */}
                                        {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                                            <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                                                {selectedTicket.attachments.map((file, idx) => (
                                                    <Paper key={idx} variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 2, bgcolor: '#f8fafc' }}>
                                                        <Avatar sx={{ width: 24, height: 24, bgcolor: '#ffebee', color: '#f44336', borderRadius: 1 }}>
                                                            <Typography fontSize={8} fontWeight={900}>PDF</Typography>
                                                        </Avatar>
                                                        <Typography variant="caption" fontWeight={800} noWrap sx={{ maxWidth: 80 }}>{file.name}</Typography>
                                                        <IconButton size="small" onClick={() => window.open(file.url, '_blank')}><DownloadIcon sx={{ fontSize: 14 }}/></IconButton>
                                                    </Paper>
                                                ))}
                                            </Stack>
                                        )}
                                    </Paper>
                                </Box>
                            </Box>

                            {/* Conversation Thread */}
                            {selectedTicket.messages.map((msg, i) => {
                                const isAdmin = msg.sender?.role === 'admin' || (typeof msg.sender === 'string' ? false : msg.sender?._id !== (selectedTicket.student?._id || selectedTicket.student));
                                return (
                                    <Box key={i} sx={{ display: 'flex', gap: 2, flexDirection: isAdmin ? 'row-reverse' : 'row', alignSelf: isAdmin ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                        <Avatar src={msg.sender?.avatar} sx={{ bgcolor: isAdmin ? 'primary.main' : 'grey.400' }}>
                                            {msg.sender?.name?.substring(0,1).toUpperCase()}
                                        </Avatar>
                                        <Box sx={{ textAlign: isAdmin ? 'right' : 'left' }}>
                                            <Paper 
                                                elevation={0} 
                                                sx={{ 
                                                    p: 2, 
                                                    borderRadius: isAdmin ? '16px 0px 16px 16px' : '0px 16px 16px 16px',
                                                    bgcolor: isAdmin ? 'primary.main' : 'white',
                                                    color: isAdmin ? 'white' : 'inherit',
                                                    border: isAdmin ? 'none' : '1px solid',
                                                    borderColor: 'divider'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isAdmin ? 'flex-end' : 'flex-start', gap: 1, mb: 0.5 }}>
                                                    <Typography variant="caption" fontWeight={900} sx={{ opacity: 0.8 }}>
                                                        {isAdmin ? 'You (Admin)' : msg.sender?.name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ opacity: 0.6 }}>{new Date(msg.createdAt).toLocaleTimeString()}</Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>{msg.message}</Typography>
                                            </Paper>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Reply Area */}
                        <Box sx={{ p: 3, bgcolor: 'white', borderTop: '1px solid', borderColor: 'divider' }}>
                            <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
                                <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, bgcolor: '#f8fafc' }}>
                                    <IconButton size="small"><BoldIcon/></IconButton>
                                    <IconButton size="small"><ItalicIcon/></IconButton>
                                    <IconButton size="small"><UnderlineIcon/></IconButton>
                                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                                    <IconButton size="small"><ListIcon/></IconButton>
                                </Box>
                                <Box sx={{ p: 2 }}>
                                    <TextField 
                                        fullWidth multiline rows={4} placeholder="Write your reply..." 
                                        value={message} onChange={(e) => setMessage(e.target.value)}
                                        variant="standard" InputProps={{ disableUnderline: true }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                        <IconButton><FileIcon/></IconButton>
                                        <Button variant="contained" onClick={handleReply} sx={{ px: 4, borderRadius: 2.5, fontWeight: 800 }}>Send Reply</Button>
                                    </Box>
                                </Box>
                            </Paper>
                        </Box>
                    </>
                ) : (
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: 0.3 }}>
                        <SupportIcon sx={{ fontSize: 100, mb: 2 }} />
                        <Typography variant="h5" fontWeight={900}>Select a ticket to start chatting</Typography>
                    </Box>
                )}
            </Grid>
        </Grid>
    );

    return viewMode === 'list' ? renderListView() : renderChatView();
};

export default SupportTickets;
