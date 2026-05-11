import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { 
    Box, 
    Typography, 
    Paper, 
    Grid, 
    Avatar, 
    Tab, 
    Tabs, 
    CircularProgress, 
    useTheme, 
    Card, 
    CardContent,
    Chip,
    Divider,
    Container,
    Fade,
    Zoom,
    IconButton
} from '@mui/material';
import { 
    EmojiEvents as TrophyIcon, 
    Whatshot as FlameIcon, 
    Star as StarIcon, 
    TrendingUp as TrendingUpIcon,
    MilitaryTech as MedalIcon,
    NavigateBefore as ChevronLeftIcon,
    NavigateNext as ChevronRightIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

const Leaderboard = () => {
    const theme = useTheme();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'points';
    
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleTabChange = (event, newValue) => {
        setSearchParams({ tab: newValue });
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'points' 
                ? '/gamification/leaderboard/points' 
                : '/gamification/leaderboard/streaks';
            const res = await api.get(endpoint);
            setData(res.data.data);
        } catch (error) {
            toast.error('Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading && data.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f8fafc' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ py: 6, px: 3, minHeight: '100vh', background: 'linear-gradient(180deg, #f1f5f9 0%, #ffffff 100%)' }}>
            <Container maxWidth="lg">
                {/* Header Section */}
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Zoom in={true}>
                        <Avatar sx={{ bgcolor: 'amber.400', width: 80, height: 80, mx: 'auto', mb: 2, boxShadow: '0 10px 30px -5px rgba(251, 191, 36, 0.4)' }}>
                            <TrophyIcon sx={{ fontSize: 48, color: 'white' }} />
                        </Avatar>
                    </Zoom>
                    <Typography variant="h3" fontWeight={900} gutterBottom sx={{ background: 'linear-gradient(90deg, #1e293b 0%, #64748b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Community Leaderboards
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
                        Celebrating our top performers and most consistent learners.
                    </Typography>
                </Box>

                {/* Tab Selection */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
                    <Paper elevation={0} sx={{ p: 0.5, borderRadius: 4, bgcolor: 'rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }}>
                        <Tabs 
                            value={activeTab} 
                            onChange={handleTabChange} 
                            centered 
                            sx={{ '& .MuiTabs-indicator': { display: 'none' } }}
                        >
                            <Tab 
                                label="Referral Points" 
                                value="points" 
                                icon={<StarIcon sx={{ fontSize: 18 }} />} 
                                iconPosition="start"
                                sx={{ borderRadius: 3, px: 4, minHeight: 48, fontWeight: 800, '&.Mui-selected': { bgcolor: 'primary.main', color: 'white' } }}
                            />
                            <Tab 
                                label="Daily Streaks" 
                                value="streaks" 
                                icon={<FlameIcon sx={{ fontSize: 18 }} />} 
                                iconPosition="start"
                                sx={{ borderRadius: 3, px: 4, minHeight: 48, fontWeight: 800, '&.Mui-selected': { bgcolor: 'orange.600', color: 'white' } }}
                            />
                        </Tabs>
                    </Paper>
                </Box>

                {/* Podium Section */}
                {data.length > 0 && (
                    <Grid container spacing={3} alignItems="flex-end" sx={{ mb: 10, px: 4, justifyContent: 'center' }}>
                        {/* 2nd Place */}
                        {data.length >= 2 && (
                            <Grid item xs={12} sm={4}>
                                <Fade in={true} style={{ transitionDelay: '200ms' }}>
                                    <Box sx={{ textAlign: 'center', p: 3 }}>
                                        <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                                            <Avatar 
                                                src={data[1].avatar || `https://ui-avatars.com/api/?name=${data[1].name}`} 
                                                sx={{ width: 100, height: 100, border: '4px solid #94a3b8', boxShadow: theme.shadows[10] }} 
                                            />
                                            <Chip label="2" sx={{ position: 'absolute', bottom: -10, right: -10, bgcolor: '#94a3b8', color: 'white', fontWeight: 900, fontSize: '1.2rem', height: 32, width: 32, borderRadius: 1 }} />
                                        </Box>
                                        <Typography variant="h6" fontWeight={800} noWrap>{data[1].name}</Typography>
                                        <Typography variant="body2" color="primary" fontWeight={900}>
                                            {activeTab === 'points' ? `${data[1].points} PTS` : `${data[1].streaks?.current || 0} DAYS`}
                                        </Typography>
                                        <Paper elevation={0} sx={{ mt: 3, height: 100, background: 'linear-gradient(180deg, #cbd5e1 0%, #f1f5f9 100%)', borderRadius: '24px 24px 0 0', border: '1px solid', borderColor: '#94a3b8' }} />
                                    </Box>
                                </Fade>
                            </Grid>
                        )}

                        {/* 1st Place */}
                        {data.length >= 1 && (
                            <Grid item xs={12} sm={4} sx={{ order: { xs: -1, sm: 0 } }}>
                                <Fade in={true}>
                                    <Box sx={{ textAlign: 'center', p: 3, transform: { sm: 'translateY(-20px)' } }}>
                                        <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                                            <TrophyIcon sx={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', fontSize: 40, color: '#fbbf24', animation: 'bounce 2s infinite' }} />
                                            <Avatar 
                                                src={data[0].avatar || `https://ui-avatars.com/api/?name=${data[0].name}`} 
                                                sx={{ width: 140, height: 140, border: '4px solid #fbbf24', boxShadow: '0 20px 40px -10px rgba(251, 191, 36, 0.4)' }} 
                                            />
                                            <Chip label="1" sx={{ position: 'absolute', bottom: -12, right: -12, bgcolor: '#fbbf24', color: 'black', fontWeight: 900, fontSize: '1.5rem', height: 40, width: 40, borderRadius: 1.5, border: '4px solid white' }} />
                                        </Box>
                                        <Typography variant="h5" fontWeight={900} noWrap>{data[0].name}</Typography>
                                        <Typography variant="h6" color="primary.main" fontWeight={900}>
                                            {activeTab === 'points' ? `${data[0].points} PTS` : `${data[0].streaks?.current || 0} DAYS`}
                                        </Typography>
                                        <Paper elevation={0} sx={{ mt: 3, height: 160, background: 'linear-gradient(180deg, #fde68a 0%, #fef3c7 100%)', borderRadius: '32px 32px 0 0', border: '1px solid', borderColor: '#fbbf24' }} />
                                    </Box>
                                </Fade>
                            </Grid>
                        )}

                        {/* 3rd Place */}
                        {data.length >= 3 && (
                            <Grid item xs={12} sm={4}>
                                <Fade in={true} style={{ transitionDelay: '400ms' }}>
                                    <Box sx={{ textAlign: 'center', p: 3 }}>
                                        <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                                            <Avatar 
                                                src={data[2].avatar || `https://ui-avatars.com/api/?name=${data[2].name}`} 
                                                sx={{ width: 100, height: 100, border: '4px solid #ea580c', boxShadow: theme.shadows[10] }} 
                                            />
                                            <Chip label="3" sx={{ position: 'absolute', bottom: -10, right: -10, bgcolor: '#ea580c', color: 'white', fontWeight: 900, fontSize: '1.2rem', height: 32, width: 32, borderRadius: 1 }} />
                                        </Box>
                                        <Typography variant="h6" fontWeight={800} noWrap>{data[2].name}</Typography>
                                        <Typography variant="body2" color="primary" fontWeight={900}>
                                            {activeTab === 'points' ? `${data[2].points} PTS` : `${data[2].streaks?.current || 0} DAYS`}
                                        </Typography>
                                        <Paper elevation={0} sx={{ mt: 3, height: 80, background: 'linear-gradient(180deg, #fed7aa 0%, #fff7ed 100%)', borderRadius: '24px 24px 0 0', border: '1px solid', borderColor: '#ea580c' }} />
                                    </Box>
                                </Fade>
                            </Grid>
                        )}
                    </Grid>
                )}

                {/* List View for Rank 4+ */}
                <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
                    {data.slice(3).map((user, i) => (
                        <Fade key={user._id} in={true} style={{ transitionDelay: `${i * 50}ms` }}>
                            <Card variant="outlined" sx={{ mb: 2, borderRadius: 3, transition: 'all 0.2s', '&:hover': { transform: 'scale(1.01)', borderColor: 'primary.main', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)' } }}>
                                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '12px 24px !important' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                        <Typography variant="body2" fontWeight={900} color="text.disabled" sx={{ width: 30 }}>#{i + 4}</Typography>
                                        <Avatar src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} sx={{ width: 44, height: 44, borderRadius: 2 }} />
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight={800}>{user.name}</Typography>
                                            <Typography variant="caption" color="text.secondary" fontWeight={700}>LEVEL {Math.floor((user.points || 0) / 500) + 1}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="h6" fontWeight={900} color={activeTab === 'points' ? 'primary.main' : 'orange.700'}>
                                            {activeTab === 'points' ? `${user.points} PTS` : `${user.streaks?.current || 0} DAYS`}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}>
                                            <TrendingUpIcon sx={{ fontSize: 14 }} />
                                            <Typography variant="caption" fontWeight={800}>STABLE</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Fade>
                    ))}

                    {data.length === 0 && !loading && (
                        <Box sx={{ textAlign: 'center', py: 10, opacity: 0.5 }}>
                            <StarIcon sx={{ fontSize: 48, mb: 2 }} />
                            <Typography variant="h6" fontWeight={700}>No data found for this period</Typography>
                        </Box>
                    )}
                </Box>
            </Container>

            <style>
                {`
                    @keyframes bounce {
                        0%, 20%, 50%, 80%, 100% {transform: translateY(0) translateX(-50%);}
                        40% {transform: translateY(-10px) translateX(-50%);}
                        60% {transform: translateY(-5px) translateX(-50%);}
                    }
                `}
            </style>
        </Box>
    );
};

export default Leaderboard;
