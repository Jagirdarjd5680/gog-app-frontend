import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Typography, IconButton, Stack, Chip, Avatar
} from '@mui/material';
import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import ArticleIcon from '@mui/icons-material/Article';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import BlogFormModal from '../../components/Blog/BlogFormModal';
import BlogViewModal from '../../components/Blog/BlogViewModal';
import { format } from 'date-fns';

const BlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [viewBlog, setViewBlog] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/blogs', {
                params: {
                    limit: 100,
                    search: searchTerm || undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined
                }
            });
            const list = data?.blogs || data?.data || [];
            setBlogs(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error('Failed to load blogs:', error);
            toast.error('Failed to load blog posts');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(fetchBlogs, 300);
        return () => clearTimeout(timer);
    }, [fetchBlogs]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this blog post?')) return;
        try {
            await api.delete(`/blogs/${id}`);
            toast.success('Blog post deleted successfully');
            fetchBlogs();
        } catch (error) {
            toast.error('Failed to delete blog');
        }
    };

    const metricsItems = useMemo(() => [
        { title: 'Total Articles', value: blogs.length, icon: <ArticleIcon />, color: 'primary' },
        { title: 'Published Posts', value: blogs.filter(b => b.status === 'published').length, icon: <CheckCircleIcon />, color: 'success' },
        { title: 'Draft Posts', value: blogs.filter(b => b.status === 'draft').length, icon: <EditNoteIcon />, color: 'warning' }
    ], [blogs]);

    const filters = useMemo(() => [
        {
            value: statusFilter,
            onChange: setStatusFilter,
            minWidth: 160,
            options: [
                { value: 'all', label: 'All Articles' },
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Drafts' }
            ]
        }
    ], [statusFilter]);

    const handleAddBlog = () => {
        setSelectedBlog(null);
        setOpenAddModal(true);
    };

    const columns = useMemo(() => [
        {
            field: 'title',
            headerName: 'ARTICLE TITLE',
            flex: 2,
            minWidth: 260,
            cellRenderer: (params) => (
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                        src={params.data.coverImage || params.data.thumbnail}
                        sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: 'primary.main', fontSize: 13 }}
                    >
                        <ArticleIcon fontSize="small" />
                    </Avatar>
                    <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                            {params.data.title || 'Blog Post'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>
                            Category: {params.data.category || 'General'}
                        </Typography>
                    </Box>
                </Stack>
            )
        },
        {
            field: 'author',
            headerName: 'AUTHOR',
            flex: 1.2,
            minWidth: 160,
            valueGetter: (params) => params.data.author?.name || params.data.authorName || 'Admin'
        },
        {
            field: 'status',
            headerName: 'STATUS',
            width: 140,
            cellRenderer: (params) => {
                const status = params.data.status || 'published';
                const color = status === 'published' ? 'success' : 'warning';
                return (
                    <Chip
                        label={status.toUpperCase()}
                        color={color}
                        size="small"
                        sx={{ fontWeight: 800, fontSize: '0.7rem', borderRadius: '6px' }}
                    />
                );
            }
        },
        {
            field: 'createdAt',
            headerName: 'DATE PUBLISHED',
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
                        <IconButton size="small" onClick={() => setViewBlog(params.data)} sx={{ color: 'var(--color-vc-link)' }} title="Preview">
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => { setSelectedBlog(params.data); setOpenAddModal(true); }} sx={{ color: 'var(--color-vc-mute)' }} title="Edit">
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
                    Blog & Articles Management
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                    Publish, edit, and categorize blog posts, news, and tutorial articles
                </Typography>
            </Box>

            <GenericMetrics items={metricsItems} />

            <GenericTableHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchPlaceholder="Search article title or category..."
                filters={filters}
                totalCount={blogs.length}
                actionButtonText="Create Post"
                actionButtonIcon={<AddIcon fontSize="small" />}
                onActionClick={handleAddBlog}
            />

            <TableUI
                rowData={blogs}
                columnDefs={columns}
                loading={loading}
            />

            <BlogFormModal
                open={openAddModal}
                onClose={() => { setOpenAddModal(false); setSelectedBlog(null); }}
                blog={selectedBlog}
                onSuccess={fetchBlogs}
            />

            <BlogViewModal
                open={Boolean(viewBlog)}
                onClose={() => setViewBlog(null)}
                blog={viewBlog}
            />
        </Box>
    );
};

export default BlogList;
