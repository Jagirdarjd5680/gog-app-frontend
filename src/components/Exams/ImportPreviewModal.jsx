import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    Chip,
    Alert
} from '@mui/material';

const ImportPreviewModal = ({ open, onClose, data, onConfirm, loading }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Typography variant="h6" fontWeight={700}>Verify Questions ({data?.length || 0})</Typography>
            </DialogTitle>
            <DialogContent dividers>
                {data?.length === 0 ? (
                    <Alert severity="warning">No valid questions found to import.</Alert>
                ) : (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Please review the data below before final import. Once confirmed, these questions will be added to your bank.
                        </Typography>
                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', maxHeight: 400 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Content</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Difficulty</TableCell>
                                        <TableCell>Marks</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data?.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {row.content}
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={row.type} size="small" sx={{ fontSize: '0.7rem' }} />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.difficulty}
                                                    size="small"
                                                    color={row.difficulty === 'hard' ? 'error' : row.difficulty === 'easy' ? 'success' : 'warning'}
                                                    sx={{ fontSize: '0.7rem' }}
                                                />
                                            </TableCell>
                                            <TableCell>{row.marks}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} variant="outlined" color="inherit">Cancel</Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="primary"
                    disabled={loading || !data?.length}
                    sx={{ fontWeight: 600, minWidth: 140 }}
                >
                    {loading ? 'Importing...' : 'Verify & Add'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ImportPreviewModal;
