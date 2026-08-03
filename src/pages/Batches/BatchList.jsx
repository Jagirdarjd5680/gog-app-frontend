import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    IconButton,
    Tooltip,
    Chip,
    Stack,
    Typography,
} from '@mui/material';
import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import BatchFormModal from '../../components/Batches/BatchFormModal';
import BatchMaterialsModal from '../../components/Batches/BatchMaterialsModal';
import DeleteConfirmDialog from '../../components/Common/DeleteConfirmDialog';
import { format } from 'date-fns';

import GroupsIcon from '@mui/icons-material/Groups';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import FaceIcon from '@mui/icons-material/Face';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const BatchList = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [batches, setBatches] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal & Dialog States
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [batchToDelete, setBatchToDelete] = useState(null);
    const [materialsOpen, setMaterialsOpen] = useState(false);
    const [materialsBatch, setMaterialsBatch] = useState(null);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [courseFilter, setCourseFilter] = useState('all');

    const fetchBatches = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/batches?t=${Date.now()}`);
            if (response.data.success || Array.isArray(response.data)) {
                const list = response.data.data || response.data || [];
                setBatches(list);
            }
        } catch (error) {
            toast.error('Failed to load batches');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCourses = useCallback(async () => {
        try {
            const response = await api.get(`/courses?t=${Date.now()}`);
            const list = response.data.data || response.data || [];
            setCourses(list);
        } catch (error) {
            console.error('Failed to fetch courses', error);
        }
    }, []);

    useEffect(() => {
        fetchBatches();
        fetchCourses();
    }, [fetchBatches, fetchCourses]);

    // Handle deep links from URL params
    useEffect(() => {
        const batchId = searchParams.get('batchId');
        if (batchId && batches.length > 0) {
            const batch = batches.find((b) => String(b._id || b.id) === String(batchId));
            if (batch) {
                setMaterialsBatch(batch);
                setMaterialsOpen(true);
            }
        }
    }, [searchParams, batches]);

    const handleCreate = useCallback(() => {
        setSelectedBatch(null);
        setModalOpen(true);
    }, []);

    const handleEdit = useCallback((batch) => {
        setSelectedBatch(batch);
        setModalOpen(true);
    }, []);

    const handleDelete = useCallback((batch) => {
        setBatchToDelete(batch);
        setDeleteDialogOpen(true);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!batchToDelete) return;
        const toastId = toast.loading('Deleting batch...');
        try {
            const id = batchToDelete._id || batchToDelete.id;
            const res = await api.delete(`/batches/${id}`);
            if (res.data.success || res.status === 200) {
                toast.update(toastId, { render: 'Batch deleted successfully', type: 'success', isLoading: false, autoClose: 3000 });
                fetchBatches();
            }
        } catch (error) {
            toast.update(toastId, { render: error.response?.data?.message || 'Delete failed', type: 'error', isLoading: false, autoClose: 3000 });
        } finally {
            setDeleteDialogOpen(false);
            setBatchToDelete(null);
        }
    }, [batchToDelete, fetchBatches]);

    const handleOpenMaterials = useCallback((batch) => {
        setSearchParams({ batchId: batch._id || batch.id });
        setMaterialsBatch(batch);
        setMaterialsOpen(true);
    }, [setSearchParams]);

    const handleCloseMaterials = useCallback(() => {
        setSearchParams({});
        setMaterialsOpen(false);
    }, [setSearchParams]);

    // Filter Logic
    const filteredBatches = useMemo(() => {
        return batches.filter((batch) => {
            const name = (batch.name || '').toLowerCase();
            const courseTitle = (batch.course?.title || '').toLowerCase();
            const timing = (batch.timing || '').toLowerCase();
            const search = searchTerm.toLowerCase().trim();

            const matchesSearch = name.includes(search) || courseTitle.includes(search) || timing.includes(search);
            if (!matchesSearch) return false;

            if (statusFilter !== 'all' && batch.isActive !== (statusFilter === 'active')) return false;

            if (courseFilter !== 'all') {
                const cId = batch.course?._id || batch.course?.id || batch.course;
                if (cId !== courseFilter && batch.course?.title !== courseFilter) return false;
            }

            return true;
        });
    }, [batches, searchTerm, statusFilter, courseFilter]);

    // Metrics Items for GenericMetrics (Same style as Dashboard, Users, Courses)
    const metricsItems = useMemo(() => {
        const totalBatches = batches.length;
        const activeBatches = batches.filter((b) => b.isActive).length;
        const totalStudents = batches.reduce((acc, b) => acc + (b.studentCount || 0), 0);
        const uniqueCourses = new Set(batches.map((b) => b.course?._id || b.course?.id || 'unassigned')).size;

        return [
            { title: 'Total Batches', value: totalBatches, icon: <GroupsIcon />, color: 'primary' },
            { title: 'Active Cohorts', value: activeBatches, icon: <CheckCircleIcon />, color: 'success' },
            { title: 'Enrolled Students', value: totalStudents, icon: <PeopleIcon />, color: 'warning' },
            { title: 'Courses Covered', value: uniqueCourses, icon: <SchoolIcon />, color: 'info' },
        ];
    }, [batches]);

    // Filters for GenericTableHeader
    const filterConfigs = useMemo(() => [
        {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
                { value: 'all', label: 'Every Status' },
                { value: 'active', label: 'Active Only' },
                { value: 'inactive', label: 'Inactive Only' },
            ],
        },
        {
            value: courseFilter,
            onChange: setCourseFilter,
            options: [
                { value: 'all', label: 'All Courses' },
                ...courses.map((c) => ({ value: c._id || c.id, label: c.title })),
            ],
        },
    ], [statusFilter, courseFilter, courses]);

    // Column Definitions for TableUI
    const columnDefs = useMemo(() => [
        {
            field: 'name',
            headerName: 'Batch Name & Course',
            flex: 1.3,
            cellRenderer: ({ data }) => (
                <Box sx={{ py: 0.5 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-vc-ink)' }}>
                        {data.name}
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)' }}>
                        {data.course?.title || 'Unassigned Course'}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'timing',
            headerName: 'Schedule / Timing',
            flex: 1,
            cellRenderer: ({ data }) => (
                <Stack direction="row" alignItems="center" spacing={0.8}>
                    <AccessTimeIcon sx={{ fontSize: 14, color: 'var(--color-vc-mute)' }} />
                    <Typography sx={{ fontSize: '13px', color: 'var(--color-vc-body)' }}>
                        {data.timing || 'N/A'}
                    </Typography>
                </Stack>
            ),
        },
        {
            field: 'studentCount',
            headerName: 'Students Capacity',
            width: 150,
            cellRenderer: ({ data }) => (
                <Stack direction="row" alignItems="center" spacing={0.8}>
                    <PeopleIcon sx={{ fontSize: 16, color: 'var(--color-vc-primary)' }} />
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)' }}>
                        {data.studentCount || 0}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)' }}>
                        / {data.maxStudents || 50}
                    </Typography>
                </Stack>
            ),
        },
        {
            field: 'startDate',
            headerName: 'Start Date',
            flex: 1,
            valueFormatter: ({ value }) => (value ? format(new Date(value), 'MMM dd, yyyy') : 'N/A'),
        },
        {
            field: 'isActive',
            headerName: 'Status',
            width: 120,
            cellRenderer: ({ data }) => (
                <Chip
                    label={data.isActive ? 'Active' : 'Inactive'}
                    size="small"
                    sx={{
                        fontSize: '11px',
                        fontWeight: 600,
                        height: 24,
                        bgcolor: data.isActive ? 'var(--color-vc-success-soft)' : 'var(--color-vc-canvas-soft)',
                        color: data.isActive ? 'var(--color-vc-success-deep)' : 'var(--color-vc-mute)',
                        borderRadius: '4px',
                    }}
                />
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            sortable: false,
            filter: false,
            width: 220,
            cellRenderer: ({ data }) => {
                const batchId = data._id || data.id;
                return (
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: '100%' }}>
                        <Tooltip title="View Students">
                            <IconButton
                                size="small"
                                onClick={() => navigate(`/batches/${batchId}/students`)}
                                sx={{ color: '#7c3aed', bgcolor: 'rgba(124, 58, 237, 0.08)', '&:hover': { bgcolor: 'rgba(124, 58, 237, 0.16)' }, borderRadius: '6px', width: 30, height: 30 }}
                            >
                                <PeopleIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Face ID Attendance">
                            <IconButton
                                size="small"
                                onClick={() => navigate(`/batches/${batchId}/attendance`)}
                                sx={{ color: '#10b981', bgcolor: 'rgba(16, 185, 129, 0.08)', '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.16)' }, borderRadius: '6px', width: 30, height: 30 }}
                            >
                                <FaceIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="File Manager">
                            <IconButton
                                size="small"
                                onClick={() => handleOpenMaterials(data)}
                                sx={{ color: '#f59e0b', bgcolor: 'rgba(245, 158, 11, 0.08)', '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.16)' }, borderRadius: '6px', width: 30, height: 30 }}
                            >
                                <FolderIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Assignments">
                            <IconButton
                                size="small"
                                onClick={() => navigate(`/assignments/submissions?batchId=${batchId}`)}
                                sx={{ color: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.08)', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.16)' }, borderRadius: '6px', width: 30, height: 30 }}
                            >
                                <AssignmentIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Batch">
                            <IconButton
                                size="small"
                                onClick={() => handleEdit(data)}
                                sx={{ color: 'var(--color-vc-primary)', bgcolor: 'var(--color-vc-canvas-soft)', '&:hover': { bgcolor: 'var(--color-vc-hairline)' }, borderRadius: '6px', width: 30, height: 30 }}
                            >
                                <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Batch">
                            <IconButton
                                size="small"
                                onClick={() => handleDelete(data)}
                                sx={{ color: 'var(--color-vc-error-deep)', bgcolor: 'var(--color-vc-error-soft)', '&:hover': { opacity: 0.8 }, borderRadius: '6px', width: 30, height: 30 }}
                            >
                                <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                );
            },
        },
    ], [navigate, handleOpenMaterials, handleEdit, handleDelete]);

    return (
        <Box sx={{ p: 0.5 }}>
            {/* Top Metrics Cards (Same as Users, Courses, Dashboard) */}
            <GenericMetrics items={metricsItems} />

            {/* Table Area */}
            <Box sx={{ bgcolor: 'transparent', px: 0 }}>
                <GenericTableHeader
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    searchPlaceholder="Search batches by name, course, schedule..."
                    filters={filterConfigs}
                    actionButtonText="Create Batch"
                    onActionClick={handleCreate}
                    actionButtonIcon={<AddIcon fontSize="small" />}
                    totalCount={filteredBatches.length}
                />

                <TableUI
                    rowData={filteredBatches}
                    columnDefs={columnDefs}
                    loading={loading}
                    pagination={true}
                    paginationPageSize={10}
                    getRowId={useCallback((row) => row?._id || row?.id || Math.random().toString(), [])}
                />
            </Box>

            {/* Modals & Dialogs */}
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

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Batch"
                message={`Are you sure you want to delete "${batchToDelete?.name}"?`}
            />
        </Box>
    );
};

export default BatchList;
