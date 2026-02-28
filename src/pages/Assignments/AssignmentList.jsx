import { useState, useEffect } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import DataTable from '../../components/Common/DataTable';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const AssignmentList = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/assignments');
            if (response.data.success) {
                setAssignments(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load assignments');
        } finally {
            setLoading(false);
        }
    };

    const columnDefs = [
        { field: 'title', headerName: 'Title', flex: 1 },
        {
            field: 'deadline',
            headerName: 'Deadline',
            valueFormatter: (params) => format(new Date(params.value), 'PPp'),
        },
        { field: 'totalMarks', headerName: 'Total Marks' },
        {
            field: 'submissions',
            headerName: 'Submissions',
            valueGetter: (params) => params.data.submissions?.length || 0,
        },
        {
            field: 'isPublished',
            headerName: 'Status',
            cellRenderer: (params) => (
                <Chip label={params.value ? 'Published' : 'Draft'} color={params.value ? 'success' : 'default'} size="small" />
            ),
        },
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight={700}>
                    Assignments
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />}>
                    Create Assignment
                </Button>
            </Box>

            <DataTable
                rowData={assignments}
                columnDefs={columnDefs}
                loading={loading}
            />
        </Box>
    );
};

export default AssignmentList;
