import { Skeleton, Box, Grid, Card, CardContent } from '@mui/material';

// 1. Table Skeleton (Header + Rows)
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
    return (
        <Box sx={{ width: '100%' }}>
            {/* Header Skeleton */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                {[...Array(columns)].map((_, i) => (
                    <Skeleton key={i} variant="rectangular" height={40} sx={{ flex: 1, borderRadius: 1 }} />
                ))}
            </Box>
            {/* Rows Skeleton */}
            {[...Array(rows)].map((_, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                    {[...Array(columns)].map((_, j) => (
                        <Skeleton key={j} variant="rectangular" height={30} sx={{ flex: 1, borderRadius: 1 }} />
                    ))}
                </Box>
            ))}
        </Box>
    );
};

// 2. Metrics Card Skeleton
export const MetricsCardSkeleton = () => {
    return (
        <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Skeleton variant="text" width={100} height={20} sx={{ mb: 1 }} />
                        <Skeleton variant="text" width={60} height={40} />
                    </Box>
                    <Skeleton variant="circular" width={40} height={40} />
                </Box>
                <Skeleton variant="text" width="60%" height={20} />
            </CardContent>
        </Card>
    );
};

// 3. Chart Skeleton
export const ChartSkeleton = ({ height = 300 }) => {
    return (
        <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
                <Skeleton variant="text" width={150} height={30} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={height} sx={{ borderRadius: 2 }} />
            </CardContent>
        </Card>
    );
};

// 4. Form/Modal Skeleton
export const FormSkeleton = ({ fields = 4 }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[...Array(fields)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
            ))}
            <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'flex-end' }}>
                <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
            </Box>
        </Box>
    );
};

// 5. Profile Header Skeleton
export const ProfileSkeleton = () => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box>
                <Skeleton variant="text" width={120} height={24} />
                <Skeleton variant="text" width={180} height={16} />
            </Box>
        </Box>
    )
}
