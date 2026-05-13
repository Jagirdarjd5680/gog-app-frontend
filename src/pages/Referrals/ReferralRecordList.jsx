import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Avatar, Chip,
    Stack, CircularProgress, Container, TextField, InputAdornment,
    Button, IconButton, Tooltip
} from '@mui/material';
import {
    Search as SearchIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    ArrowForward as ArrowIcon,
    Groups as GroupsIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const ReferralRecordList = () => {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchReferrals();
    }, []);

    const fetchReferrals = async () => {
        try {
            const res = await api.get('/referrals/admin/all');
            setReferrals(res.data.data);
        } catch (error) {
            toast.error('Failed to load referrals');
        } finally {
            setLoading(false);
        }
    };

    const processReferral = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this referral?`)) return;
        
        setProcessingId(id);
        try {
            const res = await api.put(`/referrals/admin/records/${id}/process`, { status });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchReferrals();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredReferrals = referrals.filter(r => 
        r.referrer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.referredUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.referrer?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.referredUser?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.referrer?.phone?.includes(searchTerm) ||
        r.referredUser?.phone?.includes(searchTerm)
    );

    const getStatusChip = (status) => {
        switch (status) {
            case 'rewarded':
            case 'approved': return <Chip label="Rewarded" color="success" size="small" variant="filled" sx={{ fontWeight: 700 }} />;
            case 'rejected': return <Chip label="Rejected" color="error" size="small" variant="filled" sx={{ fontWeight: 700 }} />;
            case 'joined':
            case 'pending':
            default: return <Chip label="Pending Review" color="warning" size="small" variant="filled" sx={{ fontWeight: 700 }} />;
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
            <Container maxWidth="xl">
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                            <Box sx={{ bgcolor: 'primary.main', p: 1, borderRadius: 2, display: 'flex' }}>
                                <GroupsIcon sx={{ color: 'white' }} />
                            </Box>
                            <Typography variant="h4" fontWeight={900} sx={{ color: 'text.primary' }}>Referral Points Requests</Typography>
                        </Stack>
                        <Typography variant="body1" color="text.secondary">Verify signups and distribute rewards manually.</Typography>
                    </Box>
                    <TextField
                        placeholder="Search by name, roll #, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                        sx={{ 
                            width: { xs: '100%', sm: 400 }, 
                            bgcolor: 'white', 
                            borderRadius: 3,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                '& fieldset': { borderColor: 'divider' },
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="primary" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <TableContainer sx={{ maxHeight: '70vh' }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 800, bgcolor: '#f1f3f4' }}>Referrer (Requested By)</TableCell>
                                    <TableCell align="center" sx={{ bgcolor: '#f1f3f4' }}></TableCell>
                                    <TableCell sx={{ fontWeight: 800, bgcolor: '#f1f3f4' }}>New Student (Joined)</TableCell>
                                    <TableCell sx={{ fontWeight: 800, bgcolor: '#f1f3f4' }}>Request Date</TableCell>
                                    <TableCell sx={{ fontWeight: 800, bgcolor: '#f1f3f4' }}>Status</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800, bgcolor: '#f1f3f4' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredReferrals.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                            <Box sx={{ opacity: 0.5 }}>
                                                <GroupsIcon sx={{ fontSize: 60, mb: 2 }} />
                                                <Typography variant="h6">No referral records found</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredReferrals.map((referral) => (
                                        <TableRow key={referral._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar 
                                                        src={referral.referrer?.avatar} 
                                                        sx={{ 
                                                            width: 52, 
                                                            height: 52, 
                                                            bgcolor: 'primary.main', 
                                                            fontWeight: 900,
                                                            border: '2px solid white',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                            fontSize: '1.2rem'
                                                        }}
                                                    >
                                                        {referral.referrer?.name?.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight={900} sx={{ color: '#1a237e', lineHeight: 1.2 }}>
                                                            {referral.referrer?.name || 'Unknown'}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: '#d32f2f', fontWeight: 900, mt: 0.5, fontSize: '0.85rem' }}>
                                                            ROLL: {referral.referrer?.rollNumber || 'N/A'}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', fontWeight: 800, fontSize: '0.8rem' }}>
                                                            📞 {referral.referrer?.phone || 'No Phone'}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem' }}>
                                                            ✉️ {referral.referrer?.email || 'No Email'}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ bgcolor: 'divider', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <ArrowIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar 
                                                        src={referral.referredUser?.avatar} 
                                                        sx={{ 
                                                            width: 52, 
                                                            height: 52, 
                                                            bgcolor: 'secondary.main', 
                                                            fontWeight: 900,
                                                            border: '2px solid white',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                            fontSize: '1.2rem'
                                                        }}
                                                    >
                                                        {referral.referredUser?.name?.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight={900} sx={{ color: '#1a237e', lineHeight: 1.2 }}>
                                                            {referral.referredUser?.name || 'Unknown'}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: '#d32f2f', fontWeight: 900, mt: 0.5, fontSize: '0.85rem' }}>
                                                            ROLL: {referral.referredUser?.rollNumber || 'N/A'}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', fontWeight: 800, fontSize: '0.8rem' }}>
                                                            📞 {referral.referredUser?.phone || 'No Phone'}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem' }}>
                                                            ✉️ {referral.referredUser?.email || 'No Email'}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={800} color="text.primary">{format(new Date(referral.createdAt), 'MMM dd, yyyy')}</Typography>
                                                <Typography variant="caption" fontWeight={700} color="text.secondary">{format(new Date(referral.createdAt), 'hh:mm a')}</Typography>
                                            </TableCell>
                                            <TableCell>{getStatusChip(referral.status)}</TableCell>
                                            <TableCell align="right">
                                                {['pending', 'joined'].includes(referral.status) ? (
                                                    <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            color="success"
                                                            startIcon={processingId === referral._id ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
                                                            onClick={() => processReferral(referral._id, 'approved')}
                                                            disabled={processingId === referral._id}
                                                            sx={{ 
                                                                fontWeight: 900, 
                                                                borderRadius: 2,
                                                                textTransform: 'none',
                                                                boxShadow: '0 4px 10px rgba(76, 175, 80, 0.3)'
                                                            }}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            color="error"
                                                            startIcon={processingId === referral._id ? <CircularProgress size={16} color="inherit" /> : <CancelIcon />}
                                                            onClick={() => processReferral(referral._id, 'rejected')}
                                                            disabled={processingId === referral._id}
                                                            sx={{ 
                                                                fontWeight: 900, 
                                                                borderRadius: 2,
                                                                textTransform: 'none',
                                                                boxShadow: '0 4px 10px rgba(244, 67, 54, 0.3)'
                                                            }}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </Stack>
                                                ) : (
                                                    <Box sx={{ textAlign: 'right', p: 1, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 2 }}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', fontWeight: 800 }}>
                                                            Processed ✅
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.primary' }}>
                                                            {format(new Date(referral.updatedAt), 'MMM dd, yyyy')}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Container>
        </Box>
    );
};

export default ReferralRecordList;
