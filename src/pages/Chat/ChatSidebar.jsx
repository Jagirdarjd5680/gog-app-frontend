import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Badge,
    TextField,
    InputAdornment,
    IconButton,
    Tooltip,
    Divider,
    Paper,
    useTheme,
    CircularProgress,
    Menu,
    MenuItem,
    ListItemIcon,
    Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SendIcon from '@mui/icons-material/Send';
import CampaignIcon from '@mui/icons-material/Campaign';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { format } from 'date-fns';
import { useState } from 'react';
import UserSelector, { MODES } from './UserSelector';

const ChatSidebar = ({ users, selectedUser, onSelectUser, loading, onRefresh }) => {
    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [showUserSelector, setShowUserSelector] = useState(false);
    const [selectorMode, setSelectorMode] = useState(MODES.SINGLE);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleSelectOption = (mode) => {
        setSelectorMode(mode);
        setShowUserSelector(true);
        handleMenuClose();
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Paper
            elevation={0}
            sx={{
                width: 320,
                borderRadius: 3,
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                overflow: 'hidden'
            }}
        >
            <Box sx={{ p: 2.5, pb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight={800} color="primary">
                        Messages
                    </Typography>
                    <Box>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleMenuOpen}
                            startIcon={<MoreVertIcon fontSize="small" />}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 1.5,
                                border: '1px solid',
                                borderColor: 'primary.100',
                                bgcolor: 'primary.50',
                                '&:hover': { bgcolor: 'primary.100', borderColor: 'primary.200' }
                            }}
                        >
                            Broadcast
                        </Button>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            PaperProps={{ sx: { borderRadius: 2, minWidth: 180, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}
                        >
                            <MenuItem onClick={() => handleSelectOption(MODES.SINGLE)}>
                                <ListItemIcon><PersonAddIcon fontSize="small" /></ListItemIcon>
                                <ListItemText primary="New Chat" />
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={() => handleSelectOption(MODES.BULK_ALL)}>
                                <ListItemIcon><CampaignIcon fontSize="small" color="primary" /></ListItemIcon>
                                <ListItemText primary="Broadcast to All" />
                            </MenuItem>
                            <MenuItem onClick={() => handleSelectOption(MODES.BULK_SPECIFIC)}>
                                <ListItemIcon><GroupAddIcon fontSize="small" color="primary" /></ListItemIcon>
                                <ListItemText primary="Select Recipients" />
                            </MenuItem>
                        </Menu>
                    </Box>
                </Box>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" color="action" />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 2, bgcolor: 'action.hover', '& fieldset': { border: 'none' } }
                    }}
                />
            </Box>

            <Divider />

            <List sx={{ flexGrow: 1, overflowY: 'auto', p: 1, gap: 0.5, display: 'flex', flexDirection: 'column' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : filteredUsers.length === 0 ? (
                    <Typography variant="body2" color="text.disabled" textAlign="center" sx={{ p: 4 }}>
                        No conversations found
                    </Typography>
                ) : (
                    filteredUsers.map((user) => (
                        <ListItem
                            key={user._id}
                            button
                            onClick={() => onSelectUser(user)}
                            selected={selectedUser?._id === user._id}
                            sx={{
                                borderRadius: 2,
                                transition: 'all 0.2s',
                                '&.Mui-selected': {
                                    bgcolor: 'primary.50',
                                    '&:hover': { bgcolor: 'primary.100' },
                                    '& .MuiListItemText-primary': { color: 'primary.main', fontWeight: 700 }
                                },
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                        >
                            <ListItemAvatar>
                                <Badge
                                    overlap="circular"
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    variant="dot"
                                    color={user.isOnline ? 'success' : 'default'}
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            border: `2px solid ${theme.palette.background.paper}`,
                                            bgcolor: user.isOnline ? '#44b700' : '#bdbdbd'
                                        }
                                    }}
                                >
                                    <Avatar src={user.avatar} sx={{ width: 45, height: 45 }}>
                                        {user.name.charAt(0)}
                                    </Avatar>
                                </Badge>
                            </ListItemAvatar>
                            <ListItemText
                                disableTypography
                                primary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" fontWeight={selectedUser?._id === user._id || user.unreadCount > 0 ? 800 : 500}>
                                            {user.name}
                                        </Typography>
                                        {user.lastMessage && (
                                            <Typography variant="caption" color="text.disabled">
                                                {format(new Date(user.lastMessage.createdAt), 'HH:mm')}
                                            </Typography>
                                        )}
                                    </Box>
                                }
                                secondary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography
                                            variant="caption"
                                            noWrap
                                            sx={{
                                                maxWidth: 140,
                                                color: user.unreadCount > 0 ? 'text.primary' : 'text.secondary',
                                                fontWeight: user.unreadCount > 0 ? 700 : 400
                                            }}
                                        >
                                            {user.lastMessage?.message || 'Start a conversation'}
                                        </Typography>
                                        {user.unreadCount > 0 && (
                                            <Badge badgeContent={user.unreadCount} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 18, minWidth: 18 } }} />
                                        )}
                                    </Box>
                                }
                            />
                        </ListItem>
                    ))
                )}
            </List>

            <UserSelector
                open={showUserSelector}
                initialMode={selectorMode}
                onClose={() => setShowUserSelector(false)}
                onSuccess={onRefresh}
                onSelect={(user) => {
                    onSelectUser(user);
                    setShowUserSelector(false);
                    onRefresh();
                }}
            />
        </Paper>
    );
};

export default ChatSidebar;
