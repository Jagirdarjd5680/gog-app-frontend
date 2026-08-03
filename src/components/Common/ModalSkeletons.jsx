import React from 'react';
import { Box, Skeleton, Grid, Paper, Stack } from '@mui/material';

export const UserDetailsSkeleton = () => (
    <Box sx={{ p: 0 }}>
        <Box sx={{ borderBottom: '1px solid var(--color-vc-hairline)', px: 2.5, py: 1.5, display: 'flex', gap: 2 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} variant="rounded" width={80} height={24} sx={{ bgcolor: 'var(--color-vc-hairline)', borderRadius: '4px' }} />
            ))}
        </Box>
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    {[1, 2, 3, 4].map(i => (
                        <Box key={i} sx={{ mb: 2 }}>
                            <Skeleton variant="text" width="30%" height={16} sx={{ bgcolor: 'var(--color-vc-hairline)' }} />
                            <Skeleton variant="text" width="70%" height={24} sx={{ bgcolor: 'var(--color-vc-hairline)' }} />
                        </Box>
                    ))}
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            p: 2.5, 
                            borderRadius: '6px', 
                            borderColor: 'var(--color-vc-hairline)', 
                            bgcolor: 'var(--color-vc-canvas-soft)' 
                        }}
                    >
                        <Skeleton variant="text" width="50%" height={20} sx={{ bgcolor: 'var(--color-vc-hairline)' }} />
                        <Skeleton variant="rectangular" width="30%" height={20} sx={{ borderRadius: '4px', mt: 1.5, bgcolor: 'var(--color-vc-hairline)' }} />
                        <Skeleton variant="text" width="50%" height={20} sx={{ mt: 3, bgcolor: 'var(--color-vc-hairline)' }} />
                        <Skeleton variant="text" width="25%" height={32} sx={{ mt: 1, bgcolor: 'var(--color-vc-hairline)' }} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    </Box>
);

export const UserFormSkeleton = () => (
    <Box sx={{ p: 2 }}>
        <Box sx={{ mb: 3, p: 2.5, bgcolor: 'var(--color-vc-canvas-soft)', borderRadius: '8px', border: '1px solid var(--color-vc-hairline)' }}>
            <Skeleton variant="text" width="30%" height={25} sx={{ mb: 1, bgcolor: 'var(--color-vc-hairline)' }} />
            <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: '6px', bgcolor: 'var(--color-vc-hairline)' }} />
        </Box>
        <Grid container spacing={2}>
            {[1, 2, 3, 4, 5, 6].map(i => (
                <Grid item xs={12} md={6} key={i}>
                    <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: '6px', bgcolor: 'var(--color-vc-hairline)' }} />
                </Grid>
            ))}
        </Grid>
        <Skeleton variant="rectangular" width="100%" height={100} sx={{ mt: 3, borderRadius: '6px', bgcolor: 'var(--color-vc-hairline)' }} />
    </Box>
);

export const PaymentQuickSkeleton = () => (
    <Box sx={{ p: 2 }}>
        {[1, 2].map(i => (
            <Paper key={i} variant="outlined" sx={{ mb: 2, p: 2, borderRadius: '6px', borderColor: 'var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Skeleton variant="text" width="40%" height={30} sx={{ bgcolor: 'var(--color-vc-hairline)' }} />
                    <Skeleton variant="text" width="20%" height={20} sx={{ bgcolor: 'var(--color-vc-hairline)' }} />
                </Stack>
            </Paper>
        ))}
    </Box>
);

export const CourseWizardSkeleton = () => (
    <Box sx={{ p: 0 }}>
        {/* Step Icons Skeleton */}
        <Box sx={{ p: 4, bgcolor: 'var(--color-vc-canvas)', borderBottom: '1px solid var(--color-vc-hairline)' }}>
            <Stack direction="row" spacing={4}>
                {[1, 2, 3, 4].map(i => (
                    <Stack key={i} direction="row" spacing={2} alignItems="center">
                        <Skeleton variant="circular" width={44} height={44} sx={{ bgcolor: 'var(--color-vc-hairline)' }} />
                        <Box>
                            <Skeleton variant="text" width={80} height={20} sx={{ bgcolor: 'var(--color-vc-hairline)' }} />
                            <Skeleton variant="text" width={120} height={15} sx={{ bgcolor: 'var(--color-vc-hairline)' }} />
                        </Box>
                    </Stack>
                ))}
            </Stack>
        </Box>
        <Box sx={{ p: { xs: 2, md: 5 } }}>
            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2, bgcolor: 'var(--color-vc-hairline)' }} />
                    <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: '6px', mb: 3, bgcolor: 'var(--color-vc-hairline)' }} />
                    <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: '6px', bgcolor: 'var(--color-vc-hairline)' }} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <Skeleton variant="rectangular" width="100%" height={250} sx={{ borderRadius: '6px', mb: 3, bgcolor: 'var(--color-vc-hairline)' }} />
                    <Skeleton variant="rectangular" width="100%" height={150} sx={{ borderRadius: '6px', bgcolor: 'var(--color-vc-hairline)' }} />
                </Grid>
            </Grid>
        </Box>
    </Box>
);
