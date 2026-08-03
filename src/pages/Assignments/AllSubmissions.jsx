import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TableUI from '../../components/UI/Table/TableUI';
import { Button, Card, Badge, Heading, Text } from '../../components/UI';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import { format } from 'date-fns';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const AllSubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchSubmissions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/assignments/all-submissions?limit=100');
            const data = res.data?.data || res.data || [];
            setSubmissions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
            toast.error('Failed to load all submissions');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const handleNavigateToStudent = (studentId, batches) => {
        if (batches && batches.length > 0) {
            const batchId = (batches[0]?._id || batches[0] || '').toString();
            if (!batchId) {
                toast.warning('No batch found for this student');
                return;
            }
            navigate(`/assignments/submissions?batchId=${encodeURIComponent(batchId)}&studentId=${studentId}`);
        } else {
            toast.warning('This student is not assigned to any batch.');
        }
    };

    const columns = useMemo(() => [
        {
            field: 'studentName',
            headerName: 'STUDENT',
            flex: 1.5,
            minWidth: 200,
            valueGetter: (params) => params.data.studentName || params.data.student?.name || 'N/A',
        },
        {
            field: 'assignmentTitle',
            headerName: 'ASSIGNMENT',
            flex: 1.5,
            minWidth: 200,
            valueGetter: (params) => params.data.assignmentTitle || params.data.assignment?.title || 'N/A',
        },
        {
            field: 'submittedAt',
            headerName: 'SUBMITTED AT',
            width: 180,
            valueGetter: (params) => {
                const d = params.data.submittedAt || params.data.createdAt;
                return d ? format(new Date(d), 'MMM dd, yyyy - hh:mm a') : 'N/A';
            },
        },
        {
            field: 'status',
            headerName: 'STATUS',
            width: 130,
            cellRenderer: (params) => {
                const graded = params.data.status === 'graded' || params.data.grade !== undefined;
                return (
                    <Badge variant={graded ? 'success' : 'warning'}>
                        {graded ? 'Graded' : 'Pending'}
                    </Badge>
                );
            },
        },
        {
            field: 'grade',
            headerName: 'GRADE',
            width: 120,
            valueGetter: (params) => params.data.grade !== undefined ? `${params.data.grade} Pts` : 'Not Graded',
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 120,
            cellRenderer: (params) => (
                <button
                    onClick={() => handleNavigateToStudent(params.data.studentId || params.data.student?._id, params.data.batches)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                    title="Review & Grade"
                >
                    <VisibilityIcon fontSize="small" /> Grade
                </button>
            ),
        },
    ], []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div>
                    <Heading level={2} className="text-2xl font-bold text-gray-900 dark:text-white">
                        All Student Submissions
                    </Heading>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Monitor, evaluate, and grade recent homework & assignment submissions across all batches
                    </Text>
                </div>
                <Button variant="secondary" onClick={fetchSubmissions} className="flex items-center gap-2">
                    <RefreshIcon fontSize="small" /> Refresh List
                </Button>
            </div>

            <Card className="p-0 overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                <TableUI
                    rowData={submissions}
                    columnDefs={columns}
                    loading={loading}
                />
            </Card>
        </div>
    );
};

export default AllSubmissions;
