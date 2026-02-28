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

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        totalCourses: 0,
        totalRevenue: 0,
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
        fetchDashboardData();
    }, [dateRange]);

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

            const [reportRes, coursesRes] = await Promise.all([
                api.get(`/reports/dashboard?startDate=${startDate}&endDate=${endDate}`),
                api.get('/courses?limit=100')
            ]);

            if (reportRes.data.success) {
                const dashData = reportRes.data.data;

                // Build real enrollment trend from enrolledStudents in courses
                if (dashData.enrollmentTrend?.length === 0 && coursesRes.data?.data) {
                    const courses = coursesRes.data.data || [];
                    const totalEnrolled = courses.reduce((sum, c) => sum + (c.enrolledStudents?.length || 0), 0);
                    dashData.totalStudents = dashData.totalStudents || totalEnrolled;
                }

                setStats(dashData);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };




    return (
        <Box>
            <Box mb={4} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="primary" sx={{ mb: 1 }}>
                        Dashboard Overview
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Real-time analytics for your learning management system.
                    </Typography>
                </Box>

                <Paper sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <FilterListIcon color="action" />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Date Range</InputLabel>
                        <Select
                            value={dateRange}
                            label="Date Range"
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <MenuItem value="7">Last 7 Days</MenuItem>
                            <MenuItem value="30">Last 30 Days</MenuItem>
                            <MenuItem value="90">Last 90 Days</MenuItem>
                            <MenuItem value="custom">Custom Range</MenuItem>
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
                            />
                            <TextField
                                size="small"
                                type="date"
                                label="End Date"
                                InputLabelProps={{ shrink: true }}
                                value={customRange.end}
                                onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                            />
                            <Button variant="contained" size="small" onClick={handleCustomFilter}>
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
                    [...Array(4)].map((_, i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <MetricsCardSkeleton />
                        </Grid>
                    ))
                ) : (
                    <>
                        <Grid item xs={12} sm={6} md={3}>
                            <MetricsCard
                                title="Total Students"
                                value={stats.totalStudents}
                                icon={<PeopleIcon sx={{ fontSize: 32 }} />}
                                color="primary"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <MetricsCard
                                title="Total Users"
                                value={stats.totalTeachers}
                                icon={<PeopleIcon sx={{ fontSize: 32 }} />}
                                color="success"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <MetricsCard
                                title="Total Courses"
                                value={stats.totalCourses}
                                icon={<SchoolIcon sx={{ fontSize: 32 }} />}
                                color="info"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <MetricsCard
                                title="Total Revenue"
                                value={`₹${stats.totalRevenue?.toLocaleString()}`}
                                icon={<AttachMoneyIcon sx={{ fontSize: 32 }} />}
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

            {/* Activity Log & App Reviews */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <ActivityLog activities={stats.recentActivities || []} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <AppReviewSection />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
