import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Badge, Button } from '@mui/material';
import Papa from 'papaparse';
import { format } from 'date-fns';
import TableUI from '../../components/UI/Table/TableUI';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { connectRecycleBinSocket } from '../../utils/adminRecycleBinSocket';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { hasModulePermission } from '../../utils/permissions';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GoogleIcon from '@mui/icons-material/Google';
import EmailIcon from '@mui/icons-material/Email';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import AddIcon from '@mui/icons-material/Add';

import UserBulkActions from './components/UserBulkActions';
import UserModals from './components/UserModals';
import { getUserTableColumns } from './components/UserTableColumns';

const UserList = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const canAddStudent = hasModulePermission(user, 'students', 'add');
    const [searchParams, setSearchParams] = useSearchParams();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/users?limit=1000&t=${Date.now()}`);
            if (response.data.success) setUsers(response.data.data);
        } catch {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBinCount = useCallback(async () => {
        try {
            const response = await api.get(`/users/bin/count?t=${Date.now()}`);
            if (response.data.success) setBinCount(response.data.data);
        } catch (error) {
            console.error('Failed to fetch bin count', error);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchBinCount();
    }, [fetchUsers, fetchBinCount]);

    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewUserId, setViewUserId] = useState(null);
    const [allBatches, setAllBatches] = useState([]);

    const handleView = useCallback((user) => {
        setViewUserId(user._id);
        setViewModalOpen(true);
    }, []);

    const handleEdit = useCallback(async (user) => {
        // The list row (from GET /users) never carries enrolledCourses/batches — that data
        // only comes back from GET /users/:id (findByIdDetails). Passing the raw row straight
        // into UserFormModal made the course/batch pickers look wiped every time you reopened
        // Edit, even though the assignment was saved correctly.
        const toastId = toast.loading('Loading user details...');
        try {
            const { data } = await api.get(`/users/${user._id || user.id}`);
            toast.dismiss(toastId);
            setSelectedUser(data.data);
        } catch (error) {
            toast.update(toastId, { render: 'Failed to load full user details — showing basic info', type: 'warning', isLoading: false, autoClose: 3000 });
            setSelectedUser(user);
        }
        setModalOpen(true);
    }, []);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const handleDelete = useCallback((user) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!userToDelete) return;
        const toastId = toast.loading('Archiving user...');
        try {
            const res = await api.delete(`/users/${userToDelete._id}`);
            if (res.data.success) {
                toast.update(toastId, { render: 'User moved to recycle bin', type: 'success', isLoading: false, autoClose: 3000 });
                fetchUsers();
                fetchBinCount();
            }
        } catch (error) {
            toast.update(toastId, { render: error.response?.data?.message || 'Delete failed', type: 'error', isLoading: false, autoClose: 3000 });
        } finally {
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    }, [userToDelete, fetchUsers, fetchBinCount]);

    const handlePayment = useCallback((user) => {
        setSelectedUser(user);
        setPaymentModalOpen(true);
    }, []);

    const [recycleBinOpen, setRecycleBinOpen] = useState(false);
    const [binCount, setBinCount] = useState(0);
    const [binRefreshSignal, setBinRefreshSignal] = useState(0);

    // Real-time: another admin (or this one, from a different tab) archiving/restoring/
    // permanently-deleting a user pushes an event here — the bin badge count and, if the
    // dialog happens to be open, its list both update without needing a manual refresh.
    useEffect(() => {
        const disconnect = connectRecycleBinSocket(({ event, count }) => {
            fetchBinCount();
            setBinRefreshSignal((s) => s + 1);
            const label = event === 'archived' ? 'moved to Recycle Bin' : event === 'restored' ? 'restored' : 'permanently deleted';
            toast.info(`${count} user${count === 1 ? '' : 's'} ${label}`, { autoClose: 3000 });
        });
        return disconnect;
    }, [fetchBinCount]);

    const columnDefs = useMemo(() => getUserTableColumns({ handleView, handleEdit, handleDelete, handlePayment, user }), [handleView, handleEdit, handleDelete, handlePayment, user]);

    const onSelectionChanged = useCallback((event) => {
        setSelectedRows(event.api.getSelectedRows());
    }, []);

    const handleAdd = useCallback(() => {
        setSelectedUser(null);
        setModalOpen(true);
    }, []);

    const handleBulkDelete = useCallback(async () => {
        if (selectedRows.length === 0) return;
        if (window.confirm(`Are you sure you want to archive ${selectedRows.length} users?`)) {
            const toastId = toast.loading('Archiving users...');
            try {
                const ids = selectedRows.map(r => r._id);
                const res = await api.post('/users/bulk/archive', { ids });
                if (res.data.success) {
                    toast.update(toastId, { render: `${selectedRows.length} users moved to recycle bin`, type: 'success', isLoading: false, autoClose: 3000 });
                    fetchUsers();
                    fetchBinCount();
                    setSelectedRows([]);
                }
            } catch (error) {
                toast.update(toastId, { render: error.response?.data?.message || 'Bulk delete failed', type: 'error', isLoading: false, autoClose: 3000 });
            }
        }
    }, [selectedRows, fetchUsers, fetchBinCount]);

    const handleBulkExport = useCallback(() => {
        if (selectedRows.length === 0) return;
        const csvData = selectedRows.map((u) => ({
            Name: u.name || '',
            'Roll Number': u.rollNumber || '',
            Email: u.email || '',
            Phone: u.phone || '',
            Role: u.role || '',
            Status: u.isActive ? 'Active' : 'Inactive',
            Source: u.source || 'web',
            'Auth Method': u.authMethod || 'email',
            'Registered On': u.createdAt && !isNaN(new Date(u.createdAt).getTime()) ? format(new Date(u.createdAt), 'yyyy-MM-dd') : '',
        }));
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `users-export-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Exported ${selectedRows.length} users`);
    }, [selectedRows]);

    const handleBulkBatchAssign = useCallback(async (batchName) => {
        if (selectedRows.length === 0) return;
        const toastId = toast.loading('Assigning batch...');
        try {
            const ids = selectedRows.map(r => r._id);
            const res = await api.post('/users/bulk/assign-batch', { ids, batch: batchName });
            if (res.data.success) {
                toast.update(toastId, { render: `Assigned batch to ${selectedRows.length} users`, type: 'success', isLoading: false, autoClose: 3000 });
                fetchUsers();
                setSelectedRows([]);
            }
        } catch (error) {
            toast.update(toastId, { render: error.response?.data?.message || 'Bulk batch assign failed', type: 'error', isLoading: false, autoClose: 3000 });
        }
    }, [selectedRows, fetchUsers]);

    const handleBulkSync = useCallback(async () => {
        if (selectedRows.length === 0) return;
        const toastId = toast.loading('Syncing with portal...');
        try {
            const ids = selectedRows.map(r => r._id);
            const res = await api.post('/users/bulk/sync', { ids });
            if (res.data.success) {
                toast.update(toastId, { render: `Synced ${selectedRows.length} users`, type: 'success', isLoading: false, autoClose: 3000 });
                fetchUsers();
                setSelectedRows([]);
            }
        } catch (error) {
            toast.update(toastId, { render: error.response?.data?.message || 'Bulk sync failed', type: 'error', isLoading: false, autoClose: 3000 });
        }
    }, [selectedRows, fetchUsers]);

    useEffect(() => {
        api.get('/batches').then((res) => {
            if (res.data.success) setAllBatches(res.data.data);
        }).catch(err => console.error(err));
    }, []);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [authFilter, setAuthFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [batchFilter, setBatchFilter] = useState('all');

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const name = (user.name || '').toLowerCase();
            const email = (user.email || '').toLowerCase();
            const phone = (user.phone || '').toLowerCase();
            const roll = (user.rollNumber || '').toLowerCase();
            const search = searchTerm.toLowerCase().trim();
            const searchClean = search.replace(/^0+/, '');

            const matchesSearch = name.includes(search) ||
                email.includes(search) ||
                phone.includes(search) ||
                (phone.startsWith('0') && phone.substring(1).includes(searchClean)) ||
                roll.includes(search);

            if (!matchesSearch) return false;

            if (statusFilter !== 'all' && user.isActive !== (statusFilter === 'active')) return false;
            if (sourceFilter !== 'all' && (user.source || 'web') !== sourceFilter) return false;
            if (authFilter !== 'all' && (user.authMethod || 'email') !== authFilter) return false;
            if (roleFilter !== 'all' && user.role !== roleFilter) return false;
            if (batchFilter !== 'all' && !(user.batches || (user.batch ? [user.batch] : [])).includes(batchFilter)) return false;
            return true;
        });
    }, [users, searchTerm, statusFilter, sourceFilter, authFilter, roleFilter, batchFilter]);

    const batches = useMemo(() => {
        const batchNamesFromUsers = users.flatMap(u => u.batches || (u.batch ? [u.batch] : []));
        return [...new Set([...batchNamesFromUsers, ...allBatches.map(b => b.name)])].sort();
    }, [users, allBatches]);

    const metricsItems = useMemo(() => [
        { title: 'Total Users', value: users.length, icon: <PeopleIcon />, color: 'primary' },
        { title: 'Active Users', value: users.filter(u => u.isActive).length, icon: <CheckCircleIcon />, color: 'success' },
        { title: 'From Google', value: users.filter(u => u.authMethod === 'google').length, icon: <GoogleIcon />, color: 'error' },
        { title: 'From Email', value: users.filter(u => u.authMethod === 'email').length, icon: <EmailIcon />, color: 'info' }
    ], [users]);

    const filterConfigs = useMemo(() => [
        {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
                { value: 'all', label: 'Every Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
            ]
        },
        {
            value: sourceFilter,
            onChange: setSourceFilter,
            options: [
                { value: 'all', label: 'All Sources' },
                { value: 'web', label: 'Web' },
                { value: 'android', label: 'Android App' },
                { value: 'ios', label: 'iOS App' }
            ]
        },
        {
            value: authFilter,
            onChange: setAuthFilter,
            options: [
                { value: 'all', label: 'All Auth Types' },
                { value: 'google', label: 'Google' },
                { value: 'email', label: 'Email' },
                { value: 'mobile', label: 'Mobile OTP' }
            ]
        },
        {
            value: roleFilter,
            onChange: setRoleFilter,
            options: [
                { value: 'all', label: 'All Roles' },
                { value: 'admin', label: 'Admin' },
                { value: 'teacher', label: 'Teacher' },
                { value: 'student', label: 'Student' }
            ]
        },
        {
            value: batchFilter,
            onChange: setBatchFilter,
            options: [
                { value: 'all', label: 'All Batches' },
                ...batches.map(b => ({ value: b, label: b }))
            ]
        }
    ], [statusFilter, sourceFilter, authFilter, roleFilter, batchFilter, batches]);

    const recycleBinButton = useMemo(() => (
        <Badge 
            badgeContent={binCount} 
            color="error" 
            overlap="rectangular"
            sx={{
                '& .MuiBadge-badge': { fontSize: '10px', fontWeight: 600, borderRadius: '4px' }
            }}
        >
            <Button
                variant="outlined"
                startIcon={<DeleteSweepIcon fontSize="small" />}
                onClick={() => setRecycleBinOpen(true)}
                sx={{ 
                    textTransform: 'none', 
                    fontWeight: 500, 
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    borderRadius: '6px',
                    height: 36,
                    color: 'var(--color-vc-error-deep)',
                    borderColor: 'var(--color-vc-error-soft)',
                    bgcolor: 'var(--color-vc-canvas)',
                    '&:hover': {
                        bgcolor: 'var(--color-vc-error-soft)',
                        borderColor: 'var(--color-vc-error-deep)'
                    }
                }}
            >
                Recycle Bin
            </Button>
        </Badge>
    ), [binCount]);

    return (
        <Box sx={{ p: 0.5 }}>
            <GenericMetrics items={metricsItems} />

            <Box sx={{ bgcolor: 'transparent', px: 0 }}>
                <GenericTableHeader
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    searchPlaceholder="Search students..."
                    filters={filterConfigs}
                    actionButtonText={canAddStudent ? "Add Student" : undefined}
                    onActionClick={canAddStudent ? handleAdd : undefined}
                    actionButtonIcon={canAddStudent ? <AddIcon fontSize="small" /> : undefined}
                    totalCount={filteredUsers.length}
                    extraElement={recycleBinButton}
                />

                {selectedRows.length > 0 && (
                    <UserBulkActions
                        selectedCount={selectedRows.length} handleBulkSync={handleBulkSync}
                        handleBulkBatchAssign={handleBulkBatchAssign} handleBulkDelete={handleBulkDelete}
                        handleBulkExport={handleBulkExport}
                        batches={batches} isDark={isDark} user={user}
                    />
                )}

                <TableUI
                    rowData={filteredUsers} columnDefs={columnDefs} loading={loading}
                    pagination={true} paginationPageSize={10}
                    onSelectionChanged={onSelectionChanged} getRowId={useCallback(row => row?._id || Math.random().toString(), [])}
                />
            </Box>

            <UserModals
                modalOpen={modalOpen} setModalOpen={setModalOpen} selectedUser={selectedUser} fetchUsers={fetchUsers}
                viewModalOpen={viewModalOpen} setViewModalOpen={setViewModalOpen} viewUserId={viewUserId}
                deleteDialogOpen={deleteDialogOpen} setDeleteDialogOpen={setDeleteDialogOpen} confirmDelete={confirmDelete} userToDelete={userToDelete}
                recycleBinOpen={recycleBinOpen} setRecycleBinOpen={setRecycleBinOpen} fetchBinCount={fetchBinCount}
                binRefreshSignal={binRefreshSignal}
                paymentModalOpen={paymentModalOpen} setPaymentModalOpen={setPaymentModalOpen}
                setSearchParams={setSearchParams}
            />
        </Box>
    );
};

export default UserList;
