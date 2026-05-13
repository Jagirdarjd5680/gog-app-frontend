import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Paper, Typography, Card, CardContent, 
  Switch, FormControlLabel, Button, Avatar, List, 
  ListItem, ListItemText, ListItemAvatar, Divider,
  Chip, IconButton, Stack
} from '@mui/material';
import { 
  Chat as ChatIcon, 
  CheckCircle as CheckIcon, 
  Cancel as CancelIcon,
  People as PeopleIcon,
  Timer as TimerIcon,
  Star as StarIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as ProfitIcon,
  History as HistoryIcon,
  Stars as PointsIcon,
  ArrowForward as ArrowIcon,
  Collections as GalleryIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import axios from '../../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const TutorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    rejected: 0,
    totalSessions: 0,
    rating: 0,
    recentReviews: []
  });
  const [tutorData, setTutorData] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentMedia, setRecentMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTutorStats();
  }, []);

  const fetchTutorStats = async () => {
    try {
      const [statsRes, reqRes, mediaRes] = await Promise.all([
        axios.get('/tutors/my-stats'),
        axios.get('/tutors/my-requests'),
        axios.get('/tutors/my-media')
      ]);
      
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setTutorData(statsRes.data.tutor);
      }
      if (reqRes.data.success) {
        setRecentRequests(reqRes.data.data);
      }
      if (mediaRes.data.success) {
        setRecentMedia(mediaRes.data.success ? mediaRes.data.data : []);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    try {
      const newStatus = tutorData.status === 'online' ? 'offline' : 'online';
      const { data } = await axios.put('/tutors/status', { status: newStatus });
      if (data.success) {
        setTutorData(prev => ({ ...prev, status: newStatus }));
        toast.success(`You are now ${newStatus}`);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Welcome, {user?.name}
      </Typography>
      
      <Grid container spacing={3}>
        {/* Status Toggle */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">Availability Status</Typography>
              <Typography variant="body2" color="text.secondary">
                {tutorData?.status === 'online' ? 'You are receiving requests' : 'You are currently offline'}
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch 
                  checked={tutorData?.status === 'online'} 
                  onChange={handleStatusToggle}
                  color="success"
                />
              }
              label={tutorData?.status === 'online' ? 'Online' : 'Offline'}
            />
          </Paper>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <StatCard title="Total Sessions" value={stats.totalSessions} icon={<PeopleIcon color="primary" />} />
            <StatCard title="Accepted" value={stats.accepted} icon={<CheckIcon color="success" />} />
            <StatCard 
              title="Earnings" 
              value={`${tutorData?.earnings || 0} pts`} 
              icon={<WalletIcon color="error" />} 
              onClick={() => window.location.href='/tutor/withdrawals'}
              sx={{ cursor: 'pointer', transition: '0.2s', '&:hover': { bgcolor: 'rgba(196, 12, 12, 0.05)', transform: 'translateY(-2px)' } }}
            />
            <StatCard title="Rating" value={stats.rating || 'N/A'} icon={<StarIcon color="warning" />} />
          </Grid>
        </Grid>

        {/* Financial Summary Card */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}>
              <ProfitIcon sx={{ fontSize: 120, color: '#C40C0C' }} />
            </Box>
            <Typography variant="h6" fontWeight="bold" mb={2}>Earnings Overview</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Available Balance</Typography>
                <Typography variant="h4" fontWeight="bold" color="#C40C0C">
                  {tutorData?.earnings || 0} Points
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  1 Point = ₹{tutorData?.charges?.perConversation || 0}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Minimum Withdrawal</Typography>
                  <Typography fontWeight="bold">{tutorData?.minWithdrawal || 5} Points</Typography>
                </Box>
                <Button 
                  variant="contained" 
                  color="error" 
                  size="small" 
                  onClick={() => window.location.href='/tutor/withdrawals'}
                  sx={{ borderRadius: 2 }}
                >
                  Withdraw Now
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Reviews Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Student Feedback</Typography>
            {stats.recentReviews?.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No reviews yet.</Typography>
            ) : (
              <List sx={{ p: 0 }}>
                {stats.recentReviews?.map((rev, i) => (
                  <Box key={i}>
                    <ListItem sx={{ px: 0, py: 1.5, alignItems: 'flex-start' }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" fontWeight="bold">{rev.student}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <StarIcon sx={{ fontSize: 16, color: '#FFD700' }} />
                              <Typography variant="caption" fontWeight="bold">{rev.score}</Typography>
                            </Box>
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" sx={{ my: 0.5 }}>"{rev.feedback}"</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(rev.date).toLocaleDateString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {i < stats.recentReviews.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Categorized Support Requests by Student */}
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon /> Recent Student Activities
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(
              recentRequests.reduce((acc, req) => {
                const sid = req.student?._id;
                if (!acc[sid]) acc[sid] = [];
                acc[sid].push(req);
                return acc;
              }, {})
            ).slice(0, 4).map(([sid, group]) => {
              const student = group[0].student;
              const earned = group.filter(r => ['accepted', 'active', 'completed'].includes(r.status)).length;
              return (
                <Grid item xs={12} sm={6} md={3} key={sid}>
                  <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Avatar src={student?.profileImage} sx={{ width: 40, height: 40 }}>
                          {student?.name?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold" noWrap sx={{ maxWidth: 120 }}>
                            {student?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {group.length} Requests
                          </Typography>
                        </Box>
                        <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: '#2e7d32', fontWeight: 'bold' }}>
                            <PointsIcon sx={{ fontSize: 14, mr: 0.2 }} /> +{earned}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Stack spacing={1}>
                        {group.slice(0, 2).map(req => (
                          <Box key={req._id} sx={{ p: 1, borderRadius: 1.5, bgcolor: 'action.hover', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" fontWeight="medium">{req.category}</Typography>
                            <Chip 
                              label={req.status} 
                              size="small" 
                              color={req.status === 'pending' ? 'warning' : 'success'} 
                              sx={{ height: 18, fontSize: '0.65rem' }} 
                            />
                          </Box>
                        ))}
                      </Stack>
                      
                      <Button 
                        fullWidth 
                        size="small" 
                        endIcon={<ArrowIcon fontSize="small" />}
                        sx={{ mt: 2, fontSize: '0.7rem', textTransform: 'none' }}
                        onClick={() => window.location.href='/tutor/live-requests'}
                      >
                        View Full History
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
            {recentRequests.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: 'action.hover' }}>
                  <Typography variant="body2" color="text.secondary">No recent student activities found.</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* Student Results / Media Gallery */}
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            <GalleryIcon /> Student Results & Uploads
          </Typography>
          
          {Object.entries(
            recentMedia.reduce((acc, item) => {
              const sid = item.sender?._id;
              if (!acc[sid]) acc[sid] = { student: item.sender, images: [] };
              acc[sid].images.push(item);
              return acc;
            }, {})
          ).map(([sid, data]) => (
            <Paper key={sid} sx={{ p: 2, borderRadius: 3, mb: 2, bgcolor: 'background.paper', border: '1px solid #eee' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar src={data.student?.profileImage} sx={{ width: 24, height: 24 }}>
                  {data.student?.name?.[0]}
                </Avatar>
                <Typography variant="subtitle2" fontWeight="bold">
                  {data.student?.name}'s Submissions
                </Typography>
                <Chip label={`${data.images.length} Files`} size="small" variant="outlined" sx={{ ml: 'auto', fontSize: '0.65rem' }} />
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { height: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#ddd', borderRadius: 3 } }}>
                {data.images.map((img, idx) => (
                  <Box key={idx} sx={{ minWidth: 120, maxWidth: 120, position: 'relative' }}>
                    <img 
                      src={img.image} 
                      alt="upload" 
                      style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }}
                      onClick={() => window.open(img.image, '_blank')}
                    />
                    <Typography variant="caption" sx={{ display: 'block', fontSize: '0.6rem', color: 'text.secondary', mt: 0.5, noWrap: true }}>
                      {new Date(img.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          ))}
          
          {recentMedia.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: 'action.hover' }}>
              <Typography variant="body2" color="text.secondary">No student uploads found yet.</Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

const StatCard = ({ title, value, icon, onClick, sx = {} }) => (
  <Grid item xs={6} sm={3}>
    <Paper 
      onClick={onClick}
      sx={{ 
        p: 2, 
        textAlign: 'center', 
        borderRadius: 3, 
        height: '100%',
        ...sx 
      }}
    >
      <Box sx={{ mb: 1 }}>{icon}</Box>
      <Typography variant="h5" fontWeight="bold">{value}</Typography>
      <Typography variant="caption" color="text.secondary">{title}</Typography>
    </Paper>
  </Grid>
);

export default TutorDashboard;
