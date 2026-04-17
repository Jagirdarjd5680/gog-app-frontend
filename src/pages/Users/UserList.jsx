import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Chip,
    Avatar,
    Stack,
    IconButton,
    Grid,
    Button,
    FormControl,
    Select,
    MenuItem,
    Tooltip
} from '@mui/material';
import DataTable from '../../components/Common/DataTable';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AndroidIcon from '@mui/icons-material/Android';
import LanguageIcon from '@mui/icons-material/Language';
import GoogleIcon from '@mui/icons-material/Google';
import EmailIcon from '@mui/icons-material/Email';
import AppleIcon from '@mui/icons-material/Apple';
import PhoneIcon from '@mui/icons-material/Phone';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SyncIcon from '@mui/icons-material/Sync';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import MetricsCard from '../../components/Dashboard/MetricsCard';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import UserFormModal from '../../components/Users/UserFormModal';
import UserDetailsModal from '../../components/Users/UserDetailsModal';
import DeleteConfirmDialog from '../../components/Common/DeleteConfirmDialog';
import RecycleBin from '../../components/Common/RecycleBin';
import { format } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarIcon from '@mui/icons-material/Star';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArchiveIcon from '@mui/icons-material/Archive';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import UserTableHeader from './UserTableHeader';

// Helper to generate color from name
const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
};



const UserList = () => {
    const { isDark } = useTheme();
    const [searchParams] = useSearchParams();
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

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users?limit=1000');
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const fetchBinCount = async () => {
        try {
            const response = await api.get('/users/bin/count');
            if (response.data.success) {
                setBinCount(response.data.count);
            }
        } catch (error) {
            console.error('Bin count error:', error);
        }
    };

    const fetchAllBatches = async () => {
        try {
            const response = await api.get('/batches');
            if (response.data.success) {
                setAllBatches(response.data.data);
            }
        } catch (error) {
            console.error('Fetch batches error:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchBinCount();
        fetchAllBatches();

        const openProfileId = searchParams.get('openProfile');
        if (openProfileId) {
            setViewUserId(openProfileId);
            setViewModalOpen(true);
        }
    }, [searchParams]);

    const handleAdd = () => {
        setSelectedUser(null);
        setModalOpen(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const handleDelete = (user) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleView = (user) => {
        setViewUserId(user._id);
        setViewModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/users/${userToDelete._id}`);
            toast.success('User moved to recycle bin');
            fetchUsers();
            fetchBinCount();
        } catch (error) {
            toast.error('Failed to delete user');
        }
        setDeleteDialogOpen(false);
    };

    // Custom Cell Renderers
    const StudentInfoRenderer = (params) => {
        const { name, rollNumber, avatar } = params.data;
        const initials = name ? name.match(/(\w)\w*\s*(\w)?/) : [];
        const displayInitials = (initials && initials[1] ? initials[1] : '') + (initials && initials[2] ? initials[2] : '');

        return (
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: '100%' }}>
                <Avatar
                    src={avatar}
                    sx={{
                        width: 32,
                        height: 32,
                        bgcolor: !avatar ? stringToColor(name || 'User') : 'transparent',
                        fontSize: '0.75rem',
                        fontWeight: 700
                    }}
                >
                    {!avatar && displayInitials.toUpperCase()}
                </Avatar>
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.85rem', lineHeight: 1.2 }}>
                        {name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', opacity: 0.7 }}>
                        #{rollNumber || '---'}
                    </Typography>
                </Box>
            </Stack>
        );
    };

    const SourceAuthRenderer = (params) => {
        const { source, authMethod } = params.data;

        const getSourceIcon = () => {
            if (source === 'android') return <AndroidIcon sx={{ fontSize: 18, color: '#3ddc84' }} />;
            if (source === 'ios') return <AppleIcon sx={{ fontSize: 18, color: '#000000' }} />;
            if (source === 'mobile') return <PhoneIcon sx={{ fontSize: 18, color: '#1a73e8' }} />;
            return <LanguageIcon sx={{ fontSize: 18, color: '#1a73e8' }} />;
        };

        const getAuthIcon = () => {
            if (authMethod === 'google') return <GoogleIcon sx={{ fontSize: 16, color: '#DB4437' }} />;
            if (authMethod === 'phone' || authMethod === 'otp') return <PhoneIcon sx={{ fontSize: 16, color: '#1a73e8' }} />;
            return <EmailIcon sx={{ fontSize: 16, color: '#757575' }} />;
        };

        return (
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: '100%' }}>
                <Tooltip title={`Source: ${source || 'Web'}`}>
                    {getSourceIcon()}
                </Tooltip>
                <Tooltip title={`Auth: ${authMethod || 'Email'}`}>
                    {getAuthIcon()}
                </Tooltip>
            </Stack>
        );
    };

    const DateRenderer = (params) => {
        const date = params.data.createdAt ? new Date(params.data.createdAt) : new Date();
        return (
            <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                {format(date, 'dd MMM, yyyy')}
            </Typography>
        );
    };

    const MailRenderer = (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.2, mb: 0.2 }}>
                {params.data.email}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', opacity: 0.8 }}>
                {params.data.phone || 'N/A'}
            </Typography>
        </Box>
    );

    const CoursesRenderer = (params) => {
        const courses = params.data.enrolledCourses || [];
        if (courses.length === 0) {
            return <Typography variant="caption" color="text.secondary">No courses</Typography>;
        }

        const firstCourse = courses[0];
        const remaining = courses.length - 1;

        return (
            <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                    label={firstCourse.title || 'Course'}
                    size="small"
                    sx={{
                        borderRadius: 1,
                        bgcolor: 'rgba(0,0,0,0.05)',
                        fontSize: '0.75rem',
                        maxWidth: 120
                    }}
                />
                {remaining > 0 && (
                    <Typography variant="caption" color="primary" fontWeight={600}>
                        +{remaining} more
                    </Typography>
                )}
            </Stack>
        );
    };


    const StatusRenderer = (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Tooltip title={params.value ? 'Active Account' : 'Deactivated'}>
                {params.value ? (
                    <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                ) : (
                    <CancelIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
                )}
            </Tooltip>
        </Box>
    );

    const ActionsRenderer = (params) => (
        <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={() => handleView(params.data)} title="View Detail">
                <VisibilityIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            </IconButton>
            <IconButton size="small" onClick={() => handleEdit(params.data)} title="Edit">
                <EditIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            </IconButton>
            <IconButton size="small" onClick={() => handleDelete(params.data)} title="Archive">
                <ArchiveIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            </IconButton>
        </Stack>
    );

    const [selectedRows, setSelectedRows] = useState([]);

    const onSelectionChanged = useCallback((event) => {
        const selectedNodes = event.api.getSelectedNodes();
        setSelectedRows(selectedNodes.map(node => node.data));
    }, []);

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to move ${selectedRows.length} users to the recycle bin?`)) return;
        try {
            await Promise.all(selectedRows.map(u => api.delete(`/users/${u._id}`)));
            toast.success('Users moved to recycle bin');
            fetchUsers();
            fetchBinCount();
            setSelectedRows([]);
        } catch {
            toast.error('Failed to delete some users');
        }
    };

    const handleBulkSync = async () => {
        if (!window.confirm(`Sync subscriptions for ${selectedRows.length} users? This will update expiry dates based on current course durations.`)) return;
        setLoading(true);
        try {
            const userIds = selectedRows.map(u => u._id);
            const response = await api.post('/users/bulk-sync-subscriptions', { userIds });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchUsers();
                setSelectedRows([]);
            }
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
            if (response.data.success) {
                toast.success(response.data.message);
                fetchUsers();
                setSelectedRows([]);
            }
        } catch (error) {
            toast.error('Assignment failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const columnDefs = useMemo(() => [
        {
            headerName: '',
            width: 45,
            minWidth: 45,
            flex: 0,
            checkboxSelection: true,
            headerCheckboxSelection: true,
            pinned: 'left',
            cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' }
        },
        {
            headerName: 'NAME/ROLL',
            field: 'name',
            cellRenderer: StudentInfoRenderer,
            flex: 1.5,
            minWidth: 200,
            sortable: true
        },
        {
            headerName: 'EMAIL',
            field: 'email',
            flex: 1.2,
            minWidth: 200,
            cellRenderer: (params) => (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                    {params.value}
                </Typography>
            )
        },
        {
            headerName: 'PHONE',
            field: 'phone',
            width: 130,
            cellRenderer: (params) => (
                <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.85rem' }}>
                    {params.value || 'N/A'}
                </Typography>
            )
        },
        {
            headerName: 'SOURCE/AUTH',
            cellRenderer: SourceAuthRenderer,
            width: 140
        },
        {
            headerName: 'STATUS',
            field: 'isActive',
            cellRenderer: StatusRenderer,
            width: 100,
            cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' }
        },
        {
            headerName: 'BATCH',
            field: 'batch',
            width: 120,
            cellRenderer: (params) => (
                <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'primary.main' }}>
                    {params.value || '---'}
                </Typography>
            )
        },
        {
            headerName: 'ACTIONS',
            cellRenderer: ActionsRenderer,
            width: 140,
            pinned: 'right',
            sortable: false
        },
    ], []);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            // Search Filter handled by AG-Grid's setQuickFilter, but we can also filter here if needed
            // However, it's better to let AG-Grid handle the search for performance
            
            // Status Filter
            if (statusFilter !== 'all') {
                const isActive = statusFilter === 'active';
                if (user.isActive !== isActive) return false;
            }

            // Source Filter
            if (sourceFilter !== 'all') {
                const userSource = user.source || 'web'; // Default to web for legacy data
                if (userSource !== sourceFilter) return false;
            }

            // Auth Method Filter
            if (authFilter !== 'all') {
                const userAuth = user.authMethod || 'email'; // Default to email for legacy data
                if (userAuth !== authFilter) return false;
            }

            // Role Filter
            if (roleFilter !== 'all') {
                if (user.role !== roleFilter) return false;
            }

            // Batch Filter
            if (batchFilter !== 'all') {
                if (user.batch !== batchFilter) return false;
            }
            return true;
        });
    }, [users, statusFilter, sourceFilter, authFilter, roleFilter, batchFilter]);

    const getRowId = useCallback(params => params.data._id, []);

    const batches = useMemo(() => {
        const batchNamesFromUsers = [...new Set(users.filter(u => u.batch).map(u => u.batch))];
        const officialBatchNames = allBatches.map(b => b.name);
        return [...new Set([...batchNamesFromUsers, ...officialBatchNames])].sort();
    }, [users, allBatches]);

    const activeUsers = users.filter(u => u.isActive).length;
    const googleUsers = users.filter(u => u.authMethod === 'google').length;
    const emailUsers = users.filter(u => u.authMethod === 'email').length;

    return (
        <Box sx={{ p: 2 }}>
            {/* Small Metrics Cards */}
            <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard
                        title="Total Users"
                        value={users.length}
                        icon={<PeopleIcon sx={{ fontSize: 24 }} />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard
                        title="Active Users"
                        value={activeUsers}
                        icon={<CheckCircleIcon sx={{ fontSize: 24 }} />}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard
                        title="From Google"
                        value={googleUsers}
                        icon={<GoogleIcon sx={{ fontSize: 24 }} />}
                        color="error"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard
                        title="From Email"
                        value={emailUsers}
                        icon={<EmailIcon sx={{ fontSize: 24 }} />}
                        color="info"
                    />
                </Grid>
            </Grid>

            <Box sx={{ bgcolor: 'transparent', borderRadius: 0, border: 'none', px: '10px' }}>
                <UserTableHeader
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    sourceFilter={sourceFilter}
                    setSourceFilter={setSourceFilter}
                    authFilter={authFilter}
                    setAuthFilter={setAuthFilter}
                    roleFilter={roleFilter}
                    setRoleFilter={setRoleFilter}
                    setRecycleBinOpen={setRecycleBinOpen}
                    batchFilter={batchFilter}
                    setBatchFilter={setBatchFilter}
                    batches={batches}
                    handleAdd={handleAdd}
                    binCount={binCount}
                    totalCount={filteredUsers.length}
                    isDark={isDark}
                />

                {selectedRows.length > 0 && (
                    <Box sx={{
                        p: 1,
                        px: 2,
                        bgcolor: isDark ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)',
                        borderBottom: '1px solid',
                        borderColor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2
                    }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="subtitle2" color="primary.main" fontWeight={700}>
                                {selectedRows.length} users selected
                            </Typography>
                            
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={<SyncIcon />}
                                onClick={handleBulkSync}
                                sx={{ borderRadius: 1.5, fontWeight: 700, textTransform: 'none' }}
                            >
                                Batch Sync
                            </Button>

                            <FormControl size="small" sx={{ minWidth: 160 }}>
                                <Select
                                    displayEmpty
                                    value=""
                                    onChange={(e) => handleBulkBatchAssign(e.target.value)}
                                    sx={{ 
                                        height: 32, 
                                        fontSize: '0.8rem', 
                                        borderRadius: 1.5,
                                        bgcolor: 'background.paper'
                                    }}
                                    renderValue={() => (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <GroupAddIcon sx={{ fontSize: 16 }} />
                                            <span>Assign Batch</span>
                                        </Stack>
                                    )}
                                >
                                    <MenuItem value=""><em>None / Clear</em></MenuItem>
                                    {batches.map(b => (
                                        <MenuItem key={b} value={b}>{b}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>

                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={handleBulkDelete}
                            sx={{ borderRadius: 1.5, fontWeight: 700, textTransform: 'none' }}
                        >
                            Bulk Delete
                        </Button>
                    </Box>
                )}

                <DataTable
                    rowData={filteredUsers}
                    columnDefs={columnDefs}
                    loading={loading}
                    enableGlobalSearch={false} // We handled it externally
                    externalSearchTerm={searchTerm}
                    pagination={true}
                    paginationPageSize={10}
                    height="auto"
                    onSelectionChanged={onSelectionChanged}
                    getRowId={getRowId}
                />
            </Box>

            <UserFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                user={selectedUser}
                onSuccess={fetchUsers}
            />

            <UserDetailsModal
                open={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                userId={viewUserId}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete User"
                message={`Are you sure you want to delete ${userToDelete?.name}?`}
            />

            <RecycleBin
                open={recycleBinOpen}
                onClose={() => setRecycleBinOpen(false)}
                type="user"
                onRestore={() => {
                    fetchUsers();
                    fetchBinCount();
                }}
            />
        </Box>
    );
};

export default UserList;
