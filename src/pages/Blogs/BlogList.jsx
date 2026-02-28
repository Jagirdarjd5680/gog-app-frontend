import { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination, IconButton,
    Chip, Avatar, Tooltip, InputBase, MenuItem, Select, FormControl,
    InputLabel, Backdrop, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import { format } from 'date-fns';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import BlogFormModal from '../../components/Blog/BlogFormModal';
import BlogViewModal from '../../components/Blog/BlogViewModal';

const BlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [openAddModal, setOpenAddModal] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [viewBlog, setViewBlog] = useState(null);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/blogs', {
                params: {
                    page: page + 1,
                    limit: rowsPerPage,
                    search: search || undefined,
                    status: statusFilter || undefined
                }
            });
            setBlogs(data.data || []);
            setTotal(data.total || 0);
        } catch (error) {
            toast.error('Failed to load blogs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(fetchBlogs, 500);
        return () => clearTimeout(timeoutId);
    }, [page, rowsPerPage, search, statusFilter]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this blog?')) return;
        try {
            await api.delete(`/blogs/${id}`);
            toast.success('Blog deleted successfully');
            fetchBlogs();
        } catch (error) {
            toast.error('Failed to delete blog');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return 'success';
            case 'draft': return 'warning';
            case 'archived': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight={900}>
                        Blog Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Create and manage your platform's articles and news
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAddModal(true)}
                    sx={{ borderRadius: 2, px: 3, py: 1 }}
                >
                    Create Post
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: '2px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        width: 400,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2
                    }}
                >
                    <SearchIcon sx={{ p: 1, color: 'text.secondary' }} />
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="Search blogs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </Paper>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{ borderRadius: 2 }}
                    >
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                        <MenuItem value="archived">Archived</MenuItem>
                    </Select>
                </FormControl>
            </Paper>

            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Blog Post</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Author</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
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
                        ) : blogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                    <Typography color="text.secondary">No blogs found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            blogs.map((blog) => (
                                <TableRow key={blog._id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar
                                                variant="rounded"
                                                src={blog.thumbnail}
                                                sx={{ width: 50, height: 50, borderRadius: 1 }}
                                            />
                                            <Box>
                                                <Typography variant="body2" fontWeight={700} noWrap sx={{ maxWidth: 300 }}>
                                                    {blog.title}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {blog.views} views
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={blog.category?.name || 'Uncategorized'} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar src={blog.author?.avatar} sx={{ width: 24, height: 24, fontSize: 10 }}>
                                                {blog.author?.name?.charAt(0)}
                                            </Avatar>
                                            <Typography variant="body2">{blog.author?.name}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={blog.status}
                                            color={getStatusColor(blog.status)}
                                            size="small"
                                            sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption">
                                            {format(new Date(blog.createdAt), 'dd MMM yyyy')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="View">
                                            <IconButton size="small" color="primary" onClick={() => setViewBlog(blog)}>
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                            <IconButton size="small" color="info" onClick={() => setSelectedBlog(blog)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton size="small" color="error" onClick={() => handleDelete(blog._id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </TableContainer>

            <BlogFormModal
                open={openAddModal || !!selectedBlog}
                onClose={() => {
                    setOpenAddModal(false);
                    setSelectedBlog(null);
                }}
                blog={selectedBlog}
                onSuccess={() => {
                    fetchBlogs();
                    setOpenAddModal(false);
                    setSelectedBlog(null);
                }}
            />

            <BlogViewModal
                open={!!viewBlog}
                onClose={() => setViewBlog(null)}
                blog={viewBlog}
            />
        </Box>
    );
};

export default BlogList;
