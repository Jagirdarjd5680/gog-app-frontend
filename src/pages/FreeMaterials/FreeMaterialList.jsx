import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Typography, IconButton, Stack, Chip, Avatar
} from '@mui/material';
import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import QuizIcon from '@mui/icons-material/Quiz';
import FolderIcon from '@mui/icons-material/Folder';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LaunchIcon from '@mui/icons-material/Launch';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import FreeMaterialFormModal from '../../components/FreeMaterial/FreeMaterialFormModal';
import { format } from 'date-fns';

const FreeMaterialList = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/free-materials/admin');
            const list = data.data || data || [];
            setMaterials(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error('Failed to load free materials:', error);
            toast.error('Failed to load free materials');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this free study material?')) return;
        try {
            await api.delete(`/free-materials/${id}`);
            toast.success('Material deleted successfully');
            fetchMaterials();
        } catch (error) {
            toast.error('Failed to delete material');
        }
    };

    const handleViewResource = (material) => {
        const url = material.url;
        if (url) {
            window.open(url, '_blank');
        } else {
            toast.info('Resource details view');
        }
    };

    const filteredMaterials = useMemo(() => {
        return materials.filter(m => {
            const title = (m.title || '').toLowerCase();
            const category = (m.category || '').toLowerCase();
            const term = searchTerm.toLowerCase().trim();

            const matchesSearch = title.includes(term) || category.includes(term);
            if (!matchesSearch) return false;

            if (typeFilter !== 'all' && (m.type || 'pdf') !== typeFilter) return false;
            return true;
        });
    }, [materials, searchTerm, typeFilter]);

    const metricsItems = useMemo(() => [
        { title: 'Total Free Materials', value: materials.length, icon: <FolderIcon />, color: 'primary' },
        { title: 'PDF Notes', value: materials.filter(m => m.type === 'pdf').length, icon: <PictureAsPdfIcon />, color: 'error' },
        { title: 'Video Lessons', value: materials.filter(m => m.type === 'video').length, icon: <VideoLibraryIcon />, color: 'info' },
        { title: 'Free Tests', value: materials.filter(m => m.type === 'test').length, icon: <QuizIcon />, color: 'success' }
    ], [materials]);

    const filters = useMemo(() => [
        {
            value: typeFilter,
            onChange: setTypeFilter,
            minWidth: 170,
            options: [
                { value: 'all', label: 'All Types' },
                { value: 'pdf', label: 'PDF Documents' },
                { value: 'video', label: 'Video Lessons' },
                { value: 'test', label: 'Mock Tests' }
            ]
        }
    ], [typeFilter]);

    const handleAddMaterial = () => {
        setSelectedMaterial(null);
        setOpenModal(true);
    };

    const columns = useMemo(() => [
        {
            field: 'title',
            headerName: 'MATERIAL TITLE',
            flex: 2,
            minWidth: 240,
            cellRenderer: (params) => {
                const type = params.data.type || 'pdf';
                const IconComp = type === 'pdf' ? PictureAsPdfIcon : type === 'video' ? VideoLibraryIcon : QuizIcon;
                return (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: type === 'pdf' ? 'error.main' : type === 'video' ? 'info.main' : 'success.main', fontSize: 13 }}>
                            <IconComp fontSize="small" />
                        </Avatar>
                        <Box>
                            <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                                {params.data.title || 'Study Resource'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>
                                {params.data.category || 'General'}
                            </Typography>
                        </Box>
                    </Stack>
                );
            }
        },
        {
            field: 'type',
            headerName: 'TYPE',
            width: 130,
            cellRenderer: (params) => (
                <Chip
                    label={(params.data.type || 'PDF').toUpperCase()}
                    color={params.data.type === 'pdf' ? 'error' : params.data.type === 'video' ? 'info' : 'success'}
                    size="small"
                    sx={{ fontWeight: 800, fontSize: '0.7rem', borderRadius: '6px' }}
                />
            )
        },
        {
            field: 'createdAt',
            headerName: 'DATE ADDED',
            width: 160,
            valueGetter: (params) => {
                const d = params.data.createdAt;
                return d ? format(new Date(d), 'MMM dd, yyyy') : 'N/A';
            }
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 140,
            cellRenderer: (params) => {
                const id = params.data._id || params.data.id;
                return (
                    <Stack direction="row" spacing={1}>
                        <IconButton size="small" onClick={() => handleViewResource(params.data)} sx={{ color: 'var(--color-vc-link)' }} title="Open Resource">
                            <LaunchIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => { setSelectedMaterial(params.data); setOpenModal(true); }} sx={{ color: 'var(--color-vc-mute)' }} title="Edit">
                            <EditIcon fontSize="small" />
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
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--color-vc-canvas)', minHeight: '100vh' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--color-vc-ink)', letterSpacing: -0.5 }}>
                    Free Study Materials & Notes
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                    Manage downloadable PDF notes, video lectures, and sample mock tests for students
                </Typography>
            </Box>

            <GenericMetrics items={metricsItems} />

            <GenericTableHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchPlaceholder="Search material title or category..."
                filters={filters}
                totalCount={filteredMaterials.length}
                actionButtonText="Add Free Material"
                actionButtonIcon={<AddIcon fontSize="small" />}
                onActionClick={handleAddMaterial}
            />

            <TableUI
                rowData={filteredMaterials}
                columnDefs={columns}
                loading={loading}
            />

            <FreeMaterialFormModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                material={selectedMaterial}
                onSuccess={fetchMaterials}
            />
        </Box>
    );
};

export default FreeMaterialList;
