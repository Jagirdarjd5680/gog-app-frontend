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
    alpha,
    useTheme,
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

const MediaSidebar = ({ 
    activeFilter, 
    onFilterChange, 
    onUploadClick,
    uploaderTab,
    onUploaderTabChange 
}) => {
    const theme = useTheme();

    const categories = [
        { id: 'all', label: 'All Files', icon: <AllInclusiveIcon /> },
        { id: 'image', label: 'Images', icon: <ImageIcon /> },
        { id: 'video', label: 'Videos', icon: <VideoLibraryIcon /> },
        { id: 'pdf', label: 'PDF Documents', icon: <DescriptionIcon /> },
        { id: 'code', label: 'Code Files', icon: <CodeIcon /> },
        { id: 'chat', label: 'Chat Media', icon: <ChatIcon /> },
        { id: 'other', label: 'Other Files', icon: <MoreHorizIcon /> },
    ];

    return (
        <Box sx={{ 
            width: 280, 
            minWidth: 280,
            maxWidth: 280,
            height: '100%', 
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            p: 3,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2 }
        }}>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 4, color: 'primary.main', letterSpacing: -0.5 }}>
                Media Library
            </Typography>

            <Button
                variant="contained"
                fullWidth
                startIcon={<CloudUploadIcon />}
                onClick={onUploadClick}
                sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    mb: 4
                }}
            >
                Upload New
            </Button>

            <Typography variant="caption" fontWeight={800} sx={{ color: 'text.disabled', mb: 1, display: 'block', px: 2 }}>
                FILE TYPES
            </Typography>
            <List sx={{ mb: 4 }}>
                {categories.map((cat) => (
                    <ListItem key={cat.id} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            selected={activeFilter === cat.id}
                            onClick={() => onFilterChange(cat.id)}
                            sx={{
                                borderRadius: 1.5,
                                py: 0.7,
                                '&.Mui-selected': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                    color: 'primary.main',
                                    '& .MuiListItemIcon-root': { color: 'primary.main' }
                                }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 34, color: 'text.secondary' }}>
                                {React.cloneElement(cat.icon, { sx: { fontSize: '1.1rem' } })}
                            </ListItemIcon>
                            <ListItemText 
                                primary={cat.label} 
                                primaryTypographyProps={{ 
                                    fontWeight: activeFilter === cat.id ? 700 : 500, 
                                    fontSize: '0.78rem'
                                }} 
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider sx={{ mb: 4 }} />

            <Typography variant="caption" fontWeight={800} sx={{ color: 'text.disabled', mb: 2, display: 'block', px: 2 }}>
                UPLOADER TYPE
            </Typography>
            <RadioGroup value={uploaderTab} onChange={(e) => onUploaderTabChange(e.target.value)} sx={{ px: 2, mb: 4 }}>
                <FormControlLabel 
                    value="all" 
                    control={<Radio size="small" />} 
                    label={<Typography variant="body2" fontWeight={500}>All Library</Typography>} 
                />
                <FormControlLabel 
                    value="admin" 
                    control={<Radio size="small" />} 
                    label={<Typography variant="body2" fontWeight={500}>Admin Only</Typography>} 
                />
            </RadioGroup>

            <Divider sx={{ mb: 4 }} />

            <Typography variant="caption" fontWeight={800} sx={{ color: 'text.disabled', mb: 2, display: 'block', px: 2 }}>
                MEMBERS
            </Typography>
            <Box sx={{ px: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">Admin</Typography>
                <Typography variant="body2" color="text.secondary">Teachers</Typography>
            </Box>
        </Box>
    );
};

export default MediaSidebar;
