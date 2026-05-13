import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Chip,
    Stack,
    CircularProgress,
    Container,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    Search as SearchIcon,
    Group as GroupIcon,
    ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const AdminReferralList = () => {
    const [referrals, setReferrals] = useState([]);
    const [filteredReferrals, setFilteredReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchReferrals();
    }, []);

    useEffect(() => {
        const term = searchTerm.toLowerCase();
        const filtered = referrals.filter(r => 
            r.referrer?.name?.toLowerCase().includes(term) ||
            r.referredUser?.name?.toLowerCase().includes(term) ||
            r.referrer?.phone?.includes(term) ||
            r.referredUser?.phone?.includes(term)
        );
        setFilteredReferrals(filtered);
    }, [searchTerm, referrals]);

    const fetchReferrals = async () => {
        try {
            const res = await api.get('/referrals/admin/all');
            setReferrals(res.data.data);
            setFilteredReferrals(res.data.data);
        } catch (error) {
            toast.error('Failed to load referrals');
        } finally {
            setLoading(false);
        }
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'rewarded': return <Chip label="Rewarded" color="success" size="small" />;
            case 'purchased': return <Chip label="Purchased" color="primary" size="small" />;
            default: return <Chip label="Joined" color="warning" size="small" />;
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 4 }}>
            <Container maxWidth="lg">
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" fontWeight={900}>All Referrals</Typography>
                        <Typography variant="body2" color="text.secondary">View and track all student referrals in the system.</Typography>
                    </Box>
                    <TextField
                        placeholder="Search referrer or student..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                        sx={{ width: 300 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 3 }
                        }}
                    />
                </Box>

                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: 'action.hover' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 800 }}>Referrer (Invited By)</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800 }}></TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Student (Joined)</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredReferrals.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                                        <Typography color="text.secondary">No referrals found</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredReferrals.map((referral) => (
                                    <TableRow key={referral._id} hover>
                                        <TableCell>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar src={referral.referrer?.avatar} sx={{ bgcolor: 'primary.light' }}>
                                                    {referral.referrer?.name?.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={800}>{referral.referrer?.name || 'Unknown'}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{referral.referrer?.phone || referral.referrer?.email}</Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="center">
                                            <ArrowIcon color="action" fontSize="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar src={referral.referredUser?.avatar} sx={{ bgcolor: 'secondary.light' }}>
                                                    {referral.referredUser?.name?.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={800}>{referral.referredUser?.name || 'Unknown'}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{referral.referredUser?.phone || referral.referredUser?.email}</Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{getStatusChip(referral.status)}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{format(new Date(referral.createdAt), 'MMM dd, yyyy')}</Typography>
                                            <Typography variant="caption" color="text.secondary">{format(new Date(referral.createdAt), 'hh:mm a')}</Typography>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </Box>
    );
};

export default AdminReferralList;
