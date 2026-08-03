import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Chip, Button, Alert } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';

const PaymentHistoryTable = ({ payments, isDark, handleViewReceipt, record }) => {
    if (!payments || payments.length === 0) {
        return (
            <Alert 
                severity="info" 
                sx={{ 
                    py: 0, 
                    borderRadius: '6px',
                    bgcolor: 'var(--color-vc-canvas-soft)',
                    border: '1px solid var(--color-vc-hairline)',
                    color: 'var(--color-vc-body)',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    '& .MuiAlert-message': { fontFamily: 'inherit' }
                }}
            >
                No payments recorded yet.
            </Alert>
        );
    }

    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)' }}>DATE</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)' }}>AMOUNT</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)' }}>METHOD</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)' }}>REF/NOTE</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)', textAlign: 'center' }}>RECEIPT</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {payments.map((payment, idx) => (
                    <TableRow key={idx} hover sx={{ '&:hover': { bgcolor: 'var(--color-vc-canvas-soft)' } }}>
                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', fontSize: '11px', color: 'var(--color-vc-body)', fontFamily: '"JetBrains Mono", monospace' }}>
                            {payment.paidAt ? format(new Date(payment.paidAt), 'dd MMM yyyy') : '—'}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', fontSize: '12px', fontWeight: 700, color: 'var(--color-vc-success-deep)', fontFamily: '"JetBrains Mono", monospace' }}>
                            ₹{payment.amount?.toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)' }}>
                            <Chip 
                                label={payment.method === 'admin' ? 'OFFLINE' : payment.method?.replace('_', ' ').toUpperCase()} 
                                size="small" 
                                sx={{ 
                                    height: 18, 
                                    fontSize: '9px', 
                                    fontWeight: 600,
                                    borderRadius: '4px',
                                    bgcolor: payment.method === 'admin' ? 'var(--color-vc-canvas-soft)' : 'var(--color-vc-link-bg-soft)',
                                    color: payment.method === 'admin' ? 'var(--color-vc-mute)' : 'var(--color-vc-link-deep)',
                                    border: payment.method === 'admin' ? '1px solid var(--color-vc-hairline)' : 'none'
                                }} 
                            />
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', fontSize: '12px', color: 'var(--color-vc-mute)' }}>
                            {payment.transactionRef || payment.note || '—'}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', textAlign: 'center' }}>
                            <Button
                                size="small"
                                startIcon={<VisibilityIcon sx={{ fontSize: '12px !important' }} />}
                                onClick={() => handleViewReceipt(record, payment, idx)}
                                sx={{ 
                                    textTransform: 'none', 
                                    fontSize: '11px', 
                                    fontWeight: 600,
                                    color: 'var(--color-vc-link)',
                                    py: 0,
                                    minWidth: 0,
                                    height: 24,
                                    '&:hover': { color: 'var(--color-vc-link-deep)', bgcolor: 'transparent' }
                                }}
                            >
                                Receipt
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default PaymentHistoryTable;
