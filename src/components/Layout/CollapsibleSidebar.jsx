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
import SecurityIcon from '@mui/icons-material/Security';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentIcon from '@mui/icons-material/Payment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AssessmentIcon from '@mui/icons-material/Assessment';
import QuizIcon from '@mui/icons-material/Quiz';
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
import { fixUrl } from '../../utils/api';

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
                { text: 'Referral Join Requests', path: '/referral-joining-requests', icon: <GroupsIcon /> },
                { text: 'Referral Records', path: '/referral-records', icon: <CardGiftcardIcon /> },
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
        { text: 'All Courses', icon: <LibraryBooksIcon />, path: '/all-courses', roles: ['student'] },
        { text: 'Personal Info', icon: <PeopleIcon />, path: '/profile', roles: ['student'] },
        { text: 'Account Settings', icon: <SecurityIcon />, path: '/account-settings', roles: ['student'] },
        { text: 'Refer & Earn', icon: <CardGiftcardIcon />, path: '/referrals', roles: ['student'] },
        { text: 'My Rewards', icon: <ReceiptLongIcon />, path: '/my-rewards', roles: ['student'] },
        { text: 'Leaderboard', icon: <EmojiEventsIcon />, path: '/leaderboard', roles: ['admin', 'teacher', 'student'] },
        { text: 'Leave Management', icon: <EventBusyIcon />, path: '/leaves', roles: ['student'] },
        { text: 'Timetable', icon: <EventIcon />, path: '/my-routine', roles: ['student'] },
        { text: 'Study Streaks', icon: <FlameIcon />, path: '/streaks', roles: ['student'] },

        // --- TUTOR PANEL ---
        { text: 'Tutor Dashboard', icon: <DashboardIcon />, path: '/tutor/dashboard', roles: ['tutor'] },
        { text: 'Live Requests', icon: <SupportAgentIcon />, path: '/tutor/requests', roles: ['tutor'] },
        { text: 'Earnings & Payouts', icon: <MonetizationOnIcon />, path: '/tutor/withdrawals', roles: ['tutor'] },
    ];

    const filterMenuItems = (items) => {
        return items.reduce((acc, item) => {
            // 1. Check if user role matches this item/parent
            const matchesRole = item.roles ? item.roles.includes(user?.role) : true;
            if (!matchesRole) return acc;

            // 2. Filter children if they exist
            if (item.children) {
                const filteredChildren = filterMenuItems(item.children);
                // Only show parent if it has visible children after role filtering
                if (filteredChildren.length > 0) {
                    acc.push({ ...item, children: filteredChildren });
                }
            } else {
                // 3. Simple item: check search query
                const matchesSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase());
                if (matchesSearch) {
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
                    borderColor: 'var(--color-sidebar-border, var(--color-vc-hairline))',
                    transition: 'width 0.3s ease',
                    overflow: 'visible',
                    backgroundColor: 'var(--color-sidebar-bg, var(--color-vc-canvas))',
                    fontFamily: 'var(--font-sidebar, inherit)',
                },
            }}
        >
            {!isMobile && (
                <IconButton
                    onClick={onToggleCollapse}
                    size="small"
                    sx={{ 
                        position: 'absolute',
                        right: -12,
                        top: 22,
                        zIndex: 1200,
                        width: 24,
                        height: 24,
                        backgroundColor: 'var(--color-sidebar-bg, var(--color-vc-canvas))',
                        border: '1px solid',
                        borderColor: 'var(--color-sidebar-border, var(--color-vc-hairline))',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                        color: 'var(--color-sidebar-menu-text, var(--color-vc-ink))',
                        '&:hover': { 
                            backgroundColor: 'var(--color-sidebar-hover-bg, var(--color-vc-canvas-soft))',
                            color: 'var(--color-sidebar-active-text, var(--color-vc-ink))' 
                        }
                    }}
                >
                    {collapsed ? <ChevronRightIcon sx={{ fontSize: 14 }} /> : <ChevronLeftIcon sx={{ fontSize: 14 }} />}
                </IconButton>
            )}
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header with Logo */}
                <Box sx={{
                    p: collapsed ? '16px 8px' : 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: collapsed ? 1.5 : 1,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    flexDirection: collapsed ? 'column' : 'row',
                    bgcolor: 'var(--color-sidebar-bg, var(--color-vc-canvas))'
                }}>
                    <Avatar
                        src={fixUrl(collapsed ? settings?.general?.siteIcon : settings?.general?.siteLogo)}
                        sx={{
                            bgcolor: 'var(--color-sidebar-hover-bg, var(--color-vc-canvas-soft))',
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            objectFit: 'contain',
                            border: '1px solid',
                            borderColor: 'var(--color-sidebar-border, var(--color-vc-hairline))'
                        }}
                    >
                        {!settings?.general?.siteIcon && <SchoolIcon sx={{ color: 'var(--color-sidebar-menu-text, var(--color-vc-ink))' }} />}
                    </Avatar>

                    {!collapsed && (
                        <Box sx={{ minWidth: 0, overflow: 'hidden', flexGrow: 1, ml: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ color: 'var(--color-sidebar-menu-text, var(--color-vc-ink))', fontFamily: 'inherit', fontSize: '15px' }}>
                                {settings?.general?.siteName || 'LMS Dashboard'}
                            </Typography>
                        </Box>
                    )}
                </Box>
                <Divider sx={{ borderColor: 'var(--color-sidebar-border, var(--color-vc-hairline))' }} />

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
                                    <SearchIcon sx={{ color: 'var(--color-sidebar-menu-text, var(--color-vc-mute))', mr: 0.5, fontSize: 16, opacity: 0.8 }} />
                                ),
                                sx: {
                                    height: 32,
                                    fontSize: '13px',
                                    fontFamily: 'inherit',
                                    borderRadius: '6px',
                                    bgcolor: 'var(--color-sidebar-hover-bg, var(--color-vc-canvas-soft))',
                                    color: 'var(--color-sidebar-menu-text, var(--color-vc-ink))',
                                    border: '1px solid var(--color-sidebar-border, var(--color-vc-hairline))',
                                    '&:hover': {
                                        borderColor: 'var(--color-sidebar-border, var(--color-vc-hairline-strong))',
                                    },
                                    '&.Mui-focused': {
                                        borderColor: 'var(--color-sidebar-border, var(--color-vc-hairline-strong))',
                                    },
                                    '& fieldset': { border: 'none' },
                                    px: 1,
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
                        background: 'var(--color-sidebar-border, var(--color-vc-hairline))',
                        borderRadius: '4px'
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: 'var(--color-sidebar-border, var(--color-vc-hairline-strong))'
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
                                                borderRadius: '6px',
                                                justifyContent: collapsed ? 'center' : 'flex-start',
                                                px: collapsed ? 1 : 1.5,
                                                py: 1,
                                                mx: 1,
                                                color: 'var(--color-sidebar-menu-text, var(--color-vc-body))',
                                                position: 'relative',
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: '25%',
                                                    bottom: '25%',
                                                    width: '3px',
                                                    borderRadius: '2px',
                                                    backgroundColor: 'var(--color-sidebar-active-text, var(--color-vc-primary))',
                                                    display: location.pathname === item.path ? 'block' : 'none'
                                                },
                                                '&.Mui-selected': {
                                                    backgroundColor: 'var(--color-sidebar-active-bg, var(--color-vc-canvas-soft-2))',
                                                    color: 'var(--color-sidebar-active-text, var(--color-vc-ink))',
                                                    fontWeight: 500,
                                                    '&:hover': {
                                                        backgroundColor: 'var(--color-sidebar-active-bg, var(--color-vc-canvas-soft-2))',
                                                    },
                                                    '& .MuiListItemIcon-root': {
                                                        color: 'var(--color-sidebar-active-text, var(--color-vc-ink))',
                                                    },
                                                },
                                                '&:hover': {
                                                    backgroundColor: 'var(--color-sidebar-hover-bg, var(--color-vc-canvas-soft))',
                                                    color: 'var(--color-sidebar-hover-text, var(--color-vc-ink))',
                                                    '& .MuiListItemIcon-root': {
                                                        color: 'var(--color-sidebar-hover-text, var(--color-vc-ink))',
                                                    },
                                                }
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    color: location.pathname === item.path
                                                        ? 'var(--color-sidebar-active-text, var(--color-vc-ink))'
                                                        : 'var(--color-sidebar-menu-text, var(--color-vc-body))',
                                                    minWidth: collapsed ? 0 : 32,
                                                    justifyContent: 'center',
                                                    transition: 'color 0.15s ease',
                                                }}
                                            >
                                                {item.icon}
                                            </ListItemIcon>
                                            {!collapsed && <ListItemText primary={item.text} primaryTypographyProps={{ style: { fontSize: 'var(--font-size-sidebar, 14px)', fontFamily: 'inherit' } }} />}
                                            {!collapsed && item.children && (openSubMenus[item.text] ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />)}
                                        </ListItemButton>
                                    </Tooltip>
                                </ListItem>

                                {item.children && (
                                    <Collapse in={openSubMenus[item.text] && !collapsed} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding sx={{
                                            pl: collapsed ? 0 : 1,
                                            ml: collapsed ? 0 : 2.5,
                                            borderLeft: collapsed ? 'none' : '1px solid var(--color-sidebar-border, var(--color-vc-hairline))',
                                            mb: 1
                                        }}>
                                            {item.children.map((child) => (
                                                <ListItem key={child.text} disablePadding sx={{ mb: 0.5 }}>
                                                    <Tooltip title={collapsed ? child.text : ''} placement="right">
                                                        <ListItemButton
                                                            onClick={() => handleNavigation(child.path)}
                                                            selected={location.pathname === child.path}
                                                            sx={{
                                                                borderRadius: '6px',
                                                                justifyContent: collapsed ? 'center' : 'flex-start',
                                                                px: collapsed ? 1 : 1.5,
                                                                pl: collapsed ? 1 : 3,
                                                                py: 0.75,
                                                                mx: 1,
                                                                color: 'var(--color-sidebar-menu-text, var(--color-vc-body))',
                                                                position: 'relative',
                                                                '&::before': {
                                                                    content: '""',
                                                                    position: 'absolute',
                                                                    left: 0,
                                                                    top: '25%',
                                                                    bottom: '25%',
                                                                    width: '3px',
                                                                    borderRadius: '2px',
                                                                    backgroundColor: 'var(--color-sidebar-active-text, var(--color-vc-primary))',
                                                                    display: location.pathname === child.path ? 'block' : 'none'
                                                                },
                                                                '&.Mui-selected': {
                                                                    backgroundColor: 'var(--color-sidebar-active-bg, var(--color-vc-canvas-soft-2))',
                                                                    color: 'var(--color-sidebar-active-text, var(--color-vc-ink))',
                                                                    fontWeight: 500,
                                                                    '&:hover': {
                                                                        backgroundColor: 'var(--color-sidebar-active-bg, var(--color-vc-canvas-soft-2))',
                                                                    },
                                                                    '& .MuiListItemIcon-root': {
                                                                        color: 'var(--color-sidebar-active-text, var(--color-vc-ink))',
                                                                    },
                                                                },
                                                                '&:hover': {
                                                                    backgroundColor: 'var(--color-sidebar-hover-bg, var(--color-vc-canvas-soft))',
                                                                    color: 'var(--color-sidebar-hover-text, var(--color-vc-ink))',
                                                                    '& .MuiListItemIcon-root': {
                                                                        color: 'var(--color-sidebar-hover-text, var(--color-vc-ink))',
                                                                    },
                                                                }
                                                            }}
                                                        >
                                                            <ListItemIcon
                                                                sx={{
                                                                    color: location.pathname === child.path
                                                                        ? 'var(--color-sidebar-active-text, var(--color-vc-ink))'
                                                                        : 'var(--color-sidebar-menu-text, var(--color-vc-body))',
                                                                    minWidth: collapsed ? 0 : 28,
                                                                    justifyContent: 'center',
                                                                    transition: 'color 0.15s ease',
                                                                }}
                                                            >
                                                                {React.cloneElement(child.icon, { sx: { fontSize: 16 } })}
                                                            </ListItemIcon>
                                                            {!collapsed && <ListItemText primary={child.text} primaryTypographyProps={{ style: { fontSize: 'calc(var(--font-size-sidebar, 14px) - 1px)', fontFamily: 'inherit' } }} />}
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
                        <Divider sx={{ my: 2, borderColor: 'var(--color-sidebar-border, var(--color-vc-hairline))' }} />

                        {/* Help, Settings, Logout - Also scrollable */}
                        <ListItem disablePadding sx={{ mb: 0.5 }}>
                            <Tooltip title={collapsed ? 'Help Line' : ''} placement="right">
                                <ListItemButton sx={{
                                    borderRadius: '6px',
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    px: collapsed ? 1 : 1.5,
                                    py: 1,
                                    mx: 1,
                                    color: 'var(--color-sidebar-menu-text, var(--color-vc-body))',
                                    '&:hover': {
                                        backgroundColor: 'var(--color-sidebar-hover-bg, var(--color-vc-canvas-soft))',
                                        color: 'var(--color-sidebar-hover-text, var(--color-vc-ink))',
                                        '& .MuiListItemIcon-root': {
                                            color: 'var(--color-sidebar-hover-text, var(--color-vc-ink))',
                                        },
                                    }
                                }}>
                                    <ListItemIcon sx={{
                                        minWidth: collapsed ? 0 : 32,
                                        justifyContent: 'center',
                                        color: 'var(--color-sidebar-menu-text, var(--color-vc-body))',
                                        transition: 'color 0.15s ease',
                                    }}>
                                        <HelpOutlineIcon />
                                    </ListItemIcon>
                                    {!collapsed && <ListItemText primary="Help Line" primaryTypographyProps={{ style: { fontSize: 'var(--font-size-sidebar, 14px)', fontFamily: 'inherit' } }} />}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>

                        <ListItem disablePadding sx={{ mb: 0.5 }}>
                            <Tooltip title={collapsed ? 'Settings' : ''} placement="right">
                                <ListItemButton
                                    onClick={() => handleNavigation('/settings')}
                                    selected={location.pathname === '/settings'}
                                    sx={{
                                        borderRadius: '6px',
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        px: collapsed ? 1 : 1.5,
                                        py: 1,
                                        mx: 1,
                                        color: 'var(--color-sidebar-menu-text, var(--color-vc-body))',
                                        position: 'relative',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            left: 0,
                                            top: '25%',
                                            bottom: '25%',
                                            width: '3px',
                                            borderRadius: '2px',
                                            backgroundColor: 'var(--color-sidebar-active-text, var(--color-vc-primary))',
                                            display: location.pathname === '/settings' ? 'block' : 'none'
                                        },
                                        '&.Mui-selected': {
                                            backgroundColor: 'var(--color-sidebar-active-bg, var(--color-vc-canvas-soft-2))',
                                            color: 'var(--color-sidebar-active-text, var(--color-vc-ink))',
                                            fontWeight: 500,
                                            '&:hover': {
                                                backgroundColor: 'var(--color-sidebar-active-bg, var(--color-vc-canvas-soft-2))',
                                            },
                                            '& .MuiListItemIcon-root': {
                                                color: 'var(--color-sidebar-active-text, var(--color-vc-ink))',
                                            },
                                        },
                                        '&:hover': {
                                            backgroundColor: 'var(--color-sidebar-hover-bg, var(--color-vc-canvas-soft))',
                                            color: 'var(--color-sidebar-hover-text, var(--color-vc-ink))',
                                            '& .MuiListItemIcon-root': {
                                                color: 'var(--color-sidebar-hover-text, var(--color-vc-ink))',
                                            },
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{
                                        minWidth: collapsed ? 0 : 32,
                                        justifyContent: 'center',
                                        color: location.pathname === '/settings'
                                            ? 'var(--color-sidebar-active-text, var(--color-vc-ink))'
                                            : 'var(--color-sidebar-menu-text, var(--color-vc-body))',
                                        transition: 'color 0.15s ease',
                                    }}>
                                        <SettingsIcon />
                                    </ListItemIcon>
                                    {!collapsed && <ListItemText primary="Settings" primaryTypographyProps={{ style: { fontSize: 'var(--font-size-sidebar, 14px)', fontFamily: 'inherit' } }} />}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>

                        <ListItem disablePadding sx={{ mb: 0.5 }}>
                            <Tooltip title={collapsed ? 'Log Out' : ''} placement="right">
                                <ListItemButton
                                    onClick={handleLogout}
                                    sx={{
                                        borderRadius: '6px',
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        px: collapsed ? 1 : 1.5,
                                        py: 1,
                                        mx: 1,
                                        color: 'var(--color-sidebar-menu-text, var(--color-vc-body))',
                                        '&:hover': {
                                            backgroundColor: 'var(--color-sidebar-hover-bg, var(--color-vc-canvas-soft))',
                                            color: 'var(--color-sidebar-hover-text, var(--color-vc-ink))',
                                            '& .MuiListItemIcon-root': {
                                                color: 'var(--color-sidebar-hover-text, var(--color-vc-ink))',
                                            },
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{
                                        minWidth: collapsed ? 0 : 32,
                                        justifyContent: 'center',
                                        color: 'var(--color-sidebar-menu-text, var(--color-vc-body))',
                                        transition: 'color 0.15s ease',
                                    }}>
                                        <LogoutIcon />
                                    </ListItemIcon>
                                    {!collapsed && <ListItemText primary="Log Out" primaryTypographyProps={{ style: { fontSize: 'var(--font-size-sidebar, 14px)', fontFamily: 'inherit' } }} />}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                    </List>
                </Box>

                <Divider sx={{ borderColor: 'var(--color-sidebar-border, var(--color-vc-hairline))' }} />

                {/* User Profile & Dark Mode - Sticky at Bottom */}
                <Box sx={{ 
                    p: collapsed ? '16px 8px' : 2, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'var(--color-sidebar-bg, var(--color-vc-canvas))'
                }}>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: collapsed ? 'center' : 'flex-start', 
                        width: '100%',
                        gap: 1, 
                        mb: collapsed ? 0 : 2 
                    }}>
                        <Avatar sx={{ 
                            width: 32, 
                            height: 32, 
                            bgcolor: 'var(--color-sidebar-hover-bg, var(--color-vc-canvas-soft))', 
                            border: '1px solid var(--color-sidebar-border, var(--color-vc-hairline))', 
                            color: 'var(--color-sidebar-menu-text, var(--color-vc-ink))',
                            fontSize: '14px',
                            fontWeight: 600
                        }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        {!collapsed && (
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={500} noWrap sx={{ color: 'var(--color-sidebar-menu-text, var(--color-vc-ink))', fontSize: '13px', fontFamily: 'inherit' }}>
                                    {user?.name || 'Bonyra Jony'}
                                </Typography>
                                <Typography variant="caption" noWrap sx={{ color: 'var(--color-sidebar-menu-text, var(--color-vc-mute))', opacity: 0.7, fontSize: '11px', fontFamily: '"JetBrains Mono", monospace' }}>
                                    {user?.email || 'bonyrajony19@gmail.com'}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {!collapsed && (
                        <FormControlLabel
                            control={
                                <Switch 
                                    checked={darkMode} 
                                    onChange={toggleTheme} 
                                    size="small"
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: 'var(--color-sidebar-active-text, var(--color-vc-primary))',
                                            '& + .MuiSwitch-track': {
                                                backgroundColor: 'var(--color-sidebar-active-text, var(--color-vc-primary))',
                                            },
                                        },
                                    }}
                                />
                            }
                            label={
                                <Typography sx={{ fontSize: '12px', color: 'var(--color-sidebar-menu-text, var(--color-vc-body))', fontFamily: 'inherit' }}>
                                    Dark Mode
                                </Typography>
                            }
                        />
                    )}
                </Box>
            </Box>
        </Drawer>
    );
};

export default CollapsibleSidebar;
