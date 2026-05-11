import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { 
    Box, 
    Typography, 
    Paper, 
    Grid, 
    Avatar, 
    Button, 
    IconButton, 
    TextField, 
    Card, 
    CardContent, 
    Divider, 
    List, 
    ListItem, 
    ListItemAvatar, 
    ListItemText, 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useTheme,
    Container,
    Stack,
    Tooltip,
    Zoom,
    LinearProgress
} from '@mui/material';
import { 
    GroupAdd as ReferralIcon, 
    ContentCopy as CopyIcon, 
    Share as ShareIcon, 
    Wallet as WalletIcon, 
    EmojiEvents as TrophyIcon,
    Stars as PointsIcon,
    Payments as PayoutIcon,
    ArrowForward as ArrowIcon,
    Pending as PendingIcon,
    Lock as LockIcon,
    ErrorOutline as ErrorIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { Badge } from '@mui/material';

const ReferralDashboard = () => {
    const theme = useTheme();
    const [stats, setStats] = useState({ isApproved: false, points: 0, walletBalance: 0, totalReferrals: 0, referralCode: '', joinRequestStatus: 'none', adminMessage: '' });
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [withdrawalData, setWithdrawalData] = useState({ upiId: '', amount: 100, points: 1000 });
    const [requesting, setRequesting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, leaderRes] = await Promise.all([
                api.get('/referrals/stats'),
                api.get('/referrals/leaderboard')
            ]);
            setStats(statsRes.data.data || statsRes.data);
            setLeaderboard(leaderRes.data.data || []);
        } catch (error) {
            toast.error('Failed to load referral data');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRequest = async () => {
        setRequesting(true);
        try {
            const res = await api.post('/referrals/join-request');
            if (res.data.success) {
                toast.success(res.data.message);
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit request');
        } finally {
            setRequesting(false);
        }
    };

    const copyCode = () => {
        if (!stats.referralCode) return;
        navigator.clipboard.writeText(stats.referralCode);
        toast.success('Referral code copied!');
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        if (stats.points < 1000) {
            return toast.error('Minimum 1000 points required');
        }
        try {
            await api.post('/referrals/withdraw', withdrawalData);
            toast.success('Withdrawal request submitted!');
            setShowWithdraw(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit request');
        }
    };

    if (loading) return <Box sx={{ p: 10, textAlign: 'center' }}><LinearProgress /></Box>;

    if (!stats.isApproved) {
        return (
            <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
                <Container maxWidth="sm">
                    <Paper elevation={0} sx={{ p: 6, borderRadius: 8, textAlign: 'center', boxShadow: '0 20px 50px -12px rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider' }}>
                        {stats.joinRequestStatus === 'pending' ? (
                            <Stack spacing={4} alignItems="center">
                                <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.50', color: 'primary.main' }}>
                                    <PendingIcon sx={{ fontSize: 60 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" fontWeight={900} gutterBottom>Application Pending</Typography>
                                    <Typography variant="body1" color="text.secondary">Our team is reviewing your request to join the referral program. We'll notify you once you're approved!</Typography>
                                </Box>
                                <Button variant="outlined" disabled size="large" sx={{ borderRadius: 4, px: 6, py: 1.5, fontWeight: 900 }}>Wait for Approval</Button>
                            </Stack>
                        ) : stats.joinRequestStatus === 'rejected' ? (
                            <Stack spacing={4} alignItems="center">
                                <Avatar sx={{ width: 100, height: 100, bgcolor: 'error.50', color: 'error.main' }}>
                                    <ErrorIcon sx={{ fontSize: 60 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" fontWeight={900} gutterBottom>Request Rejected</Typography>
                                    {stats.adminMessage && (
                                        <Box sx={{ p: 2, bgcolor: 'error.50', borderRadius: 4, mb: 2, border: '1px solid', borderColor: 'error.100' }}>
                                            <Typography variant="caption" fontWeight={900} color="error.main">ADMIN NOTE:</Typography>
                                            <Typography variant="body2" color="error.dark">{stats.adminMessage}</Typography>
                                        </Box>
                                    )}
                                    <Typography variant="body1" color="text.secondary">Unfortunately, your request was not approved at this time. You can contact support for more details.</Typography>
                                </Box>
                                <Button variant="contained" onClick={handleJoinRequest} disabled={requesting} color="primary" size="large" sx={{ borderRadius: 4, px: 6, py: 1.5, fontWeight: 900 }}>Re-apply Now</Button>
                            </Stack>
                        ) : (
                            <Stack spacing={4} alignItems="center">
                                <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main', color: 'white', boxShadow: '0 20px 40px -10px rgba(37, 99, 235, 0.4)' }}>
                                    <LockIcon sx={{ fontSize: 60 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" fontWeight={900} gutterBottom>Refer & Earn Program</Typography>
                                    <Typography variant="body1" color="text.secondary">Join our exclusive referral program to earn points and rewards by inviting your friends to the platform.</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'left', width: '100%', bgcolor: 'action.hover', p: 3, borderRadius: 6 }}>
                                    <Typography variant="subtitle2" fontWeight={800} gutterBottom>Program Benefits:</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>• Earn points for every successful signup.</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>• Extra points on course purchases.</Typography>
                                    <Typography variant="body2" color="text.secondary">• Redeem points for real cash via UPI.</Typography>
                                </Box>
                                <Button variant="contained" onClick={handleJoinRequest} disabled={requesting} size="large" sx={{ borderRadius: 4, px: 6, py: 1.5, fontWeight: 900, fontSize: '1.1rem' }}>
                                    {requesting ? 'Submitting...' : 'Apply to Join Now'}
                                </Button>
                            </Stack>
                        )}
                    </Paper>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Left Column: Stats & Referral Info */}
                    <Grid item xs={12} lg={7}>
                        {/* Premium Referral Card */}
                        <Paper elevation={0} sx={{ 
                            p: 4, 
                            borderRadius: 6, 
                            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            mb: 4,
                            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)'
                        }}>
                            <Box sx={{ position: 'absolute', top: -20, right: -20, width: 200, height: 200, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '50%' }} />
                            
                            <Stack spacing={3}>
                                <Box>
                                    <Typography variant="h4" fontWeight={900}>Refer & Earn Rewards</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.7, maxWidth: 400 }}>Invite your friends to God of Graphics and earn points for every signup and course purchase.</Typography>
                                </Box>

                                <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 800, letterSpacing: 1 }}>YOUR REFERRAL CODE</Typography>
                                        <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: 4 }}>{stats.referralCode}</Typography>
                                    </Box>
                                    <Stack direction="row" spacing={1}>
                                        <IconButton onClick={copyCode} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                                            <CopyIcon />
                                        </IconButton>
                                        <Button variant="contained" startIcon={<ShareIcon />} sx={{ bgcolor: 'white', color: 'black', fontWeight: 800, borderRadius: 2, '&:hover': { bgcolor: '#f1f5f9' } }}>Share</Button>
                                    </Stack>
                                </Paper>

                                <Grid container spacing={2}>
                                    <Grid item xs={4}>
                                        <Typography variant="h4" fontWeight={900}>{stats.totalReferrals}</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>FRIENDS JOINED</Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="h4" fontWeight={900}>{stats.points}</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>TOTAL POINTS</Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="h4" fontWeight={900}>₹{stats.walletBalance}</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>REDEEMED</Typography>
                                    </Grid>
                                </Grid>
                            </Stack>
                        </Paper>

                        {/* Payout Banner */}
                        <Card variant="outlined" sx={{ borderRadius: 6, border: '2px solid', borderColor: 'primary.light', bgcolor: 'rgba(37, 99, 235, 0.02)' }}>
                            <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.3)' }}>
                                    <WalletIcon sx={{ fontSize: 32 }} />
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" fontWeight={800}>Redeem for Real Cash</Typography>
                                    <Typography variant="body2" color="text.secondary">Every 1000 points can be converted to ₹100 instantly via UPI.</Typography>
                                </Box>
                                <Button variant="contained" onClick={() => setShowWithdraw(true)} sx={{ borderRadius: 3, fontWeight: 800, px: 3 }}>Withdraw</Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Right Column: Leaderboard Snippet */}
                    <Grid item xs={12} lg={5}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                                <Typography variant="h6" fontWeight={900}>Top Referrers</Typography>
                                <TrophyIcon color="warning" />
                            </Box>

                            <List sx={{ p: 0 }}>
                                {leaderboard.slice(0, 5).map((user, index) => (
                                    <ListItem key={index} sx={{ p: 1.5, mb: 1, borderRadius: 3, '&:hover': { bgcolor: '#f1f5f9' } }}>
                                        <ListItemAvatar>
                                            <Badge badgeContent={index + 1} color={index < 3 ? "warning" : "default"} overlap="circular">
                                                <Avatar src={`https://ui-avatars.com/api/?name=${user.name}`} sx={{ borderRadius: 2 }} />
                                            </Badge>
                                        </ListItemAvatar>
                                        <ListItemText 
                                            primary={<Typography fontWeight={800}>{user.name}</Typography>} 
                                            secondary={<Typography variant="caption" fontWeight={700} color="text.disabled">{user.count} REFERRALS</Typography>} 
                                        />
                                        <Typography variant="subtitle2" fontWeight={900} color="primary">{user.count * 100} pts</Typography>
                                    </ListItem>
                                ))}
                            </List>
                            <Button fullWidth variant="text" sx={{ mt: 2, fontWeight: 800, borderRadius: 3 }}>View Full Leaderboard</Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* Withdraw Dialog */}
            <Dialog open={showWithdraw} onClose={() => setShowWithdraw(false)} PaperProps={{ sx: { borderRadius: 6, p: 2 } }}>
                <DialogTitle sx={{ fontWeight: 900 }}>Withdraw Rewards</DialogTitle>
                <form onSubmit={handleWithdraw}>
                    <DialogContent>
                        <Stack spacing={3}>
                            <Box sx={{ p: 2, bgcolor: '#fef3c7', borderRadius: 3, border: '1px solid #fbbf24' }}>
                                <Typography variant="caption" fontWeight={900} color="#92400e">POINT BALANCE: {stats.points}</Typography>
                                <Typography variant="h6" fontWeight={900} color="#92400e">≈ ₹{(stats.points / 10).toFixed(2)}</Typography>
                            </Box>
                            <TextField label="UPI ID" fullWidth required placeholder="example@okaxis" value={withdrawalData.upiId} onChange={(e) => setWithdrawalData({...withdrawalData, upiId: e.target.value})} />
                            <TextField label="Points to Redeem" type="number" fullWidth required helperText="1000 points = ₹100" value={withdrawalData.points} onChange={(e) => setWithdrawalData({...withdrawalData, points: parseInt(e.target.value), amount: parseInt(e.target.value) / 10})} />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setShowWithdraw(false)} color="inherit" sx={{ fontWeight: 800 }}>Cancel</Button>
                        <Button type="submit" variant="contained" sx={{ px: 4, borderRadius: 3, fontWeight: 800 }}>Confirm Payout</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default ReferralDashboard;
