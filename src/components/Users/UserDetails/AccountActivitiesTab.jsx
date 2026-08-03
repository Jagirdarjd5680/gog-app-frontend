import React, { useEffect, useState } from 'react';
import { Box, Typography, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip, CircularProgress } from '@mui/material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

import api from '../../../utils/api';

const eventMeta = {
    login: { label: 'LOGIN', bg: 'var(--color-vc-success-soft)', color: 'var(--color-vc-success-deep)' },
    forced_logout: { label: 'FORCED LOGOUT', bg: 'var(--color-vc-error-soft)', color: 'var(--color-vc-error-deep)' },
    warning: { label: 'WARNING', bg: 'var(--color-vc-warning-soft)', color: 'var(--color-vc-warning-deep)' },
    blocked: { label: 'BLOCKED', bg: 'var(--color-vc-error-soft)', color: 'var(--color-vc-error-deep)' },
    unblocked: { label: 'UNBLOCKED', bg: 'var(--color-vc-success-soft)', color: 'var(--color-vc-success-deep)' },
};

const headerCellSx = {
    fontWeight: 700,
    fontSize: '10px',
    color: 'var(--color-vc-mute)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid var(--color-vc-hairline)',
    bgcolor: 'var(--color-vc-canvas-soft)',
};

const AccountActivitiesTab = ({ userId }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userId) return;
        const fetchActivity = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/session/${userId}/activity`);
                if (response.data.success) setActivities(response.data.data || []);
            } catch (error) {
                toast.error('Failed to load account activity');
            } finally {
                setLoading(false);
            }
        };
        fetchActivity();
    }, [userId]);

    return (
        <Box>
            <Typography sx={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-vc-ink)', mb: 0.5, fontFamily: 'inherit' }}>
                Login Activity
            </Typography>
            <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)', mb: 3 }}>
                When this account logged in, from which device, and its IP address
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <CircularProgress size={24} sx={{ color: 'var(--color-vc-primary)' }} />
                </Box>
            ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '6px', borderColor: 'var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={headerCellSx}>Date</TableCell>
                                <TableCell sx={headerCellSx}>Event</TableCell>
                                <TableCell sx={headerCellSx}>Device</TableCell>
                                <TableCell sx={headerCellSx}>IP</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {activities.length > 0 ? activities.map((activity) => {
                                const meta = eventMeta[activity.event] || { label: activity.event, bg: 'var(--color-vc-canvas-soft)', color: 'var(--color-vc-mute)' };
                                return (
                                    <TableRow key={activity.id} hover sx={{ '&:hover': { bgcolor: 'var(--color-vc-canvas-soft)' } }}>
                                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', py: 1, fontSize: '11px', color: 'var(--color-vc-body)', fontFamily: '"JetBrains Mono", monospace' }}>
                                            {activity.createdAt && !isNaN(new Date(activity.createdAt).getTime()) ? format(new Date(activity.createdAt), 'PPp') : '-'}
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', py: 1 }}>
                                            <Chip
                                                label={meta.label}
                                                size="small"
                                                sx={{ fontWeight: 600, fontSize: '9px', borderRadius: '4px', height: 18, bgcolor: meta.bg, color: meta.color }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', py: 1, fontSize: '12px', color: 'var(--color-vc-body)' }}>
                                            {activity.deviceLabel || activity.deviceId || 'N/A'}
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', py: 1, fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--color-vc-mute)' }}>
                                            {activity.ip || 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                );
                            }) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                        <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '12px' }}>No activity recorded yet.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default AccountActivitiesTab;
