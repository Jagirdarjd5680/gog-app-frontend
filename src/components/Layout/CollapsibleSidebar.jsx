import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Typography,
    Divider,
    Avatar,
    Switch,
    FormControlLabel,
    IconButton,
    Tooltip,
    useMediaQuery,
    useTheme as useMuiTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentIcon from '@mui/icons-material/Payment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AssessmentIcon from '@mui/icons-material/Assessment';
import QuizIcon from '@mui/icons-material/Quiz';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CategoryIcon from '@mui/icons-material/Category';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import ChatIcon from '@mui/icons-material/Chat';
import ArticleIcon from '@mui/icons-material/Article';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import StarIcon from '@mui/icons-material/Star';
import CampaignIcon from '@mui/icons-material/Campaign';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';

const DRAWER_WIDTH_EXPANDED = 280;
const DRAWER_WIDTH_COLLAPSED = 80;

const CollapsibleSidebar = ({ open, collapsed, mobileOpen, onToggleCollapse, onMobileClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const { settings } = useSettings();
    const muiTheme = useMuiTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/', roles: ['admin', 'teacher', 'student'] },
        { text: user?.role === 'admin' ? 'Message Management' : 'Admin Support', icon: <ChatIcon />, path: '/chat', roles: ['admin', 'teacher', 'student'] },
        { text: 'Users', icon: <PeopleIcon />, path: '/users', roles: ['admin'] },
        { text: 'Courses', icon: <SchoolIcon />, path: '/courses', roles: ['admin', 'teacher'] },
        { text: 'Media Library', icon: <PermMediaIcon />, path: '/media-library', roles: ['admin', 'teacher'] },
        { text: 'Live Classes', icon: <VideoCallIcon />, path: '/live-classes', roles: ['admin', 'teacher'] },
        { text: 'Assignments', icon: <AssignmentIcon />, path: '/assignments', roles: ['admin', 'teacher'] },
        { text: 'Payments', icon: <PaymentIcon />, path: '/payments', roles: ['admin'] },
        { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications', roles: ['admin', 'teacher'] },
        { text: 'Exam Management', icon: <QuizIcon />, path: '/exam-management', roles: ['admin', 'teacher'] },
        { text: 'Exam Results', icon: <AssignmentTurnedInIcon />, path: '/exam-results', roles: ['admin', 'teacher'] },
        { text: 'Question Bank', icon: <LibraryBooksIcon />, path: '/question-bank', roles: ['admin', 'teacher'] },
        { text: 'Categories', icon: <CategoryIcon />, path: '/categories', roles: ['admin'] },
        { text: 'Coupons', icon: <LocalOfferIcon />, path: '/coupons', roles: ['admin', 'teacher'] },
        { text: 'Reports', icon: <AssessmentIcon />, path: '/reports', roles: ['admin'] },
        { text: 'Blog Management', icon: <ArticleIcon />, path: '/blogs', roles: ['admin', 'teacher'] },
        { text: 'App Banners', icon: <ViewCarouselIcon />, path: '/banners', roles: ['admin'] },
        { text: 'News Ticker', icon: <CampaignIcon />, path: '/news-ticker', roles: ['admin'] },
        { text: 'App Reviews', icon: <StarIcon />, path: '/app-reviews', roles: ['admin'] },
        { text: 'Free Materials', icon: <AutoAwesomeIcon />, path: '/free-materials', roles: ['admin', 'teacher'] },
    ];

    const filteredMenuItems = menuItems.filter(item =>
        item.roles.includes(user?.role)
    );

    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile && onMobileClose) {
            onMobileClose();
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // For mobile, we force collapsed to be false (expanded) when open
    const isCollapsed = isMobile ? false : collapsed;
    const drawerWidth = isCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED;

    return (
        <Drawer
            variant={isMobile ? 'temporary' : 'permanent'}
            open={isMobile ? mobileOpen : open}
            onClose={isMobile ? onMobileClose : undefined}
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    transition: 'width 0.3s ease',
                    overflowX: 'hidden',
                    overflowY: 'hidden',
                    backgroundColor: darkMode
                        ? '#1e1e1e'
                        : (settings?.theme?.sidebarBg || '#ffffff'),
                },
            }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header with Logo */}
                {/* Header with Logo */}
                <Box sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    flexDirection: 'row',
                    bgcolor: darkMode ? '#1e1e1e' : (settings?.theme?.sidebarBg || '#fff')
                }}>
                    <Avatar
                        src={collapsed ? settings?.general?.siteIcon : settings?.general?.siteLogo}
                        sx={{
                            bgcolor: '#fff',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            objectFit: 'contain',
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        {!settings?.general?.siteIcon && <SchoolIcon sx={{ color: 'primary.main' }} />}
                    </Avatar>

                    {!collapsed && (
                        <Box sx={{ minWidth: 0, overflow: 'hidden', flexGrow: 1, ml: 1 }}>
                            <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ color: darkMode ? '#ffffff' : (settings?.theme?.menuText || '#000') }}>
                                {settings?.general?.siteName || 'LMS Dashboard'}
                            </Typography>
                        </Box>
                    )}

                    {!isMobile && (
                        <IconButton
                            onClick={onToggleCollapse}
                            size="small"
                            sx={{ ml: 'auto' }}
                        >
                            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                        </IconButton>
                    )}
                </Box>


                <Divider />

                {/* Menu Items + Bottom Actions - Scrollable */}
                <Box sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-track': { background: 'transparent' },
                    '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(0,0,0,0.15)',
                        borderRadius: '4px'
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: 'rgba(0,0,0,0.3)'
                    },
                }}>
                    <List sx={{ pt: 2, px: 1 }}>
                        {filteredMenuItems.map((item) => (
                            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                                <Tooltip title={collapsed ? item.text : ''} placement="right">
                                    <ListItemButton
                                        onClick={() => handleNavigation(item.path)}
                                        selected={location.pathname === item.path}
                                        sx={{
                                            borderRadius: 2,
                                            justifyContent: collapsed ? 'center' : 'flex-start',
                                            px: collapsed ? 1 : 2,
                                            color: darkMode ? '#ffffff' : (settings?.theme?.menuText || 'text.secondary'),
                                            '&.Mui-selected': {
                                                backgroundColor: darkMode ? 'primary.main' : (settings?.theme?.activeMenuBg || 'primary.main'),
                                                color: '#fff',
                                                '&:hover': {
                                                    backgroundColor: darkMode ? 'primary.dark' : (settings?.theme?.activeMenuBg || 'primary.dark'),
                                                },
                                                '& .MuiListItemIcon-root': {
                                                    color: '#fff',
                                                },
                                            },
                                            '&:hover': {
                                                backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : (settings?.theme?.hoverMenuBg || 'rgba(0,0,0,0.04)'),
                                                color: darkMode ? '#fff' : (settings?.theme?.hoverMenuText || 'inherit'),
                                                '& .MuiListItemIcon-root': {
                                                    color: darkMode ? '#fff' : (settings?.theme?.hoverMenuText || 'inherit'),
                                                },
                                            }
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                color: location.pathname === item.path
                                                    ? '#fff'
                                                    : (darkMode ? '#ffffff' : (settings?.theme?.menuText || 'text.secondary')),
                                                minWidth: collapsed ? 0 : 40,
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {item.icon}
                                        </ListItemIcon>
                                        {!collapsed && <ListItemText primary={item.text} />}
                                    </ListItemButton>
                                </Tooltip>
                            </ListItem>
                        ))}

                        {/* Divider before bottom actions */}
                        <Divider sx={{ my: 2 }} />

                        {/* Help, Settings, Logout - Also scrollable */}
                        <ListItem disablePadding sx={{ mb: 0.5 }}>
                            <Tooltip title={collapsed ? 'Help Line' : ''} placement="right">
                                <ListItemButton sx={{
                                    borderRadius: 2,
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    color: darkMode ? '#ffffff' : (settings?.theme?.menuText || 'text.secondary'),
                                    '&:hover': {
                                        backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : (settings?.theme?.hoverMenuBg || 'rgba(0,0,0,0.04)'),
                                        color: darkMode ? '#fff' : (settings?.theme?.hoverMenuText || 'inherit'),
                                        '& .MuiListItemIcon-root': {
                                            color: darkMode ? '#fff' : (settings?.theme?.hoverMenuText || 'inherit'),
                                        },
                                    }
                                }}>
                                    <ListItemIcon sx={{
                                        minWidth: collapsed ? 0 : 40,
                                        justifyContent: 'center',
                                        color: darkMode ? '#ffffff' : (settings?.theme?.menuText || 'text.secondary')
                                    }}>
                                        <HelpOutlineIcon />
                                    </ListItemIcon>
                                    {!collapsed && <ListItemText primary="Help Line" />}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>

                        <ListItem disablePadding sx={{ mb: 0.5 }}>
                            <Tooltip title={collapsed ? 'Settings' : ''} placement="right">
                                <ListItemButton
                                    onClick={() => handleNavigation('/settings')}
                                    selected={location.pathname === '/settings'}
                                    sx={{
                                        borderRadius: 2,
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        color: darkMode ? '#ffffff' : (settings?.theme?.menuText || 'text.secondary'),
                                        '&.Mui-selected': {
                                            backgroundColor: darkMode ? 'primary.main' : (settings?.theme?.activeMenuBg || 'primary.main'),
                                            color: darkMode ? '#fff' : (settings?.theme?.activeMenuText || '#fff'),
                                            '& .MuiListItemIcon-root': {
                                                color: darkMode ? '#fff' : (settings?.theme?.activeMenuText || '#fff'),
                                            },
                                        },
                                        '&:hover': {
                                            backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : (settings?.theme?.hoverMenuBg || 'rgba(0,0,0,0.04)'),
                                            color: darkMode ? '#fff' : (settings?.theme?.hoverMenuText || 'inherit'),
                                            '& .MuiListItemIcon-root': {
                                                color: darkMode ? '#fff' : (settings?.theme?.hoverMenuText || 'inherit'),
                                            },
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{
                                        minWidth: collapsed ? 0 : 40,
                                        justifyContent: 'center',
                                        color: location.pathname === '/settings'
                                            ? (darkMode ? '#fff' : (settings?.theme?.activeMenuText || 'white'))
                                            : (darkMode ? '#ffffff' : (settings?.theme?.menuText || 'text.secondary'))
                                    }}>
                                        <SettingsIcon />
                                    </ListItemIcon>
                                    {!collapsed && <ListItemText primary="Settings" />}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>

                        <ListItem disablePadding>
                            <Tooltip title={collapsed ? 'Log Out' : ''} placement="right">
                                <ListItemButton
                                    onClick={handleLogout}
                                    sx={{
                                        borderRadius: 2,
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        color: darkMode ? '#ffffff' : (settings?.theme?.menuText || 'text.secondary'),
                                        '&:hover': {
                                            backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : (settings?.theme?.hoverMenuBg || 'rgba(0,0,0,0.04)'),
                                            color: darkMode ? '#fff' : (settings?.theme?.hoverMenuText || 'inherit'),
                                            '& .MuiListItemIcon-root': {
                                                color: darkMode ? '#fff' : (settings?.theme?.hoverMenuText || 'inherit'),
                                            },
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{
                                        minWidth: collapsed ? 0 : 40,
                                        justifyContent: 'center',
                                        color: darkMode ? '#ffffff' : (settings?.theme?.menuText || 'text.secondary')
                                    }}>
                                        <LogoutIcon />
                                    </ListItemIcon>
                                    {!collapsed && <ListItemText primary="Log Out" />}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                    </List>
                </Box>

                <Divider />

                {/* User Profile & Dark Mode - Sticky at Bottom */}
                <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Avatar sx={{ width: 40, height: 40 }}>
                            {user?.name?.charAt(0)}
                        </Avatar>
                        {!collapsed && (
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={600} noWrap sx={{ color: darkMode ? '#ffffff' : (settings?.theme?.menuText || 'text.primary') }}>
                                    {user?.name || 'Bonyra Jony'}
                                </Typography>
                                <Typography variant="caption" noWrap sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : (settings?.theme?.menuText || 'text.secondary'), opacity: 0.8 }}>
                                    {user?.email || 'bonyrajony19@gmail.com'}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {!collapsed && (
                        <FormControlLabel
                            control={<Switch checked={darkMode} onChange={toggleTheme} />}
                            label="Dark Mode"
                        />
                    )}
                </Box>
            </Box>
        </Drawer>
    );
};

export default CollapsibleSidebar;
