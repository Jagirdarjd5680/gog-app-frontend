import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
    Box, Typography, Button, IconButton, Tooltip, Chip, Stack, 
    Grid, Card, CardContent, CardActionArea, Avatar, TextField, InputAdornment, Divider
} from '@mui/material';
import DataTable from '../../components/Common/DataTable';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
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
    
    // Course-wise management states
    const [view, setView] = useState('courses'); // 'courses' or 'batches'
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

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

    // Group batches by course
    const courseGroups = useMemo(() => {
        const groups = {};
        batches.forEach(batch => {
            const courseId = batch.course?._id || 'unassigned';
            if (!groups[courseId]) {
                groups[courseId] = {
                    course: batch.course || { title: 'Unassigned Batches', _id: 'unassigned' },
                    batches: [],
                    studentCount: 0
                };
            }
            groups[courseId].batches.push(batch);
            groups[courseId].studentCount += (batch.studentCount || 0);
        });
        
        // Convert to array and filter by search
        return Object.values(groups).filter(group => 
            group.course.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [batches, searchQuery]);

    // Sync modal state and view with URL
    useEffect(() => {
        const batchId = searchParams.get('batchId');
        const courseId = searchParams.get('courseId');

        if (batchId && batches.length > 0) {
            const batch = batches.find(b => b._id === batchId);
            if (batch) {
                setMaterialsBatch(batch);
                setMaterialsOpen(true);
            }
        } else if (!batchId && materialsOpen) {
            setMaterialsOpen(false);
        }

        if (courseId && view === 'courses' && courseGroups.length > 0) {
            const group = courseGroups.find(g => g.course._id === courseId);
            if (group) {
                setSelectedCourse(group);
                setView('batches');
            }
        }
    }, [searchParams, batches, courseGroups, view, materialsOpen]);

    const handleCourseClick = (courseGroup) => {
        setSelectedCourse(courseGroup);
        setView('batches');
        setSearchParams({ courseId: courseGroup.course._id });
    };

    const handleBack = () => {
        setView('courses');
        setSelectedCourse(null);
        setSearchParams({});
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
                    <Tooltip title="Assignment Submissions">
                        <IconButton
                            size="small"
                            onClick={() => navigate(`/assignments/submissions?batchId=${params.data._id}`)}
                            sx={{
                                color: '#2196F3',
                                bgcolor: 'rgba(33,150,243,0.1)',
                                '&:hover': { bgcolor: 'rgba(33,150,243,0.2)' },
                                borderRadius: 1.5
                            }}
                        >
                            <AssignmentIcon fontSize="small" />
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'flex-start' }}>
                <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                        {view === 'batches' && (
                            <IconButton onClick={handleBack} size="small" sx={{ mb: 0.5 }}>
                                <ArrowBackIcon />
                            </IconButton>
                        )}
                        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
                            {view === 'courses' ? 'Batch Management' : selectedCourse.course.title}
                        </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        {view === 'courses' 
                            ? 'Organize and manage student cohorts by course' 
                            : `Manage batches for ${selectedCourse.course.title}`}
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    {view === 'courses' && (
                        <TextField
                            size="small"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" color="action" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2, bgcolor: 'white' }
                            }}
                        />
                    )}
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />} 
                        onClick={handleCreate}
                        sx={{ borderRadius: 2, px: 3, boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}
                    >
                        Create Batch
                    </Button>
                </Stack>
            </Box>

            {view === 'courses' ? (
                <Grid container spacing={2}>
                    {courseGroups.map((group) => (
                        <Grid item xs={12} sm={6} md={3} key={group.course._id}>
                            <Card 
                                sx={{ 
                                    borderRadius: 2, 
                                    transition: 'all 0.2s ease',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    '&:hover': { 
                                        transform: 'translateY(-3px)',
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                                        borderColor: 'primary.main'
                                    }
                                }}
                            >
                                <CardActionArea onClick={() => handleCourseClick(group)}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1.5 }}>
                                            <Avatar 
                                                sx={{ 
                                                    bgcolor: 'primary.soft', 
                                                    color: 'primary.main',
                                                    width: 36, height: 36,
                                                    borderRadius: 1.5
                                                }}
                                            >
                                                <SchoolIcon sx={{ fontSize: 20 }} />
                                            </Avatar>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ letterSpacing: '-0.3px' }}>
                                                    {group.course.title}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mt: -0.5 }}>
                                                    {group.batches.length} {group.batches.length === 1 ? 'Batch' : 'Batches'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <PeopleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                <Typography variant="caption" fontWeight={700} color="text.primary">
                                                    {group.studentCount}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Students
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="primary.main" fontWeight={700}>
                                                View Details →
                                            </Typography>
                                        </Stack>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                    {courseGroups.length === 0 && (
                        <Grid item xs={12}>
                            <Box sx={{ py: 10, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 4, border: '2px dashed', borderColor: 'grey.300' }}>
                                <Typography color="text.secondary">No courses found matching your search.</Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            ) : (
                <Box sx={{ 
                    bgcolor: 'white', 
                    borderRadius: 4, 
                    p: 1, 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    border: '1px solid',
                    borderColor: 'divider'
                }}>
                    <DataTable
                        rowData={selectedCourse.batches}
                        columnDefs={columnDefs}
                        loading={loading}
                    />
                </Box>
            )}

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
