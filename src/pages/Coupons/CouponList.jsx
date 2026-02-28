import { useState, useEffect } from 'react';
import { Box, Button, Chip, IconButton, Tooltip } from '@mui/material';
import DataTable from '../../components/Common/DataTable';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import api from '../../utils/api'; // Ensure this path is correct
import { toast } from 'react-toastify';
import DeleteConfirmDialog from '../../components/Common/DeleteConfirmDialog';
import CouponForm from '../../components/Coupons/CouponForm';

const CouponList = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [couponToDelete, setCouponToDelete] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/coupons');
            setCoupons(data);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            toast.error('Failed to load coupons');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCoupon = () => {
        setSelectedCoupon(null);
        setIsModalOpen(true);
    };

    const handleEditCoupon = (coupon) => {
        setSelectedCoupon(coupon);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedCoupon(null);
    };

    const handleModalSuccess = () => {
        fetchCoupons();
        handleModalClose();
    };

    const confirmDelete = async () => {
        if (!couponToDelete) return;
        try {
            await api.delete(`/coupons/${couponToDelete._id}`);
            toast.success('Coupon deleted successfully');
            fetchCoupons();
        } catch (error) {
            console.error('Error deleting coupon:', error);
            toast.error('Failed to delete coupon');
        }
        setCouponToDelete(null);
        setDeleteDialogOpen(false);
    };

    const columnDefs = [
        {
            headerName: '#',
            valueGetter: (params) => params.node.rowIndex + 1,
            width: 70,
            pinned: 'left'
        },
        {
            field: 'code',
            headerName: 'CODE',
            flex: 1,
            minWidth: 150,
            cellRenderer: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {params.value}
                    </Box>
                    <Tooltip title="Copy Code">
                        <IconButton
                            size="small"
                            onClick={() => {
                                navigator.clipboard.writeText(params.value);
                                toast.success('Code copied to clipboard');
                            }}
                        >
                            <ContentCopyIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        },
        {
            field: 'discountValue',
            headerName: 'DISCOUNT',
            width: 150,
            valueGetter: (params) => {
                const type = params.data.discountType === 'percentage' ? '%' : ' FLAT';
                return `${params.data.discountValue}${type}`;
            }
        },
        {
            field: 'applicableType',
            headerName: 'APPLICABLE TO',
            width: 150,
            cellRenderer: (params) => (
                <Chip
                    label={params.value.toUpperCase()}
                    size="small"
                    color={params.value === 'all' ? 'success' : 'primary'}
                    variant="outlined"
                />
            )
        },
        {
            field: 'endDate',
            headerName: 'EXPIRY DATE',
            width: 180,
            valueFormatter: (params) => new Date(params.value).toLocaleDateString()
        },
        {
            field: 'usageLimit',
            headerName: 'USAGE',
            width: 150,
            valueGetter: (params) => {
                const limit = params.data.usageLimit || '∞';
                return `${params.data.usedCount} / ${limit}`;
            }
        },
        {
            field: 'isActive',
            headerName: 'STATUS',
            width: 120,
            cellRenderer: (params) => (
                <Chip
                    label={params.value ? 'Active' : 'Inactive'}
                    color={params.value ? 'success' : 'default'}
                    size="small"
                />
            )
        },
        {
            headerName: 'ACTIONS',
            field: 'actions',
            width: 150,
            pinned: 'right',
            cellRenderer: (params) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => handleEditCoupon(params.data)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => { setCouponToDelete(params.data); setDeleteDialogOpen(true); }}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <DataTable
                title="Coupon Management"
                rowData={coupons}
                columnDefs={columnDefs}
                loading={loading}
                actions={
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddCoupon}
                        sx={{ textTransform: 'uppercase' }}
                    >
                        Create Coupon
                    </Button>
                }
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Coupon"
                message={`Are you sure you want to delete coupon "${couponToDelete?.code}"?`}
            />

            {isModalOpen && (
                <CouponForm
                    open={isModalOpen}
                    onClose={handleModalClose}
                    initialData={selectedCoupon}
                    onSuccess={handleModalSuccess}
                />
            )}
        </Box>
    );
};

export default CouponList;
