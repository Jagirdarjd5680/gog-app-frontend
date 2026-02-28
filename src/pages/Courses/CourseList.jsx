import { useState, useEffect } from 'react';
import { Box, Typography, Button, Chip, IconButton } from '@mui/material';
import DataTable from '../../components/Common/DataTable';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import DeleteConfirmDialog from '../../components/Common/DeleteConfirmDialog';
import CourseWizard from '../../components/Courses/CourseWizard/CourseWizard';
import CourseViewModal from '../../components/Courses/CourseViewModal';
import QuizIcon from '@mui/icons-material/Quiz';
import StarIcon from '@mui/icons-material/Star';
import AssignExamModal from '../../components/Courses/AssignExamModal';
import ReviewModal from '../../components/Courses/ReviewModal';
import { useAuth } from '../../context/AuthContext';

const CourseList = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    // View Modal State
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedCourseData, setSelectedCourseData] = useState(null);
    // New Action Modals
    const [assignExamModalOpen, setAssignExamModalOpen] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedCourseForAction, setSelectedCourseForAction] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            let url = '/courses';
            if (user?.role === 'teacher' && user?.permissions === 'fullControl') {
                url += `?instructor=${user._id}`;
            }
            const { data } = await api.get(url);
            setCourses(data.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCourse = () => {
        setSelectedCourseId(null);
        setIsModalOpen(true);
    };

    const handleEditCourse = (courseId) => {
        setSelectedCourseId(courseId);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedCourseId(null);
    };

    const handleViewCourse = (course) => {
        setSelectedCourseData(course);
        setViewModalOpen(true);
    };

    const handleAssignExam = (course) => {
        setSelectedCourseForAction(course);
        setAssignExamModalOpen(true);
    };

    const handleReviewCourse = (course) => {
        setSelectedCourseForAction(course);
        setReviewModalOpen(true);
    };

    const handleModalSuccess = () => {
        fetchCourses();
        handleModalClose();
    };

    const handleTogglePublish = async (course) => {
        try {
            const updatedStatus = !course.isPublished;
            await api.put(`/courses/${course._id}/publish`, { isPublished: updatedStatus });
            toast.success(`Course ${updatedStatus ? 'published' : 'unpublished'} successfully`);
            fetchCourses();
        } catch (error) {
            console.error('Error updating course status:', error);
            toast.error('Failed to update status');
        }
    };

    const confirmDelete = async () => {
        if (!courseToDelete) return;
        try {
            await api.delete(`/courses/${courseToDelete._id}`);
            toast.success('Course deleted successfully');
            fetchCourses();
        } catch (error) {
            console.error('Error deleting course:', error);
            toast.error('Failed to delete course');
        }
        setCourseToDelete(null);
        setDeleteDialogOpen(false); // Close the dialog after action
    };

    const columnDefs = [
        {
            headerName: '#',
            valueGetter: (params) => params.node.rowIndex + 1,
            width: 70,
            pinned: 'left',
            suppressMovable: true,
        },
        {
            headerName: 'THUMBNAIL',
            field: 'thumbnail',
            width: 120,
            cellRenderer: (params) => (
                <Box
                    sx={{
                        width: 45,
                        height: 45,
                        borderRadius: 1,
                        overflow: 'hidden',
                        mt: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: params.value ? 'transparent' : 'primary.main',
                        border: params.value ? '1px solid rgba(0,0,0,0.08)' : 'none'
                    }}
                >
                    {params.value ? (
                        <img src={params.value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#fff', fontSize: '0.75rem' }}>TEST</Typography>
                    )}
                </Box>
            )
        },
        { field: 'title', headerName: 'TITLE', flex: 2, minWidth: 200 },
        {
            field: 'category',
            headerName: 'CATEGORY',
            valueGetter: (params) => params.data.category?.name || params.data.category || 'Global',
            width: 130,
            cellRenderer: (params) => (
                <Chip
                    label={params.value?.name || params.value || 'Global'}
                    size="small"
                    sx={{
                        borderRadius: 1,
                        bgcolor: 'rgba(0,0,0,0.05)',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        textTransform: 'capitalize'
                    }}
                />
            )
        },
        {
            headerName: 'ENROLLMENTS',
            width: 130,
            valueGetter: (params) => params.data.enrolledStudents?.length || 0,
            cellRenderer: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{params.value}</Typography>
                    <Typography variant="caption" color="text.secondary">Students</Typography>
                </Box>
            )
        },
        {
            headerName: 'SUBJECTS',
            field: 'subjects',
            width: 150,
            valueGetter: (params) => params.data.subjects || '-',
        },
        {
            field: 'price',
            headerName: 'PRICE',
            width: 150,
            cellRenderer: (params) => {
                const price = params.data.price ?? 0;
                const originalPrice = params.data.originalPrice ?? 0;
                const isFree = price === 0;

                return (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            height: '100%',
                        }}
                    >
                        {isFree ? (
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>FREE</Typography>
                        ) : (
                            <>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                    ₹{price}
                                </Typography>
                                {originalPrice > price && (
                                    <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                                        ₹{originalPrice}
                                    </Typography>
                                )}
                            </>
                        )}
                    </Box>
                );
            }
        },
        {
            headerName: 'DURATION',
            width: 130,
            valueGetter: (params) => {
                const val = params.data.durationValue;
                const unit = params.data.durationUnit;
                if (val === undefined || val === null) return '-';
                if (val === 0) return 'Lifetime';
                return `${val} ${unit}`;
            },
        },
        {
            headerName: 'REVIEWS',
            field: 'totalReviews',
            width: 90,
            cellRenderer: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon sx={{ fontSize: 16, color: 'amber.600' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{params.value || 0}</Typography>
                </Box>
            )
        },
        {
            headerName: 'LIKES',
            width: 90,
            valueGetter: (params) => (params.data.fakeLikes || 0) + (params.data.likes?.length || 0),
            cellRenderer: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton size="small" disabled sx={{ p: 0, color: 'primary.main' }}>
                        <Box component="span" sx={{ fontSize: 16 }}>👍</Box>
                    </IconButton>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{params.value}</Typography>
                </Box>
            )
        },
        {
            field: 'isPublished',
            headerName: 'STATUS',
            width: 120,
            cellRenderer: (params) => (
                <Chip
                    label={params.value ? 'Active' : 'Inactive'}
                    color={params.value ? 'success' : 'default'}
                    size="small"
                    sx={{
                        borderRadius: 1,
                        minWidth: 80,
                        fontWeight: 600,
                        fontSize: '0.7rem'
                    }}
                    onClick={() => handleTogglePublish(params.data)}
                />
            ),
        },
        {
            headerName: 'ACTIONS',
            field: 'actions',
            width: 280,
            pinned: 'right',
            cellRenderer: (params) => {
                const canEditDelet = user?.role === 'admin' || (user?.role === 'teacher' && user?.permissions === 'fullControl');

                return (
                    <Box sx={{ display: 'flex', gap: 0.5, p: 0.5 }}>
                        <Box sx={{ display: 'flex', gap: 0.5, bgcolor: 'rgba(0,0,0,0.04)', p: 0.5, borderRadius: 1 }}>
                            <IconButton size="small" sx={{ color: '#00bcd4' }} title="View" onClick={() => handleViewCourse(params.data)}>
                                <VisibilityIcon fontSize="inherit" />
                            </IconButton>
                            <IconButton size="small" sx={{ color: '#9c27b0' }} title="Assign Exam" onClick={() => handleAssignExam(params.data)} disabled={user?.role === 'teacher' && user?.permissions === 'read'}>
                                <QuizIcon fontSize="inherit" />
                            </IconButton>
                            <IconButton size="small" sx={{ color: '#ffb300' }} title="Ratings" onClick={() => handleReviewCourse(params.data)}>
                                <StarIcon fontSize="inherit" />
                            </IconButton>
                            <IconButton
                                size="small"
                                sx={{ color: '#4caf50' }}
                                onClick={() => handleEditCourse(params.data._id)}
                                title="Edit"
                                disabled={!canEditDelet}
                            >
                                <EditIcon fontSize="inherit" />
                            </IconButton>
                            <IconButton
                                size="small"
                                sx={{ color: '#f44336' }}
                                onClick={() => { setCourseToDelete(params.data); setDeleteDialogOpen(true); }}
                                title="Delete"
                                disabled={!canEditDelet}
                            >
                                <DeleteIcon fontSize="inherit" />
                            </IconButton>
                        </Box>
                    </Box>
                );
            }
        }
    ];

    return (
        <Box sx={{ p: 1 }}>
            <DataTable
                rowData={courses}
                columnDefs={columnDefs}
                loading={loading}
                enableGlobalSearch={true}
                searchPlaceholder="Search courses..."
                actions={
                    <Button
                        variant="contained"
                        sx={{
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            px: 3,
                            borderRadius: 1
                        }}
                        startIcon={<AddIcon />}
                        onClick={handleAddCourse}
                        disabled={user?.role === 'teacher' && user?.permissions === 'read'}
                    >
                        Create New Course
                    </Button>
                }
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Course"
                message={`Delete "${courseToDelete?.title}"? This cannot be undone.`}
            />

            {isModalOpen && (
                <CourseWizard
                    open={isModalOpen}
                    onClose={handleModalClose}
                    courseId={selectedCourseId}
                    onSuccess={handleModalSuccess}
                />
            )}

            <CourseViewModal
                open={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                course={selectedCourseData}
            />

            {assignExamModalOpen && (
                <AssignExamModal
                    open={assignExamModalOpen}
                    onClose={() => setAssignExamModalOpen(false)}
                    courseId={selectedCourseForAction?._id}
                    courseTitle={selectedCourseForAction?.title}
                />
            )}

            {reviewModalOpen && (
                <ReviewModal
                    open={reviewModalOpen}
                    onClose={() => setReviewModalOpen(false)}
                    courseId={selectedCourseForAction?._id}
                    courseTitle={selectedCourseForAction?.title}
                />
            )}
        </Box>
    );
};

export default CourseList;
