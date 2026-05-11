import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Chip, Button, Alert } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';

const PaymentHistoryTable = ({ payments, isDark, handleViewReceipt, record }) => {
    if (!payments || payments.length === 0) {
        return <Alert severity="info" sx={{ py: 0, borderRadius: 2 }}>No payments recorded yet.</Alert>;
    }

    return (
        <Table size="small">
            <TableHead>
                <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>DATE</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>AMOUNT</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>METHOD</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>REF/NOTE</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textAlign: 'center' }}>RECEIPT</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {payments.map((payment, idx) => (
                    <TableRow key={idx}>
                        <TableCell sx={{ fontSize: '0.8rem' }}>
                            {payment.paidAt ? format(new Date(payment.paidAt), 'dd MMM yyyy') : '—'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'success.main' }}>
                            ₹{payment.amount?.toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem' }}>
                            <Chip 
                                label={payment.method === 'admin' ? 'OFFLINE' : payment.method?.replace('_', ' ').toUpperCase()} 
                                size="small" 
                                sx={{ 
                                    height: 18, 
                                    fontSize: '0.65rem', 
                                    fontWeight: 700,
                                    bgcolor: payment.method === 'admin' ? 'info.lighter' : 'grey.100',
                                    color: payment.method === 'admin' ? 'info.main' : 'text.primary'
                                }} 
                            />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                            {payment.transactionRef || payment.note || '—'}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                            <Button
                                size="small"
                                startIcon={<VisibilityIcon sx={{ fontSize: '14px !important' }} />}
                                onClick={() => handleViewReceipt(record, payment, idx)}
                                sx={{ fontSize: '0.7rem', py: 0, height: 24, borderRadius: 1, textTransform: 'none' }}
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
