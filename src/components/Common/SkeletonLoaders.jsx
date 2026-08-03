import { Skeleton, Box, Grid, Card, CardContent } from '@mui/material';

// 1. Table Skeleton (Header + Rows)
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
    return (
        <Box sx={{ width: '100%', border: '1px solid var(--color-vc-hairline)', borderRadius: '8px', overflow: 'hidden', bgcolor: 'var(--color-vc-canvas)' }}>
            <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', borderBottom: '1px solid var(--color-vc-hairline)' }}>
                <Skeleton variant="rectangular" width={120} height={32} sx={{ borderRadius: '6px', bgcolor: 'var(--color-vc-hairline)' }} />
                <Skeleton variant="rectangular" width={200} height={32} sx={{ borderRadius: '6px', bgcolor: 'var(--color-vc-hairline)' }} />
                <Box sx={{ ml: 'auto', display: 'flex', gap: 1.5 }}>
                    <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: '6px', bgcolor: 'var(--color-vc-hairline)' }} />
                    <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: '6px', bgcolor: 'var(--color-vc-hairline)' }} />
                </Box>
            </Box>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-vc-hairline)' }}>
                        {[...Array(columns)].map((_, i) => (
                            <th key={i} style={{ padding: '12px 16px', textAlign: 'left', background: 'var(--color-vc-canvas-soft)' }}>
                                <Skeleton variant="text" width="60%" height={24} sx={{ bgcolor: 'var(--color-vc-hairline)' }} />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {[...Array(rows)].map((_, i) => (
                        <tr key={i} style={{ borderBottom: i === rows - 1 ? 'none' : '1px solid var(--color-vc-hairline)' }}>
                            {[...Array(columns)].map((_, j) => (
                                <td key={j} style={{ padding: '14px 16px' }}>
                                    <Skeleton variant="text" width={j === 0 ? "40%" : j === 1 ? "80%" : "60%"} height={20} sx={{ bgcolor: 'var(--color-vc-hairline)' }} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </Box>
    );
};

// 2. Metrics Card Skeleton
export const MetricsCardSkeleton = () => {
    return (
        <Card sx={{ height: '100%', borderRadius: '6px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ width: '100%' }}>
                        <Skeleton variant="text" width={100} height={20} sx={{ mb: 1, bgcolor: 'var(--color-vc-hairline)' }} />
                        <Skeleton variant="text" width={60} height={40} sx={{ bgcolor: 'var(--color-vc-hairline)' }} />
                    </Box>
                    <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: 'var(--color-vc-hairline)' }} />
                </Box>
                <Skeleton variant="text" width="60%" height={20} sx={{ bgcolor: 'var(--color-vc-hairline)' }} />
            </CardContent>
        </Card>
    );
};

// 3. Chart Skeleton
export const ChartSkeleton = ({ height = 300 }) => {
    return (
        <Card sx={{ height: '100%', borderRadius: '6px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none' }}>
            <CardContent>
                <Skeleton variant="text" width={150} height={30} sx={{ mb: 2, bgcolor: 'var(--color-vc-hairline)' }} />
                <Skeleton variant="rectangular" height={height} sx={{ borderRadius: '6px', bgcolor: 'var(--color-vc-hairline)' }} />
            </CardContent>
        </Card>
    );
};

// 4. Form/Modal Skeleton
export const FormSkeleton = ({ fields = 4 }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[...Array(fields)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={56} sx={{ borderRadius: '6px', bgcolor: 'var(--color-vc-hairline)' }} />
            ))}
            <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'flex-end' }}>
                <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: '6px', bgcolor: 'var(--color-vc-hairline)' }} />
                <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: '6px', bgcolor: 'var(--color-vc-hairline)' }} />
            </Box>
        </Box>
    );
};

// 5. Profile Header Skeleton
export const ProfileSkeleton = () => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: 'var(--color-vc-hairline)' }} />
            <Box>
                <Skeleton variant="text" width={120} height={24} sx={{ bgcolor: 'var(--color-vc-hairline)' }} />
                <Skeleton variant="text" width={180} height={16} sx={{ bgcolor: 'var(--color-vc-hairline)' }} />
            </Box>
        </Box>
    );
};
