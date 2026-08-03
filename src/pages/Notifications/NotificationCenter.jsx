import { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import NotificationForm from './NotificationForm';
import NotificationHistory from './NotificationHistory';
import HistoryIcon from '@mui/icons-material/History';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../../context/AuthContext';

const NotificationCenter = () => {
    const { user } = useAuth();
    const isAdminOrTeacher = user?.role === 'admin' || user?.role === 'teacher';
    const [tab, setTab] = useState(isAdminOrTeacher ? 0 : 1);

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--color-vc-canvas)', minHeight: '100vh' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--color-vc-ink)', letterSpacing: -0.5 }}>
                    Notifications
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                    {isAdminOrTeacher
                        ? 'Manage organization-wide communications, send instant alerts, and review broadcast history'
                        : 'Review system announcements and alerts'}
                </Typography>
            </Box>

            {isAdminOrTeacher && (
                <Box sx={{ borderBottom: '1px solid var(--color-vc-hairline)', mb: 3 }}>
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        sx={{
                            minHeight: 40,
                            '& .MuiTabs-indicator': { height: 2.5, borderRadius: '3px 3px 0 0' },
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '13px',
                                minHeight: 40,
                                color: 'var(--color-vc-mute)'
                            }
                        }}
                    >
                        <Tab icon={<SendIcon sx={{ mr: 1, fontSize: 17 }} />} iconPosition="start" label="Send New Notification" />
                        <Tab icon={<HistoryIcon sx={{ mr: 1, fontSize: 17 }} />} iconPosition="start" label="Notification History" />
                    </Tabs>
                </Box>
            )}

            {isAdminOrTeacher && tab === 0 ? (
                <Box sx={{ maxWidth: 720 }}>
                    <NotificationForm onSuccess={() => setTab(1)} />
                </Box>
            ) : (
                <NotificationHistory onSendNew={isAdminOrTeacher ? () => setTab(0) : undefined} />
            )}
        </Box>
    );
};

export default NotificationCenter;
