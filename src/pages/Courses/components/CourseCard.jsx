import React, { useState } from 'react';
import { Box, Typography, Card, CardMedia, CardContent, CardActions, Stack, Chip, Divider, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VideocamIcon from '@mui/icons-material/Videocam';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PeopleIcon from '@mui/icons-material/People';
import QuizIcon from '@mui/icons-material/Quiz';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { fixUrl } from '../../../utils/api';
import { hasModulePermission } from '../../../utils/permissions';

const CourseActionMenu = ({ course, onReview, onDelete, onTogglePublish, canDelete }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    return (
        <>
            <IconButton 
                size="small" 
                onClick={handleClick}
                sx={{ 
                    color: 'var(--color-vc-mute)',
                    '&:hover': {
                        color: 'var(--color-vc-ink)',
                        bgcolor: 'var(--color-vc-canvas-soft)'
                    }
                }}
            >
                <MoreVertIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Menu
                anchorEl={anchorEl} open={open} onClose={handleClose}
                PaperProps={{ 
                    sx: { 
                        bgcolor: 'var(--color-vc-canvas)',
                        color: 'var(--color-vc-ink)',
                        border: '1px solid var(--color-vc-hairline)',
                        borderRadius: '6px', 
                        minWidth: 160, 
                        boxShadow: '0px 8px 16px -4px rgba(0,0,0,0.08)',
                        '& .MuiMenuItem-root': {
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            py: 1,
                            '&:hover': {
                                bgcolor: 'var(--color-vc-canvas-soft)'
                            }
                        }
                    } 
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={() => { handleClose(); onTogglePublish(course); }}>
                    {course.isPublished ? (
                        <><VisibilityOffIcon fontSize="small" sx={{ mr: 1.5, color: 'var(--color-vc-mute)', fontSize: 16 }} /> Unpublish</>
                    ) : (
                        <><VisibilityIcon fontSize="small" sx={{ mr: 1.5, color: 'var(--color-vc-link)', fontSize: 16 }} /> Publish</>
                    )}
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); onReview(course); }}>
                    <StarIcon fontSize="small" sx={{ mr: 1.5, color: 'var(--color-vc-warning-deep)', fontSize: 16 }} /> Ratings & Reviews
                </MenuItem>
                {canDelete && (
                    <>
                        <Divider sx={{ borderColor: 'var(--color-vc-hairline)' }} />
                        <MenuItem onClick={() => { handleClose(); onDelete(course); }} sx={{ color: 'var(--color-vc-error-deep)' }}>
                            <DeleteIcon fontSize="small" sx={{ mr: 1.5, fontSize: 16 }} /> Delete Course
                        </MenuItem>
                    </>
                )}
            </Menu>
        </>
    );
};

const CourseCard = ({ course, handleViewCourse, handleEditCourse, handleAssignAssignment, handleAssignExam, handleReviewCourse, handleTogglePublish, setCourseToDelete, setDeleteDialogOpen, handleDuplicateCourse, handleManageLiveClasses, user }) => {
    const isOffline = course.courseType === 'offline';
    const canEdit = hasModulePermission(user, 'courses', 'edit');
    const canDelete = hasModulePermission(user, 'courses', 'delete');
    
    return (
        <Card
            sx={{
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                borderRadius: '8px',
                bgcolor: 'var(--color-vc-canvas)',
                border: '1px solid var(--color-vc-hairline)', 
                boxShadow: '0px 1px 1px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease',
                '&:hover': { 
                    borderColor: 'var(--color-vc-hairline-strong)',
                    boxShadow: '0px 2px 2px rgba(0,0,0,0.02), 0px 8px 16px -4px rgba(0,0,0,0.04)',
                    transform: 'translateY(-2px)'
                },
                overflow: 'hidden', 
                position: 'relative'
            }}
        >
            <Box sx={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                <CardMedia 
                    component="img" 
                    height="160" 
                    image={course.thumbnail ? fixUrl(course.thumbnail) : 'https://via.placeholder.com/400x225?text=No+Image'} 
                    alt={course.title}
                    sx={{
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.03)'
                        }
                    }}
                />
                <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 0.5 }}>
                    <Chip 
                        label={isOffline ? 'Offline' : 'Online'} 
                        size="small" 
                        sx={{ 
                            borderRadius: '4px',
                            height: 20,
                            fontSize: '10px',
                            fontWeight: 600,
                            bgcolor: isOffline ? 'var(--color-vc-violet-soft)' : 'var(--color-vc-link-bg-soft)',
                            color: isOffline ? 'var(--color-vc-violet-deep)' : 'var(--color-vc-link-deep)',
                            border: '1px solid transparent',
                            backdropFilter: 'blur(4px)'
                        }} 
                    />
                    <Chip 
                        label={course.isPublished ? 'Published' : 'Draft'} 
                        size="small" 
                        sx={{ 
                            borderRadius: '4px',
                            height: 20,
                            fontSize: '10px',
                            fontWeight: 600,
                            bgcolor: course.isPublished ? 'rgba(41, 188, 155, 0.15)' : 'var(--color-vc-canvas-soft-2)',
                            color: course.isPublished ? 'var(--color-vc-cyan-deep)' : 'var(--color-vc-mute)',
                            border: '1px solid transparent',
                            backdropFilter: 'blur(4px)'
                        }} 
                    />
                </Box>
            </Box>

            <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography 
                    variant="caption" 
                    sx={{ 
                        textTransform: 'uppercase', 
                        fontSize: '10px', 
                        fontWeight: 600, 
                        color: 'var(--color-vc-mute)', 
                        mb: 0.5, 
                        display: 'block' 
                    }}
                >
                    {course.category?.name || course.category || 'Global'}
                </Typography>
                <Typography 
                    variant="body1" 
                    sx={{ 
                        fontWeight: 600, 
                        color: 'var(--color-vc-ink)',
                        fontSize: '15px',
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden', 
                        height: '2.6em', 
                        lineHeight: '1.3em',
                        fontFamily: 'inherit',
                        mb: 1.5
                    }}
                >
                    {course.title}
                </Typography>
                
                <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                    <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={0.5} alignItems="center" mb={0.25}>
                            <PeopleIcon sx={{ fontSize: 13, color: 'var(--color-vc-mute)' }} />
                            <Typography sx={{ fontSize: '10px', color: 'var(--color-vc-mute)', fontWeight: 500 }}>Students</Typography>
                        </Stack>
                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)' }}>
                            {course.enrolledStudents?.length || 0}
                        </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={0.5} alignItems="center" mb={0.25}>
                            <QuizIcon sx={{ fontSize: 13, color: 'var(--color-vc-mute)' }} />
                            <Typography sx={{ fontSize: '10px', color: 'var(--color-vc-mute)', fontWeight: 500 }}>Exams</Typography>
                        </Stack>
                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)' }}>
                            {course.examCount || 0}
                        </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={0.5} alignItems="center" mb={0.25}>
                            <AttachMoneyIcon sx={{ fontSize: 13, color: 'var(--color-vc-mute)' }} />
                            <Typography sx={{ fontSize: '10px', color: 'var(--color-vc-mute)', fontWeight: 500 }}>Price</Typography>
                        </Stack>
                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: course.price === 0 ? 'var(--color-vc-cyan-deep)' : 'var(--color-vc-ink)' }}>
                            {course.price === 0 ? 'FREE' : `₹${course.price}`}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>

            <Divider sx={{ borderColor: 'var(--color-vc-hairline)' }} />
            <CardActions sx={{ p: 1.5, justifyContent: 'space-between', bgcolor: 'var(--color-vc-canvas-soft)' }}>
                <Stack direction="row" spacing={1}>
                    <Tooltip title="View">
                        <IconButton 
                            size="small" 
                            onClick={() => handleViewCourse(course)}
                            sx={{ 
                                border: '1px solid var(--color-vc-hairline)', 
                                borderRadius: '4px', 
                                p: '5px', 
                                color: 'var(--color-vc-mute)', 
                                bgcolor: 'var(--color-vc-canvas)',
                                '&:hover': { 
                                    borderColor: 'var(--color-vc-hairline-strong)', 
                                    bgcolor: 'var(--color-vc-canvas-soft-2)',
                                    color: 'var(--color-vc-ink)' 
                                } 
                            }} 
                        >
                            <VisibilityIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                    </Tooltip>
                    {canEdit && (
                        <Tooltip title="Edit">
                            <IconButton
                                size="small"
                                onClick={() => handleEditCourse(course.id || course._id)}
                                sx={{
                                    border: '1px solid var(--color-vc-hairline)',
                                    borderRadius: '4px',
                                    p: '5px',
                                    color: 'var(--color-vc-mute)',
                                    bgcolor: 'var(--color-vc-canvas)',
                                    '&:hover': {
                                        borderColor: 'var(--color-vc-hairline-strong)',
                                        bgcolor: 'var(--color-vc-canvas-soft-2)',
                                        color: 'var(--color-vc-ink)'
                                    }
                                }}
                            >
                                <EditIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="Duplicate">
                        <IconButton 
                            size="small" 
                            onClick={() => handleDuplicateCourse(course.id || course._id)}
                            sx={{ 
                                border: '1px solid var(--color-vc-hairline)', 
                                borderRadius: '4px', 
                                p: '5px', 
                                color: 'var(--color-vc-mute)', 
                                bgcolor: 'var(--color-vc-canvas)',
                                '&:hover': { 
                                    borderColor: 'var(--color-vc-hairline-strong)', 
                                    bgcolor: 'var(--color-vc-canvas-soft-2)',
                                    color: 'var(--color-vc-ink)' 
                                } 
                            }} 
                        >
                            <ContentCopyIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Live Classes">
                        <IconButton
                            size="small"
                            onClick={() => handleManageLiveClasses(course)}
                            sx={{
                                border: '1px solid var(--color-vc-hairline)',
                                borderRadius: '4px',
                                p: '5px',
                                color: 'var(--color-vc-mute)',
                                bgcolor: 'var(--color-vc-canvas)',
                                '&:hover': {
                                    borderColor: 'var(--color-vc-hairline-strong)',
                                    bgcolor: 'var(--color-vc-canvas-soft-2)',
                                    color: 'var(--color-vc-ink)'
                                }
                            }}
                        >
                            <VideocamIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
                <CourseActionMenu
                    course={course}
                    onReview={handleReviewCourse}
                    onDelete={(c) => { setCourseToDelete(c); setDeleteDialogOpen(true); }}
                    onTogglePublish={handleTogglePublish}
                    canDelete={canDelete}
                />
            </CardActions>
        </Card>
    );
};

export default CourseCard;
