import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Button, Chip, IconButton } from '@mui/material';
import DataTable from '../../components/Common/DataTable';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import DeleteConfirmDialog from '../../components/Common/DeleteConfirmDialog';
import CourseWizard from '../../components/Courses/CourseWizard/CourseWizard';
import CourseViewModal from '../../components/Courses/CourseViewModal';
import QuizIcon from '@mui/icons-material/Quiz';
import StarIcon from '@mui/icons-material/Star';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignExamModal from '../../components/Courses/AssignExamModal';
import AssignAssignmentModal from '../../components/Courses/AssignAssignmentModal';
import ReviewModal from '../../components/Courses/ReviewModal';
import { useAuth } from '../../context/AuthContext';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import { 
    Grid, 
    Card, 
    CardMedia, 
    CardContent, 
    CardActions, 
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Paper,
    InputBase,
    CircularProgress,
    Divider,
    Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const CourseActionMenu = ({ course, onReview, onDelete, onTogglePublish }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton size="small" onClick={handleClick}>
                <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        minWidth: 160,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        border: '1px solid rgba(0,0,0,0.06)',
                        mt: 1
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={() => { handleClose(); onTogglePublish(course); }} sx={{ fontSize: '0.85rem', py: 1 }}>
                    {course.isPublished ? (
                        <><VisibilityOffIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} /> Unpublish</>
                    ) : (
                        <><VisibilityIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} /> Publish</>
                    )}
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); onReview(course); }} sx={{ fontSize: '0.85rem', py: 1 }}>
                    <StarIcon fontSize="small" sx={{ mr: 1.5, color: '#ffb300' }} /> Ratings & Reviews
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleClose(); onDelete(course); }} sx={{ fontSize: '0.85rem', py: 1, color: 'error.main' }}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} /> Delete Course
                </MenuItem>
            </Menu>
        </>
    );
};

const CourseList = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    
    // Derived state from URL
    const wizardType = searchParams.get('wizard'); // 'add' or 'edit'
    const wizardCourseId = searchParams.get('id');
    const isModalOpen = wizardType === 'add' || wizardType === 'edit';
    const selectedCourseId = wizardType === 'edit' ? wizardCourseId : null;

    // View Modal State
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedCourseData, setSelectedCourseData] = useState(null);
    // New Action Modals
    const [assignExamModalOpen, setAssignExamModalOpen] = useState(false);
    const [assignAssignmentModalOpen, setAssignAssignmentModalOpen] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedCourseForAction, setSelectedCourseForAction] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Check if returning from Google Auth
        const urlParams = new URLSearchParams(window.location.search);
        const tokens = urlParams.get('tokens');
        if (tokens) {
            localStorage.setItem('googleMeetTokens', tokens);
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
            toast.success('Google Meet connected successfully!');
            
            // If we were editing/adding a course, keep the wizard open
            const wizard = urlParams.get('wizard');
            const id = urlParams.get('id');
            if (wizard) {
                setSearchParams({ wizard, ...(id && { id }) });
            }
        }
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
        setSearchParams({ wizard: 'add' });
    };

    const handleEditCourse = (courseId) => {
        setSearchParams({ wizard: 'edit', id: courseId });
    };

    const handleModalClose = () => {
        searchParams.delete('wizard');
        searchParams.delete('id');
        setSearchParams(searchParams);
    };

    const handleViewCourse = (course) => {
        setSelectedCourseData(course);
        setViewModalOpen(true);
    };

    const handleAssignExam = (course) => {
        setSelectedCourseForAction(course);
        setAssignExamModalOpen(true);
    };

    const handleAssignAssignment = (course) => {
        setSelectedCourseForAction(course);
        setAssignAssignmentModalOpen(true);
    };

    const handleReviewCourse = (course) => {
        setSelectedCourseForAction(course);
        setReviewModalOpen(true);
    };

    const handleActionSuccess = () => {
        fetchCourses();
    };

    const handleModalSuccess = () => {
        handleActionSuccess();
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

    const columnDefs = useMemo(() => [
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
        {
            field: 'courseType',
            headerName: 'TYPE',
            width: 100,
            cellRenderer: (params) => {
                const isOffline = params.value === 'offline';
                return (
                    <Chip
                        label={isOffline ? 'Offline' : 'Online'}
                        size="small"
                        sx={{
                            borderRadius: 1,
                            bgcolor: isOffline ? 'rgba(156, 39, 176, 0.1)' : 'rgba(33, 150, 243, 0.1)',
                            color: isOffline ? '#9c27b0' : '#2196f3',
                            fontWeight: 800,
                            fontSize: '0.65rem',
                            border: '1px solid',
                            borderColor: isOffline ? 'rgba(156, 39, 176, 0.2)' : 'rgba(33, 150, 243, 0.2)',
                            textTransform: 'uppercase'
                        }}
                    />
                );
            }
        },
        { 
            field: 'title', 
            headerName: 'TITLE', 
            flex: 2, 
            minWidth: 200,
            cellRenderer: (params) => (
                <Box sx={{ 
                    py: 1, 
                    px: 1, 
                    borderRadius: 1, 
                    bgcolor: params.data.courseType === 'offline' ? 'rgba(156, 39, 176, 0.04)' : 'transparent',
                    borderLeft: params.data.courseType === 'offline' ? '3px solid #9c27b0' : 'none'
                }}>
                    <Typography variant="body2" fontWeight={700} color="text.primary">
                        {params.value}
                    </Typography>
                </Box>
            )
        },
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
            headerName: 'EXAMS',
            field: 'examCount',
            width: 100,
            cellRenderer: (params) => (
                <Chip
                    label={params.value || 0}
                    size="small"
                    color={params.value > 0 ? "info" : "default"}
                    sx={{ fontWeight: 'bold' }}
                />
            )
        },
        {
            headerName: 'ASSIGNMENTS',
            field: 'assignmentCount',
            width: 120,
            cellRenderer: (params) => (
                <Chip
                    label={params.value || 0}
                    size="small"
                    color={params.value > 0 ? "primary" : "default"}
                    sx={{ fontWeight: 'bold' }}
                />
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
                            <IconButton size="small" sx={{ color: '#ff5722' }} title="Assign Assignment" onClick={() => handleAssignAssignment(params.data)} disabled={user?.role === 'teacher' && user?.permissions === 'read'}>
                                <AssignmentIcon fontSize="inherit" />
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
    ], [user, handleViewCourse, handleAssignExam, handleAssignAssignment, handleReviewCourse, handleEditCourse, handleTogglePublish]);

    const filteredCourses = useMemo(() => {
        if (!searchTerm) return courses;
        return courses.filter(c => 
            c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.courseType?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [courses, searchTerm]);

    return (
        <Box sx={{ p: 2 }}>
            {/* Header & Controls */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', md: 'center' },
                mb: 3,
                gap: 2
            }}>
                <Box>
                    <Typography variant="h5" fontWeight={800}>Course Management</Typography>
                    <Typography variant="caption" color="text.secondary">Manage your curriculum and student access</Typography>
                </Box>

                <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
                    <Paper 
                        elevation={0} 
                        sx={{ 
                            p: '2px 4px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            width: { xs: '100%', md: 300 },
                            bgcolor: 'rgba(0,0,0,0.04)',
                            borderRadius: '12px'
                        }}
                    >
                        <IconButton sx={{ p: '10px' }} aria-label="search">
                            <SearchIcon fontSize="small" />
                        </IconButton>
                        <InputBase
                            sx={{ ml: 1, flex: 1, fontSize: '0.875rem' }}
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Paper>

                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(e, v) => v && setViewMode(v)}
                        size="small"
                        sx={{ bgcolor: 'white', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)' }}
                    >
                        <ToggleButton value="grid" sx={{ px: 2, borderRadius: '10px !important' }}>
                            <GridViewIcon fontSize="small" />
                        </ToggleButton>
                        <ToggleButton value="list" sx={{ px: 2, borderRadius: '10px !important' }}>
                            <ViewListIcon fontSize="small" />
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <Button
                        variant="contained"
                        sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 3,
                            borderRadius: '12px',
                            boxShadow: 'none',
                            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
                        }}
                        startIcon={<AddIcon />}
                        onClick={handleAddCourse}
                        disabled={user?.role === 'teacher' && user?.permissions === 'read'}
                    >
                        New Course
                    </Button>
                </Stack>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : viewMode === 'list' ? (
                <DataTable
                    rowData={filteredCourses}
                    columnDefs={columnDefs}
                    loading={loading}
                    enableGlobalSearch={false} // We have our own search
                />
            ) : (
                <Grid container spacing={3}>
                    {filteredCourses.map((course) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={course._id}>
                            <Card 
                                sx={{ 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    borderRadius: '20px',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                                    },
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}
                            >
                                <Box sx={{ position: 'relative' }}>
                                    <CardMedia
                                        component="img"
                                        height="160"
                                        image={course.thumbnail || 'https://via.placeholder.com/400x225?text=No+Image'}
                                        alt={course.title}
                                    />
                                    <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 0.5 }}>
                                        <Chip 
                                            label={course.courseType === 'offline' ? 'Offline' : 'Online'} 
                                            size="small"
                                            sx={{ 
                                                bgcolor: course.courseType === 'offline' ? 'rgba(156, 39, 176, 0.9)' : 'rgba(33, 150, 243, 0.9)',
                                                color: 'white',
                                                fontWeight: 800,
                                                fontSize: '0.65rem',
                                                backdropFilter: 'blur(4px)'
                                            }}
                                        />
                                        <Chip 
                                            label={course.isPublished ? 'Active' : 'Draft'} 
                                            size="small"
                                            sx={{ 
                                                bgcolor: course.isPublished ? 'rgba(76, 175, 80, 0.9)' : 'rgba(158, 158, 158, 0.9)',
                                                color: 'white',
                                                fontWeight: 800,
                                                fontSize: '0.65rem',
                                                backdropFilter: 'blur(4px)'
                                            }}
                                        />
                                    </Box>
                                </Box>

                                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                    <Typography variant="caption" color="primary" fontWeight={800} sx={{ textTransform: 'uppercase', fontSize: '0.65rem', mb: 0.5, display: 'block' }}>
                                        {course.category?.name || 'Global'}
                                    </Typography>
                                    <Typography variant="body1" fontWeight={800} gutterBottom sx={{ 
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        height: '3em',
                                        lineHeight: '1.5em'
                                    }}>
                                        {course.title}
                                    </Typography>
                                    
                                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">Students</Typography>
                                            <Typography variant="body2" fontWeight={700}>{course.enrolledStudents?.length || 0}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">Exams</Typography>
                                            <Typography variant="body2" fontWeight={700}>{course.examCount || 0}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">Price</Typography>
                                            <Typography variant="body2" fontWeight={700} color="success.main">
                                                {course.price === 0 ? 'FREE' : `₹${course.price}`}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>

                                <Divider sx={{ borderStyle: 'dashed' }} />
                                
                                <CardActions sx={{ p: 1.5, justifyContent: 'space-between' }}>
                                    <Stack direction="row" spacing={0.5}>
                                        <IconButton size="small" sx={{ color: '#00bcd4', bgcolor: 'rgba(0,188,212,0.08)' }} title="View" onClick={() => handleViewCourse(course)}>
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" sx={{ color: '#4caf50', bgcolor: 'rgba(76,175,80,0.08)' }} onClick={() => handleEditCourse(course._id)} title="Edit">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>

                                    <Stack direction="row" spacing={0.5}>
                                        <Tooltip title="Assignments">
                                            <IconButton size="small" sx={{ color: '#ff5722' }} onClick={() => handleAssignAssignment(course)}>
                                                <AssignmentIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Exams">
                                            <IconButton size="small" sx={{ color: '#9c27b0' }} onClick={() => handleAssignExam(course)}>
                                                <QuizIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <CourseActionMenu 
                                            course={course} 
                                            onReview={handleReviewCourse}
                                            onDelete={(c) => { setCourseToDelete(c); setDeleteDialogOpen(true); }}
                                            onTogglePublish={handleTogglePublish}
                                        />
                                    </Stack>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

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
                    onSuccess={handleActionSuccess}
                />
            )}

            {assignAssignmentModalOpen && (
                <AssignAssignmentModal
                    open={assignAssignmentModalOpen}
                    onClose={() => setAssignAssignmentModalOpen(false)}
                    courseId={selectedCourseForAction?._id}
                    courseTitle={selectedCourseForAction?.title}
                    onSuccess={handleActionSuccess}
                />
            )}

            {reviewModalOpen && (
                <ReviewModal
                    open={reviewModalOpen}
                    onClose={() => setReviewModalOpen(false)}
                    courseId={selectedCourseForAction?._id}
                    courseTitle={selectedCourseForAction?.title}
                    onSuccess={handleActionSuccess}
                />
            )}
        </Box>
    );
};

export default CourseList;
