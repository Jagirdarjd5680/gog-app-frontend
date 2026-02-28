import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Chip,
    Stack,
    IconButton,
    Tooltip,
} from '@mui/material';
import DataTable from '../../components/Common/DataTable';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const ExamResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const response = await api.get('/exam-results/recent');
            setResults(response.data || []);
        } catch (error) {
            toast.error('Failed to load exam results');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    const StatusRenderer = (params) => {
        const passed = params.data.passed;
        return (
            <Chip
                label={passed ? 'PASSED' : 'FAILED'}
                size="small"
                color={passed ? 'success' : 'error'}
                sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
            />
        );
    };

    const ActionsRenderer = (params) => (
        <Stack direction="row" spacing={1}>
            <Tooltip title="View Details">
                <IconButton size="small" sx={{ bgcolor: 'rgba(0,0,0,0.04)' }}>
                    <VisibilityIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </Stack>
    );

    const columnDefs = [
        {
            headerName: 'STUDENT',
            field: 'user.name',
            flex: 1.2,
            minWidth: 150,
            valueGetter: (params) => params.data.user?.name || 'Unknown'
        },
        {
            headerName: 'ROLL NO',
            field: 'user.rollNumber',
            flex: 1,
            minWidth: 120,
            valueGetter: (params) => params.data.user?.rollNumber || 'N/A'
        },
        {
            headerName: 'EXAM',
            field: 'exam.title',
            flex: 1.5,
            minWidth: 200,
            valueGetter: (params) => params.data.exam?.title || 'Exam'
        },
        {
            headerName: 'SCORE',
            field: 'score',
            width: 120,
            valueGetter: (params) => `${params.data.score}/${params.data.maxScore}`
        },
        {
            headerName: 'PERCENTAGE',
            field: 'percentage',
            width: 120,
            valueGetter: (params) => `${params.data.percentage.toFixed(1)}%`
        },
        {
            headerName: 'ATTEMPT',
            field: 'attemptNumber',
            width: 100,
        },
        {
            headerName: 'STATUS',
            cellRenderer: StatusRenderer,
            width: 120
        },
        {
            headerName: 'DATE',
            field: 'submitTime',
            width: 160,
            valueGetter: (params) => format(new Date(params.data.submitTime), 'MMM dd, yyyy HH:mm')
        },
        {
            headerName: 'ACTION',
            cellRenderer: ActionsRenderer,
            width: 100,
            pinned: 'right'
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="text.primary">
                        Exam Results
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Recent exam attempts by students
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <DataTable
                    rowData={results}
                    columnDefs={columnDefs}
                    loading={loading}
                    pagination={true}
                    paginationPageSize={10}
                />
            </Box>
        </Box>
    );
};

export default ExamResults;
