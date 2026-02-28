import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Box, Typography, Avatar, Chip, Divider, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';

const BlogViewModal = ({ open, onClose, blog }) => {
    if (!blog) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label={blog.category?.name || 'Uncategorized'} color="primary" variant="outlined" size="small" />
                    <Chip
                        label={blog.status}
                        size="small"
                        color={blog.status === 'published' ? 'success' : 'warning'}
                        sx={{ textTransform: 'capitalize', fontWeight: 700 }}
                    />
                </Box>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4, pt: 1 }}>
                <Typography variant="h3" fontWeight={900} gutterBottom sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' }, lineHeight: 1.2 }}>
                    {blog.title}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, my: 3, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={blog.author?.avatar} sx={{ width: 32, height: 32 }}>
                            {blog.author?.name?.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">AUTHOR</Typography>
                            <Typography variant="body2" fontWeight={700}>{blog.author?.name}</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'action.hover', color: 'text.secondary' }}>
                            <CalendarTodayIcon fontSize="small" />
                        </Avatar>
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">PUBLISHED</Typography>
                            <Typography variant="body2" fontWeight={700}>{format(new Date(blog.createdAt), 'MMMM dd, yyyy')}</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'action.hover', color: 'text.secondary' }}>
                            <VisibilityIcon fontSize="small" />
                        </Avatar>
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">VIEWS</Typography>
                            <Typography variant="body2" fontWeight={700}>{blog.views || 0}</Typography>
                        </Box>
                    </Box>
                </Box>

                {blog.thumbnail && (
                    <Box
                        component="img"
                        src={blog.thumbnail}
                        sx={{
                            width: '100%',
                            maxHeight: 400,
                            objectFit: 'cover',
                            borderRadius: 4,
                            mb: 4,
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                        }}
                    />
                )}

                <Box
                    className="blog-content-preview"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                    sx={{
                        fontSize: '1.1rem',
                        lineHeight: 1.8,
                        color: 'text.primary',
                        '& p': { mb: 2 },
                        '& img': { maxWidth: '100%', borderRadius: 2 },
                        '& blockquote': {
                            borderLeft: '4px solid',
                            borderColor: 'primary.main',
                            pl: 3,
                            py: 1,
                            my: 3,
                            bgcolor: 'action.hover',
                            fontStyle: 'italic'
                        }
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ p: 2, bgcolor: 'action.hover' }}>
                <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2 }}>Close Preview</Button>
            </DialogActions>
        </Dialog>
    );
};

export default BlogViewModal;
