// Reports Dashboard with dynamic theme support
import { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Tabs,
    Tab,
    Paper,
    Divider,
    Stack,
    CircularProgress,
    Fade
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import PaymentsIcon from '@mui/icons-material/Payments';
import DataTable from '../../components/Common/DataTable';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme as useAppTheme } from '../../context/ThemeContext';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const ReportsDashboard = () => {
    const { isDark } = useAppTheme();
    const [tabValue, setTabValue] = useState(0);
    const [dashboardData, setDashboardData] = useState(null);
    const [studentPerformance, setStudentPerformance] = useState([]);
    const [courseEngagement, setCourseEngagement] = useState([]);
    const [teacherActivity, setTeacherActivity] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const [dashRes, perfRes, engRes, actRes] = await Promise.all([
                api.get('/reports/dashboard'),
                api.get('/reports/student-performance'),
                api.get('/reports/course-engagement'),
                api.get('/reports/teacher-activity'),
            ]);

            if (dashRes.data.success) setDashboardData(dashRes.data.data);
            if (perfRes.data.success) setStudentPerformance(perfRes.data.data);
            if (engRes.data.success) setCourseEngagement(engRes.data.data);
            if (actRes.data.success) setTeacherActivity(actRes.data.data);
        } catch (error) {
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const muiTheme = useMuiTheme();
    const primaryColor = muiTheme.palette.primary.main;
    const secondaryColor = muiTheme.palette.secondary.main;

    const COLORS = [primaryColor, secondaryColor, '#00bcd4', '#4caf50', '#ff9800', '#f44336'];

    const StatCard = ({ title, value, icon, color, gradient }) => (
        <Card sx={{
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            background: gradient || (isDark ? 'linear-gradient(45deg, #1e1e1e, #2c2c2c)' : '#fff'),
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
            boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.05)'
        }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="overline" color="text.secondary" fontWeight={700}>
                            {title}
                        </Typography>
                        <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                            {value}
                        </Typography>
                    </Box>
                    <Box sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: color + '22',
                        color: color,
                        display: 'flex'
                    }}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    const ChartCard = ({ title, children, height = 300, hasData = true }) => (
        <Paper sx={{
            p: 3,
            borderRadius: 3,
            height: '100%',
            bgcolor: isDark ? '#1e1e1e' : '#fff',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
        }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                {title}
            </Typography>
            {hasData ? (
                <Box sx={{ width: '100%', height }}>
                    {children}
                </Box>
            ) : (
                <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary" variant="body2">No data available</Typography>
                </Box>
            )}
        </Paper>
    );

    const studentColumns = [
        { field: 'studentName', headerName: 'Student', flex: 1 },
        { field: 'studentEmail', headerName: 'Email', flex: 1 },
        { field: 'averageGrade', headerName: 'Avg Grade', valueFormatter: (params) => params.value?.toFixed(2) },
        { field: 'totalSubmissions', headerName: 'Submissions' },
    ];

    const courseColumns = [
        { field: 'title', headerName: 'Course', flex: 1 },
        { field: 'enrolledCount', headerName: 'Enrollments' },
        { field: 'rating', headerName: 'Rating', valueFormatter: (params) => params.value?.toFixed(1) },
        { field: 'totalReviews', headerName: 'Reviews' },
    ];

    const teacherColumns = [
        { field: 'teacherName', headerName: 'Teacher', flex: 1 },
        { field: 'teacherEmail', headerName: 'Email', flex: 1 },
        { field: 'coursesCreated', headerName: 'Courses' },
        { field: 'assignmentsCreated', headerName: 'Assignments' },
    ];

    if (loading && !dashboardData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Fade in timeout={800}>
            <Box>
                {/* Header Section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h3" fontWeight={800} sx={{
                            background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Analytics Dashboard
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Comprehensive insight into your learning management system.
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
                        onClick={() => toast.info('Generating PDF Report...')}
                    >
                        Export Report
                    </Button>
                </Box>

                {/* Top Stat Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Students"
                            value={dashboardData?.totalStudents}
                            icon={<PeopleIcon />}
                            color="#3f51b5"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Courses"
                            value={dashboardData?.totalCourses}
                            icon={<SchoolIcon />}
                            color="#2196f3"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Revenue (₹)"
                            value={dashboardData?.totalRevenue?.toLocaleString()}
                            icon={<PaymentsIcon />}
                            color="#4caf50"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Teachers"
                            value={dashboardData?.totalTeachers}
                            icon={<TrendingUpIcon />}
                            color="#ff9800"
                        />
                    </Grid>
                </Grid>

                {/* Main Charts Body */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Revenue Trend */}
                    <Grid item xs={12} md={8}>
                        <ChartCard title="Revenue Trend (Last 30 Days)" hasData={dashboardData?.revenueTrend?.length > 0}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dashboardData?.revenueTrend}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3f51b5" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3f51b5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#333' : '#eee'} />
                                    <XAxis dataKey="date" stroke={isDark ? '#777' : '#999'} fontSize={12} tickMargin={10} />
                                    <YAxis stroke={isDark ? '#777' : '#999'} fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDark ? '#1e1e1e' : '#fff',
                                            borderRadius: '8px',
                                            border: `1px solid ${isDark ? '#333' : '#ddd'}`
                                        }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#3f51b5" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </Grid>

                    {/* Enrollment Trend */}
                    <Grid item xs={12} md={4}>
                        <ChartCard title="User Status Distribution">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Students', value: dashboardData?.totalStudents },
                                            { name: 'Teachers', value: dashboardData?.totalTeachers }
                                        ]}
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {COLORS.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </Grid>

                    {/* Course Engagement Bar Chart */}
                    <Grid item xs={12}>
                        <ChartCard title="Top Performing Courses (by Enrollment)" hasData={courseEngagement.length > 0}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={courseEngagement.slice(0, 8)}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#333' : '#eee'} />
                                    <XAxis dataKey="title" stroke={isDark ? '#777' : '#999'} fontSize={10} angle={-15} textAnchor="end" interval={0} />
                                    <YAxis stroke={isDark ? '#777' : '#999'} fontSize={12} />
                                    <Tooltip />
                                    <Bar dataKey="enrolledCount" fill="#2196f3" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </Grid>
                </Grid>

                {/* Data Tables Section */}
                <Paper sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    bgcolor: isDark ? '#1e1e1e' : '#fff',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    mb: 4
                }}>
                    <Tabs
                        value={tabValue}
                        onChange={(e, newValue) => setTabValue(newValue)}
                        sx={{
                            px: 3,
                            pt: 2,
                            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' }
                        }}
                    >
                        <Tab label="Student Performance" sx={{ fontWeight: 700 }} />
                        <Tab label="Detailed Engagment" sx={{ fontWeight: 700 }} />
                        <Tab label="Teacher Audit" sx={{ fontWeight: 700 }} />
                    </Tabs>
                    <Divider />
                    <Box sx={{ p: 2 }}>
                        {tabValue === 0 && (
                            <DataTable
                                rowData={studentPerformance}
                                columnDefs={studentColumns}
                                loading={loading}
                                height={400}
                                enableGlobalSearch={false}
                            />
                        )}

                        {tabValue === 1 && (
                            <DataTable
                                rowData={courseEngagement}
                                columnDefs={courseColumns}
                                loading={loading}
                                height={400}
                                enableGlobalSearch={false}
                            />
                        )}

                        {tabValue === 2 && (
                            <DataTable
                                rowData={teacherActivity}
                                columnDefs={teacherColumns}
                                loading={loading}
                                height={400}
                                enableGlobalSearch={false}
                            />
                        )}
                    </Box>
                </Paper>
            </Box>
        </Fade>
    );
};

export default ReportsDashboard;
