import React from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Button,
    Divider,
    Radio,
    RadioGroup,
    FormControlLabel
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import ChatIcon from '@mui/icons-material/Chat';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural';

const MediaSidebar = (props) => {
    const activeFilter = props.activeFilter || props.activeTab || 'all';
    const onFilterChange = props.onFilterChange || props.setActiveTab || (() => {});
    const onUploadClick = props.onUploadClick || (() => {});
    const uploaderTab = props.uploaderTab || 'all';
    const onUploaderTabChange = props.onUploaderTabChange || props.setUploaderTab || (() => {});

    const categories = [
        { id: 'all', label: 'All Assets', icon: <AllInclusiveIcon fontSize="small" /> },
        { id: 'image', label: 'Images & Photos', icon: <ImageIcon fontSize="small" /> },
        { id: 'video', label: 'Videos & Chunks', icon: <VideoLibraryIcon fontSize="small" /> },
        { id: 'pdf', label: 'PDF Documents', icon: <DescriptionIcon fontSize="small" /> },
        { id: 'code', label: 'Code Files', icon: <CodeIcon fontSize="small" /> },
        { id: 'chat', label: 'Chat Media', icon: <ChatIcon fontSize="small" /> },
        { id: 'other', label: 'Other Files', icon: <MoreHorizIcon fontSize="small" /> },
        { id: 'faceRegistrations', label: 'Face Registrations', icon: <FaceRetouchingNaturalIcon fontSize="small" /> },
    ];

    return (
        <Box sx={{ 
            width: 260, 
            minWidth: 260,
            maxWidth: 260,
            borderRadius: '16px',
            bgcolor: 'var(--color-vc-canvas-soft)',
            border: '1px solid var(--color-vc-hairline)',
            display: 'flex',
            flexDirection: 'column',
            p: 2.5,
            height: 'fit-content'
        }}>
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>
                MEDIA CATEGORIES
            </Typography>

            <List disablePadding sx={{ mb: 3 }}>
                {categories.map((cat) => {
                    const selected = activeFilter === cat.id;
                    return (
                        <ListItem key={cat.id} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                selected={selected}
                                onClick={() => onFilterChange(cat.id)}
                                sx={{
                                    borderRadius: '10px',
                                    py: 1,
                                    px: 1.5,
                                    transition: 'all 0.2s ease',
                                    bgcolor: selected ? 'var(--color-vc-primary-light, rgba(99,102,241,0.1))' : 'transparent',
                                    color: selected ? 'var(--color-vc-link)' : 'var(--color-vc-ink)',
                                    '&:hover': {
                                        bgcolor: 'var(--color-vc-canvas)'
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 32, color: selected ? 'var(--color-vc-link)' : 'var(--color-vc-mute)' }}>
                                    {cat.icon}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={cat.label} 
                                    primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: selected ? 800 : 600 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            <Divider sx={{ my: 1.5, borderColor: 'var(--color-vc-hairline)' }} />

            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>
                UPLOADER FILTER
            </Typography>

            <RadioGroup value={uploaderTab} onChange={(e) => onUploaderTabChange(e.target.value)}>
                <FormControlLabel value="all" control={<Radio size="small" />} label={<Typography variant="body2" fontWeight={600} fontSize="0.82rem">All Library</Typography>} />
                <FormControlLabel value="admin" control={<Radio size="small" />} label={<Typography variant="body2" fontWeight={600} fontSize="0.82rem">Admin Uploads</Typography>} />
                <FormControlLabel value="teacher" control={<Radio size="small" />} label={<Typography variant="body2" fontWeight={600} fontSize="0.82rem">Teacher Uploads</Typography>} />
            </RadioGroup>
        </Box>
    );
};

export default MediaSidebar;
