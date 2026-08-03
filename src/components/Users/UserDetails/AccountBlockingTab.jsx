import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack, Button, Chip, CircularProgress } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

import api from '../../../utils/api';

const InfoRow = ({ label, value }) => (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 1, borderBottom: '1px solid var(--color-vc-hairline)' }}>
        <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)' }}>{label}</Typography>
        <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-ink)', fontWeight: 600, fontFamily: '"JetBrains Mono", monospace' }}>{value}</Typography>
    </Stack>
);

const AccountBlockingTab = ({ userId }) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/session/${userId}/status`);
            if (response.data.success) setStatus(response.data.data);
        } catch (error) {
            toast.error('Failed to load account status');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) fetchStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const handleUnblock = async () => {
        setActionLoading(true);
        try {
            const response = await api.post(`/session/${userId}/unblock`);
            if (response.data.success) {
                toast.success('Account unblocked');
                fetchStatus();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to unblock account');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress size={24} sx={{ color: 'var(--color-vc-primary)' }} />
            </Box>
        );
    }

    if (!status) return null;

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography sx={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-vc-ink)', display: 'flex', alignItems: 'center', gap: 1, fontFamily: 'inherit' }}>
                        {status.isBlocked
                            ? <LockIcon sx={{ color: 'var(--color-vc-error-deep)', fontSize: 18 }} />
                            : <LockOpenIcon sx={{ color: 'var(--color-vc-success-deep)', fontSize: 18 }} />}
                        Account Status
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)' }}>
                        Single-device login enforcement and blocking state for this account
                    </Typography>
                </Box>
                {status.isBlocked && (
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleUnblock}
                        disabled={actionLoading}
                        sx={{
                            textTransform: 'none',
                            fontSize: '12px',
                            fontWeight: 500,
                            fontFamily: 'inherit',
                            borderRadius: '6px',
                            boxShadow: 'none',
                            bgcolor: 'var(--color-vc-primary)',
                            color: 'var(--color-vc-on-primary)',
                            '&:hover': { bgcolor: 'var(--color-vc-primary)', opacity: 0.9, boxShadow: 'none' },
                        }}
                    >
                        {actionLoading ? 'Unblocking...' : 'Unblock Account'}
                    </Button>
                )}
            </Stack>

            <Box sx={{ borderRadius: '6px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ py: 1 }}>
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)' }}>Status</Typography>
                    <Chip
                        label={status.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                        size="small"
                        sx={{
                            fontWeight: 600,
                            fontSize: '9px',
                            borderRadius: '4px',
                            height: 18,
                            bgcolor: status.isBlocked ? 'var(--color-vc-error-soft)' : 'var(--color-vc-success-soft)',
                            color: status.isBlocked ? 'var(--color-vc-error-deep)' : 'var(--color-vc-success-deep)',
                        }}
                    />
                </Stack>
                <InfoRow label="Forced-logout strikes" value={`${status.forcedLogoutStrikes ?? 0} / 3`} />
                <InfoRow
                    label="Blocked at"
                    value={status.blockedAt && !isNaN(new Date(status.blockedAt).getTime()) ? format(new Date(status.blockedAt), 'PPp') : '—'}
                />
                <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)' }}>Blocked reason</Typography>
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-ink)', maxWidth: '60%', textAlign: 'right' }}>
                        {status.blockedReason || '—'}
                    </Typography>
                </Stack>
            </Box>
        </Box>
    );
};

export default AccountBlockingTab;
