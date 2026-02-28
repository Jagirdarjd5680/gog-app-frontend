import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    IconButton,
    Tooltip,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Switch,
    FormControlLabel,
    CircularProgress
} from '@mui/material';
import DataTable from '../../components/Common/DataTable';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import DeleteConfirmDialog from '../../components/Common/DeleteConfirmDialog';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '',
        isActive: true,
        order: 0
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/categories');
            setCategories(data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setFormData({
                name: category.name,
                description: category.description || '',
                icon: category.icon || '',
                isActive: category.isActive,
                order: category.order || 0
            });
            setSelectedCategory(category);
        } else {
            setFormData({
                name: '',
                description: '',
                icon: '',
                isActive: true,
                order: 0
            });
            setSelectedCategory(null);
        }
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name) return toast.warning('Name is required');

        try {
            if (selectedCategory) {
                await api.put(`/categories/${selectedCategory._id}`, formData);
                toast.success('Category updated');
            } else {
                await api.post('/categories', formData);
                toast.success('Category created');
            }
            fetchCategories();
            setModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Failed to save');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/categories/${selectedCategory._id}`);
            toast.success('Category deleted');
            fetchCategories();
            setDeleteOpen(false);
            setSelectedCategory(null);
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const columnDefs = [
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'description', headerName: 'Description', flex: 1.5 },
        { field: 'order', headerName: 'Order', width: 100 },
        {
            field: 'isActive',
            headerName: 'Status',
            width: 120,
            cellRenderer: (params) => params.value ? 'Active' : 'Inactive'
        },
        {
            headerName: 'Actions',
            field: 'actions',
            width: 150,
            cellRenderer: (params) => (
                <Box>
                    <IconButton size="small" onClick={() => handleOpenModal(params.data)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => {
                        setSelectedCategory(params.data);
                        setDeleteOpen(true);
                    }}>
                        <DeleteIcon />
                    </IconButton>
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <DataTable
                title="Category Management"
                rowData={categories}
                columnDefs={columnDefs}
                loading={loading}
                actions={
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
                        Create Category
                    </Button>
                }
            />

            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{selectedCategory ? 'Edit Category' : 'New Category'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                multiline
                                rows={2}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Order"
                                type="number"
                                value={formData.order}
                                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                }
                                label="Active"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>

            <DeleteConfirmDialog
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleDelete}
                title="Delete Category"
                message={`Are you sure you want to delete "${selectedCategory?.name}"?`}
            />
        </Box>
    );
};

export default CategoryList;
