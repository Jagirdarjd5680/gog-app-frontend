import { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Stack, Card, CardContent, 
    IconButton, Chip, CircularProgress
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

    const formatDeadline = (assignment) => {
        if (assignment.deadlineDays > 0) return `${assignment.deadlineDays} Days after unlock`;
        if (!assignment.deadline) return 'No deadline set';
        const parsed = new Date(assignment.deadline);
        return Number.isNaN(parsed.getTime()) ? 'No deadline set' : format(parsed, 'PPp');
    };

    return (
        <Box sx={{ p: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
                <Box>
                    <Typography sx={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-vc-ink)', letterSpacing: '-0.02em', fontFamily: 'inherit' }}>Course Assignments</Typography>
                    <Typography sx={{ fontSize: '13px', color: 'var(--color-vc-mute)', fontFamily: 'inherit', mt: 0.25 }}>Create and link assignments to specific modules for auto-unlocking.</Typography>
                </Box>
                <Button
                    variant="contained" 
                    startIcon={<AddIcon sx={{ fontSize: 16 }} />} 
                    onClick={handleCreate}
                    disabled={!courseId}
                    sx={{ 
                        borderRadius: '6px', 
                        px: 3, 
                        height: 36,
                        boxShadow: 'none',
                        bgcolor: 'var(--color-vc-primary)',
                        color: 'var(--color-vc-on-primary)',
                        textTransform: 'none', 
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        fontWeight: 500,
                        '&:hover': { bgcolor: 'var(--color-vc-primary)', opacity: 0.9, boxShadow: 'none' },
                        '&:disabled': {
                            bgcolor: 'var(--color-vc-canvas-soft-2)',
                            color: 'var(--color-vc-mute)',
                            border: '1px solid var(--color-vc-hairline)'
                        }
                    }}
                >
                    Create Assignment
                </Button>
            </Box>

            {!courseId ? (
                <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'var(--color-vc-canvas-soft)', borderRadius: '6px', border: '1px dashed var(--color-vc-hairline)' }}>
                    <AssignmentOutlinedIcon sx={{ fontSize: 40, color: 'var(--color-vc-mute)', mb: 1.5 }} />
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>Save Course First</Typography>
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)', fontFamily: 'inherit', mt: 0.5 }}>Please save the course details before adding assignments.</Typography>
                </Box>
            ) : loading ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                    <CircularProgress size={32} thickness={4} sx={{ color: 'var(--color-vc-ink)' }} />
                </Box>
            ) : assignments.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'var(--color-vc-canvas-soft)', borderRadius: '6px', border: '1px dashed var(--color-vc-hairline)' }}>
                    <AssignmentOutlinedIcon sx={{ fontSize: 40, color: 'var(--color-vc-mute)', mb: 1.5 }} />
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>No Assignments Yet</Typography>
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)', fontFamily: 'inherit', mt: 0.5 }}>Add your first assignment and link it to a curriculum module.</Typography>
                    <Button 
                        variant="text" 
                        sx={{ mt: 2, textTransform: 'none', fontSize: '13px', fontWeight: 500, fontFamily: 'inherit', color: 'var(--color-vc-link)', '&:hover': { color: 'var(--color-vc-link-deep)' } }} 
                        onClick={handleCreate}
                    >
                        + Add New Assignment
                    </Button>
                </Box>
            ) : (
                <Stack spacing={2}>
                    {assignments.map((assignment) => (
                        <Card 
                            key={assignment._id} 
                            variant="outlined"
                            sx={{ 
                                borderRadius: '6px', 
                                border: '1px solid var(--color-vc-hairline-strong, rgba(0, 0, 0, 0.12))', 
                                bgcolor: 'var(--color-vc-canvas)',
                                boxShadow: 'none',
                                '&:hover': { borderColor: 'var(--color-vc-hairline-strong, rgba(0, 0, 0, 0.18))', bgcolor: 'var(--color-vc-canvas-soft)' } 
                            }}
                        >
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ width: 40, height: 40, borderRadius: '6px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft-2)', color: 'var(--color-vc-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <AssignmentOutlinedIcon sx={{ fontSize: 18 }} />
                                    </Box>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>{assignment.title}</Typography>
                                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.5, flexWrap: 'wrap', gap: 1 }}>
                                            <Chip 
                                                icon={<LinkIcon sx={{ fontSize: '12px !important', color: 'inherit !important' }} />} 
                                                label={assignment.moduleId ? getModuleName(assignment.moduleId) : 'Unlinked'} 
                                                size="small" 
                                                sx={{ 
                                                    height: 20, 
                                                    fontSize: '10px',
                                                    fontWeight: 500,
                                                    borderRadius: '4px',
                                                    bgcolor: assignment.moduleId ? 'var(--color-vc-link-bg-soft)' : 'var(--color-vc-canvas-soft-2)',
                                                    color: assignment.moduleId ? 'var(--color-vc-link-deep)' : 'var(--color-vc-mute)',
                                                    border: '1px solid transparent'
                                                }}
                                            />
                                            {assignment.lectureId && (
                                                <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>
                                                    • {getLectureName(assignment.moduleId, assignment.lectureId)}
                                                </Typography>
                                            )}
                                            <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>
                                                • Marks: {assignment.totalMarks}
                                            </Typography>
                                            <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>
                                                • Deadline: {formatDeadline(assignment)}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                    <Stack direction="row" spacing={0.5}>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => handleEdit(assignment)}
                                            sx={{ color: 'var(--color-vc-body)', '&:hover': { color: 'var(--color-vc-ink)' } }}
                                        >
                                            <EditOutlinedIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => handleDelete(assignment._id)}
                                            sx={{ color: 'var(--color-vc-mute)', '&:hover': { color: 'var(--color-vc-error-deep)' } }}
                                        >
                                            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
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
