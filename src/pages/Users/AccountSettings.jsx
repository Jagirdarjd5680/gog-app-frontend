import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Switch,
    FormControlLabel,
    Stack,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    CircularProgress,
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import DevicesIcon from '@mui/icons-material/Devices';
import HistoryIcon from '@mui/icons-material/History';
import ComputerIcon from '@mui/icons-material/Computer';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LoginIcon from '@mui/icons-material/Login';
import BlockIcon from '@mui/icons-material/Block';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ACTIVITY_LABELS = {
    login: { label: 'Signed in', icon: <LoginIcon fontSize="small" color="success" /> },
    forced_logout: { label: 'Logged out — another device signed in', icon: <LogoutIcon fontSize="small" color="warning" /> },
    warning: { label: 'Warning — repeated device switching', icon: <CancelIcon fontSize="small" color="warning" /> },
    blocked: { label: 'Account blocked', icon: <BlockIcon fontSize="small" color="error" /> },
    unblocked: { label: 'Account unblocked', icon: <CheckCircleIcon fontSize="small" color="success" /> },
};

/** A device is "PC" if its label mentions a desktop browser, otherwise treated as the mobile app. */
const isDesktopDevice = (deviceLabel) => /chrome|firefox|edge|safari|windows|mac|linux/i.test(deviceLabel || '');

const SectionPaper = ({ icon, title, subtitle, children }) => (
    <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
            {icon}
            <Typography variant="h6" fontWeight={800}>{title}</Typography>
        </Stack>
        {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{subtitle}</Typography>
        )}
        <Box sx={{ mt: subtitle ? 0 : 2 }}>{children}</Box>
    </Paper>
);

const AccountSettings = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [savingTwoFactor, setSavingTwoFactor] = useState(false);
    const [status, setStatus] = useState(null);
    const [devices, setDevices] = useState([]);
    const [activity, setActivity] = useState([]);
    const [revokingId, setRevokingId] = useState(null);

    const fetchAll = async () => {
        try {
            const [statusRes, devicesRes, activityRes] = await Promise.all([
                api.get('/session/me/status'),
                api.get('/session/me/devices'),
                api.get('/session/me/activity'),
            ]);
            setStatus(statusRes.data.data);
            setDevices(devicesRes.data.data || []);
            setActivity(activityRes.data.data || []);
        } catch (err) {
            toast.error('Failed to load account settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleToggleTwoFactor = async (e) => {
        const enabled = e.target.checked;
        setSavingTwoFactor(true);
        try {
            const res = await api.post('/auth/me/two-factor', { enabled });
            if (res.data.success) {
                updateUser({ twoFactorEnabled: res.data.twoFactorEnabled });
                toast.success(enabled ? '2FA enabled — you\'ll need an email code on your next login.' : '2FA disabled');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update 2FA setting');
        } finally {
            setSavingTwoFactor(false);
        }
    };

    const handleRevokeDevice = async (sessionId) => {
        if (!window.confirm('Log out this device? It will need to sign in again.')) return;
        setRevokingId(sessionId);
        try {
            await api.post(`/session/me/devices/${sessionId}/revoke`);
            toast.success('Device logged out');
            setDevices((prev) => prev.filter((d) => d.id !== sessionId));
        } catch (err) {
            toast.error('Failed to log out that device');
        } finally {
            setRevokingId(null);
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 6, textAlign: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: 'auto' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={900}>Account Settings</Typography>
                <Typography variant="body2" color="text.secondary">
                    Security, sign-in devices, and account activity
                </Typography>
            </Box>

            <SectionPaper
                icon={<ShieldIcon color="primary" />}
                title="Two-Factor Authentication"
                subtitle="When enabled, logging in with your password also requires a 6-digit code emailed to you."
            >
                <FormControlLabel
                    control={<Switch checked={!!user?.twoFactorEnabled} onChange={handleToggleTwoFactor} disabled={savingTwoFactor} />}
                    label={user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                />
            </SectionPaper>

            {status?.isBlocked && (
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid', borderColor: 'error.light', bgcolor: 'error.50', mb: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <BlockIcon color="error" />
                        <Box>
                            <Typography variant="subtitle2" fontWeight={800} color="error.main">Account Blocked</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {status.blockedReason || 'Contact support for details.'}
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>
            )}

            <SectionPaper
                icon={<DevicesIcon color="primary" />}
                title="Signed-in Devices"
                subtitle="Only one device can be signed in at a time — logging in elsewhere signs this one out automatically."
            >
                {devices.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No active sessions found.</Typography>
                ) : (
                    <List sx={{ p: 0 }}>
                        {devices.map((d) => (
                            <ListItem
                                key={d.id}
                                sx={{ borderRadius: '10px', border: '1px solid', borderColor: 'divider', mb: 1 }}
                                secondaryAction={
                                    <Button
                                        size="small"
                                        color="error"
                                        startIcon={<LogoutIcon fontSize="small" />}
                                        onClick={() => handleRevokeDevice(d.id)}
                                        disabled={revokingId === d.id}
                                    >
                                        Log out
                                    </Button>
                                }
                            >
                                <ListItemIcon>
                                    {isDesktopDevice(d.deviceLabel) ? <ComputerIcon /> : <PhoneIphoneIcon />}
                                </ListItemIcon>
                                <ListItemText
                                    primary={d.deviceLabel || (isDesktopDevice(d.deviceLabel) ? 'PC / Browser' : 'Mobile App')}
                                    secondary={`Last active ${new Date(d.lastSeenAt).toLocaleString()} · IP ${d.ip || 'unknown'}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </SectionPaper>

            <SectionPaper icon={<HistoryIcon color="primary" />} title="Login Activity">
                {activity.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No activity recorded yet.</Typography>
                ) : (
                    <List sx={{ p: 0 }}>
                        {activity.map((a, idx) => {
                            const meta = ACTIVITY_LABELS[a.event] || { label: a.event, icon: <HistoryIcon fontSize="small" /> };
                            return (
                                <React.Fragment key={a.id ?? idx}>
                                    <ListItem sx={{ px: 0 }}>
                                        <ListItemIcon sx={{ minWidth: 36 }}>{meta.icon}</ListItemIcon>
                                        <ListItemText
                                            primary={meta.label}
                                            secondary={`${d(a.createdAt)} · ${a.deviceLabel || 'Unknown device'}`}
                                        />
                                    </ListItem>
                                    {idx < activity.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            );
                        })}
                    </List>
                )}
            </SectionPaper>
        </Box>
    );
};

const d = (v) => new Date(v).toLocaleString();

export default AccountSettings;
