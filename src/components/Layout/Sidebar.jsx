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
import PermMediaIcon from '@mui/icons-material/PermMedia';
import QuizIcon from '@mui/icons-material/Quiz';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import ArticleIcon from '@mui/icons-material/Article';
import StarIcon from '@mui/icons-material/Star';
import CampaignIcon from '@mui/icons-material/Campaign';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 260;

const Sidebar = ({ open, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const theme = useMuiTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/', roles: ['admin', 'teacher', 'student'] },
        { text: user?.role === 'admin' ? 'Message Management' : 'Admin Support', icon: <ChatIcon />, path: '/chat', roles: ['admin', 'teacher', 'student'] },
        { text: 'Users', icon: <PeopleIcon />, path: '/users', roles: ['admin'] },
        { text: 'Courses', icon: <SchoolIcon />, path: '/courses', roles: ['admin', 'teacher'] },
        { text: 'Exams', icon: <QuizIcon />, path: '/exam-management', roles: ['admin', 'teacher'] },
        { text: 'Exam Results', icon: <AssignmentTurnedInIcon />, path: '/exam-results', roles: ['admin', 'teacher'] },
        { text: 'Question Bank', icon: <CategoryIcon />, path: '/question-bank', roles: ['admin', 'teacher'] },
        { text: 'Media Library', icon: <PermMediaIcon />, path: '/media-library', roles: ['admin', 'teacher'] },
        { text: 'Live Classes', icon: <VideoCallIcon />, path: '/live-classes', roles: ['admin', 'teacher'] },
        { text: 'Assignments', icon: <AssignmentIcon />, path: '/assignments', roles: ['admin', 'teacher'] },
        { text: 'Coupons', icon: <LocalOfferIcon />, path: '/coupons', roles: ['admin', 'teacher'] },
        { text: 'Payments', icon: <PaymentIcon />, path: '/payments', roles: ['admin'] },
        { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications', roles: ['admin', 'teacher'] },
        { text: 'Reports', icon: <AssessmentIcon />, path: '/reports', roles: ['admin'] },
        { text: 'Blogs', icon: <ArticleIcon />, path: '/blogs', roles: ['admin', 'teacher'] },
        { text: 'App Banners', icon: <ViewCarouselIcon />, path: '/banners', roles: ['admin'] },
        { text: 'News Ticker', icon: <CampaignIcon />, path: '/news-ticker', roles: ['admin'] },
        { text: 'App Reviews', icon: <StarIcon />, path: '/app-reviews', roles: ['admin'] },
        { text: 'Free Materials', icon: <AutoAwesomeIcon />, path: '/free-materials', roles: ['admin', 'teacher'] },
        { text: 'Settings', icon: <SettingsIcon />, path: '/settings', roles: ['admin'] },
    ];

    const filteredMenuItems = menuItems.filter(item => {
        if (!user) return false;
        if (user.role === 'admin') return true;

        // If teacher, check moduleAccess
        if (user.role === 'teacher') {
            const moduleMap = {
                '/courses': 'courseManagement',
                '/exam-management': 'examManagement',
                '/exam-results': 'examManagement',
                '/question-bank': 'questionManagement',
                '/media-library': 'mediaAccess',
                '/live-classes': 'liveClasses',
                '/assignments': 'assignments',
                '/notifications': 'notifications',
                '/coupons': 'coupons',
                '/chat': 'chatAccess',
            };

            const requiredModule = moduleMap[item.path];
            // Dashboard doesn't require module access
            if (item.path === '/') return true;

            if (requiredModule && !user.moduleAccess?.includes(requiredModule)) {
                return false;
            }
        }

        return item.roles.includes(user.role);
    });

    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile) {
            onClose();
        }
    };

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700} color="primary">
                    LMS Admin
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Learning Management System
                </Typography>
            </Box>

            <Divider />

            <List sx={{ flexGrow: 1, pt: 2, px: 2 }}>
                {filteredMenuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            onClick={() => handleNavigation(item.path)}
                            selected={location.pathname === item.path}
                            sx={{
                                borderRadius: 2,
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: 'white',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: location.pathname === item.path ? 'white' : 'text.secondary',
                                    minWidth: 40,
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider />

            <Box sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                    © 2024 LMS Admin
                </Typography>
            </Box>
        </Box>
    );

    return (
        <>
            {isMobile ? (
                <Drawer
                    anchor="left"
                    open={open}
                    onClose={onClose}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: DRAWER_WIDTH,
                            boxSizing: 'border-box',
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            ) : (
                <Drawer
                    variant="persistent"
                    open={open}
                    sx={{
                        width: DRAWER_WIDTH,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: DRAWER_WIDTH,
                            boxSizing: 'border-box',
                            borderRight: 'none',
                            boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            )}
        </>
    );
};

export default Sidebar;
