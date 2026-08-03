import React from 'react';
import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, LinearProgress, Chip, Skeleton } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { formatDuration } from '../../../utils/formatDuration';

export function CurriculumSidebar({ lessons, activeLessonId, onSelect, completedLessonIds, progressPercent }) {
    return (
        <Box
            sx={{
                width: { xs: '100%', md: '20%' },
                minWidth: { md: 260 },
                borderLeft: { md: '1px solid' },
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden',
            }}
        >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={800}>Curriculum</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <LinearProgress
                        variant="determinate"
                        value={progressPercent || 0}
                        sx={{ flex: 1, height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                        {Math.round(progressPercent || 0)}%
                    </Typography>
                </Box>
            </Box>

            <List sx={{ p: 1, overflowY: 'auto', flex: 1 }}>
                {lessons.map((lesson, idx) => {
                    const isActive = lesson.id === activeLessonId;
                    const isDone = completedLessonIds.includes(String(lesson.id));
                    return (
                        <ListItemButton
                            key={lesson.id}
                            selected={isActive}
                            onClick={() => onSelect(lesson)}
                            sx={{ borderRadius: '10px', mb: 0.5, alignItems: 'flex-start' }}
                        >
                            <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                                {isDone ? (
                                    <CheckCircleIcon fontSize="small" color="success" />
                                ) : (
                                    <RadioButtonUncheckedIcon fontSize="small" color="disabled" />
                                )}
                            </ListItemIcon>
                            <ListItemText
                                primary={`${idx + 1}. ${lesson.title}`}
                                secondary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                                        {lesson.type === 'pdf' ? <PictureAsPdfIcon sx={{ fontSize: 14 }} /> : <PlayCircleOutlineIcon sx={{ fontSize: 14 }} />}
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDuration(lesson.duration) || lesson.type}
                                        </Typography>
                                        {lesson.freePreview && <Chip label="Preview" size="small" sx={{ height: 16, fontSize: '0.6rem', ml: 0.5 }} />}
                                    </Box>
                                }
                                primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: isActive ? 800 : 600 }}
                                secondaryTypographyProps={{ component: 'div' }}
                            />
                        </ListItemButton>
                    );
                })}
            </List>
        </Box>
    );
}

export function CurriculumSidebarSkeleton() {
    return (
        <Box
            sx={{
                width: { xs: '100%', md: '20%' },
                minWidth: { md: 260 },
                borderLeft: { md: '1px solid' },
                borderColor: 'divider',
                bgcolor: 'background.paper',
                p: 2,
            }}
        >
            <Skeleton variant="text" width="50%" height={28} />
            <Skeleton variant="rounded" height={6} sx={{ my: 1.5, borderRadius: 3 }} />
            {[1, 2, 3, 4, 5].map((n) => (
                <Box key={n} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2 }}>
                    <Skeleton variant="circular" width={20} height={20} />
                    <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="90%" />
                        <Skeleton variant="text" width="40%" />
                    </Box>
                </Box>
            ))}
        </Box>
    );
}
