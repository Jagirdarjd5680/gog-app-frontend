import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import GlobalSearchBar from './GlobalSearchBar';

const Header = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const { mode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleProfileClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
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
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
