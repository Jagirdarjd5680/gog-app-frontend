import React from 'react';
import { Box, Typography, Stack, Button, Tabs, Tab, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip, CircularProgress } from '@mui/material';
import StarsIcon from '@mui/icons-material/Stars';
import SyncIcon from '@mui/icons-material/Sync';
import { format } from 'date-fns';

const TokenTab = ({ tokenBalance, tokenLoading, tokenTab, setTokenTab, tokenHistory, handleSyncTokens, actionLoading }) => {
    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarsIcon color="warning" />
                        Token Balance: {tokenBalance}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Current available credits for AI services</Typography>
                </Box>
                <Button 
                    startIcon={<SyncIcon />} 
                    variant="outlined" 
                    size="small" 
                    onClick={handleSyncTokens}
                    disabled={actionLoading}
                >
                    {actionLoading ? 'Syncing...' : 'Sync Balance'}
                </Button>
            </Stack>

            <Tabs value={tokenTab} onChange={(e, v) => setTokenTab(v)} sx={{ mb: 2 }}>
                <Tab label="Credits (History)" />
                <Tab label="Usage Log" />
            </Tabs>

            {tokenLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Chat ID</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tokenHistory
                                .filter(tx => tokenTab === 0 ? tx.type === 'credit' : tx.type === 'debit')
                                .length > 0 ? (
                                tokenHistory
                                    .filter(tx => tokenTab === 0 ? tx.type === 'credit' : tx.type === 'debit')
                                    .map((tx) => (
                                    <TableRow key={tx._id} hover>
                                        <TableCell>
                                            {tx.createdAt && !isNaN(new Date(tx.createdAt).getTime()) ? format(new Date(tx.createdAt), 'PPp') : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={tx.type === 'credit' ? 'PURCHASED' : 'USED'} 
                                                size="small" 
                                                color={tx.type === 'credit' ? 'success' : 'error'} 
                                                variant="outlined"
                                                sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: tx.type === 'credit' ? 'success.main' : 'error.main' }}>
                                            {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                                        </TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                            {tx.sessionId?._id || tx.sessionId || 'N/A'}
                                        </TableCell>
                                        <TableCell>{tx.reason}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                        <Typography color="text.secondary">No {tokenTab === 0 ? 'purchased' : 'used'} tokens found.</Typography>
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
