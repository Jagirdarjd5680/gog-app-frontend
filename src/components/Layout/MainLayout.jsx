import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import CollapsibleSidebar from './CollapsibleSidebar';
import Header from './Header';

const MainLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleSidebar = () => {
        if (isMobile) {
            setMobileOpen(!mobileOpen);
        } else {
            setSidebarCollapsed(!sidebarCollapsed);
        }
    };

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
                        backgroundColor: 'background.default',
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
