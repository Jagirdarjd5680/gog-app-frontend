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

    // Students get the floating "raised" card treatment (rounded, shadowed, no hard
    // bottom border) to match StudentSidebar.jsx's card look; admin/teacher keep the
    // flush classic bar unchanged. Same --color-topbar-* variables either way, so an
    // admin's theme color settings still apply here.
    const isStudent = user?.role === 'student';

    return (
        <AppBar
            position="sticky"
            sx={{
                backgroundColor: 'var(--color-topbar-bg, var(--color-vc-canvas))',
                color: 'var(--color-topbar-text, var(--color-vc-ink))',
                borderBottom: isStudent ? 'none' : '1px solid var(--color-topbar-border, var(--color-vc-hairline))',
                boxShadow: isStudent ? '0 8px 24px -14px rgba(0,0,0,0.25)' : 'none',
                borderRadius: isStudent ? '20px' : 0,
                mb: isStudent ? 2 : 0,
                top: isStudent ? 16 : 0,
                zIndex: 1100,
            }}
        >
            <Toolbar sx={{ gap: 1 }}>
                <IconButton
                    edge="start"
                    color="inherit"
                    onClick={onMenuClick}
                    sx={{ 
                        mr: 1, 
                        color: 'var(--color-topbar-text, var(--color-vc-mute))', 
                        opacity: 0.8,
                        '&:hover': { 
                            opacity: 1, 
                            backgroundColor: 'var(--color-topbar-hover-bg, var(--color-vc-canvas-soft))' 
                        } 
                    }}
                >
                    <MenuIcon />
                </IconButton>

                {!isStudent && (
                    <Typography sx={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-topbar-text, var(--color-vc-ink))', display: { xs: 'none', sm: 'block' }, mr: 2 }}>
                        WORKSPACE / ADMIN
                    </Typography>
                )}
                {isStudent && (
                    <Typography sx={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-topbar-text, var(--color-vc-ink))', display: { xs: 'none', sm: 'block' } }}>
                        Hi, {user?.name?.split(' ')[0] || 'there'} 👋
                    </Typography>
                )}

                {/* Global Search Bar (only for admin/teacher) */}
                {(user?.role === 'admin' || user?.role === 'teacher') && (
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                        <GlobalSearchBar />
                    </Box>
                )}

                {/* Spacer if not admin */}
                {user?.role === 'student' && <Box sx={{ flexGrow: 1 }} />}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton 
                        color="inherit" 
                        onClick={toggleTheme} 
                        sx={{ 
                            color: 'var(--color-topbar-text, var(--color-vc-mute))', 
                            opacity: 0.8,
                            '&:hover': { 
                                opacity: 1, 
                                backgroundColor: 'var(--color-topbar-hover-bg, var(--color-vc-canvas-soft))' 
                            } 
                        }}
                    >
                        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>

                    <IconButton 
                        color="inherit" 
                        onClick={() => navigate('/notifications')} 
                        sx={{ 
                            color: 'var(--color-topbar-text, var(--color-vc-mute))', 
                            opacity: 0.8,
                            '&:hover': { 
                                opacity: 1, 
                                backgroundColor: 'var(--color-topbar-hover-bg, var(--color-vc-canvas-soft))' 
                            } 
                        }}
                    >
                        <NotificationsIcon />
                    </IconButton>

                    {(user?.role === 'admin' || user?.role === 'teacher') && (
                        <>
                            <IconButton 
                                color="inherit" 
                                onClick={handleSubmissionClick} 
                                sx={{ 
                                    color: 'var(--color-topbar-text, var(--color-vc-mute))', 
                                    opacity: 0.8,
                                    '&:hover': { 
                                        opacity: 1, 
                                        backgroundColor: 'var(--color-topbar-hover-bg, var(--color-vc-canvas-soft))' 
                                    } 
                                }}
                            >
                                <Badge badgeContent={pendingCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '10px', fontWeight: 600 } }}>
                                    <AssignmentTurnedInIcon />
                                </Badge>
                            </IconButton>
                            <Menu
                                anchorEl={subAnchorEl}
                                open={Boolean(subAnchorEl)}
                                onClose={handleClose}
                                PaperProps={{
                                    sx: { 
                                        width: 320, 
                                        maxHeight: 400, 
                                        borderRadius: '6px', 
                                        mt: 1.5, 
                                        bgcolor: 'var(--color-vc-canvas)',
                                        border: '1px solid var(--color-vc-hairline)',
                                        boxShadow: '0px 8px 16px -4px rgba(0,0,0,0.08)' 
                                    }
                                }}
                            >
                                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography sx={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>Recent Submissions</Typography>
                                    <Chip label={pendingCount} size="small" color="error" sx={{ fontWeight: 600, height: 20, borderRadius: '4px' }} />
                                </Box>
                                <Divider sx={{ borderColor: 'var(--color-vc-hairline)' }} />
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
                                            sx={{ py: 1.5, px: 2, '&:hover': { bgcolor: 'var(--color-vc-canvas-soft)' } }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar src={fixUrl(sub.studentImage)} sx={{ width: 28, height: 28 }} />
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary={
                                                    <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }} noWrap>
                                                        {sub.studentName}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-body)', fontFamily: 'inherit' }} noWrap display="block">
                                                            {sub.assignmentTitle}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: '10px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>
                                                            {formatDistanceToNow(new Date(sub.submittedAt))} ago
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                    {recentSubmissions.length === 0 && (
                                        <Box sx={{ p: 4, textAlign: 'center' }}>
                                            <Typography sx={{ fontSize: '13px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>No new submissions</Typography>
                                        </Box>
                                    )}
                                </List>
                                <Divider sx={{ borderColor: 'var(--color-vc-hairline)' }} />
                                <MenuItem 
                                    onClick={() => { navigate('/assignments/all'); handleClose(); }}
                                    sx={{ 
                                        justifyContent: 'center', 
                                        py: 1.5, 
                                        color: 'var(--color-vc-link)', 
                                        fontWeight: 500, 
                                        fontSize: '13px',
                                        fontFamily: 'inherit',
                                        '&:hover': { color: 'var(--color-vc-link-deep)', bgcolor: 'var(--color-vc-canvas-soft)' } 
                                    }}
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
                                backgroundColor: 'var(--color-vc-error-soft)',
                                color: 'var(--color-vc-error-deep)',
                                padding: '4px 12px',
                                borderRadius: '4px',
                                border: '1px solid var(--color-vc-error-soft)',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    backgroundColor: 'var(--color-vc-error-deep)',
                                    color: '#ffffff',
                                    borderColor: 'var(--color-vc-error-deep)'
                                }
                            }}
                        >
                            <Brightness7Icon sx={{ fontSize: 16 }} />
                            <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', fontFamily: 'inherit' }}>
                                {user?.tutorInfo?.earnings || 0} Credits
                            </Typography>
                        </Box>
                    )}

                    <IconButton onClick={handleProfileClick} sx={{ p: 0, ml: 1 }}>
                        <Avatar
                            alt={user?.name}
                            src={fixUrl(user?.avatar)}
                            sx={{ width: 32, height: 32, bgcolor: 'var(--color-vc-canvas-soft)', border: '1px solid var(--color-vc-hairline)', color: 'var(--color-vc-ink)' }}
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
                        PaperProps={{
                            sx: {
                                borderRadius: '6px',
                                mt: 1,
                                border: '1px solid var(--color-vc-hairline)',
                                bgcolor: 'var(--color-vc-canvas)',
                                boxShadow: '0px 8px 16px -4px rgba(0,0,0,0.08)',
                            }
                        }}
                    >
                        <MenuItem disabled sx={{ opacity: '1 !important', py: 1, px: 2 }}>
                            <Box>
                                <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>{user?.name}</Typography>
                                <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: '"JetBrains Mono", monospace' }}>{user?.email}</Typography>
                            </Box>
                        </MenuItem>
                        <Divider sx={{ borderColor: 'var(--color-vc-hairline)' }} />
                        {(user?.role === 'admin' || user?.role === 'teacher') && (
                            <MenuItem 
                                onClick={() => { navigate(`/users?openProfile=${user._id}`); handleClose(); }}
                                sx={{ fontSize: '13px', color: 'var(--color-vc-body)', fontFamily: 'inherit', py: 1, px: 2, '&:hover': { bgcolor: 'var(--color-vc-canvas-soft)', color: 'var(--color-vc-ink)' } }}
                            >
                                My Profile & Certificates
                            </MenuItem>
                        )}
                        <MenuItem 
                            onClick={handleLogout}
                            sx={{ fontSize: '13px', color: 'var(--color-vc-body)', fontFamily: 'inherit', py: 1, px: 2, '&:hover': { bgcolor: 'var(--color-vc-canvas-soft)', color: 'var(--color-vc-ink)' } }}
                        >
                            Logout
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
