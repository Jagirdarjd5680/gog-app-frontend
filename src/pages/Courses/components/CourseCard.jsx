import React, { useState } from 'react';
import { Box, Typography, Card, CardMedia, CardContent, CardActions, Stack, Chip, Divider, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { fixUrl } from '../../../utils/api';

const CourseActionMenu = ({ course, onReview, onDelete, onTogglePublish }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    return (
        <>
            <IconButton size="small" onClick={handleClick}><MoreVertIcon fontSize="small" /></IconButton>
            <Menu
                anchorEl={anchorEl} open={open} onClose={handleClose}
                PaperProps={{ sx: { borderRadius: '12px', minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.06)', mt: 1 } }}
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

const CourseCard = ({ course, handleViewCourse, handleEditCourse, handleAssignAssignment, handleAssignExam, handleReviewCourse, handleTogglePublish, setCourseToDelete, setDeleteDialogOpen, handleDuplicateCourse }) => {
    return (
        <Card
            sx={{
                height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '20px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' },
                border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden', position: 'relative'
            }}
        >
            <Box sx={{ position: 'relative' }}>
                <CardMedia component="img" height="160" image={course.thumbnail ? fixUrl(course.thumbnail) : 'https://via.placeholder.com/400x225?text=No+Image'} alt={course.title} />
                <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 0.5 }}>
                    <Chip label={course.courseType === 'offline' ? 'Offline' : 'Online'} size="small" sx={{ bgcolor: course.courseType === 'offline' ? 'rgba(156, 39, 176, 0.9)' : 'rgba(33, 150, 243, 0.9)', color: 'white', fontWeight: 800, fontSize: '0.65rem', backdropFilter: 'blur(4px)' }} />
                    <Chip label={course.isPublished ? 'Published' : 'Draft'} size="small" sx={{ bgcolor: course.isPublished ? 'rgba(76, 175, 80, 0.9)' : 'rgba(158, 158, 158, 0.9)', color: 'white', fontWeight: 800, fontSize: '0.65rem', backdropFilter: 'blur(4px)' }} />
                </Box>
            </Box>

            <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography variant="caption" color="primary" fontWeight={800} sx={{ textTransform: 'uppercase', fontSize: '0.65rem', mb: 0.5, display: 'block' }}>{course.category?.name || 'Global'}</Typography>
                <Typography variant="body1" fontWeight={800} gutterBottom sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '3em', lineHeight: '1.5em' }}>{course.title}</Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Box><Typography variant="caption" color="text.secondary" display="block">Students</Typography><Typography variant="body2" fontWeight={700}>{course.enrolledStudents?.length || 0}</Typography></Box>
                    <Box><Typography variant="caption" color="text.secondary" display="block">Exams</Typography><Typography variant="body2" fontWeight={700}>{course.examCount || 0}</Typography></Box>
                    <Box><Typography variant="caption" color="text.secondary" display="block">Price</Typography><Typography variant="body2" fontWeight={700} color="success.main">{course.price === 0 ? 'FREE' : `₹${course.price}`}</Typography></Box>
                </Stack>
            </CardContent>

            <Divider sx={{ borderStyle: 'dashed' }} />
            <CardActions sx={{ p: 1.5, justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={0.5}>
                    <Tooltip title="View"><IconButton size="small" sx={{ color: '#00bcd4', bgcolor: 'rgba(0,188,212,0.08)' }} onClick={() => handleViewCourse(course)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Edit"><IconButton size="small" sx={{ color: '#4caf50', bgcolor: 'rgba(76,175,80,0.08)' }} onClick={() => handleEditCourse(course._id)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Duplicate"><IconButton size="small" sx={{ color: '#2196f3', bgcolor: 'rgba(33,150,243,0.08)' }} onClick={() => handleDuplicateCourse(course._id)}><ContentCopyIcon fontSize="small" /></IconButton></Tooltip>
                </Stack>
                <Stack direction="row" spacing={0.5}>
                    <CourseActionMenu course={course} onReview={handleReviewCourse} onDelete={(c) => { setCourseToDelete(c); setDeleteDialogOpen(true); }} onTogglePublish={handleTogglePublish} />
                </Stack>
            </CardActions>
        </Card>
    );
};

export default CourseCard;
