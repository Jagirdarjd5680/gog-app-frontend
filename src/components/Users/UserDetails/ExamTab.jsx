import React from 'react';
import { Box, Typography, Chip, Stack, TableContainer, Paper, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { format } from 'date-fns';

const ExamTab = ({ user }) => {
    const examResults = user?.examResults || [];
    const attempted = examResults.length;
    const passed = examResults.filter((r) => r.passed).length;

    return (
        <>
            <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
                <Box>
                    <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Exams Attempted</Typography>
                    <Typography sx={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-vc-ink)', fontFamily: '"JetBrains Mono", monospace' }}>{attempted}</Typography>
                </Box>
                <Box>
                    <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Passed</Typography>
                    <Typography sx={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-vc-success-deep)', fontFamily: '"JetBrains Mono", monospace' }}>{passed}</Typography>
                </Box>
            </Stack>

            {examResults.length === 0 ? (
                <Box sx={{ py: 5, textAlign: 'center' }}>
                    <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '13px' }}>No exams attempted yet.</Typography>
                </Box>
            ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '6px', borderColor: 'var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', bgcolor: 'var(--color-vc-canvas-soft)' }}>Exam</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', bgcolor: 'var(--color-vc-canvas-soft)' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', bgcolor: 'var(--color-vc-canvas-soft)' }}>Score</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', bgcolor: 'var(--color-vc-canvas-soft)' }}>Result</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {examResults.map((r) => (
                                <TableRow key={r._id} hover>
                                    <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-vc-ink)' }}>{r.exam?.title || 'Exam'}</TableCell>
                                    <TableCell sx={{ fontSize: '11px', color: 'var(--color-vc-body)', fontFamily: '"JetBrains Mono", monospace' }}>
                                        {r.createdAt ? format(new Date(r.createdAt), 'PPp') : '-'}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '12px', color: 'var(--color-vc-body)', fontFamily: '"JetBrains Mono", monospace' }}>
                                        {r.score}{r.maxScore != null ? ` / ${r.maxScore}` : ''}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={r.passed ? 'PASSED' : 'FAILED'}
                                            size="small"
                                            sx={{
                                                fontWeight: 700, fontSize: '10px', height: 20, borderRadius: '4px',
                                                bgcolor: r.passed ? 'var(--color-vc-success-soft)' : 'var(--color-vc-error-soft)',
                                                color: r.passed ? 'var(--color-vc-success-deep)' : 'var(--color-vc-error-deep)'
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </>
    );
};

export default ExamTab;
