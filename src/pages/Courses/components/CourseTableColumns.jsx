import React from 'react';
import { Box, Typography, Chip, IconButton } from '@mui/material';

// I will import normally to be safe
import Star from '@mui/icons-material/Star';
import Quiz from '@mui/icons-material/Quiz';
import Assignment from '@mui/icons-material/Assignment';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Visibility from '@mui/icons-material/Visibility';
import ContentCopy from '@mui/icons-material/ContentCopy';

export const getCourseTableColumns = ({ 
    user, handleViewCourse, handleAssignExam, handleAssignAssignment, 
    handleReviewCourse, handleEditCourse, handleTogglePublish, 
    setCourseToDelete, setDeleteDialogOpen, handleDuplicateCourse 
}) => [
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
                    width: 45, height: 45, borderRadius: 1, overflow: 'hidden', mt: 0.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                    label={isOffline ? 'Offline' : 'Online'} size="small"
                    sx={{
                        borderRadius: 1, bgcolor: isOffline ? 'rgba(156, 39, 176, 0.1)' : 'rgba(33, 150, 243, 0.1)',
                        color: isOffline ? '#9c27b0' : '#2196f3', fontWeight: 800, fontSize: '0.65rem',
                        border: '1px solid', borderColor: isOffline ? 'rgba(156, 39, 176, 0.2)' : 'rgba(33, 150, 243, 0.2)',
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
                py: 1, px: 1, borderRadius: 1,
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
                label={params.value?.name || params.value || 'Global'} size="small"
                sx={{ borderRadius: 1, bgcolor: 'rgba(0,0,0,0.05)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'capitalize' }}
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
            <Chip label={params.value || 0} size="small" color={params.value > 0 ? "info" : "default"} sx={{ fontWeight: 'bold' }} />
        )
    },
    {
        headerName: 'ASSIGNMENTS',
        field: 'assignmentCount',
        width: 120,
        cellRenderer: (params) => (
            <Chip label={params.value || 0} size="small" color={params.value > 0 ? "primary" : "default"} sx={{ fontWeight: 'bold' }} />
        )
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
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                    {isFree ? (
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>FREE</Typography>
                    ) : (
                        <>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>₹{price}</Typography>
                            {originalPrice > price && (
                                <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>₹{originalPrice}</Typography>
                            )}
                        </>
                    )}
                </Box>
            );
        }
    },
    {
        field: 'isPublished',
        headerName: 'STATUS',
        width: 120,
        cellRenderer: (params) => (
            <Chip
                label={params.value ? 'Active' : 'Inactive'} color={params.value ? 'success' : 'default'} size="small"
                sx={{ borderRadius: 1, minWidth: 80, fontWeight: 600, fontSize: '0.7rem' }}
                onClick={() => handleTogglePublish(params.data)}
            />
        ),
    },
    {
        headerName: 'ACTIONS',
        field: 'actions',
        width: 320,
        pinned: 'right',
        cellRenderer: (params) => {
            const canEditDelet = user?.role === 'admin' || (user?.role === 'teacher' && user?.permissions === 'fullControl');
            return (
                <Box sx={{ display: 'flex', gap: 0.5, p: 0.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, bgcolor: 'rgba(0,0,0,0.04)', p: 0.5, borderRadius: 1 }}>
                        <IconButton size="small" sx={{ color: '#00bcd4' }} title="View" onClick={() => handleViewCourse(params.data)}><Visibility fontSize="inherit" /></IconButton>
                        <IconButton size="small" sx={{ color: '#2196f3' }} title="Duplicate" onClick={() => handleDuplicateCourse(params.data._id)}><ContentCopy fontSize="inherit" /></IconButton>
                        <IconButton size="small" sx={{ color: '#ffb300' }} title="Ratings" onClick={() => handleReviewCourse(params.data)}><Star fontSize="inherit" /></IconButton>
                        <IconButton size="small" sx={{ color: '#4caf50' }} onClick={() => handleEditCourse(params.data._id)} title="Edit" disabled={!canEditDelet}><Edit fontSize="inherit" /></IconButton>
                        <IconButton size="small" sx={{ color: '#f44336' }} onClick={() => { setCourseToDelete(params.data); setDeleteDialogOpen(true); }} title="Delete" disabled={!canEditDelet}><Delete fontSize="inherit" /></IconButton>
                    </Box>
                </Box>
            );
        }
    }
];
