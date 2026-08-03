import React from 'react';
import { Box, Typography, Chip, IconButton, Tooltip, Stack } from '@mui/material';
import Star from '@mui/icons-material/Star';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Visibility from '@mui/icons-material/Visibility';
import ContentCopy from '@mui/icons-material/ContentCopy';
import Videocam from '@mui/icons-material/Videocam';
import { fixUrl } from '../../../utils/api';
import { hasModulePermission } from '../../../utils/permissions';

export const getCourseTableColumns = ({
    user, handleViewCourse, handleAssignExam, handleAssignAssignment,
    handleReviewCourse, handleEditCourse, handleTogglePublish,
    setCourseToDelete, setDeleteDialogOpen, handleDuplicateCourse, handleManageLiveClasses
}) => [
    {
        headerName: '#',
        valueGetter: (params) => params.node.rowIndex + 1,
        width: 60,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { display: 'flex', alignItems: 'center' }
    },
    {
        headerName: 'THUMBNAIL',
        field: 'thumbnail',
        width: 100,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params) => (
            <Box
                sx={{
                    width: 42, 
                    height: 42, 
                    borderRadius: '4px', 
                    overflow: 'hidden',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'var(--color-vc-canvas-soft-2)',
                    border: '1px solid var(--color-vc-hairline)'
                }}
            >
                {params.value ? (
                    <img src={fixUrl(params.value)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--color-vc-mute)', fontSize: '9px' }}>NO IMG</Typography>
                )}
            </Box>
        )
    },
    {
        field: 'courseType',
        headerName: 'TYPE',
        width: 90,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params) => {
            const isOffline = params.value === 'offline';
            return (
                <Chip
                    label={isOffline ? 'Offline' : 'Online'} 
                    size="small"
                    sx={{
                        borderRadius: '4px', 
                        height: 20,
                        bgcolor: isOffline ? 'var(--color-vc-violet-soft)' : 'var(--color-vc-link-bg-soft)',
                        color: isOffline ? 'var(--color-vc-violet-deep)' : 'var(--color-vc-link-deep)', 
                        fontWeight: 600, 
                        fontSize: '9px',
                        border: '1px solid transparent',
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
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params) => (
            <Box sx={{
                py: 0.5, 
                px: 1, 
                borderRadius: '4px',
                width: '100%',
                bgcolor: params.data.courseType === 'offline' ? 'rgba(121, 40, 202, 0.05)' : 'transparent',
                borderLeft: params.data.courseType === 'offline' ? '3px solid var(--color-vc-violet-deep)' : 'none'
            }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-vc-ink)', fontFamily: 'inherit', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {params.value}
                </Typography>
            </Box>
        )
    },
    {
        field: 'category',
        headerName: 'CATEGORY',
        valueGetter: (params) => params.data.category?.name || params.data.category || 'Global',
        width: 120,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params) => (
            <Chip
                label={params.value || 'Global'} 
                size="small"
                sx={{ 
                    borderRadius: '4px', 
                    height: 20,
                    bgcolor: 'var(--color-vc-canvas-soft-2)', 
                    color: 'var(--color-vc-body)',
                    border: '1px solid var(--color-vc-hairline)',
                    fontSize: '10px', 
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
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-vc-ink)' }}>{params.value}</Typography>
                <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '11px' }}>Students</Typography>
            </Box>
        )
    },
    {
        headerName: 'EXAMS',
        field: 'examCount',
        width: 90,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params) => {
            const count = params.value || 0;
            return (
                <Chip 
                    label={count} 
                    size="small" 
                    sx={{ 
                        borderRadius: '4px',
                        height: 20,
                        fontWeight: 600,
                        fontSize: '10px',
                        bgcolor: count > 0 ? 'var(--color-vc-link-bg-soft)' : 'var(--color-vc-canvas-soft-2)',
                        color: count > 0 ? 'var(--color-vc-link-deep)' : 'var(--color-vc-mute)',
                        border: count > 0 ? '1px solid var(--color-vc-link-bg-soft)' : '1px solid var(--color-vc-hairline)'
                    }} 
                />
            );
        }
    },
    {
        headerName: 'ASSIGNMENTS',
        field: 'assignmentCount',
        width: 110,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params) => {
            const count = params.value || 0;
            return (
                <Chip 
                    label={count} 
                    size="small" 
                    sx={{ 
                        borderRadius: '4px',
                        height: 20,
                        fontWeight: 600,
                        fontSize: '10px',
                        bgcolor: count > 0 ? 'rgba(41, 188, 155, 0.15)' : 'var(--color-vc-canvas-soft-2)',
                        color: count > 0 ? 'var(--color-vc-cyan-deep)' : 'var(--color-vc-mute)',
                        border: count > 0 ? '1px solid rgba(41, 188, 155, 0.3)' : '1px solid var(--color-vc-hairline)'
                    }} 
                />
            );
        }
    },
    {
        field: 'price',
        headerName: 'PRICE',
        width: 120,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params) => {
            const price = params.data.price ?? 0;
            const originalPrice = params.data.originalPrice ?? 0;
            const isFree = price === 0;
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                    {isFree ? (
                        <Typography sx={{ fontWeight: 600, color: 'var(--color-vc-cyan-deep)', fontSize: '13px' }}>FREE</Typography>
                    ) : (
                        <>
                            <Typography sx={{ fontWeight: 600, color: 'var(--color-vc-ink)', fontSize: '13px' }}>₹{price}</Typography>
                            {originalPrice > price && (
                                <Typography sx={{ textDecoration: 'line-through', color: 'var(--color-vc-mute)', fontSize: '11px', mt: 0.25 }}>₹{originalPrice}</Typography>
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
        width: 100,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params) => (
            <Chip
                label={params.value ? 'Published' : 'Draft'} 
                size="small"
                sx={{ 
                    borderRadius: '4px', 
                    height: 20,
                    minWidth: 70, 
                    fontWeight: 600, 
                    fontSize: '10px',
                    cursor: 'pointer',
                    bgcolor: params.value ? 'rgba(41, 188, 155, 0.15)' : 'var(--color-vc-canvas-soft-2)',
                    color: params.value ? 'var(--color-vc-cyan-deep)' : 'var(--color-vc-mute)',
                    border: '1px solid transparent',
                    '&:hover': {
                        opacity: 0.8
                    }
                }}
                onClick={() => handleTogglePublish(params.data)}
            />
        ),
    },
    {
        headerName: 'ACTIONS',
        field: 'actions',
        width: 200,
        pinned: 'right',
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params) => {
            const canEditDelete = user?.role === 'admin' || (user?.role === 'teacher' && user?.permissions === 'fullControl');
            const canEdit = canEditDelete && hasModulePermission(user, 'courses', 'edit');
            const canDelete = canEditDelete && hasModulePermission(user, 'courses', 'delete');
            return (
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <Tooltip title="View Detail">
                        <IconButton
                            size="small"
                            onClick={() => handleViewCourse(params.data)}
                            sx={{ border: '1px solid transparent', borderRadius: '4px', p: '4px', color: 'var(--color-vc-link)', '&:hover': { borderColor: 'var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)' } }}
                        >
                            <Visibility sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Duplicate">
                        <IconButton
                            size="small"
                            onClick={() => handleDuplicateCourse(params.data.id || params.data._id)}
                            sx={{ border: '1px solid transparent', borderRadius: '4px', p: '4px', color: 'var(--color-vc-mute)', '&:hover': { borderColor: 'var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)', color: 'var(--color-vc-ink)' } }}
                        >
                            <ContentCopy sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Live Classes">
                        <IconButton
                            size="small"
                            onClick={() => handleManageLiveClasses(params.data)}
                            sx={{ border: '1px solid transparent', borderRadius: '4px', p: '4px', color: 'var(--color-vc-mute)', '&:hover': { borderColor: 'var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)', color: 'var(--color-vc-ink)' } }}
                        >
                            <Videocam sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Ratings & Reviews">
                        <IconButton
                            size="small"
                            onClick={() => handleReviewCourse(params.data)}
                            sx={{ border: '1px solid transparent', borderRadius: '4px', p: '4px', color: 'var(--color-vc-warning-deep)', '&:hover': { borderColor: 'var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)' } }}
                        >
                            <Star sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                    {hasModulePermission(user, 'courses', 'edit') && (
                        <Tooltip title="Edit">
                            <IconButton
                                size="small"
                                onClick={() => handleEditCourse(params.data.id || params.data._id)}
                                disabled={!canEdit}
                                sx={{ border: '1px solid transparent', borderRadius: '4px', p: '4px', color: 'var(--color-vc-mute)', '&:hover': { borderColor: 'var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)', color: 'var(--color-vc-ink)' } }}
                            >
                                <Edit sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {hasModulePermission(user, 'courses', 'delete') && (
                        <Tooltip title="Delete">
                            <IconButton
                                size="small"
                                onClick={() => { setCourseToDelete(params.data); setDeleteDialogOpen(true); }}
                                disabled={!canDelete}
                                sx={{ border: '1px solid transparent', borderRadius: '4px', p: '4px', color: 'var(--color-vc-error-deep)', '&:hover': { borderColor: 'var(--color-vc-error-soft)', bgcolor: 'var(--color-vc-error-soft)20' } }}
                            >
                                <Delete sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            );
        }
    }
];
