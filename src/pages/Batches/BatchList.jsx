import { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Tooltip, Chip } from '@mui/material';
import DataTable from '../../components/Common/DataTable';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import BatchFormModal from '../../components/Batches/BatchFormModal';

const BatchList = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const response = await api.get('/batches');
            if (response.data.success) {
                setBatches(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load batches');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (batch) => {
        setSelectedBatch(batch);
        setModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedBatch(null);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this batch?')) {
            try {
                await api.delete(`/batches/${id}`);
                toast.success('Batch deleted successfully');
                fetchBatches();
            } catch (error) {
                toast.error('Failed to delete batch');
            }
        }
    };

    const columnDefs = [
        { field: 'name', headerName: 'Batch Name', flex: 1.2 },
        { 
            field: 'course', 
            headerName: 'Course', 
            flex: 1,
            valueGetter: (params) => params.data.course?.title || 'N/A'
        },
        { 
            field: 'teacher', 
            headerName: 'Primary Teacher', 
            flex: 1,
            valueGetter: (params) => params.data.teacher?.name || 'Unassigned'
        },
        { 
            field: 'timing', 
            headerName: 'Timing',
            flex: 1
        },
        { 
            field: 'startDate', 
            headerName: 'Start Date',
            valueFormatter: (params) => params.value ? format(new Date(params.value), 'PP') : 'N/A',
            flex: 1
        },
        {
            field: 'isActive',
            headerName: 'Status',
            cellRenderer: (params) => (
                <Chip 
                    label={params.value ? 'Active' : 'Inactive'} 
                    color={params.value ? 'success' : 'default'} 
                    size="small" 
                />
            ),
            width: 100
        },
        {
            field: 'actions',
            headerName: 'Actions',
            sortable: false,
            filter: false,
            width: 120,
            cellRenderer: (params) => (
                <Box>
                    <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => handleEdit(params.data)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(params.data._id)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Batch Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage your student cohorts and timings
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
                    Create Batch
                </Button>
            </Box>

            <DataTable
                rowData={batches}
                columnDefs={columnDefs}
                loading={loading}
            />

            {modalOpen && (
                <BatchFormModal 
                    open={modalOpen} 
                    batch={selectedBatch}
                    onClose={() => setModalOpen(false)} 
                    onSuccess={fetchBatches}
                />
            )}
        </Box>
    );
};

export default BatchList;
