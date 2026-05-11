import { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Stack, Card, CardContent, 
    IconButton, Chip, Tooltip, CircularProgress, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import LinkIcon from '@mui/icons-material/Link';
import { format } from 'date-fns';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import AssignmentFormModal from '../../Assignments/AssignmentFormModal';

const AssignmentStep = ({ values, setFieldValue, courseId }) => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    useEffect(() => {
        if (courseId) {
            fetchAssignments();
        }
    }, [courseId]);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/assignments?course=${courseId}&limit=100`);
            setAssignments(data.data || []);
        } catch (error) {
            toast.error('Failed to load assignments');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedAssignment({
            course: courseId
        });
        setModalOpen(true);
    };

    const handleEdit = (assignment) => {
        setSelectedAssignment(assignment);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try {
                await api.delete(`/assignments/${id}`);
                toast.success('Assignment deleted');
                fetchAssignments();
            } catch (error) {
                toast.error('Failed to delete assignment');
            }
        }
    };

    const getModuleName = (moduleId) => {
        const module = values.modules.find(m => m._id === moduleId || m.id === moduleId);
        return module ? module.title : 'Unknown Module';
    };

    const getLectureName = (moduleId, lectureId) => {
        const module = values.modules.find(m => m._id === moduleId || m.id === moduleId);
        if (!module) return 'Unknown';
        const lecture = module.videos?.find(v => v._id === lectureId || v.id === lectureId);
        return lecture ? lecture.title : 'All Lectures';
    };

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
                <Box>
                    <Typography variant="h5" fontWeight={800} sx={{ color: '#1e293b' }}>Course Assignments</Typography>
                    <Typography variant="body2" color="text.secondary">Create and link assignments to specific modules for auto-unlocking.</Typography>
                </Box>
                <Button
                    variant="contained" startIcon={<AddIcon />} onClick={handleCreate}
                    sx={{ borderRadius: '10px', px: 3, py: 1, bgcolor: '#1e293b', '&:hover': { bgcolor: '#0f172a' }, textTransform: 'none', fontWeight: 600 }}
                    disabled={!courseId}
                >
                    Create Assignment
                </Button>
            </Box>

            {!courseId ? (
                <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '16px', border: '1px dashed rgba(0,0,0,0.1)' }}>
                    <AssignmentOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">Save Course First</Typography>
                    <Typography variant="body2" color="text.disabled">Please save the course details before adding assignments.</Typography>
                </Box>
            ) : loading ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : assignments.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '16px', border: '1px dashed rgba(0,0,0,0.1)' }}>
                    <AssignmentOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">No Assignments Yet</Typography>
                    <Typography variant="body2" color="text.disabled">Add your first assignment and link it to a curriculum module.</Typography>
                    <Button variant="text" sx={{ mt: 2 }} onClick={handleCreate}>+ Add New Assignment</Button>
                </Box>
            ) : (
                <Stack spacing={2}>
                    {assignments.map((assignment) => (
                        <Card key={assignment._id} sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.08)', transition: 'all 0.3s ease', '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'primary.light', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <AssignmentOutlinedIcon />
                                    </Box>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="subtitle1" fontWeight={700}>{assignment.title}</Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                            <Chip 
                                                icon={<LinkIcon sx={{ fontSize: '14px !important' }} />} 
                                                label={assignment.moduleId ? getModuleName(assignment.moduleId) : 'Unlinked'} 
                                                size="small" 
                                                variant="outlined"
                                                color={assignment.moduleId ? 'primary' : 'default'}
                                                sx={{ height: 24, fontSize: '0.75rem' }}
                                            />
                                            {assignment.lectureId && (
                                                <Typography variant="caption" color="text.secondary">
                                                    • {getLectureName(assignment.moduleId, assignment.lectureId)}
                                                </Typography>
                                            )}
                                            <Divider orientation="vertical" flexItem sx={{ height: 12, my: 'auto' }} />
                                            <Typography variant="caption" color="text.secondary">
                                                Marks: {assignment.totalMarks}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                • Deadline: {assignment.deadlineDays > 0 ? `${assignment.deadlineDays} Days after unlock` : format(new Date(assignment.deadline), 'PPp')}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                    <Stack direction="row" spacing={1}>
                                        <IconButton size="small" onClick={() => handleEdit(assignment)}>
                                            <EditOutlinedIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(assignment._id)}>
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}

            {modalOpen && (
                <AssignmentFormModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    assignment={selectedAssignment}
                    onSuccess={fetchAssignments}
                />
            )}
        </Box>
    );
};

export default AssignmentStep;
