import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Avatar,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
    Container,
    Stack
} from '@mui/material';
import {
    CardGiftcard as GiftIcon,
    TrendingUp as TrendingUpIcon,
    History as HistoryIcon,
    ArrowUpward as ArrowUpIcon,
    ArrowDownward as ArrowDownIcon,
    Schedule as ClockIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as XCircleIcon,
    AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import socket, { connectSocket } from '../../realtime/socketClient';

const STATUS_STYLES = {
    approved: { bg: 'rgba(16, 185, 129, 0.1)', color: '#059669' },
    pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#b45309' },
    rejected: { bg: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' },
};

const StatCard = ({ icon, iconColor, iconBg, label, value, sub }) => (
    <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', bgcolor: 'var(--color-vc-canvas-soft, #fff)', border: '1px solid var(--color-vc-hairline, rgba(0,0,0,0.08))', height: '100%' }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Avatar sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: iconBg, color: iconColor }}>
                {icon}
            </Avatar>
            <Typography variant="caption" fontWeight={800} sx={{ color: 'var(--color-vc-mute, text.secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>
                {label}
            </Typography>
        </Stack>
        <Typography variant="h4" fontWeight={900} sx={{ color: 'var(--color-vc-ink, text.primary)' }}>{value}</Typography>
        <Typography variant="caption" sx={{ color: 'var(--color-vc-mute, text.secondary)' }}>{sub}</Typography>
    </Paper>
);

const MyRewards = () => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [stats, setStats] = useState({ points: 0, walletBalance: 0, totalReferrals: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();

        connectSocket();
        const handleRealtimeUpdate = (payload) => {
            if (payload?.type === 'REFERRAL_UPDATED') fetchData();
        };
        socket.on('realtime_update', handleRealtimeUpdate);
        return () => socket.off('realtime_update', handleRealtimeUpdate);
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, withRes] = await Promise.all([
                api.get('/referrals/stats'),
                api.get('/referrals/my-withdrawals')
            ]);
            setStats(statsRes.data.data);
            setWithdrawals(withRes.data.data);
        } catch (error) {
            toast.error('Failed to load rewards data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Box sx={{ p: 10, textAlign: 'center' }}><LinearProgress /></Box>;

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--color-vc-canvas, #f8fafc)', minHeight: '100vh' }}>
            <Container maxWidth="lg" disableGutters>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--color-vc-ink, text.primary)', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GiftIcon color="primary" /> My Rewards
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--color-vc-mute, text.secondary)' }}>
                        Track your points, earnings and withdrawals
                    </Typography>
                </Box>

                <Grid container spacing={2.5} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                        <StatCard
                            icon={<TrendingUpIcon />}
                            iconColor="#2563eb"
                            iconBg="rgba(37, 99, 235, 0.1)"
                            label="Total Points"
                            value={stats.points}
                            sub={`Value: ₹${(stats.points / 10).toFixed(2)}`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <StatCard
                            icon={<WalletIcon />}
                            iconColor="#059669"
                            iconBg="rgba(16, 185, 129, 0.1)"
                            label="Wallet Balance"
                            value={`₹${stats.walletBalance}`}
                            sub="Available for withdrawal"
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <StatCard
                            icon={<ArrowUpIcon />}
                            iconColor="#7c3aed"
                            iconBg="rgba(124, 58, 237, 0.1)"
                            label="Total Referrals"
                            value={stats.totalReferrals}
                            sub="Successful invites"
                        />
                    </Grid>
                </Grid>

                <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid var(--color-vc-hairline, rgba(0,0,0,0.08))', overflow: 'hidden' }}>
                    <Box sx={{ p: 2.5, borderBottom: '1px solid var(--color-vc-hairline, rgba(0,0,0,0.08))', bgcolor: 'var(--color-vc-canvas-soft, #f8fafc)' }}>
                        <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'var(--color-vc-ink, text.primary)', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <HistoryIcon fontSize="small" sx={{ color: 'var(--color-vc-mute, text.secondary)' }} /> Withdrawal History
                        </Typography>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ '& th': { fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--color-vc-mute, text.secondary)', bgcolor: 'var(--color-vc-canvas-soft, #f8fafc)' } }}>
                                    <TableCell>Transaction Details</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Reference</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {withdrawals.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ py: 8, textAlign: 'center' }}>
                                            <Stack alignItems="center" spacing={1}>
                                                <ClockIcon sx={{ fontSize: 40, opacity: 0.2 }} />
                                                <Typography variant="caption" fontWeight={800} sx={{ color: 'var(--color-vc-mute, text.secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>
                                                    No withdrawal history yet
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    withdrawals.map((w) => {
                                        const style = STATUS_STYLES[w.status] || STATUS_STYLES.pending;
                                        return (
                                            <TableRow key={w._id} hover>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        <Avatar sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: style.bg, color: style.color }}>
                                                            {w.status === 'approved' ? <ArrowDownIcon fontSize="small" /> : <ArrowUpIcon fontSize="small" />}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink, text.primary)' }}>Points Redemption</Typography>
                                                            <Typography variant="caption" sx={{ color: 'var(--color-vc-mute, text.secondary)', fontFamily: 'monospace' }}>{w.upiId}</Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={800} sx={{ color: 'var(--color-vc-ink, text.primary)' }}>₹{w.amount}</Typography>
                                                    <Typography variant="caption" sx={{ color: 'var(--color-vc-mute, text.secondary)' }}>{w.points} Points</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        icon={w.status === 'pending' ? <ClockIcon sx={{ fontSize: 14 }} /> : w.status === 'approved' ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <XCircleIcon sx={{ fontSize: 14 }} />}
                                                        label={w.status}
                                                        sx={{ bgcolor: style.bg, color: style.color, fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption" fontWeight={700} sx={{ color: 'var(--color-vc-mute, text.secondary)' }}>
                                                        {new Date(w.createdAt).toLocaleDateString()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {w.transactionId ? (
                                                        <Chip size="small" label={w.transactionId} sx={{ fontFamily: 'monospace', fontSize: '0.65rem', bgcolor: 'var(--color-vc-canvas-soft, #f1f5f9)' }} />
                                                    ) : (
                                                        <Typography variant="caption" sx={{ color: 'var(--color-vc-mute, text.disabled)', fontStyle: 'italic' }}>Processing...</Typography>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Container>
        </Box>
    );
};

export default MyRewards;
