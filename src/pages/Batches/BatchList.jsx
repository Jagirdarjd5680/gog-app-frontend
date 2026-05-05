import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Tooltip, Chip, Stack } from '@mui/material';
import DataTable from '../../components/Common/DataTable';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import { format } from 'date-fns';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import BatchFormModal from '../../components/Batches/BatchFormModal';
import BatchMaterialsModal from '../../components/Batches/BatchMaterialsModal';
import FaceIcon from '@mui/icons-material/Face';
import { useNavigate } from 'react-router-dom';

const BatchList = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [materialsOpen, setMaterialsOpen] = useState(false);
    const [materialsBatch, setMaterialsBatch] = useState(null);

    useEffect(() => {
        fetchBatches();
    }, []);

    // Sync modal state with URL
    useEffect(() => {
        const batchId = searchParams.get('batchId');
        if (batchId && batches.length > 0) {
            const batch = batches.find(b => b._id === batchId);
            if (batch) {
                setMaterialsBatch(batch);
                setMaterialsOpen(true);
            }
        } else if (!batchId && materialsOpen) {
            setMaterialsOpen(false);
        }
    }, [searchParams, batches, materialsOpen]);

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

    const handleOpenMaterials = (batch) => {
        setSearchParams({ batchId: batch._id });
        setMaterialsBatch(batch);
        setMaterialsOpen(true);
    };

    const handleCloseMaterials = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('batchId');
        newParams.delete('folderId'); // Clean up folder too
        setSearchParams(newParams);
        setMaterialsOpen(false);
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
            field: 'students',
            headerName: 'Students',
            width: 110,
            cellRenderer: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" fontWeight={600}>
                        {params.data.studentCount || 0}
                    </Typography>
                </Box>
            )
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
            width: 200,
            pinned: 'right',
            cellRenderer: (params) => (
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: '100%' }}>
                    <Tooltip title="Face ID Attendance">
                        <IconButton
                            size="small"
                            onClick={() => navigate(`/batches/${params.data._id}/attendance`)}
                            sx={{
                                color: '#4CAF50',
                                bgcolor: 'rgba(76,175,80,0.1)',
                                '&:hover': { bgcolor: 'rgba(76,175,80,0.2)' },
                                borderRadius: 1.5
                            }}
                        >
                            <FaceIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Batch Materials (File Manager)">
                        <IconButton
                            size="small"
                            onClick={() => handleOpenMaterials(params.data)}
                            sx={{
                                color: '#FF9800',
                                bgcolor: 'rgba(255,152,0,0.1)',
                                '&:hover': { bgcolor: 'rgba(255,152,0,0.2)' },
                                borderRadius: 1.5
                            }}
                        >
                            <FolderIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Batch">
                        <IconButton size="small" color="primary" onClick={() => handleEdit(params.data)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Batch">
                        <IconButton size="small" color="error" onClick={() => handleDelete(params.data._id)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
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
                        Manage your student cohorts, timings and batch materials
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

            {materialsOpen && (
                <BatchMaterialsModal
                    open={materialsOpen}
                    onClose={handleCloseMaterials}
                    batch={materialsBatch}
                />
            )}
        </Box>
    );
};

export default BatchList;
