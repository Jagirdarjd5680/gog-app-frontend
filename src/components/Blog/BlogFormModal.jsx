import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, MenuItem, Box, Grid, Typography, Avatar, Paper,
    InputAdornment, FormControl, InputLabel, Select, CircularProgress,
    Tooltip, IconButton, Divider, Stack
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import CloseIcon from '@mui/icons-material/Close';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import UniversalUpload from '../Common/UniversalUpload';

const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    content: Yup.string().required('Content is required'),
    category: Yup.string().required('Category is required'),
    status: Yup.string().required('Status is required'),
});

const BlogFormModal = ({ open, onClose, blog, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                setCategories(data.data || []);
            } catch (error) {
                
            }
        };
        if (open) fetchCategories();
    }, [open]);

    const initialValues = {
        title: blog?.title || '',
        content: blog?.content || '',
        category: blog?.category?._id || blog?.category || '',
        thumbnail: blog?.thumbnail || '',
        status: blog?.status || 'draft',
        isFeatured: blog?.isFeatured || false,
        excerpt: blog?.excerpt || '',
    };



    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            if (blog) {
                await api.put(`/blogs/${blog._id}`, values);
                toast.success('Blog updated successfully');
            } else {
                await api.post('/blogs', values);
                toast.success('Blog created successfully');
            }
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    // Quill Modules
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
                <DialogTitle sx={{ fontWeight: 800 }}>
                    {blog ? 'Edit Blog Post' : 'Create New Post'}
                </DialogTitle>
                <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize>
                    {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
                        <Form>
                            <DialogContent dividers>
                                <Grid container spacing={3}>
                                    {/* Left Column: Content */}
                                    <Grid item xs={12} md={8}>
                                        <TextField
                                            fullWidth
                                            label="Article Title"
                                            name="title"
                                            value={values.title}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.title && Boolean(errors.title)}
                                            helperText={touched.title && errors.title}
                                            sx={{ mb: 3 }}
                                        />

                                        <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ color: 'text.secondary', ml: 0.5 }}>
                                            ARTICLE CONTENT
                                        </Typography>
                                        <Box sx={{ height: 400, mb: 8 }}>
                                            <ReactQuill
                                                theme="snow"
                                                value={values.content}
                                                onChange={(val) => setFieldValue('content', val)}
                                                modules={modules}
                                                style={{ height: '350px' }}
                                            />
                                        </Box>

                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            label="Excerpt / Short Summary"
                                            name="excerpt"
                                            value={values.excerpt}
                                            onChange={handleChange}
                                            placeholder="Briefly describe what this article is about..."
                                            helperText="Short summary used in cards and search results"
                                        />
                                    </Grid>

                                    {/* Right Column: Sidebar Settings */}
                                    <Grid item xs={12} md={4}>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 3 }}>
                                            <UniversalUpload
                                                label="Thumbnail Image"
                                                value={values.thumbnail}
                                                onChange={(url) => setFieldValue('thumbnail', url)}
                                                type="image"
                                                placeholder="https://example.com/image.jpg"
                                            />

                                            <TextField
                                                fullWidth
                                                select
                                                size="small"
                                                label="Status"
                                                name="status"
                                                value={values.status}
                                                onChange={handleChange}
                                                sx={{ mb: 2 }}
                                            >
                                                <MenuItem value="draft">Draft</MenuItem>
                                                <MenuItem value="published">Published</MenuItem>
                                                <MenuItem value="archived">Archived</MenuItem>
                                            </TextField>

                                            <TextField
                                                fullWidth
                                                select
                                                size="small"
                                                label="Category"
                                                name="category"
                                                value={values.category}
                                                onChange={handleChange}
                                                error={touched.category && Boolean(errors.category)}
                                                helperText={touched.category && errors.category}
                                                sx={{ mb: 1 }}
                                            >
                                                {categories.map((cat) => (
                                                    <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                                                ))}
                                            </TextField>
                                        </Paper>

                                        <Box sx={{ p: 1 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                                Publishing as: <strong>Admin</strong>
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Last saved: {blog ? new Date(blog.updatedAt).toLocaleDateString() : 'Not saved yet'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </DialogContent>
                            <DialogActions sx={{ p: 2, px: 3 }}>
                                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    sx={{ borderRadius: 2, px: 4 }}
                                >
                                    {loading ? 'Saving...' : blog ? 'Update Post' : 'Publish Post'}
                                </Button>
                            </DialogActions>


                        </Form>
                    )}
                </Formik>
            </Dialog>
        </>
    );
};

export default BlogFormModal;
