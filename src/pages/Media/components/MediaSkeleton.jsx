import React from 'react';
import { Box, Skeleton } from '@mui/material';

export const MediaCardSkeleton = () => (
    <Box sx={{
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid var(--color-vc-hairline)',
        bgcolor: 'var(--color-vc-canvas-soft)',
        p: 1.5
    }}>
        <Skeleton variant="rectangular" width="100%" height={140} animation="wave" sx={{ borderRadius: '12px', mb: 1.5 }} />
        <Skeleton variant="text" width="70%" height={20} animation="wave" />
        <Skeleton variant="text" width="40%" height={16} animation="wave" sx={{ mt: 0.5 }} />
    </Box>
);

export const MediaGridSkeleton = ({ count = 8 }) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 2 }}>
        {Array.from({ length: count }).map((_, i) => (
            <MediaCardSkeleton key={i} />
        ))}
    </Box>
);

export default MediaGridSkeleton;
