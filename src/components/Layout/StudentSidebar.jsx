import React from 'react';
import { Box, Avatar, Typography, Tooltip, IconButton } from '@mui/material';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useMyEnrollments } from '../../hooks/useMyEnrollments';
import { fixUrl } from '../../utils/api';

export const STUDENT_SIDEBAR_WIDTH = 232;
export const STUDENT_SIDEBAR_WIDTH_COLLAPSED = 84;

/**
 * Dedicated sidebar for the student dashboard — deliberately separate from
 * CollapsibleSidebar.jsx (admin/teacher), which has a very different information
 * density (submenus, search, 30+ items) that doesn't fit a student's much smaller,
 * calmer menu. Visual language: a single floating rounded card (not an edge-to-edge
 * drawer) with a bold pill for the active item, matching the "raised/smooth" look
 * requested — colors still come from the same admin-configurable theme variables
 * CollapsibleSidebar uses (ThemeContext.jsx), so an admin's theme settings apply here too.
 */
const StudentSidebar = ({ collapsed = false, onToggleCollapse }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { settings } = useSettings();
    const { isEnrolled, loading } = useMyEnrollments();

    const alwaysVisible = [
        { text: 'Dashboard', icon: <GridViewRoundedIcon />, path: '/' },
        { text: 'Courses', icon: <SchoolRoundedIcon />, path: '/all-courses' },
    ];
    const enrolledOnly = [
        { text: 'My Courses', icon: <MenuBookRoundedIcon />, path: '/all-courses?mine=1' },
        { text: 'Payments', icon: <PaymentRoundedIcon />, path: '/my-payments' },
        { text: 'Referrals', icon: <CardGiftcardRoundedIcon />, path: '/referrals' },
    ];
    const tail = [
        { text: 'Support', icon: <SupportAgentRoundedIcon />, path: '/tutor-support' },
        { text: 'Profile', icon: <PersonRoundedIcon />, path: '/profile' },
    ];

    // Not-yet-enrolled students see only the two entry points that lead to enrolling —
    // everything else (payments, referrals) is meaningless with zero courses and stays
    // hidden here; RequireEnrollment.jsx is the actual enforcement if they type the URL.
    const menuItems = loading ? alwaysVisible : [...alwaysVisible, ...(isEnrolled ? enrolledOnly : []), ...tail];

    const isActive = (path) => {
        const base = path.split('?')[0];
        if (base === '/all-courses') {
            // "Courses" and "My Courses" share a base path but differ by ?mine= — only
            // highlight the one matching the current query, not both at once.
            const wantsMine = path.includes('mine=1');
            const isMine = location.search.includes('mine=1');
            return location.pathname === base && wantsMine === isMine;
        }
        return location.pathname === base;
    };

    return (
        <Box
            sx={{
                width: collapsed ? STUDENT_SIDEBAR_WIDTH_COLLAPSED : STUDENT_SIDEBAR_WIDTH,
                flexShrink: 0,
                position: 'sticky',
                top: 16,
                alignSelf: 'flex-start',
                height: 'calc(100vh - 32px)',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '24px',
                bgcolor: 'var(--color-sidebar-bg, var(--color-vc-canvas))',
                border: '1px solid var(--color-sidebar-border, var(--color-vc-hairline))',
                boxShadow: '0 10px 30px -12px rgba(0,0,0,0.12)',
                overflow: 'visible',
                transition: 'width 0.3s ease',
            }}
        >
            {onToggleCollapse && (
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
                        bgcolor: 'var(--color-sidebar-bg, var(--color-vc-canvas))',
                        border: '1px solid var(--color-sidebar-border, var(--color-vc-hairline))',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                        color: 'var(--color-sidebar-menu-text, var(--color-vc-ink))',
                        '&:hover': {
                            bgcolor: 'var(--color-sidebar-hover-bg, var(--color-vc-canvas-soft))',
                        },
                    }}
                >
                    {collapsed ? <ChevronRightIcon sx={{ fontSize: 14 }} /> : <ChevronLeftIcon sx={{ fontSize: 14 }} />}
                </IconButton>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', borderRadius: '24px' }}>
            {/* Brand */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 1.2, px: collapsed ? 1 : 2.5, pt: 2.5, pb: 2 }}>
                <Avatar
                    src={fixUrl(settings?.general?.siteIcon)}
                    sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: 'var(--color-vc-primary, #6366f1)' }}
                >
                    {!settings?.general?.siteIcon && <SchoolRoundedIcon sx={{ fontSize: 18 }} />}
                </Avatar>
                {!collapsed && (
                    <Typography
                        noWrap
                        sx={{ fontWeight: 800, fontSize: 15, color: 'var(--color-sidebar-menu-text, var(--color-vc-ink))', fontFamily: 'var(--font-sidebar, inherit)' }}
                    >
                        {settings?.general?.siteName || 'Student Hub'}
                    </Typography>
                )}
            </Box>

            {/* Nav */}
            <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Tooltip key={item.text} title={collapsed ? item.text : ''} placement="right">
                            <Box
                                onClick={() => navigate(item.path)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    gap: 1.5,
                                    px: collapsed ? 1 : 2,
                                    py: 1.3,
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    transition: 'all 0.18s ease',
                                    bgcolor: active ? 'var(--color-sidebar-active-bg, var(--color-vc-primary))' : 'transparent',
                                    color: active
                                        ? 'var(--color-sidebar-active-text, var(--color-vc-on-primary))'
                                        : 'var(--color-sidebar-menu-text, var(--color-vc-body))',
                                    boxShadow: active ? '0 8px 16px -6px rgba(0,0,0,0.28)' : 'none',
                                    '&:hover': active
                                        ? {}
                                        : {
                                              bgcolor: 'var(--color-sidebar-hover-bg, var(--color-vc-canvas-soft))',
                                              color: 'var(--color-sidebar-hover-text, var(--color-sidebar-menu-text, var(--color-vc-ink)))',
                                          },
                                }}
                            >
                                <Box sx={{ display: 'flex', '& svg': { fontSize: 20 } }}>{item.icon}</Box>
                                {!collapsed && (
                                    <Typography
                                        noWrap
                                        sx={{
                                            fontSize: 'var(--font-size-sidebar, 13.5px)',
                                            fontWeight: active ? 700 : 500,
                                            fontFamily: 'var(--font-sidebar, inherit)',
                                        }}
                                    >
                                        {item.text}
                                    </Typography>
                                )}
                            </Box>
                        </Tooltip>
                    );
                })}
            </Box>

            {/* User + Logout */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: 1.2,
                    px: collapsed ? 1 : 2,
                    py: 2,
                    borderTop: '1px solid var(--color-sidebar-border, var(--color-vc-hairline))',
                }}
            >
                <Avatar sx={{ width: 32, height: 32, fontSize: 13, fontWeight: 700, bgcolor: 'var(--color-vc-primary, #6366f1)' }}>
                    {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                {!collapsed && (
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-sidebar-menu-text, var(--color-vc-ink))' }}>
                            {user?.name}
                        </Typography>
                    </Box>
                )}
                <Tooltip title="Log out">
                    <Box
                        onClick={() => { logout(); navigate('/login'); }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 30,
                            height: 30,
                            borderRadius: '10px',
                            cursor: 'pointer',
                            flexShrink: 0,
                            color: 'var(--color-sidebar-menu-text, var(--color-vc-mute))',
                            '&:hover': { bgcolor: 'var(--color-sidebar-hover-bg, var(--color-vc-canvas-soft))', color: '#ef4444' },
                        }}
                    >
                        <LogoutRoundedIcon sx={{ fontSize: 18 }} />
                    </Box>
                </Tooltip>
            </Box>
            </Box>
        </Box>
    );
};

export default StudentSidebar;
