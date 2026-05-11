import React from 'react';
import { Box, Skeleton, Grid, Paper, Stack } from '@mui/material';

export const UserDetailsSkeleton = () => (
    <Box sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, py: 1 }}>
            <Stack direction="row" spacing={2}>
                <Skeleton variant="text" width={80} height={40} />
                <Skeleton variant="text" width={80} height={40} />
                <Skeleton variant="text" width={80} height={40} />
            </Stack>
        </Box>
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    {[1, 2, 3, 4].map(i => (
                        <Box key={i} sx={{ mb: 2 }}>
                            <Skeleton variant="text" width="40%" height={20} />
                            <Skeleton variant="text" width="80%" height={30} />
                        </Box>
                    ))}
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Skeleton variant="text" width="50%" height={25} />
                        <Skeleton variant="rectangular" width="30%" height={30} sx={{ borderRadius: 1, mt: 1 }} />
                        <Skeleton variant="text" width="50%" height={25} sx={{ mt: 2 }} />
                        <Skeleton variant="text" width="20%" height={40} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    </Box>
);

export const UserFormSkeleton = () => (
    <Box sx={{ p: 2 }}>
        <Box sx={{ mb: 3, p: 2.5, bgcolor: 'grey.50', borderRadius: 3, border: '1px solid #eee' }}>
            <Skeleton variant="text" width="30%" height={25} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 2 }} />
        </Box>
        <Grid container spacing={2}>
            {[1, 2, 3, 4, 5, 6].map(i => (
                <Grid item xs={12} md={6} key={i}>
                    <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 2 }} />
                </Grid>
            ))}
        </Grid>
        <Skeleton variant="rectangular" width="100%" height={100} sx={{ mt: 3, borderRadius: 2 }} />
    </Box>
);

export const PaymentQuickSkeleton = () => (
    <Box sx={{ p: 2 }}>
        {[1, 2].map(i => (
            <Paper key={i} variant="outlined" sx={{ mb: 2, p: 2, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Skeleton variant="text" width="40%" height={30} />
                    <Skeleton variant="text" width="20%" height={20} />
                </Stack>
            </Paper>
        ))}
    </Box>
);
export const CourseWizardSkeleton = () => (
    <Box sx={{ p: 0 }}>
        {/* Step Icons Skeleton */}
        <Box sx={{ p: 4, bgcolor: 'white', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <Stack direction="row" spacing={4}>
                {[1, 2, 3, 4].map(i => (
                    <Stack key={i} direction="row" spacing={2} alignItems="center">
                        <Skeleton variant="circular" width={44} height={44} />
                        <Box>
                            <Skeleton variant="text" width={80} height={20} />
                            <Skeleton variant="text" width={120} height={15} />
                        </Box>
                    </Stack>
                ))}
            </Stack>
        </Box>
        <Box sx={{ p: { xs: 2, md: 5 } }}>
            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 4, mb: 3 }} />
                    <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 4 }} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <Skeleton variant="rectangular" width="100%" height={250} sx={{ borderRadius: 4, mb: 3 }} />
                    <Skeleton variant="rectangular" width="100%" height={150} sx={{ borderRadius: 4 }} />
                </Grid>
            </Grid>
        </Box>
    </Box>
);
