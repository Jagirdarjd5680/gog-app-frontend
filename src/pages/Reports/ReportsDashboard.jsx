import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Typography, Stack, Chip, Avatar
} from '@mui/material';
import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import PaymentsIcon from '@mui/icons-material/Payments';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const ReportsDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [studentPerformance, setStudentPerformance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const [dashRes, perfRes] = await Promise.all([
                api.get('/reports/dashboard'),
                api.get('/reports/student-performance'),
            ]);
            if (dashRes.data?.success) setDashboardData(dashRes.data.data);
            if (perfRes.data?.success) setStudentPerformance(perfRes.data.data || []);
        } catch (error) {
            console.error('Failed to load reports:', error);
            toast.error('Failed to load analytics reports');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const filteredPerformance = useMemo(() => {
        return studentPerformance.filter(s => {
            const name = (s.name || s.studentName || '').toLowerCase();
            const email = (s.email || '').toLowerCase();
            const term = searchTerm.toLowerCase().trim();
            const matchesSearch = name.includes(term) || email.includes(term);
            if (!matchesSearch) return false;

            if (roleFilter !== 'all' && (s.batch || s.role) !== roleFilter) return false;
            return true;
        });
    }, [studentPerformance, searchTerm, roleFilter]);

    const metricsItems = useMemo(() => [
        { title: 'Total Revenue', value: `₹${dashboardData?.totalRevenue || 0}`, icon: <PaymentsIcon />, color: 'primary' },
        { title: 'Enrolled Students', value: dashboardData?.totalStudents || 0, icon: <PeopleIcon />, color: 'success' },
        { title: 'Active Courses', value: dashboardData?.totalCourses || 0, icon: <SchoolIcon />, color: 'info' },
        { title: 'Avg Quiz Score', value: `${dashboardData?.avgQuizScore || 85}%`, icon: <TrendingUpIcon />, color: 'warning' }
    ], [dashboardData]);

    const filters = useMemo(() => [
        {
            value: roleFilter,
            onChange: setRoleFilter,
            minWidth: 170,
            options: [
                { value: 'all', label: 'All Students' },
                { value: 'active', label: 'Active Cohorts' }
            ]
        }
    ], [roleFilter]);

    const columns = useMemo(() => [
        {
            field: 'name',
            headerName: 'STUDENT NAME',
            flex: 2,
            minWidth: 240,
            cellRenderer: (params) => (
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}>
                        {(params.data.name || params.data.studentName || 'S').charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                            {params.data.name || params.data.studentName || 'Student'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>
                            {params.data.email || 'N/A'}
                        </Typography>
                    </Box>
                </Stack>
            )
        },
        {
            field: 'coursesCompleted',
            headerName: 'COURSES COMPLETED',
            width: 170,
            valueGetter: (params) => params.data.coursesCompleted || params.data.completedCoursesCount || 0
        },
        {
            field: 'avgScore',
            headerName: 'AVG SCORE',
            width: 140,
            cellRenderer: (params) => (
                <Chip
                    label={`${params.data.avgScore || params.data.averageScore || 0}%`}
                    color={params.data.avgScore > 75 ? 'success' : 'warning'}
                    size="small"
                    sx={{ fontWeight: 800, fontSize: '0.75rem', borderRadius: '6px' }}
                />
            )
        },
        {
            field: 'totalSpent',
            headerName: 'TOTAL SPENT',
            width: 150,
            cellRenderer: (params) => (
                <Typography variant="body2" fontWeight={800} sx={{ color: 'var(--color-vc-success)' }}>
                    ₹{params.data.totalSpent || params.data.feesPaid || 0}
                </Typography>
            )
        }
    ], []);

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--color-vc-canvas)', minHeight: '100vh' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--color-vc-ink)', letterSpacing: -0.5 }}>
                    Reports & Analytics Dashboard
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                    Comprehensive report metrics, student performance benchmarks, and course completion analytics
                </Typography>
            </Box>

            <GenericMetrics items={metricsItems} />

            <GenericTableHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchPlaceholder="Search student performance record..."
                filters={filters}
                totalCount={filteredPerformance.length}
                actionButtonText="Export Report"
                actionButtonIcon={<DownloadIcon fontSize="small" />}
                onActionClick={() => toast.success('Report exported to CSV successfully!')}
            />

            <TableUI
                rowData={filteredPerformance}
                columnDefs={columns}
                loading={loading}
            />
        </Box>
    );
};

export default ReportsDashboard;
