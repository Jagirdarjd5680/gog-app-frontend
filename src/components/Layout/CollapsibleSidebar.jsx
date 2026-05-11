import React, { useState } from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Button,
    TextField,
    Box,
    Typography,
    Divider,
    Avatar,
    Switch,
    FormControlLabel,
    IconButton,
    Tooltip,
    Collapse,
    useMediaQuery,
    useTheme as useMuiTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentIcon from '@mui/icons-material/Payment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
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
import EventSeatIcon from '@mui/icons-material/EventSeat';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import EventIcon from '@mui/icons-material/Event';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkIcon from '@mui/icons-material/Work';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HistoryIcon from '@mui/icons-material/History';
import FlameIcon from '@mui/icons-material/Whatshot';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [openSubMenus, setOpenSubMenus] = useState({});

    const toggleSubMenu = (menuText) => {
        setOpenSubMenus(prev => ({
            ...prev,
            [menuText]: !prev[menuText]
        }));
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/', roles: ['admin', 'teacher', 'student'] },
        
        // --- ADMIN / TEACHER GROUPS ---
        {
            text: 'User Management',
            icon: <PeopleIcon />,
            roles: ['admin'],
            children: [
                { text: 'All Users', path: '/users', icon: <PeopleIcon /> },
                { text: 'Tutors', path: '/tutors', icon: <SupportAgentIcon /> },
                { text: 'Leave Requests', path: '/leave-requests', icon: <ExitToAppIcon /> },
                { text: 'Referral Payouts', path: '/withdrawal-requests', icon: <MonetizationOnIcon /> },
                { text: 'Referral Requests', path: '/referral-joining-requests', icon: <GroupsIcon /> },
            ]
        },
        
        {
            text: 'LMS Management',
            icon: <SchoolIcon />,
            roles: ['admin', 'teacher'],
            children: [
                { text: 'Courses', path: '/courses', icon: <SchoolIcon /> },
                { text: 'Batches', path: '/batches', icon: <GroupsIcon /> },
                { text: 'Categories', path: '/categories', icon: <CategoryIcon /> },
                { text: 'Media Library', path: '/media-library', icon: <PermMediaIcon /> },
                { text: 'Live Classes', path: '/live-classes', icon: <VideoCallIcon /> },
                { text: 'Assignments', path: '/assignments', icon: <AssignmentIcon /> },
            ]
        },

        {
            text: 'Exams & Results',
            icon: <QuizIcon />,
            roles: ['admin', 'teacher'],
            children: [
                { text: 'Exam Management', path: '/exam-management', icon: <QuizIcon /> },
                { text: 'Exam Results', path: '/exam-results', icon: <AssignmentTurnedInIcon /> },
                { text: 'Question Bank', path: '/question-bank', icon: <LibraryBooksIcon /> },
                { text: 'Passed Students', path: '/passed-students', icon: <SchoolIcon /> },
            ]
        },

        {
            text: 'Financials',
            icon: <MonetizationOnIcon />,
            roles: ['admin'],
            children: [
                { text: 'Payments', path: '/payments', icon: <PaymentIcon /> },
                { text: 'Fee Records', path: '/fee-records', icon: <PaymentIcon /> },
                { text: 'Tutor Payouts', path: '/tutor-withdrawals', icon: <PaymentIcon /> },
            ]
        },

        {
            text: 'Marketing & Comms',
            icon: <CampaignIcon />,
            roles: ['admin', 'teacher'],
            children: [
                { text: 'Coupons', path: '/coupons', icon: <LocalOfferIcon /> },
                { text: 'Notifications', path: '/notifications', icon: <NotificationsIcon /> },
                { text: 'Blog Management', path: '/blogs', icon: <ArticleIcon /> },
                { text: 'App Banners', path: '/banners', icon: <ViewCarouselIcon /> },
                { text: 'News Ticker', path: '/news-ticker', icon: <CampaignIcon /> },
                { text: 'App Reviews', path: '/app-reviews', icon: <StarIcon /> },
                { text: 'Free Materials', path: '/free-materials', icon: <AutoAwesomeIcon /> },
                { text: 'Event Management', path: '/events', icon: <CampaignIcon /> },
            ]
        },

        {
            text: 'Administration',
            icon: <SettingsIcon />,
            roles: ['admin'],
            children: [
                { text: 'Settings', path: '/settings', icon: <SettingsIcon /> },
                { text: 'Booking', path: '/booking', icon: <EventSeatIcon /> },
                { text: 'Reports', path: '/reports', icon: <AssessmentIcon /> },
                { text: 'Timetable Manager', path: '/timetable', icon: <EventIcon /> },
            ]
        },

        {
            text: 'Support Hub',
            icon: <ChatIcon />,
            roles: ['admin', 'teacher', 'student'],
            children: [
                { text: user?.role === 'admin' ? 'Message Management' : 'Admin Support', path: '/chat', icon: <ChatIcon />, roles: ['admin', 'teacher', 'student'] },
                { text: 'Tutor Chats', path: '/tutor-chats', icon: <ChatIcon />, roles: ['admin'] },
                { text: 'Support Tickets', path: '/support-tickets', icon: <SupportAgentIcon />, roles: ['admin', 'student'] },
                { text: 'Tutor Help', path: '/tutor-support', icon: <SupportAgentIcon />, roles: ['admin', 'teacher', 'student'] },
                { text: 'Placements', path: '/placements', icon: <WorkIcon />, roles: ['admin', 'teacher', 'student'] },
            ]
        },

        // --- STUDENT SPECIFIC ---
        { text: 'Personal Info', icon: <PeopleIcon />, path: '/profile', roles: ['student'] },
        { text: 'Timetable', icon: <EventIcon />, path: '/timetable', roles: ['student'] },
        { text: 'Refer & Earn', icon: <CardGiftcardIcon />, path: '/referrals', roles: ['student'] },
        { text: 'My Rewards', icon: <ReceiptLongIcon />, path: '/my-rewards', roles: ['student'] },
        { text: 'Leaderboard', icon: <EmojiEventsIcon />, path: '/leaderboard', roles: ['admin', 'teacher', 'student'] },
        { text: 'Leave Management', icon: <EventBusyIcon />, path: '/leaves', roles: ['student'] },
        { text: 'My Routine', icon: <HistoryIcon />, path: '/my-routine', roles: ['student'] },
        { text: 'Study Streaks', icon: <FlameIcon />, path: '/streaks', roles: ['student'] },

        // --- TUTOR PANEL ---
        { text: 'Tutor Dashboard', icon: <DashboardIcon />, path: '/tutor/dashboard', roles: ['tutor'] },
        { text: 'Live Requests', icon: <SupportAgentIcon />, path: '/tutor/requests', roles: ['tutor'] },
        { text: 'Earnings & Payouts', icon: <MonetizationOnIcon />, path: '/tutor/withdrawals', roles: ['tutor'] },
    ];

    const filterMenuItems = (items) => {
        return items.reduce((acc, item) => {
            const matchesRole = item.roles ? item.roles.includes(user?.role) : true;
            
            if (item.children) {
                const filteredChildren = filterMenuItems(item.children);
                if (filteredChildren.length > 0) {
                    acc.push({ ...item, children: filteredChildren });
                }
            } else {
                // Custom condition for Student Leave Management
                if (user?.role === 'student' && item.path === '/leaves') {
                    if (user?.registrationStatus !== 'approved') return acc;
                }

                const matchesSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase());
                if (matchesRole && matchesSearch) {
                    acc.push(item);
                }
            }
            return acc;
        }, []);
    };

    const filteredMenuItems = filterMenuItems(menuItems);

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
                            borderColor: darkMode ? 'rgba(255,255,255,0.12)' : 'divider'
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

                {/* Search Bar */}
                {!collapsed && (
                    <Box sx={{ p: 2, pb: 0 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search menu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                                ),
                                sx: {
                                    borderRadius: 2,
                                    bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                    '& fieldset': { border: 'none' },
                                }
                            }}
                        />
                    </Box>
                )}

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
                            <React.Fragment key={item.text}>
                                <ListItem disablePadding sx={{ mb: 0.5 }}>
                                    <Tooltip title={collapsed ? item.text : ''} placement="right">
                                        <ListItemButton
                                            onClick={() => item.children ? toggleSubMenu(item.text) : handleNavigation(item.path)}
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
                                            {!collapsed && item.children && (openSubMenus[item.text] ? <ExpandLess /> : <ExpandMore />)}
                                        </ListItemButton>
                                    </Tooltip>
                                </ListItem>

                                {item.children && (
                                    <Collapse in={openSubMenus[item.text] && !collapsed} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding sx={{ pl: collapsed ? 0 : 2 }}>
                                            {item.children.map((child) => (
                                                <ListItem key={child.text} disablePadding sx={{ mb: 0.5 }}>
                                                    <Tooltip title={collapsed ? child.text : ''} placement="right">
                                                        <ListItemButton
                                                            onClick={() => handleNavigation(child.path)}
                                                            selected={location.pathname === child.path}
                                                            sx={{
                                                                borderRadius: 2,
                                                                justifyContent: collapsed ? 'center' : 'flex-start',
                                                                px: collapsed ? 1 : 2,
                                                                pl: collapsed ? 1 : 4,
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
                                                                    color: location.pathname === child.path
                                                                        ? '#fff'
                                                                        : (darkMode ? '#ffffff' : (settings?.theme?.menuText || 'text.secondary')),
                                                                    minWidth: collapsed ? 0 : 30,
                                                                    justifyContent: 'center',
                                                                }}
                                                            >
                                                                {React.cloneElement(child.icon, { sx: { fontSize: 18 } })}
                                                            </ListItemIcon>
                                                            {!collapsed && <ListItemText primary={child.text} primaryTypographyProps={{ variant: 'body2' }} />}
                                                        </ListItemButton>
                                                    </Tooltip>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Collapse>
                                )}
                            </React.Fragment>
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
