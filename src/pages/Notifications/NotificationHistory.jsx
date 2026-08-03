import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Typography, IconButton, Stack, Chip, Avatar
} from '@mui/material';
import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CampaignIcon from '@mui/icons-material/Campaign';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const NotificationHistory = ({ onSendNew }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotif, setSelectedNotif] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/notifications/history');
            const list = data?.notifications || data?.data || [];
            setNotifications(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error('Failed to load notifications history:', error);
            toast.error('Failed to load notification history');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this notification broadcast record?')) return;
        try {
            await api.delete(`/notifications/${id}`);
            toast.success('Notification record deleted');
            fetchHistory();
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    };

    const filteredNotifications = useMemo(() => {
        return notifications.filter(n => {
            const title = (n.title || '').toLowerCase();
            const message = (n.message || '').toLowerCase();
            const term = searchTerm.toLowerCase().trim();

            const matchesSearch = title.includes(term) || message.includes(term);
            if (!matchesSearch) return false;

            if (typeFilter !== 'all' && (n.type || 'info') !== typeFilter) return false;
            return true;
        });
    }, [notifications, searchTerm, typeFilter]);

    const metricsItems = useMemo(() => [
        { title: 'Total Broadcasts', value: notifications.length, icon: <NotificationsIcon />, color: 'primary' },
        { title: 'Announcements', value: notifications.filter(n => n.type === 'announcement').length, icon: <CampaignIcon />, color: 'info' },
        { title: 'Sent Alerts', value: notifications.filter(n => n.isSent !== false).length, icon: <CheckCircleIcon />, color: 'success' }
    ], [notifications]);

    const filters = useMemo(() => [
        {
            value: typeFilter,
            onChange: setTypeFilter,
            minWidth: 160,
            options: [
                { value: 'all', label: 'All Types' },
                { value: 'announcement', label: 'Announcements' },
                { value: 'info', label: 'Information' },
                { value: 'warning', label: 'Warnings' }
            ]
        }
    ], [typeFilter]);

    const columns = useMemo(() => [
        {
            field: 'title',
            headerName: 'NOTIFICATION TITLE',
            flex: 2,
            minWidth: 260,
            cellRenderer: (params) => (
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13 }}>
                        <NotificationsIcon fontSize="small" />
                    </Avatar>
                    <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                            {params.data.title || 'Push Alert'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }} noWrap>
                            {params.data.message || ''}
                        </Typography>
                    </Box>
                </Stack>
            )
        },
        {
            field: 'type',
            headerName: 'TYPE',
            width: 140,
            cellRenderer: (params) => {
                const type = params.data.type || 'info';
                const color = type === 'announcement' ? 'primary' : type === 'warning' ? 'warning' : 'info';
                return (
                    <Chip
                        label={type.toUpperCase()}
                        color={color}
                        size="small"
                        sx={{ fontWeight: 800, fontSize: '0.7rem', borderRadius: '6px' }}
                    />
                );
            }
        },
        {
            field: 'recipientRole',
            headerName: 'TARGET ROLE',
            width: 140,
            valueGetter: (params) => (params.data.recipientRole || 'All Users').toUpperCase()
        },
        {
            field: 'createdAt',
            headerName: 'SENT DATE',
            width: 160,
            valueGetter: (params) => {
                const d = params.data.createdAt;
                return d ? format(new Date(d), 'MMM dd, yyyy') : 'N/A';
            }
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 130,
            cellRenderer: (params) => {
                const id = params.data._id || params.data.id;
                return (
                    <Stack direction="row" spacing={1}>
                        <IconButton size="small" onClick={() => setSelectedNotif(params.data)} sx={{ color: 'var(--color-vc-link)' }} title="View Detail">
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(id)} sx={{ color: 'var(--color-vc-error)' }} title="Delete">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                );
            }
        }
    ], []);

    return (
        <Box>
            <GenericMetrics items={metricsItems} />

            <GenericTableHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchPlaceholder="Search notification title or body..."
                filters={filters}
                totalCount={filteredNotifications.length}
                actionButtonText={onSendNew ? 'Send New Notification' : undefined}
                actionButtonIcon={<AddIcon fontSize="small" />}
                onActionClick={onSendNew}
            />

            <TableUI
                rowData={filteredNotifications}
                columnDefs={columns}
                loading={loading}
            />
        </Box>
    );
};

export default NotificationHistory;
