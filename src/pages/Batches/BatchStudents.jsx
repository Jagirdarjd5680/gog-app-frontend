import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Avatar,
    Stack,
    Chip,
    Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import api, { fixUrl } from '../../utils/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const BatchStudents = () => {
    const { batchId } = useParams();
    const navigate = useNavigate();
    
    const [students, setStudents] = useState([]);
    const [batch, setBatch] = useState(null);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchBatchAndStudents = useCallback(async () => {
        setLoading(true);
        try {
            const [batchRes, studentsRes] = await Promise.all([
                api.get(`/batches/${batchId}?t=${Date.now()}`),
                api.get(`/batches/${batchId}/students?t=${Date.now()}`),
            ]);

            if (batchRes.data.success || batchRes.data.data) {
                setBatch(batchRes.data.data || batchRes.data);
            }
            if (studentsRes.data.success || Array.isArray(studentsRes.data.data)) {
                setStudents(studentsRes.data.data || []);
            }
        } catch (error) {
            toast.error('Failed to load student data');
            navigate('/batches');
        } finally {
            setLoading(false);
        }
    }, [batchId, navigate]);

    useEffect(() => {
        fetchBatchAndStudents();
    }, [fetchBatchAndStudents]);

    // Filtered Students
    const filteredStudents = useMemo(() => {
        return students.filter((s) => {
            const name = (s.name || '').toLowerCase();
            const email = (s.email || '').toLowerCase();
            const roll = (s.rollNumber || '').toLowerCase();
            const phone = (s.phone || s.phoneNumber || '').toLowerCase();
            const search = searchTerm.toLowerCase().trim();

            const matchesSearch = name.includes(search) || email.includes(search) || roll.includes(search) || phone.includes(search);
            if (!matchesSearch) return false;

            if (statusFilter !== 'all') {
                if (statusFilter === 'active' && s.isActive === false) return false;
                if (statusFilter === 'inactive' && s.isActive !== false) return false;
            }

            return true;
        });
    }, [students, searchTerm, statusFilter]);

    // Metrics Items for GenericMetrics
    const metricsItems = useMemo(() => {
        const totalEnrolled = students.length;
        const capacity = batch?.maxStudents || 50;
        const activeCount = students.filter((s) => s.isActive !== false).length;

        return [
            { title: 'Enrolled Students', value: totalEnrolled, icon: <PeopleIcon />, color: 'primary' },
            { title: 'Cohort Capacity', value: `${totalEnrolled} / ${capacity}`, icon: <SchoolIcon />, color: 'info' },
            { title: 'Active Students', value: activeCount, icon: <CheckCircleIcon />, color: 'success' },
            { title: 'Associated Course', value: batch?.course?.title || 'General', icon: <PersonIcon />, color: 'warning' },
        ];
    }, [students, batch]);

    // Filter Configs for GenericTableHeader
    const filterConfigs = useMemo(() => [
        {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
                { value: 'all', label: 'Every Status' },
                { value: 'active', label: 'Active Students' },
                { value: 'inactive', label: 'Inactive Students' },
            ],
        },
    ], [statusFilter]);

    // Column Definitions for TableUI
    const columnDefs = useMemo(() => [
        {
            field: 'name',
            headerName: 'Student Name & Email',
            flex: 1.5,
            cellRenderer: ({ data }) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                    <Avatar
                        src={fixUrl(data.profileImage || data.avatar)}
                        sx={{
                            width: 34,
                            height: 34,
                            bgcolor: 'var(--color-vc-primary)',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: 'var(--color-vc-on-primary)',
                        }}
                    >
                        {data.name?.charAt(0) || 'S'}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-vc-ink)' }}>
                            {data.name}
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)' }}>
                            {data.email}
                        </Typography>
                    </Box>
                </Box>
            ),
        },
        {
            field: 'rollNumber',
            headerName: 'Roll Number',
            flex: 1,
            cellRenderer: ({ data }) => (
                <Chip
                    label={data.rollNumber || 'N/A'}
                    size="small"
                    sx={{
                        fontWeight: 600,
                        fontSize: '11px',
                        height: 24,
                        bgcolor: 'var(--color-vc-canvas-soft)',
                        color: 'var(--color-vc-body)',
                        borderRadius: '4px',
                    }}
                />
            ),
        },
        {
            field: 'phone',
            headerName: 'Contact Number',
            flex: 1.2,
            cellRenderer: ({ data }) => {
                const phoneNum = data.phone || data.phoneNumber || 'N/A';
                return (
                    <Stack direction="row" alignItems="center" spacing={0.8}>
                        <PhoneIcon sx={{ fontSize: 14, color: 'var(--color-vc-mute)' }} />
                        <Typography sx={{ fontSize: '13px', color: 'var(--color-vc-body)' }}>
                            {phoneNum}
                        </Typography>
                    </Stack>
                );
            },
        },
        {
            field: 'enrollmentDate',
            headerName: 'Enrolled Date',
            flex: 1,
            valueFormatter: ({ value, data }) => {
                const d = value || data.createdAt;
                return d ? format(new Date(d), 'MMM dd, yyyy') : 'N/A';
            },
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 140,
            cellRenderer: ({ data }) => (
                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/users?search=${encodeURIComponent(data.email || data.name)}`)}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        height: 28,
                        borderRadius: '4px',
                        color: 'var(--color-vc-primary)',
                        borderColor: 'var(--color-vc-hairline)',
                        '&:hover': {
                            bgcolor: 'var(--color-vc-canvas-soft)',
                            borderColor: 'var(--color-vc-primary)',
                        },
                    }}
                >
                    View Profile
                </Button>
            ),
        },
    ], [navigate]);

    const backButton = useMemo(() => (
        <Button
            variant="outlined"
            startIcon={<ArrowBackIcon fontSize="small" />}
            onClick={() => navigate('/batches')}
            sx={{
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '13px',
                fontFamily: 'inherit',
                borderRadius: '6px',
                height: 36,
                color: 'var(--color-vc-body)',
                borderColor: 'var(--color-vc-hairline)',
                bgcolor: 'var(--color-vc-canvas)',
                '&:hover': {
                    bgcolor: 'var(--color-vc-canvas-soft)',
                    borderColor: 'var(--color-vc-hairline-strong)',
                },
            }}
        >
            Back to Batches
        </Button>
    ), [navigate]);

    return (
        <Box sx={{ p: 0.5 }}>
            {/* Header Title Banner */}
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                <IconButton onClick={() => navigate('/batches')} size="small" sx={{ border: '1px solid var(--color-vc-hairline)', borderRadius: '6px', height: 36, width: 36, color: 'var(--color-vc-mute)', bgcolor: 'var(--color-vc-canvas)' }}>
                    <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Box>
                    <Typography sx={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit', lineHeight: 1.2 }}>
                        Students in Cohort: {batch?.name || 'Loading...'}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>
                        {batch?.course?.title ? `Course: ${batch.course.title}` : 'Managing batch cohort enrollments and student profiles'}
                    </Typography>
                </Box>
            </Stack>

            {/* Top Metrics Cards (Same shared component) */}
            <GenericMetrics items={metricsItems} />

            {/* Table UI Container */}
            <Box sx={{ bgcolor: 'transparent', px: 0 }}>
                <GenericTableHeader
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    searchPlaceholder="Search batch students by name, email, roll number..."
                    filters={filterConfigs}
                    totalCount={filteredStudents.length}
                    extraElement={backButton}
                />

                <TableUI
                    rowData={filteredStudents}
                    columnDefs={columnDefs}
                    loading={loading}
                    pagination={true}
                    paginationPageSize={10}
                    getRowId={useCallback((row) => row?._id || row?.id || Math.random().toString(), [])}
                />
            </Box>
        </Box>
    );
};

export default BatchStudents;
