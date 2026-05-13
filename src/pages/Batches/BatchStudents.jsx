import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, IconButton, Avatar, Card,
    Stack, Divider, TextField, InputAdornment, Breadcrumbs, Link,
    CircularProgress, Chip, Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import MailIcon from '@mui/icons-material/Mail';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import DataTable from '../../components/Common/DataTable';
import api, { fixUrl } from '../../utils/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const BatchStudents = () => {
    const { batchId } = useParams();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [batch, setBatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchBatchAndStudents();
    }, [batchId]);

    const fetchBatchAndStudents = async () => {
        setLoading(true);
        try {
            const [batchRes, studentsRes] = await Promise.all([
                api.get(`/batches/${batchId}`),
                api.get(`/batches/${batchId}/students`)
            ]);

            if (batchRes.data.success) setBatch(batchRes.data.data);
            if (studentsRes.data.success) setStudents(studentsRes.data.data);
        } catch (error) {
            toast.error('Failed to load student data');
            navigate('/batches');
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = useMemo(() => {
        return students.filter(s =>
            s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [students, searchQuery]);

    const columnDefs = [
        {
            headerName: 'Student',
            field: 'name',
            flex: 2,
            cellRenderer: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                    <Avatar
                        src={fixUrl(params.data.profileImage)}
                        sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.85rem' }}
                    >
                        {params.data.name?.charAt(0)}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={700} noWrap>
                            {params.data.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                            {params.data.email}
                        </Typography>
                    </Box>
                </Box>
            )
        },
        {
            headerName: 'Roll Number',
            field: 'rollNumber',
            flex: 1,
            cellRenderer: (params) => (
                <Chip
                    label={params.value || 'N/A'}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                />
            )
        },
        {
            headerName: 'Contact',
            field: 'phoneNumber',
            flex: 1.2,
            cellRenderer: (params) => (
                <Stack spacing={0.2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                        <Typography variant="caption" fontWeight={600}>{params.value || 'N/A'}</Typography>
                    </Box>
                </Stack>
            )
        },
        {
            headerName: 'Enrolled On',
            field: 'enrollmentDate',
            flex: 1,
            valueFormatter: (params) => params.value ? format(new Date(params.value), 'PP') : format(new Date(params.data.createdAt), 'PP')
        },
        {
            headerName: 'Actions',
            width: 100,
            cellRenderer: (params) => (
                <Button
                    size="small"
                    variant="text"
                    onClick={() => navigate(`/users?search=${params.data.email}&openProfile=${params.data._id}`)}
                    sx={{ fontSize: '0.7rem', fontWeight: 700 }}
                >
                    View Profile
                </Button>
            )
        }
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* Header Area */}
            <Box sx={{ mb: 3 }}>
                <Breadcrumbs sx={{ mb: 1 }}>
                    <Link underline="hover" color="inherit" onClick={() => navigate('/batches')} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PersonIcon sx={{ fontSize: 16 }} /> Batches
                    </Link>
                    <Typography color="text.primary" fontWeight={600}>{batch?.name}</Typography>
                    <Typography color="text.primary">Students</Typography>
                </Breadcrumbs>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <IconButton onClick={() => navigate('/batches')} size="small">
                                <ArrowBackIcon />
                            </IconButton>
                            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-1px' }}>
                                Batch Students
                            </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 5 }}>
                            Showing all students enrolled in <b>{batch?.name}</b> ({batch?.course?.title})
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={2}>
                        <TextField
                            size="small"
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2, bgcolor: 'white', minWidth: 250 }
                            }}
                        />
                    </Stack>
                </Box>
            </Box>

            {/* Quick Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 2, borderRadius: 3, bgcolor: 'primary.soft', border: '1px solid', borderColor: 'primary.light' }}>
                        <Typography variant="caption" color="primary.main" fontWeight={800} sx={{ letterSpacing: 1 }}>
                            TOTAL STUDENTS
                        </Typography>
                        <Typography variant="h4" fontWeight={800} color="primary.main">
                            {students.length}
                        </Typography>
                    </Card>
                </Grid>
            </Grid>

            {/* Data Table */}
            <Box sx={{
                bgcolor: 'white',
                borderRadius: 4,
                p: 1,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid',
                borderColor: 'divider'
            }}>
                <DataTable
                    rowData={filteredStudents}
                    columnDefs={columnDefs}
                    pagination={true}
                    paginationPageSize={20}
                />
            </Box>
        </Box>
    );
};

export default BatchStudents;
