import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Typography, Stack, Avatar, Chip, IconButton
} from '@mui/material';
import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import GroupsIcon from '@mui/icons-material/Groups';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { format } from 'date-fns';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const ReferralRecordList = () => {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchReferrals = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/referrals/admin/all');
            const data = res.data?.data || res.data || [];
            setReferrals(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load referrals:', error);
            toast.error('Failed to load referral records');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReferrals();
    }, [fetchReferrals]);

    const processReferral = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this referral?`)) return;
        try {
            const res = await api.put(`/referrals/admin/records/${id}/process`, { status });
            if (res.data.success) {
                toast.success(res.data.message || `Referral ${status}`);
                fetchReferrals();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const filteredReferrals = useMemo(() => {
        return referrals.filter(r => {
            const referrerName = (r.referrer?.name || '').toLowerCase();
            const referredName = (r.referredUser?.name || '').toLowerCase();
            const referrerPhone = (r.referrer?.phone || '').toLowerCase();
            const referredPhone = (r.referredUser?.phone || '').toLowerCase();
            const term = searchTerm.toLowerCase().trim();

            const matchesSearch = referrerName.includes(term) || referredName.includes(term) || referrerPhone.includes(term) || referredPhone.includes(term);
            if (!matchesSearch) return false;

            if (statusFilter !== 'all' && (r.status || 'pending') !== statusFilter) return false;
            return true;
        });
    }, [referrals, searchTerm, statusFilter]);

    const metricsItems = useMemo(() => [
        { title: 'Total Referrals', value: referrals.length, icon: <GroupsIcon />, color: 'primary' },
        { title: 'Pending Review', value: referrals.filter(r => r.status === 'pending' || r.status === 'joined').length, icon: <PendingActionsIcon />, color: 'warning' },
        { title: 'Rewarded Bonuses', value: referrals.filter(r => r.status === 'rewarded' || r.status === 'approved').length, icon: <CheckCircleIcon />, color: 'success' },
        { title: 'Rejected', value: referrals.filter(r => r.status === 'rejected').length, icon: <CancelIcon />, color: 'error' }
    ], [referrals]);

    const filterConfigs = useMemo(() => [
        {
            key: 'status',
            label: 'Status',
            options: [
                { value: 'all', label: 'All Statuses' },
                { value: 'pending', label: 'Pending Review' },
                { value: 'rewarded', label: 'Rewarded' },
                { value: 'rejected', label: 'Rejected' }
            ]
        }
    ], []);

    const filterValues = useMemo(() => ({ status: statusFilter }), [statusFilter]);
    const filterSetters = useMemo(() => ({ status: setStatusFilter }), []);

    const columns = useMemo(() => [
        {
            field: 'referrer',
            headerName: 'REFERRER STUDENT',
            flex: 1.5,
            minWidth: 200,
            cellRenderer: (params) => {
                const user = params.data.referrer || {};
                const name = user.name || 'N/A';
                const email = user.email || user.phone || 'N/A';
                return (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}>
                            {name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                                {name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>
                                {email}
                            </Typography>
                        </Box>
                    </Stack>
                );
            }
        },
        {
            field: 'referredUser',
            headerName: 'REFERRED JOINEE',
            flex: 1.5,
            minWidth: 200,
            cellRenderer: (params) => {
                const user = params.data.referredUser || {};
                const name = user.name || 'N/A';
                const email = user.email || user.phone || 'N/A';
                return (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'info.main', fontSize: 13, fontWeight: 700 }}>
                            {name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                                {name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>
                                {email}
                            </Typography>
                        </Box>
                    </Stack>
                );
            }
        },
        {
            field: 'rewardAmount',
            headerName: 'REWARD BONUS',
            width: 140,
            cellRenderer: (params) => (
                <Typography variant="body2" fontWeight={800} sx={{ color: 'var(--color-vc-success)' }}>
                    ₹{params.data.rewardAmount || params.data.amount || 0}
                </Typography>
            )
        },
        {
            field: 'status',
            headerName: 'STATUS',
            width: 140,
            cellRenderer: (params) => {
                const status = params.data.status || 'pending';
                const isRewarded = status === 'rewarded' || status === 'approved';
                const isRejected = status === 'rejected';
                return (
                    <Chip
                        label={isRewarded ? 'REWARDED' : isRejected ? 'REJECTED' : 'PENDING'}
                        color={isRewarded ? 'success' : isRejected ? 'error' : 'warning'}
                        size="small"
                        sx={{ fontWeight: 800, fontSize: '0.7rem', borderRadius: '6px' }}
                    />
                );
            }
        },
        {
            field: 'createdAt',
            headerName: 'DATE',
            width: 160,
            valueGetter: (params) => {
                const d = params.data.createdAt;
                return d ? format(new Date(d), 'MMM dd, yyyy') : 'N/A';
            }
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 140,
            cellRenderer: (params) => {
                const id = params.data._id || params.data.id;
                const status = params.data.status || 'pending';
                if (status === 'rewarded' || status === 'approved') {
                    return <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>Processed</Typography>;
                }
                return (
                    <Stack direction="row" spacing={1}>
                        <IconButton
                            size="small"
                            onClick={() => processReferral(id, 'approved')}
                            sx={{ color: 'var(--color-vc-success)' }}
                            title="Approve Bonus"
                        >
                            <CheckCircleIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={() => processReferral(id, 'rejected')}
                            sx={{ color: 'var(--color-vc-error)' }}
                            title="Reject Bonus"
                        >
                            <CancelIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                );
            }
        }
    ], []);

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--color-vc-canvas)', minHeight: '100vh' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--color-vc-ink)', letterSpacing: -0.5 }}>
                    Referral Points Requests
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                    Verify signups and distribute referral reward bonuses manually
                </Typography>
            </Box>

            <GenericMetrics items={metricsItems} />

            <GenericTableHeader
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                searchPlaceholder="Search referrer or joinee student name..."
                filterConfigs={filterConfigs}
                filterValues={filterValues}
                filterSetters={filterSetters}
            />

            <TableUI
                rowData={filteredReferrals}
                columnDefs={columns}
                loading={loading}
            />
        </Box>
    );
};

export default ReferralRecordList;
