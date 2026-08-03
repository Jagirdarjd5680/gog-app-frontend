import { useState, useEffect } from 'react';
import {
    Grid,
    Box,
    Typography,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Paper,
    TextField,
    Button
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FilterListIcon from '@mui/icons-material/FilterList';
import MetricsCard from '../../components/Dashboard/MetricsCard';
import ActivityLog from '../../components/Dashboard/ActivityLog';
import RevenueChart from '../../components/Dashboard/RevenueChart';
import EnrollmentChart from '../../components/Dashboard/EnrollmentChart';
import { MetricsCardSkeleton, ChartSkeleton } from '../../components/Common/SkeletonLoaders';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { format, subDays } from 'date-fns';
import AppReviewSection from '../../components/Dashboard/AppReviewSection';
import { useAuth } from '../../context/AuthContext';
import StudentDashboard from '../../components/Dashboard/StudentDashboard';
import RecentSubmissionsWidget from '../../components/Dashboard/RecentSubmissionsWidget';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        totalCourses: 0,
        totalRevenue: 0,
        pendingWithdrawals: 0,
        revenueTrend: [],
        enrollmentTrend: []
    });
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30'); // 7, 30, custom
    const [customRange, setCustomRange] = useState({
        start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });

    useEffect(() => {
        if (user?.role !== 'student') {
            fetchDashboardData();
        }
    }, [dateRange, user]);

    const handleCustomFilter = () => {
        fetchDashboardData();
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            let startDate, endDate;

            if (dateRange === 'custom') {
                startDate = customRange.start;
                endDate = customRange.end;
            } else {
                startDate = format(subDays(new Date(), parseInt(dateRange)), 'yyyy-MM-dd');
                endDate = format(new Date(), 'yyyy-MM-dd');
            }

            // Primary report data
            const reportRes = await api.get(`/reports/dashboard?startDate=${startDate}&endDate=${endDate}`);
            
            if (reportRes.data.success) {
                const dashData = reportRes.data.data;

                // Secondary data - handled separately to prevent failure cascade
                try {
                    const coursesRes = await api.get('/courses?limit=100');
                    if (dashData.enrollmentTrend?.length === 0 && coursesRes.data?.data) {
                        const courses = coursesRes.data.data || [];
                        const totalEnrolled = courses.reduce((sum, c) => sum + (c.enrolledStudents?.length || 0), 0);
                        dashData.totalStudents = dashData.totalStudents || totalEnrolled;
                    }
                } catch (e) {
                    
                }

                // Fetch withdrawals only for admin
                if (user?.role === 'admin') {
                    try {
                        const withdrawalRes = await api.get('/withdrawals/all?status=pending');
                        if (withdrawalRes.data.success) {
                            dashData.pendingWithdrawals = withdrawalRes.data.data?.length || 0;
                        }
                    } catch (e) {
                        
                    }
                }

                setStats(dashData);
            }
        } catch (error) {
            
            toast.error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
        } finally {
            setLoading(false);
        }
    };




    if (user?.role === 'student') {
        return <StudentDashboard />;
    }

    return (
        <Box>
            <Box mb={4} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography sx={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit', letterSpacing: '-0.02em', mb: 0.5 }}>
                        Dashboard Overview
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>
                        Real-time analytics for your learning management system.
                    </Typography>
                </Box>

                <Paper sx={{ 
                    p: 1.5, 
                    borderRadius: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5, 
                    flexWrap: 'wrap',
                    bgcolor: 'var(--color-vc-canvas)',
                    border: '1px solid var(--color-vc-hairline)',
                    boxShadow: 'none'
                }}>
                    <FilterListIcon sx={{ color: 'var(--color-vc-mute)', fontSize: 18 }} />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel sx={{ fontSize: '13px', fontFamily: 'inherit', color: 'var(--color-vc-mute)', '&.Mui-focused': { color: 'var(--color-vc-ink)' } }}>Date Range</InputLabel>
                        <Select
                            value={dateRange}
                            label="Date Range"
                            onChange={(e) => setDateRange(e.target.value)}
                            sx={{
                                height: 36,
                                fontSize: '13px',
                                fontFamily: 'inherit',
                                borderRadius: '6px',
                                color: 'var(--color-vc-ink)',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'var(--color-vc-hairline)',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'var(--color-vc-hairline-strong)',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'var(--color-vc-hairline-strong)',
                                }
                            }}
                        >
                            <MenuItem value="7" sx={{ fontSize: '13px', fontFamily: 'inherit' }}>Last 7 Days</MenuItem>
                            <MenuItem value="30" sx={{ fontSize: '13px', fontFamily: 'inherit' }}>Last 30 Days</MenuItem>
                            <MenuItem value="90" sx={{ fontSize: '13px', fontFamily: 'inherit' }}>Last 90 Days</MenuItem>
                            <MenuItem value="custom" sx={{ fontSize: '13px', fontFamily: 'inherit' }}>Custom Range</MenuItem>
                        </Select>
                    </FormControl>

                    {dateRange === 'custom' && (
                        <>
                            <TextField
                                size="small"
                                type="date"
                                label="Start Date"
                                InputLabelProps={{ shrink: true }}
                                value={customRange.start}
                                onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        height: 36,
                                        fontSize: '13px',
                                        borderRadius: '6px',
                                        color: 'var(--color-vc-ink)',
                                        bgcolor: 'var(--color-vc-canvas)',
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'var(--color-vc-hairline)',
                                    }
                                }}
                            />
                            <TextField
                                size="small"
                                type="date"
                                label="End Date"
                                InputLabelProps={{ shrink: true }}
                                value={customRange.end}
                                onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        height: 36,
                                        fontSize: '13px',
                                        borderRadius: '6px',
                                        color: 'var(--color-vc-ink)',
                                        bgcolor: 'var(--color-vc-canvas)',
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'var(--color-vc-hairline)',
                                    }
                                }}
                            />
                            <Button 
                                variant="contained" 
                                size="small" 
                                onClick={handleCustomFilter}
                                sx={{
                                    height: 36,
                                    bgcolor: 'var(--color-vc-primary)',
                                    color: 'var(--color-vc-on-primary)',
                                    borderRadius: '6px',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: '13px',
                                    px: 2,
                                    boxShadow: 'none',
                                    '&:hover': {
                                        bgcolor: 'var(--color-vc-primary)',
                                        opacity: 0.9,
                                        boxShadow: 'none'
                                    }
                                }}
                            >
                                Apply
                            </Button>
                        </>
                    )}
                </Paper>
            </Box>

            {/* Metrics Cards */}
            <Grid container spacing={3} mb={3}>
                {loading ? (
                    // Skeleton Loaders
                    [...Array(5)].map((_, i) => (
                        <Grid item xs={12} sm={6} md={2.4} key={i}>
                            <MetricsCardSkeleton />
                        </Grid>
                    ))
                ) : (
                    <>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <MetricsCard
                                title="Total Students"
                                value={stats.totalStudents}
                                icon={<PeopleIcon />}
                                color="primary"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <MetricsCard
                                title="Total Users"
                                value={stats.totalTeachers}
                                icon={<PeopleIcon />}
                                color="success"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <MetricsCard
                                title="Total Courses"
                                value={stats.totalCourses}
                                icon={<SchoolIcon />}
                                color="info"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <MetricsCard
                                title="Pending Payouts"
                                value={stats.pendingWithdrawals}
                                icon={<AttachMoneyIcon />}
                                color="error"
                                onClick={() => navigate('/withdrawal-requests')}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <MetricsCard
                                title="Total Revenue"
                                value={`₹${stats.totalRevenue?.toLocaleString()}`}
                                icon={<AttachMoneyIcon />}
                                color="warning"
                            />
                        </Grid>
                    </>
                )}
            </Grid>

            {/* Charts */}
            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={6}>
                    {loading ? (
                        <ChartSkeleton height={350} />
                    ) : (
                        <RevenueChart data={stats.revenueTrend} />
                    )}
                </Grid>
                <Grid item xs={12} md={6}>
                    {loading ? (
                        <ChartSkeleton height={350} />
                    ) : (
                        <EnrollmentChart data={stats.enrollmentTrend} />
                    )}
                </Grid>
            </Grid>

            {/* Activity Log, Recent Submissions & App Reviews */}
            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <ActivityLog activities={stats.recentActivities || []} />
                        </Grid>
                        <Grid item xs={12}>
                            <RecentSubmissionsWidget />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} lg={4}>
                    <AppReviewSection />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
