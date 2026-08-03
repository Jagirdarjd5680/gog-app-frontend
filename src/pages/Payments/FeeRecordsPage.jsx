import { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, IconButton, Stack, Chip, Avatar } from '@mui/material';
import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DownloadIcon from '@mui/icons-material/Download';
import { format } from 'date-fns';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const FeeRecordsPage = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/fee-records');
            const data = res.data?.data || res.data || [];
            setRecords(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load fee records:', error);
            toast.error('Failed to load fee records');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const handleDownloadReceipt = async (record) => {
        const studentId = record.studentId || record.student?._id || record.user?._id;
        if (!studentId) {
            toast.error('Student ID missing for receipt generation');
            return;
        }
        try {
            const res = await api.get(`/fee-records/receipt/${studentId}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt_${studentId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Fee receipt PDF downloaded');
        } catch (error) {
            toast.error('Failed to download receipt PDF');
        }
    };

    const filteredRecords = useMemo(() => {
        if (!searchTerm.trim()) return records;
        const term = searchTerm.toLowerCase();
        return records.filter(r =>
            (r.student?.name || r.user?.name || '').toLowerCase().includes(term) ||
            (r.student?.email || r.user?.email || '').toLowerCase().includes(term)
        );
    }, [records, searchTerm]);

    const metrics = useMemo(() => {
        const totalCollected = records.reduce((sum, r) => sum + (r.amountPaid || 0), 0);
        const avgPayment = records.length ? Math.round(totalCollected / records.length) : 0;
        return [
            { title: 'Total Records', value: records.length, icon: <ReceiptLongIcon />, color: 'primary' },
            { title: 'Total Collected', value: `₹${totalCollected}`, icon: <AttachMoneyIcon />, color: 'success' },
            { title: 'Average Payment', value: `₹${avgPayment}`, icon: <TrendingUpIcon />, color: 'info' }
        ];
    }, [records]);

    const columns = useMemo(() => [
        {
            field: 'student',
            headerName: 'STUDENT NAME',
            flex: 1.5,
            minWidth: 220,
            cellRenderer: (params) => {
                const name = params.data.student?.name || params.data.user?.name || 'N/A';
                return (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}>
                            {name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                                {name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>
                                {params.data.student?.email || params.data.user?.email || 'N/A'}
                            </Typography>
                        </Box>
                    </Stack>
                );
            }
        },
        {
            field: 'amountPaid',
            headerName: 'AMOUNT PAID',
            width: 150,
            cellRenderer: (params) => (
                <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-success, #16a34a)' }}>
                    ₹{params.data.amountPaid || 0}
                </Typography>
            )
        },
        {
            field: 'paymentDate',
            headerName: 'PAYMENT DATE',
            width: 170,
            valueGetter: (params) => {
                const d = params.data.paymentDate || params.data.createdAt;
                return d ? format(new Date(d), 'MMM dd, yyyy') : 'N/A';
            }
        },
        {
            field: 'status',
            headerName: 'STATUS',
            width: 130,
            cellRenderer: () => (
                <Chip
                    label="PAID"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 800, fontSize: '0.7rem', borderRadius: '6px' }}
                />
            )
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 120,
            cellRenderer: (params) => (
                <IconButton
                    size="small"
                    onClick={() => handleDownloadReceipt(params.data)}
                    sx={{ color: 'var(--color-vc-mute)' }}
                    title="Download Receipt PDF"
                >
                    <DownloadIcon fontSize="small" />
                </IconButton>
            )
        }
    ], []);

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--color-vc-canvas)', minHeight: '100vh' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--color-vc-ink)', letterSpacing: -0.5 }}>
                    Fee Ledger & Payment Receipts
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                    Track student fee installments, fee history, and generate PDF invoices
                </Typography>
            </Box>

            <GenericMetrics items={metrics} />

            <GenericTableHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchPlaceholder="Search student name or email..."
                totalCount={filteredRecords.length}
            />

            <TableUI
                rowData={filteredRecords}
                columnDefs={columns}
                loading={loading}
            />
        </Box>
    );
};

export default FeeRecordsPage;
