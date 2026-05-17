import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import DataTable from '../../components/Common/DataTable';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useTheme } from '../../context/ThemeContext';
import UserTableHeader from './UserTableHeader';

import UserMetrics from './components/UserMetrics';
import UserBulkActions from './components/UserBulkActions';
import UserModals from './components/UserModals';
import { getUserTableColumns } from './components/UserTableColumns';

const UserList = () => {
    const { isDark } = useTheme();
    const [searchParams, setSearchParams] = useSearchParams();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [authFilter, setAuthFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [batchFilter, setBatchFilter] = useState('all');
    const [recycleBinOpen, setRecycleBinOpen] = useState(false);
    const [binCount, setBinCount] = useState(0);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewUserId, setViewUserId] = useState(null);
    const [allBatches, setAllBatches] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/users?limit=1000');
            if (response.data.success) setUsers(response.data.data);
        } catch {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBinCount = useCallback(async () => {
        try {
            const response = await api.get('/users/bin/count');
            if (response.data.success) setBinCount(response.data.count);
        } catch { }
    }, []);

    const fetchAllBatches = useCallback(async () => {
        try {
            const response = await api.get('/batches');
            if (response.data.success) setAllBatches(response.data.data);
        } catch { }
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchBinCount();
        fetchAllBatches();
    }, [fetchUsers, fetchBinCount, fetchAllBatches]);

    useEffect(() => {
        const openProfileId = searchParams.get('openProfile');
        const editId = searchParams.get('edit');
        const paymentId = searchParams.get('payment');
        const searchVal = searchParams.get('search');

        if (searchVal !== null && searchVal !== searchTerm) {
            setSearchTerm(searchVal);
        }

        if (openProfileId) {
            setViewUserId(openProfileId);
            setViewModalOpen(true);
        }

        if (editId && users.length > 0) {
            const user = users.find(u => u._id === editId);
            if (user) { setSelectedUser(user); setModalOpen(true); }
        }

        if (paymentId && users.length > 0) {
            const user = users.find(u => u._id === paymentId);
            if (user) { setSelectedUser(user); setPaymentModalOpen(true); }
        }
    }, [searchParams, users]);

    const handleAdd = () => { setSelectedUser(null); setModalOpen(true); };
    const handleEdit = (user) => { setSelectedUser(user); setModalOpen(true); setSearchParams({ edit: user._id }); };
    const handleDelete = (user) => { setUserToDelete(user); setDeleteDialogOpen(true); };
    const handleView = (user) => { setViewUserId(user._id); setViewModalOpen(true); setSearchParams({ openProfile: user._id }); };
    const handlePayment = (user) => { setSelectedUser(user); setPaymentModalOpen(true); setSearchParams({ payment: user._id }); };

    const confirmDelete = async () => {
        try {
            await api.delete(`/users/${userToDelete._id}`);
            toast.success('User moved to recycle bin');
            fetchUsers();
            fetchBinCount();
        } catch {
            toast.error('Failed to delete user');
        }
        setDeleteDialogOpen(false);
    };

    const onSelectionChanged = useCallback((event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const newSelection = selectedNodes.map(node => node.data);
        setSelectedRows(prev => {
            if (prev.length === 0 && newSelection.length === 0) return prev;
            if (prev.length === newSelection.length && prev.every((u, i) => u._id === newSelection[i]._id)) return prev;
            return newSelection;
        });
    }, []);

    const handleBulkDelete = async () => {
        if (!window.confirm(`Move ${selectedRows.length} users to bin?`)) return;
        try {
            await Promise.all(selectedRows.map(u => api.delete(`/users/${u._id}`)));
            toast.success('Users moved to bin');
            fetchUsers();
            fetchBinCount();
            setSelectedRows([]);
        } catch {
            toast.error('Failed to delete some users');
        }
    };

    const handleBulkSync = async () => {
        if (!window.confirm(`Sync subscriptions for ${selectedRows.length} users?`)) return;
        setLoading(true);
        try {
            const userIds = selectedRows.map(u => u._id);
            const response = await api.post('/users/bulk-sync-subscriptions', { userIds });
            if (response.data.success) { toast.success(response.data.message); fetchUsers(); setSelectedRows([]); }
        } catch (error) {
            toast.error('Sync failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleBulkBatchAssign = async (batchName) => {
        if (!batchName && !window.confirm('Clear batch for selected users?')) return;
        setLoading(true);
        try {
            const userIds = selectedRows.map(u => u._id);
            const response = await api.put('/users/bulk-assign-batch', { userIds, batchName });
            if (response.data.success) { toast.success(response.data.message); fetchUsers(); setSelectedRows([]); }
        } catch (error) {
            toast.error('Assignment failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const columnDefs = useMemo(() => getUserTableColumns({ handleView, handleEdit, handleDelete, handlePayment }), []);

    const filteredUsers = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();
        // Remove leading zero for cleaner phone matching
        const searchClean = search.startsWith('0') ? search.substring(1) : search;

        return users.filter(user => {
            if (!searchTerm) return true;

            const name = user.name?.toLowerCase() || '';
            const email = user.email?.toLowerCase() || '';
            const phone = user.phone?.toLowerCase() || '';
            const roll = user.rollNumber?.toLowerCase() || '';

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

    const metrics = useMemo(() => ({
        total: users.length,
        active: users.filter(u => u.isActive).length,
        google: users.filter(u => u.authMethod === 'google').length,
        email: users.filter(u => u.authMethod === 'email').length
    }), [users]);

    return (
        <Box sx={{ p: 2 }}>
            <UserMetrics {...metrics} />

            <Box sx={{ bgcolor: 'transparent', px: '10px' }}>
                <UserTableHeader
                    searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                    sourceFilter={sourceFilter} setSourceFilter={setSourceFilter}
                    authFilter={authFilter} setAuthFilter={setAuthFilter}
                    roleFilter={roleFilter} setRoleFilter={setRoleFilter}
                    setRecycleBinOpen={setRecycleBinOpen}
                    batchFilter={batchFilter} setBatchFilter={setBatchFilter}
                    batches={batches} handleAdd={handleAdd}
                    binCount={binCount} totalCount={filteredUsers.length} isDark={isDark}
                />

                {selectedRows.length > 0 && (
                    <UserBulkActions
                        selectedCount={selectedRows.length} handleBulkSync={handleBulkSync}
                        handleBulkBatchAssign={handleBulkBatchAssign} handleBulkDelete={handleBulkDelete}
                        batches={batches} isDark={isDark}
                    />
                )}

                <DataTable
                    rowData={filteredUsers} columnDefs={columnDefs} loading={loading}
                    enableGlobalSearch={false} externalSearchTerm=""
                    pagination={true} paginationPageSize={10} height="auto"
                    onSelectionChanged={onSelectionChanged} getRowId={useCallback(row => row?._id || Math.random().toString(), [])}
                />
            </Box>

            <UserModals
                modalOpen={modalOpen} setModalOpen={setModalOpen} selectedUser={selectedUser} fetchUsers={fetchUsers}
                viewModalOpen={viewModalOpen} setViewModalOpen={setViewModalOpen} viewUserId={viewUserId}
                deleteDialogOpen={deleteDialogOpen} setDeleteDialogOpen={setDeleteDialogOpen} confirmDelete={confirmDelete} userToDelete={userToDelete}
                recycleBinOpen={recycleBinOpen} setRecycleBinOpen={setRecycleBinOpen} fetchBinCount={fetchBinCount}
                paymentModalOpen={paymentModalOpen} setPaymentModalOpen={setPaymentModalOpen}
                setSearchParams={setSearchParams}
            />
        </Box>
    );
};

export default UserList;
