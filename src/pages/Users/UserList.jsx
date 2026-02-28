import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Chip,
    Avatar,
    Stack,
    IconButton,
    Grid
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
import api from '../../utils/api';
import { toast } from 'react-toastify';
import UserFormModal from '../../components/Users/UserFormModal';
import UserDetailsModal from '../../components/Users/UserDetailsModal';
import DeleteConfirmDialog from '../../components/Common/DeleteConfirmDialog';
import RecycleBin from '../../components/Common/RecycleBin';
import { format } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';

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

import UserTableHeader from './UserTableHeader';

const UserList = () => {
    const { isDark } = useTheme();
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
    const [recycleBinOpen, setRecycleBinOpen] = useState(false);
    const [binCount, setBinCount] = useState(0);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewUserId, setViewUserId] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
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

    useEffect(() => {
        fetchUsers();
        fetchBinCount();
    }, []);

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
        const { name, _id, avatar } = params.data;
        const initials = name ? name.match(/(\w)\w*\s*(\w)?/) : []; // basic initials
        const displayInitials = (initials && initials[1] ? initials[1] : '') + (initials && initials[2] ? initials[2] : '');

        return (
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: '100%' }}>
                <Avatar
                    src={avatar}
                    imgProps={{ referrerPolicy: 'no-referrer' }}
                    sx={{
                        width: 38,
                        height: 38,
                        bgcolor: !avatar ? stringToColor(name || 'User') : 'transparent',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        border: avatar ? '1px solid' : 'none',
                        borderColor: 'divider'
                    }}
                >
                    {!avatar && displayInitials.toUpperCase()}
                </Avatar>
                <Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.1, mb: 0.3, fontSize: '0.875rem' }}>
                        {name}
                    </Typography>
                </Box>
            </Stack>
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

    const SourceAuthRenderer = (params) => {
        const { source, authMethod } = params.data;

        return (
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: '100%' }}>
                {source === 'android' ? (
                    <AndroidIcon fontSize="small" sx={{ color: '#3ddc84' }} titleAccess="Android App" />
                ) : source === 'ios' ? (
                    <AppleIcon fontSize="small" sx={{ color: '#000000' }} titleAccess="iOS App" />
                ) : (
                    <LanguageIcon fontSize="small" sx={{ color: '#00bcd4' }} titleAccess="Web Portal" />
                )}

                {authMethod === 'google' ? (
                    <GoogleIcon fontSize="small" sx={{ color: '#DB4437' }} titleAccess="Google Login" />
                ) : authMethod === 'phone' ? (
                    <PhoneIcon fontSize="small" sx={{ color: '#4caf50' }} titleAccess="Phone Login" />
                ) : (
                    <EmailIcon fontSize="small" sx={{ color: '#757575' }} titleAccess="Email/Password" />
                )}
            </Stack>
        );
    };

    const StatusRenderer = (params) => (
        <Chip
            label={params.value ? 'ACTIVE' : 'INACTIVE'}
            size="small"
            sx={{
                bgcolor: params.value ? '#00c853' : '#e0e0e0', // Green for active
                color: params.value ? '#fff' : '#757575',
                borderRadius: 4,
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 22,
                minWidth: 70
            }}
        />
    );

    const ActionsRenderer = (params) => (
        <Stack direction="row" spacing={1}>
            <IconButton size="small" sx={{ bgcolor: 'rgba(0,188,212,0.06)', borderRadius: 1, color: 'info.main' }} onClick={() => handleView(params.data)}>
                <VisibilityIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ bgcolor: 'rgba(0,0,0,0.04)', borderRadius: 1 }} onClick={() => handleEdit(params.data)}>
                <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ bgcolor: 'rgba(255,0,0,0.04)', borderRadius: 1, color: 'error.main' }} onClick={() => handleDelete(params.data)}>
                <DeleteIcon fontSize="small" />
            </IconButton>
        </Stack>
    );

    const columnDefs = [
        {
            headerName: 'ID',
            width: 50,
            minWidth: 50,
            flex: 0,
            valueGetter: (params) => params.node.rowIndex + 1,
            suppressHeaderMenuButton: true,
            sortable: false
        },
        {
            headerName: 'STUDENT INFO',
            field: 'name',
            cellRenderer: StudentInfoRenderer,
            flex: 1.2,
            minWidth: 180
        },
        {
            headerName: 'ROLL NUMBER',
            field: 'rollNumber',
            flex: 0.8,
            minWidth: 140,
            valueGetter: (params) => params.data.rollNumber || params.data._id?.substring(params.data._id.length - 8).toUpperCase()
        },
        {
            headerName: 'MAIL',
            field: 'email',
            cellRenderer: MailRenderer,
            flex: 1.2,
            minWidth: 180
        },
        {
            headerName: 'COURSE',
            field: 'enrolledCourses',
            cellRenderer: CoursesRenderer,
            flex: 1,
            minWidth: 130
        },
        {
            headerName: 'SOURCE',
            cellRenderer: SourceAuthRenderer,
            width: 120
        },
        {
            headerName: 'EXAMS',
            field: 'examCount',
            width: 100,
            cellRenderer: (params) => (
                <Stack direction="row" alignItems="center" sx={{ height: '100%' }}>
                    <Chip
                        label={params.value || 0}
                        size="small"
                        color={params.value > 0 ? "primary" : "default"}
                        sx={{ fontWeight: 'bold' }}
                    />
                </Stack>
            )
        },
        {
            headerName: 'ACTION',
            cellRenderer: ActionsRenderer,
            width: 180,
            pinned: 'right'
        },
    ];

    const filteredUsers = users.filter(user => {
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

        return true;
    });

    return (
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <UserTableHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                sourceFilter={sourceFilter}
                setSourceFilter={setSourceFilter}
                authFilter={authFilter}
                setAuthFilter={setAuthFilter}
                handleAdd={handleAdd}
                setRecycleBinOpen={setRecycleBinOpen}
                binCount={binCount}
                totalCount={filteredUsers.length}
                isDark={isDark}
            />

            <DataTable
                rowData={filteredUsers}
                columnDefs={columnDefs}
                loading={loading}
                enableGlobalSearch={false} // We handled it externally
                externalSearchTerm={searchTerm}
                pagination={true}
                paginationPageSize={10}
            />

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
