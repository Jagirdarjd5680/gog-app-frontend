import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material';
import CollapsibleSidebar from './CollapsibleSidebar';
import StudentSidebar from './StudentSidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

const MainLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user } = useAuth();
    const isStudent = user?.role === 'student';

    const toggleSidebar = () => {
        if (isMobile) {
            setMobileOpen(!mobileOpen);
        } else {
            setSidebarCollapsed(!sidebarCollapsed);
        }
    };

    // Students get their own floating-card layout (StudentSidebar.jsx) instead of
    // the admin/teacher CollapsibleSidebar — different visual language entirely, so
    // it's a separate branch here rather than another prop CollapsibleSidebar has to
    // understand.
    if (isStudent) {
        return (
            <Box sx={{ display: 'flex', minHeight: '100vh', gap: 2, p: 2, backgroundColor: 'var(--color-vc-canvas-soft)' }}>
                {isMobile ? (
                    <Drawer
                        anchor="left"
                        open={mobileOpen}
                        onClose={() => setMobileOpen(false)}
                        PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none', p: 1.5 } }}
                    >
                        <StudentSidebar />
                    </Drawer>
                ) : (
                    <StudentSidebar collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />
                )}

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Header onMenuClick={toggleSidebar} />
                    <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                        <Outlet />
                    </Box>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <CollapsibleSidebar
                open={true}
                collapsed={sidebarCollapsed}
                mobileOpen={mobileOpen}
                onToggleCollapse={toggleSidebar}
                onMobileClose={() => setMobileOpen(false)}
            />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    overflow: 'hidden',
                    transition: 'margin 0.3s ease',
                }}
            >
                <Header onMenuClick={toggleSidebar} />

                <Box
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        backgroundColor: 'var(--color-vc-canvas-soft)',
                        overflowY: 'auto',
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;
