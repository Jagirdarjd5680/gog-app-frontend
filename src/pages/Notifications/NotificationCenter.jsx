import { useState } from 'react';
import { Box, Typography, Container, Grid, Paper, IconButton, Tabs, Tab, Divider } from '@mui/material';
import NotificationForm from './NotificationForm';
import NotificationHistory from './NotificationHistory';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import HistoryIcon from '@mui/icons-material/History';
import SendIcon from '@mui/icons-material/Send';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const NotificationCenter = () => {
    const [tab, setTab] = useState(0);

    return (
        <Box sx={{ bgcolor: 'action.hover', minHeight: 'calc(100vh - 64px)', py: 6 }}>
            <Container maxWidth="lg">
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Box
                                sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    p: 1,
                                    borderRadius: 2,
                                    display: 'flex',
                                    boxShadow: '0 4px 12px rgba(var(--mui-palette-primary-mainChannel), 0.3)'
                                }}
                            >
                                <NotificationsActiveIcon />
                            </Box>
                            <Typography variant="h4" fontWeight={900} color="text.primary">
                                Notifications
                            </Typography>
                        </Box>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
                            Manage organization-wide communications. Send instant alerts and view your broadcast history.
                        </Typography>
                    </Box>
                    <IconButton color="primary">
                        <HelpOutlineIcon />
                    </IconButton>
                </Box>

                <Paper sx={{ borderRadius: 3, mb: 4, overflow: 'hidden' }}>
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        sx={{
                            px: 2,
                            pt: 1,
                            bgcolor: 'background.paper',
                            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' }
                        }}
                    >
                        <Tab
                            icon={<SendIcon sx={{ mr: 1, fontSize: 18 }} />}
                            iconPosition="start"
                            label="Send New Notification"
                            sx={{ fontWeight: 700, py: 2 }}
                        />
                        <Tab
                            icon={<HistoryIcon sx={{ mr: 1, fontSize: 18 }} />}
                            iconPosition="start"
                            label="Notification History"
                            sx={{ fontWeight: 700, py: 2 }}
                        />
                    </Tabs>
                    <Divider />

                    <Box sx={{ p: tab === 0 ? 0 : 3 }}>
                        {tab === 0 ? (
                            <Box sx={{ p: 4 }}>
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={7}>
                                        <NotificationForm onSuccess={() => setTab(1)} />
                                    </Grid>
                                    <Grid item xs={12} md={5}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 4,
                                                borderRadius: 3,
                                                bgcolor: 'action.hover',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                height: '100%'
                                            }}
                                        >
                                            <Typography variant="h6" fontWeight={700} gutterBottom>
                                                Best Practices
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={800} color="primary" gutterBottom>
                                                        CLEAR TITLES
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Use concise, action-oriented titles to capture immediate attention.
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={800} color="primary" gutterBottom>
                                                        CHOOSE THE RIGHT TYPE
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Use 'Critical' or 'Error' only for truly urgent messages to avoid fatigue.
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={800} color="primary" gutterBottom>
                                                        TARGETING
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Ensure your recipient role is correctly selected to avoid spamming.
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Box>
                        ) : (
                            <NotificationHistory />
                        )}
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default NotificationCenter;
