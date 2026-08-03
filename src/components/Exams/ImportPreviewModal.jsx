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
    Alert,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ImportPreviewModal = ({ open, onClose, data, onConfirm, loading }) => {
    const validCount = data?.filter(row => row.isValid).length || 0;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: '10px', bgcolor: 'var(--color-vc-canvas)', border: '1px solid var(--color-vc-hairline)' } }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-vc-hairline)' }}>
                <Typography sx={{ fontWeight: 800, fontSize: '16px', color: 'var(--color-vc-ink)' }}>
                    Verify Questions ({data?.length || 0})
                </Typography>
                <IconButton size="small" onClick={onClose} sx={{ color: 'var(--color-vc-mute)' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 2.5 }}>
                {!data?.length ? (
                    <Alert severity="warning">No rows found in this CSV file.</Alert>
                ) : (
                    <Box>
                        <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)', mb: 2 }}>
                            {validCount} of {data.length} rows look valid. Review below before importing — invalid rows will be skipped.
                        </Typography>
                        <TableContainer sx={{ border: '1px solid var(--color-vc-hairline)', borderRadius: '8px', maxHeight: 420 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        {['Question', 'Options', 'Correct Answer', 'Marks', 'Category', 'Status'].map(h => (
                                            <TableCell
                                                key={h}
                                                sx={{ bgcolor: 'var(--color-vc-canvas-soft)', color: 'var(--color-vc-mute)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                                            >
                                                {h}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.map((row, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', color: 'var(--color-vc-ink)' }}>
                                                {row.text || <em>Missing</em>}
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px', color: 'var(--color-vc-mute)' }}>
                                                {row.options?.join(' | ') || '—'}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '12px', color: 'var(--color-vc-ink)' }}>
                                                {row.correctOption || '—'}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '12px', color: 'var(--color-vc-ink)' }}>
                                                {row.marks || 1}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '12px', color: 'var(--color-vc-ink)' }}>
                                                {row.category || '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.isValid ? 'Valid' : 'Invalid'}
                                                    color={row.isValid ? 'success' : 'error'}
                                                    size="small"
                                                    sx={{ fontWeight: 700, fontSize: '0.65rem', borderRadius: '6px' }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: '1px solid var(--color-vc-hairline)' }}>
                <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600, color: 'var(--color-vc-mute)' }}>Cancel</Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    disabled={loading || !validCount}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', minWidth: 160 }}
                >
                    {loading ? 'Importing...' : `Import ${validCount} Question${validCount === 1 ? '' : 's'}`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ImportPreviewModal;
