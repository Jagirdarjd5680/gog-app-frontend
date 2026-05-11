import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem, Chip, Stack } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { Badge, Divider, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import GlobalSearchBar from './GlobalSearchBar';
import api, { fixUrl } from '../../utils/api';
import { formatDistanceToNow } from 'date-fns';

const Header = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const { mode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [subAnchorEl, setSubAnchorEl] = useState(null);
    const [recentSubmissions, setRecentSubmissions] = useState([]);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        if (user?.role === 'admin' || user?.role === 'teacher') {
            fetchRecentSubmissions();
        }
    }, [user]);

    const fetchRecentSubmissions = async () => {
        try {
            const res = await api.get('/assignments/all-submissions?limit=5');
            if (res.data.success) {
                setRecentSubmissions(res.data.data);
                setPendingCount(res.data.data.filter(s => s.status === 'pending').length);
            }
        } catch (error) {
            console.error('Failed to fetch recent submissions:', error);
        }
    };

    const handleProfileClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSubmissionClick = (event) => {
        setSubAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSubAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        handleClose();
    };

    return (
        <AppBar
            position="sticky"
            sx={{
                backgroundColor: 'background.paper',
                color: 'text.primary',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                zIndex: 1100,
            }}
        >
            <Toolbar sx={{ gap: 1 }}>
                <IconButton
                    edge="start"
                    color="inherit"
                    onClick={onMenuClick}
                    sx={{ mr: 1 }}
                >
                    <MenuIcon />
                </IconButton>

                <Typography variant="h6" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' }, mr: 2 }}>
                    LMS Admin Panel
                </Typography>

                {/* Global Search Bar (only for admin/teacher) */}
                {(user?.role === 'admin' || user?.role === 'teacher') && (
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                        <GlobalSearchBar />
                    </Box>
                )}

                {/* Spacer if not admin */}
                {user?.role === 'student' && <Box sx={{ flexGrow: 1 }} />}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton color="inherit" onClick={toggleTheme}>
                        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>

                    <IconButton color="inherit" onClick={() => navigate('/notifications')}>
                        <NotificationsIcon />
                    </IconButton>

                    {(user?.role === 'admin' || user?.role === 'teacher') && (
                        <>
                            <IconButton color="inherit" onClick={handleSubmissionClick}>
                                <Badge badgeContent={pendingCount} color="error">
                                    <AssignmentTurnedInIcon />
                                </Badge>
                            </IconButton>
                            <Menu
                                anchorEl={subAnchorEl}
                                open={Boolean(subAnchorEl)}
                                onClose={handleClose}
                                PaperProps={{
                                    sx: { width: 320, maxHeight: 400, borderRadius: 3, mt: 1.5, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }
                                }}
                            >
                                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography fontWeight={700}>Recent Submissions</Typography>
                                    <Chip label={pendingCount} size="small" color="error" sx={{ fontWeight: 800, height: 20 }} />
                                </Box>
                                <Divider />
                                <List sx={{ p: 0 }}>
                                    {recentSubmissions.map((sub) => (
                                        <ListItem 
                                            key={sub._id} 
                                            button 
                                            onClick={() => {
                                                const batchId = sub.studentBatches?.[0]?._id || sub.studentBatches?.[0];
                                                navigate(`/assignments/submissions?batchId=${batchId}&studentId=${sub.studentId}`);
                                                handleClose();
                                            }}
                                            sx={{ py: 1.5 }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar src={fixUrl(sub.studentImage)} sx={{ width: 32, height: 32 }} />
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary={
                                                    <Typography variant="body2" fontWeight={600} noWrap>
                                                        {sub.studentName}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                                                            {sub.assignmentTitle}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'primary.main' }}>
                                                            {formatDistanceToNow(new Date(sub.submittedAt))} ago
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                    {recentSubmissions.length === 0 && (
                                        <Box sx={{ p: 4, textAlign: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">No new submissions</Typography>
                                        </Box>
                                    )}
                                </List>
                                <Divider />
                                <MenuItem 
                                    onClick={() => { navigate('/assignments/all'); handleClose(); }}
                                    sx={{ justifyContent: 'center', py: 1.5, color: 'primary.main', fontWeight: 600 }}
                                >
                                    View All Submissions
                                </MenuItem>
                            </Menu>
                        </>
                    )}

                    {user?.role === 'tutor' && (
                        <Box 
                            onClick={() => navigate('/tutor/withdrawals')}
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1, 
                                ml: 1, 
                                cursor: 'pointer',
                                backgroundColor: 'rgba(196, 12, 12, 0.1)',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                border: '1px solid rgba(196, 12, 12, 0.2)',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    backgroundColor: 'rgba(196, 12, 12, 0.15)',
                                    transform: 'translateY(-1px)'
                                }
                            }}
                        >
                            <Brightness7Icon sx={{ fontSize: 20, color: '#C40C0C' }} />
                            <Typography sx={{ fontWeight: 'bold', color: '#C40C0C', fontSize: '0.9rem' }}>
                                {user?.tutorInfo?.earnings || 0} Credits
                            </Typography>
                        </Box>
                    )}

                    <IconButton onClick={handleProfileClick} sx={{ p: 0, ml: 1 }}>
                        <Avatar
                            alt={user?.name}
                            src={user?.avatar}
                            sx={{ width: 38, height: 38 }}
                        >
                            {user?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <MenuItem disabled>
                            <Box>
                                <Typography variant="body2" fontWeight={600}>{user?.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                            </Box>
                        </MenuItem>
                        <Divider />
                        {(user?.role === 'admin' || user?.role === 'teacher') && (
                            <MenuItem onClick={() => { navigate(`/users?openProfile=${user._id}`); handleClose(); }}>
                                My Profile & Certificates
                            </MenuItem>
                        )}
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
