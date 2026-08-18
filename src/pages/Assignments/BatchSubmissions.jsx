import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Button, Stack, Chip, Avatar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import StudentSubmissionsModal from '../../components/Assignments/StudentSubmissionsModal';

const BatchSubmissions = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const batchId = searchParams.get('batchId');
    const studentIdParam = searchParams.get('studentId');

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    // Tracked by id, not the object itself, so a refetch after grading (onGraded below)
    // re-derives the modal's data from the freshly-fetched list instead of showing stale grades.
    const [selectedStudentId, setSelectedStudentId] = useState(null);

    const fetchSubmissions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/assignments/batch/${batchId}/submissions`);
            const subData = res.data?.data || res.data || null;
            setData(subData);
        } catch (error) {
            console.error('Failed to load submissions:', error);
            toast.error('Failed to load batch assignment submissions');
        } finally {
            setLoading(false);
        }
    }, [batchId]);

    useEffect(() => {
        if (batchId) {
            fetchSubmissions();
        } else {
            setLoading(false);
        }
    }, [batchId, fetchSubmissions]);

    // Deep-link support: AllSubmissions' "Grade" action navigates here with both
    // batchId and studentId, expecting that student's submissions to open directly.
    useEffect(() => {
        if (!studentIdParam || !data?.students) return;
        const student = data.students.find((s) => (s._id || s.id)?.toString() === studentIdParam);
        if (student) setSelectedStudentId(student._id || student.id);
    }, [studentIdParam, data]);

    const selectedStudent = useMemo(
        () => data?.students?.find((s) => (s._id || s.id)?.toString() === selectedStudentId?.toString()) || null,
        [data, selectedStudentId]
    );

    const students = data?.students || [];

    const filteredStudents = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        const matched = term
            ? students.filter(s =>
                (s.name || '').toLowerCase().includes(term) ||
                (s.email || '').toLowerCase().includes(term) ||
                (s.rollNumber || '').toLowerCase().includes(term)
            )
            : students;
        return [...matched].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [students, searchTerm]);

    const metricsItems = useMemo(() => {
        const totalSubmissions = students.reduce((sum, s) => sum + (s.submissions?.length || 0), 0);
        const graded = students.reduce((sum, s) => sum + (s.submissions?.filter(sub => sub.status === 'graded').length || 0), 0);
        return [
            { title: 'Students', value: students.length, icon: <PeopleIcon />, color: 'primary' },
            { title: 'Total Submissions', value: totalSubmissions, icon: <AssignmentTurnedInIcon />, color: 'info' },
            { title: 'Graded', value: graded, icon: <CheckCircleIcon />, color: 'success' },
            { title: 'Pending', value: totalSubmissions - graded, icon: <PendingActionsIcon />, color: 'warning' },
        ];
    }, [students]);

    const columnDefs = useMemo(() => [
        {
            field: 'name',
            headerName: 'Student Name & Email',
            flex: 1.5,
            cellRenderer: ({ data }) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                    <Avatar
                        src={data.profileImage}
                        sx={{ width: 34, height: 34, bgcolor: 'var(--color-vc-primary)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-vc-on-primary)' }}
                    >
                        {data.name?.charAt(0) || 'S'}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-vc-ink)' }}>
                            {data.name}
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)' }}>
                            {data.email || 'No email'}
                        </Typography>
                    </Box>
                </Box>
            ),
        },
        {
            field: 'rollNumber',
            headerName: 'Roll Number',
            flex: 0.8,
            cellRenderer: ({ data }) => (
                <Chip
                    label={data.rollNumber || 'N/A'}
                    size="small"
                    sx={{ fontWeight: 600, fontSize: '11px', height: 24, bgcolor: 'var(--color-vc-canvas-soft)', color: 'var(--color-vc-body)', borderRadius: '4px' }}
                />
            ),
        },
        {
            field: 'submissions',
            headerName: 'Submissions',
            flex: 1,
            cellRenderer: ({ data }) => {
                const count = data.submissions?.length || 0;
                return (
                    <Chip
                        label={`${count} Submitted`}
                        size="small"
                        color={count > 0 ? 'success' : 'warning'}
                        sx={{ fontWeight: 700, fontSize: '11px', borderRadius: '6px' }}
                    />
                );
            },
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            cellRenderer: ({ data }) => (
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon fontSize="small" />}
                    onClick={() => setSelectedStudentId(data._id || data.id)}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        height: 28,
                        borderRadius: '4px',
                        color: 'var(--color-vc-primary)',
                        borderColor: 'var(--color-vc-hairline)',
                        '&:hover': { bgcolor: 'var(--color-vc-canvas-soft)', borderColor: 'var(--color-vc-primary)' },
                    }}
                >
                    View Submissions
                </Button>
            ),
        },
    ], []);

    return (
        <Box sx={{ p: 0.5 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                <IconButton
                    onClick={() => navigate('/assignments')}
                    size="small"
                    sx={{ border: '1px solid var(--color-vc-hairline)', borderRadius: '6px', height: 36, width: 36, color: 'var(--color-vc-mute)', bgcolor: 'var(--color-vc-canvas)' }}
                >
                    <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Box>
                    <Typography sx={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit', lineHeight: 1.2 }}>
                        {data?.batchName ? `${data.batchName} - Submissions` : 'Batch Assignment Submissions'}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>
                        Grade student submissions, view submitted attachments, and give feedback
                    </Typography>
                </Box>
            </Stack>

            <GenericMetrics items={metricsItems} />

            <Box sx={{ bgcolor: 'transparent', px: 0 }}>
                <GenericTableHeader
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    searchPlaceholder="Search student name, email, or roll number..."
                    totalCount={filteredStudents.length}
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

            <StudentSubmissionsModal
                open={Boolean(selectedStudentId)}
                onClose={() => setSelectedStudentId(null)}
                student={selectedStudent}
                onGraded={fetchSubmissions}
            />
        </Box>
    );
};

export default BatchSubmissions;
