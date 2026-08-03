import React from 'react';
import { Box, Typography, Stack, Button, Tabs, Tab, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip, CircularProgress } from '@mui/material';
import StarsIcon from '@mui/icons-material/Stars';
import SyncIcon from '@mui/icons-material/Sync';
import { format } from 'date-fns';

const TokenTab = ({ tokenBalance, tokenLoading, tokenTab, setTokenTab, tokenHistory, handleSyncTokens, actionLoading }) => {
    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography sx={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-vc-ink)', display: 'flex', alignItems: 'center', gap: 1, fontFamily: 'inherit' }}>
                        <StarsIcon sx={{ color: 'var(--color-vc-warning-deep)', fontSize: 18 }} />
                        Token Balance: {tokenBalance}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)' }}>Current available credits for AI services</Typography>
                </Box>
                <Button 
                    startIcon={<SyncIcon />} 
                    variant="outlined" 
                    size="small" 
                    onClick={handleSyncTokens}
                    disabled={actionLoading}
                    sx={{
                        textTransform: 'none',
                        fontSize: '12px',
                        fontWeight: 500,
                        fontFamily: 'inherit',
                        borderRadius: '6px',
                        color: 'var(--color-vc-ink)',
                        borderColor: 'var(--color-vc-hairline)',
                        bgcolor: 'var(--color-vc-canvas)',
                        '&:hover': {
                            bgcolor: 'var(--color-vc-canvas-soft)',
                            borderColor: 'var(--color-vc-hairline-strong)'
                        }
                    }}
                >
                    {actionLoading ? 'Syncing...' : 'Sync Balance'}
                </Button>
            </Stack>

            <Tabs 
                value={tokenTab} 
                onChange={(e, v) => setTokenTab(v)} 
                sx={{ 
                    mb: 2,
                    minHeight: 36,
                    borderBottom: '1px solid var(--color-vc-hairline)',
                    '& .MuiTabs-indicator': {
                        bgcolor: 'var(--color-vc-primary)',
                        height: '2px'
                    },
                    '& .MuiTab-root': {
                        textTransform: 'none',
                        fontSize: '12px',
                        fontWeight: 500,
                        fontFamily: 'inherit',
                        color: 'var(--color-vc-mute)',
                        minHeight: 36,
                        py: 0.5,
                        px: 1.5,
                        '&.Mui-selected': {
                            color: 'var(--color-vc-ink)',
                            fontWeight: 600
                        }
                    }
                }}
            >
                <Tab label="Credits (History)" />
                <Tab label="Usage Log" />
            </Tabs>

            {tokenLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <CircularProgress size={24} sx={{ color: 'var(--color-vc-primary)' }} />
                </Box>
            ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '6px', borderColor: 'var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)' }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)' }}>Chat ID</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)' }}>Reason</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tokenHistory
                                .filter(tx => tokenTab === 0 ? tx.type === 'credit' : tx.type === 'debit')
                                .length > 0 ? (
                                tokenHistory
                                    .filter(tx => tokenTab === 0 ? tx.type === 'credit' : tx.type === 'debit')
                                    .map((tx) => (
                                    <TableRow key={tx._id} hover sx={{ '&:hover': { bgcolor: 'var(--color-vc-canvas-soft)' } }}>
                                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', py: 1, fontSize: '11px', color: 'var(--color-vc-body)', fontFamily: '"JetBrains Mono", monospace' }}>
                                            {tx.createdAt && !isNaN(new Date(tx.createdAt).getTime()) ? format(new Date(tx.createdAt), 'PPp') : '-'}
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', py: 1 }}>
                                            <Chip 
                                                label={tx.type === 'credit' ? 'PURCHASED' : 'USED'} 
                                                size="small" 
                                                sx={{ 
                                                    fontWeight: 600, 
                                                    fontSize: '9px',
                                                    borderRadius: '4px',
                                                    height: 18,
                                                    bgcolor: tx.type === 'credit' ? 'var(--color-vc-success-soft)' : 'var(--color-vc-error-soft)',
                                                    color: tx.type === 'credit' ? 'var(--color-vc-success-deep)' : 'var(--color-vc-error-deep)',
                                                    border: '1px solid',
                                                    borderColor: tx.type === 'credit' ? 'var(--color-vc-success-soft)' : 'var(--color-vc-error-soft)'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', py: 1, fontWeight: 700, fontSize: '12px', fontFamily: '"JetBrains Mono", monospace', color: tx.type === 'credit' ? 'var(--color-vc-success-deep)' : 'var(--color-vc-error-deep)' }}>
                                            {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', py: 1, fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--color-vc-mute)' }}>
                                            {tx.sessionId?._id || tx.sessionId || 'N/A'}
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', py: 1, fontSize: '12px', color: 'var(--color-vc-body)' }}>{tx.reason}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                        <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '12px' }}>No {tokenTab === 0 ? 'purchased' : 'used'} tokens found.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default TokenTab;
