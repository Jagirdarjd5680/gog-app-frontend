import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Typography, IconButton, Stack, Chip, Tooltip
} from '@mui/material';
import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PercentIcon from '@mui/icons-material/Percent';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import DeleteConfirmDialog from '../../components/Common/DeleteConfirmDialog';
import CouponForm from '../../components/Coupons/CouponForm';
import { format } from 'date-fns';

const CouponList = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [couponToDelete, setCouponToDelete] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/coupons');
            const list = data?.data || data || [];
            setCoupons(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error('Failed to load coupons:', error);
            toast.error('Failed to load discount coupons');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    const handleAddCoupon = () => {
        setSelectedCoupon(null);
        setIsModalOpen(true);
    };

    const handleEditCoupon = (coupon) => {
        setSelectedCoupon(coupon);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!couponToDelete) return;
        try {
            await api.delete(`/coupons/${couponToDelete._id || couponToDelete.id}`);
            toast.success('Coupon deleted successfully');
            fetchCoupons();
        } catch (error) {
            toast.error('Failed to delete coupon');
        } finally {
            setCouponToDelete(null);
            setDeleteDialogOpen(false);
        }
    };

    const filteredCoupons = useMemo(() => {
        return coupons.filter(c => {
            const code = (c.code || '').toLowerCase();
            const term = searchTerm.toLowerCase().trim();
            const matchesSearch = code.includes(term);
            if (!matchesSearch) return false;

            if (statusFilter !== 'all' && c.isActive !== (statusFilter === 'active')) return false;
            return true;
        });
    }, [coupons, searchTerm, statusFilter]);

    const metricsItems = useMemo(() => [
        { title: 'Total Coupons', value: coupons.length, icon: <LocalOfferIcon />, color: 'primary' },
        { title: 'Active Coupons', value: coupons.filter(c => c.isActive).length, icon: <CheckCircleIcon />, color: 'success' },
        { title: 'Percentage Off', value: coupons.filter(c => c.discountType === 'percentage').length, icon: <PercentIcon />, color: 'info' }
    ], [coupons]);

    const filters = useMemo(() => [
        {
            value: statusFilter,
            onChange: setStatusFilter,
            minWidth: 160,
            options: [
                { value: 'all', label: 'All Coupons' },
                { value: 'active', label: 'Active Only' },
                { value: 'inactive', label: 'Disabled Only' }
            ]
        }
    ], [statusFilter]);

    const columns = useMemo(() => [
        {
            field: 'code',
            headerName: 'COUPON CODE',
            flex: 1.5,
            minWidth: 180,
            cellRenderer: (params) => (
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" fontWeight={800} sx={{ color: 'var(--color-vc-link)', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                        {params.value}
                    </Typography>
                    <Tooltip title="Copy Code">
                        <IconButton
                            size="small"
                            onClick={() => {
                                navigator.clipboard.writeText(params.value);
                                toast.success('Coupon code copied!');
                            }}
                        >
                            <ContentCopyIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        },
        {
            field: 'discountValue',
            headerName: 'DISCOUNT',
            width: 140,
            cellRenderer: (params) => {
                const isPct = params.data.discountType === 'percentage';
                return (
                    <Typography variant="body2" fontWeight={800} sx={{ color: 'var(--color-vc-success)' }}>
                        {params.data.discountValue}{isPct ? '%' : ' FLAT'}
                    </Typography>
                );
            }
        },
        {
            field: 'isActive',
            headerName: 'STATUS',
            width: 130,
            cellRenderer: (params) => (
                <Chip
                    label={params.data.isActive ? 'ACTIVE' : 'DISABLED'}
                    color={params.data.isActive ? 'success' : 'default'}
                    size="small"
                    sx={{ fontWeight: 800, fontSize: '0.7rem', borderRadius: '6px' }}
                />
            )
        },
        {
            field: 'expiryDate',
            headerName: 'EXPIRY DATE',
            width: 160,
            valueGetter: (params) => {
                const d = params.data.endDate || params.data.expiry || params.data.expiryDate || params.data.expiresAt;
                return d ? format(new Date(d), 'MMM dd, yyyy') : 'No Expiry';
            }
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 140,
            cellRenderer: (params) => (
                <Stack direction="row" spacing={1}>
                    <IconButton size="small" onClick={() => handleEditCoupon(params.data)} sx={{ color: 'var(--color-vc-mute)' }} title="Edit">
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => { setCouponToDelete(params.data); setDeleteDialogOpen(true); }} sx={{ color: 'var(--color-vc-error)' }} title="Delete">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Stack>
            )
        }
    ], []);

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--color-vc-canvas)', minHeight: '100vh' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--color-vc-ink)', letterSpacing: -0.5 }}>
                    Discount Coupons & Promo Codes
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                    Create and manage discount offer codes for student course enrollments
                </Typography>
            </Box>

            <GenericMetrics items={metricsItems} />

            <GenericTableHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchPlaceholder="Search coupon code..."
                filters={filters}
                totalCount={filteredCoupons.length}
                actionButtonText="Create Coupon"
                actionButtonIcon={<AddIcon fontSize="small" />}
                onActionClick={handleAddCoupon}
            />

            <TableUI
                rowData={filteredCoupons}
                columnDefs={columns}
                loading={loading}
            />

            <CouponForm
                open={isModalOpen}
                handleClose={() => setIsModalOpen(false)}
                couponData={selectedCoupon}
                onSuccess={() => { fetchCoupons(); setIsModalOpen(false); }}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Coupon"
                content={`Are you sure you want to delete coupon code "${couponToDelete?.code}"?`}
            />
        </Box>
    );
};

export default CouponList;
