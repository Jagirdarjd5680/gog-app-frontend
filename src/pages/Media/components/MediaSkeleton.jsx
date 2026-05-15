import React from 'react';
import { Box, Skeleton, alpha, useTheme } from '@mui/material';

// ── Card Skeleton (Grid View) ────────────────────────────────────────────────
export const MediaCardSkeleton = () => {
    const theme = useTheme();
    return (
        <Box sx={{
            borderRadius: 1,
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper'
        }}>
            <Skeleton variant="rectangular" width="100%" height={160} animation="wave" />
            <Box sx={{ p: 1.5 }}>
                <Skeleton variant="text" width="70%" height={18} animation="wave" />
                <Skeleton variant="text" width="40%" height={14} animation="wave" sx={{ mt: 0.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                    <Skeleton variant="rounded" width={48} height={24} animation="wave" />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Skeleton variant="circular" width={24} height={24} animation="wave" />
                        <Skeleton variant="circular" width={24} height={24} animation="wave" />
                        <Skeleton variant="circular" width={24} height={24} animation="wave" />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

// ── Grid Skeleton (4 columns) ─────────────────────────────────────────────────
export const MediaGridSkeleton = ({ count = 8 }) => (
    <Box>
        <Skeleton variant="text" width={160} height={20} sx={{ mb: 2 }} animation="wave" />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
            {Array.from({ length: count }).map((_, i) => (
                <MediaCardSkeleton key={i} />
            ))}
        </Box>
    </Box>
);

// ── Table Row Skeleton (List View) ───────────────────────────────────────────
export const MediaRowSkeleton = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Skeleton variant="circular" width={18} height={18} animation="wave" />
        <Skeleton variant="rounded" width={32} height={32} animation="wave" />
        <Skeleton variant="text" width="35%" height={18} animation="wave" />
        <Box sx={{ flexGrow: 1 }} />
        <Skeleton variant="text" width={60} height={16} animation="wave" />
        <Skeleton variant="text" width={80} height={16} animation="wave" sx={{ ml: 4 }} />
        <Box sx={{ display: 'flex', gap: 0.5, ml: 4 }}>
            <Skeleton variant="circular" width={26} height={26} animation="wave" />
            <Skeleton variant="circular" width={26} height={26} animation="wave" />
            <Skeleton variant="circular" width={26} height={26} animation="wave" />
        </Box>
    </Box>
);

// ── List Skeleton ─────────────────────────────────────────────────────────────
export const MediaListSkeleton = ({ count = 8 }) => {
    const theme = useTheme();
    return (
        <Box>
            <Skeleton variant="text" width={140} height={20} sx={{ mb: 2 }} animation="wave" />
            <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1, overflow: 'hidden', bgcolor: 'background.paper' }}>
                {/* Table Head */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Skeleton variant="circular" width={18} height={18} animation="wave" />
                    <Skeleton variant="text" width={50} height={14} animation="wave" />
                    <Box sx={{ flexGrow: 1 }} />
                    <Skeleton variant="text" width={40} height={14} animation="wave" />
                    <Skeleton variant="text" width={70} height={14} animation="wave" sx={{ ml: 4 }} />
                    <Skeleton variant="text" width={60} height={14} animation="wave" sx={{ ml: 4 }} />
                </Box>
                {Array.from({ length: count }).map((_, i) => (
                    <MediaRowSkeleton key={i} />
                ))}
            </Box>
        </Box>
    );
};

// ── Sidebar Skeleton ──────────────────────────────────────────────────────────
export const MediaSidebarSkeleton = () => (
    <Box sx={{ width: 280, minWidth: 280, p: 3, borderRight: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Skeleton variant="text" width="70%" height={30} animation="wave" sx={{ mb: 3 }} />
        <Skeleton variant="rounded" width="100%" height={40} animation="wave" sx={{ mb: 4, borderRadius: 2 }} />
        <Skeleton variant="text" width={90} height={14} animation="wave" sx={{ mb: 1 }} />
        {Array.from({ length: 7 }).map((_, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.8, px: 1 }}>
                <Skeleton variant="circular" width={20} height={20} animation="wave" />
                <Skeleton variant="text" width={`${50 + Math.random() * 30}%`} height={16} animation="wave" />
            </Box>
        ))}
        <Skeleton variant="text" width={1} height={1} sx={{ my: 3 }} />
        <Skeleton variant="text" width={100} height={14} animation="wave" sx={{ mb: 1 }} />
        <Box sx={{ px: 1 }}>
            {[1, 2].map((i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.6 }}>
                    <Skeleton variant="circular" width={16} height={16} animation="wave" />
                    <Skeleton variant="text" width={80} height={16} animation="wave" />
                </Box>
            ))}
        </Box>
    </Box>
);

export default MediaGridSkeleton;
