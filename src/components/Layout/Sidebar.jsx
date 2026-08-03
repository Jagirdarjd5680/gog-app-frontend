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
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SchoolIcon from '@mui/icons-material/School';
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
import EventSeatIcon from '@mui/icons-material/EventSeat';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import EventIcon from '@mui/icons-material/Event';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import WorkIcon from '@mui/icons-material/Work';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HistoryIcon from '@mui/icons-material/History';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import PostAddIcon from '@mui/icons-material/PostAdd';
import FlameIcon from '@mui/icons-material/Whatshot';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { fixUrl } from '../../utils/api';
import { hasModulePermission } from '../../utils/permissions';

const DRAWER_WIDTH = 260;

const Sidebar = ({ open, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { settings } = useSettings();
    const theme = useMuiTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const siteName = settings?.general?.siteName || 'LMS Admin';

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/', roles: ['admin', 'teacher', 'student'] },
        { text: 'Personal Info', icon: <AccountCircleIcon />, path: '/profile', roles: ['student'] },
        { text: user?.role === 'admin' ? 'Message Management' : 'Admin Support', icon: <ChatIcon />, path: '/chat', roles: ['admin', 'teacher', 'student'] },
        { text: 'Users', icon: <PeopleIcon />, path: '/users', roles: ['admin', 'teacher'] },
        { text: 'Tutors', icon: <SupportAgentIcon />, path: '/tutors', roles: ['admin'] },
        { text: 'Leave Requests', icon: <ExitToAppIcon />, path: '/leave-requests', roles: ['admin'] },
        { text: 'My Leaves', icon: <ExitToAppIcon />, path: '/leaves', roles: ['student'] },
        { text: 'Courses', icon: <SchoolIcon />, path: '/courses', roles: ['admin', 'teacher'] },
        { text: 'Exams', icon: <QuizIcon />, path: '/exam-management', roles: ['admin', 'teacher'] },
        { text: 'Exam Results', icon: <AssignmentTurnedInIcon />, path: '/exam-results', roles: ['admin', 'teacher'] },
        { text: 'Question Bank', icon: <CategoryIcon />, path: '/question-bank', roles: ['admin', 'teacher'] },
        { text: 'Media Library', icon: <PermMediaIcon />, path: '/media-library', roles: ['admin', 'teacher'] },
        { text: 'Assignments', icon: <AssignmentIcon />, path: '/assignments', roles: ['admin', 'teacher'] },
        { text: 'Coupons', icon: <LocalOfferIcon />, path: '/coupons', roles: ['admin', 'teacher'] },
        { text: 'Payments', icon: <PaymentIcon />, path: '/payments', roles: ['admin'] },
        { text: 'Booking', icon: <EventSeatIcon />, path: '/booking', roles: ['admin'] },
        { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications', roles: ['admin', 'teacher'] },
        { text: 'Reports', icon: <AssessmentIcon />, path: '/reports', roles: ['admin'] },
        { text: 'Blogs', icon: <ArticleIcon />, path: '/blogs', roles: ['admin', 'teacher'] },
        { text: 'App Banners', icon: <ViewCarouselIcon />, path: '/banners', roles: ['admin'] },
        { text: 'News Ticker', icon: <CampaignIcon />, path: '/news-ticker', roles: ['admin'] },
        { text: 'App Reviews', icon: <StarIcon />, path: '/app-reviews', roles: ['admin'] },
        { text: 'Free Materials', icon: <AutoAwesomeIcon />, path: '/free-materials', roles: ['admin', 'teacher'] },
        { text: 'Settings', icon: <SettingsIcon />, path: '/settings', roles: ['admin'] },

        // --- NEW FEATURES ---
        { text: 'Timetable Manager', icon: <EventIcon />, path: '/timetable', roles: ['admin', 'teacher'] },
        { text: 'My Routine', icon: <HistoryIcon />, path: '/my-routine', roles: ['student'] },
        { text: 'Referrals', icon: <CardGiftcardIcon />, path: '/referrals', roles: ['student'] },
        { text: 'All Referrals', icon: <PeopleIcon />, path: '/all-referrals', roles: ['admin'] },
        { text: 'Referral Payouts', icon: <MonetizationOnIcon />, path: '/withdrawal-requests', roles: ['admin'] },
        { text: 'Tutor Payouts', icon: <PaymentIcon />, path: '/tutor-withdrawals', roles: ['admin'] },
        { text: 'Tutor Chats', icon: <ChatIcon />, path: '/tutor-chats', roles: ['admin'] },
        { text: 'My Rewards', icon: <ReceiptLongIcon />, path: '/my-rewards', roles: ['student'] },
        { text: 'Tutor Help', icon: <SupportAgentIcon />, path: '/tutor-support', roles: ['admin', 'teacher', 'student'] },
        { text: 'Leaderboard', icon: <EmojiEventsIcon />, path: '/leaderboard', roles: ['admin', 'teacher', 'student'] },
        { text: 'Placements', icon: <WorkIcon />, path: '/placements', roles: ['admin', 'teacher', 'student'] },
        { text: 'Support Tickets', icon: <SupportAgentIcon />, path: '/support-tickets', roles: ['admin', 'student'] },
        { text: 'Live Support', icon: <SupportAgentIcon />, path: '/tutor-support', roles: ['student'] },
        { text: 'Study Streaks', icon: <FlameIcon />, path: '/streaks', roles: ['student'] },

        // --- TUTOR PANEL ---
        { text: 'Tutor Dashboard', icon: <DashboardIcon />, path: '/tutor/dashboard', roles: ['tutor', 'admin'] },
        { text: 'Live Requests', icon: <SupportAgentIcon />, path: '/tutor/requests', roles: ['tutor', 'admin'] },
        { text: 'Earnings & Payouts', icon: <MonetizationOnIcon />, path: '/tutor/withdrawals', roles: ['tutor', 'admin'] },
    ];

    const filteredMenuItems = menuItems.filter(item => {
        if (!user) return false;
        if (user.role === 'admin') return true;

        // If teacher, check permissions
        if (user.role === 'teacher') {
            // Dashboard doesn't require module access
            if (item.path === '/') return true;

            // Granular per-module view permission (courses/exams/students/chat) —
            // shared source of truth with backend_nestjs's ModulePermissionsGuard.
            const permissionModuleMap = {
                '/courses': 'courses',
                '/exam-management': 'exams',
                '/exam-results': 'exams',
                '/question-bank': 'exams',
                '/chat': 'chat',
                '/users': 'students',
            };
            const permModule = permissionModuleMap[item.path];
            if (permModule) {
                return hasModulePermission(user, permModule, 'view');
            }

            // Legacy moduleAccess gate for everything else — unrelated to the above.
            const moduleMap = {
                '/media-library': 'mediaAccess',
                '/assignments': 'assignments',
                '/notifications': 'notifications',
                '/coupons': 'coupons',
            };
            const requiredModule = moduleMap[item.path];
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
                {settings?.general?.siteLogo ? (
                    <Box
                        component="img"
                        src={fixUrl(settings.general.siteLogo)}
                        sx={{ height: 40, mb: 1 }}
                        alt="Logo"
                    />
                ) : (
                    <Typography variant="h6" fontWeight={700} color="primary" sx={{ lineHeight: 1.2 }}>
                        {siteName}
                    </Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
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
                    © {new Date().getFullYear()} {siteName}
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
