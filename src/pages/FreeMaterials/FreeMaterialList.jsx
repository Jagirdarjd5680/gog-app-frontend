import { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton,
    Chip, Tooltip, CircularProgress, Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import QuizIcon from '@mui/icons-material/Quiz';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import { format } from 'date-fns';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import FreeMaterialFormModal from '../../components/FreeMaterial/FreeMaterialFormModal';

const FreeMaterialList = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/free-materials/admin');
            setMaterials(data.data || []);
        } catch (error) {
            toast.error('Failed to load free materials');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this material?')) return;
        try {
            await api.delete(`/free-materials/${id}`);
            toast.success('Material deleted successfully');
            fetchMaterials();
        } catch (error) {
            toast.error('Failed to delete material');
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'pdf': return <PictureAsPdfIcon fontSize="small" color="error" />;
            case 'video': return <VideoLibraryIcon fontSize="small" color="primary" />;
            case 'test': return <QuizIcon fontSize="small" color="success" />;
            case 'zoom': return <VideoCallIcon fontSize="small" color="secondary" />;
            default: return null;
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight={900}>
                        Free Materials
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage free resources for students
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setSelectedMaterial(null);
                        setOpenModal(true);
                    }}
                    sx={{ borderRadius: 2, px: 3, py: 1 }}
                >
                    Add Material
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Created Date</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                    <CircularProgress size={30} />
                                </TableCell>
                            </TableRow>
                        ) : materials.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                    <Typography color="text.secondary">No free materials found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            materials.map((m) => (
                                <TableRow key={m._id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={700}>
                                            {m.title}
                                        </Typography>
                                        {m.subject && (
                                            <Typography variant="caption" color="text.secondary">
                                                Sub: {m.subject}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            {getTypeIcon(m.type)}
                                            <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
                                                {m.type}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {m.category?.name || 'Unknown'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={m.isActive ? 'Active' : 'Inactive'}
                                            color={m.isActive ? 'success' : 'error'}
                                            size="small"
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption">
                                            {format(new Date(m.createdAt), 'dd MMM yyyy')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit">
                                            <IconButton size="small" color="info" onClick={() => {
                                                setSelectedMaterial(m);
                                                setOpenModal(true);
                                            }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton size="small" color="error" onClick={() => handleDelete(m._id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <FreeMaterialFormModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                material={selectedMaterial}
                onSuccess={() => {
                    fetchMaterials();
                    setOpenModal(false);
                }}
            />
        </Box>
    );
};

export default FreeMaterialList;
