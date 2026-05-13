import React from 'react';
import { 
    Box, Stack, TextField, InputAdornment, Button, Menu, MenuItem, 
    ListItemIcon, ListItemText, Divider, Tooltip, IconButton, Breadcrumbs, Link, Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FolderIcon from '@mui/icons-material/Folder';
import CollectionsIcon from '@mui/icons-material/Collections';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

const MaterialsToolbar = ({ 
    searchQuery, setSearchQuery,
    typeFilter, setTypeFilter,
    viewMode, setViewMode,
    breadcrumbs, navigateToBreadcrumb,
    currentParent,
    isDark, borderColor
}) => {
    const [filterAnchorEl, setFilterAnchorEl] = React.useState(null);

    return (
        <Box sx={{
            px: 3, py: 1,
            borderBottom: `1px solid ${borderColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'white'
        }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ flex: 1 }}>
                <Link
                    component="button"
                    underline="hover"
                    onClick={() => navigateToBreadcrumb(-1)}
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: currentParent ? 'primary.main' : 'text.primary', cursor: 'pointer' }}
                >
                    <HomeIcon sx={{ fontSize: 16 }} />
                    Root
                </Link>
                {breadcrumbs.map((crumb, idx) => (
                    idx === breadcrumbs.length - 1 ? (
                        <Typography key={crumb.id} variant="body2" sx={{ fontWeight: 600 }}>
                            {crumb.name}
                        </Typography>
                    ) : (
                        <Link
                            key={crumb.id}
                            component="button"
                            underline="hover"
                            onClick={() => navigateToBreadcrumb(idx)}
                            sx={{ color: 'primary.main', cursor: 'pointer' }}
                        >
                            {crumb.name}
                        </Link>
                    )
                ))}
            </Breadcrumbs>

            <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                    size="small"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} /></InputAdornment>,
                        sx: { borderRadius: 1.5, height: 32, fontSize: '0.8rem', width: 160 }
                    }}
                />
                
                <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                    startIcon={<MoreVertIcon sx={{ transform: 'rotate(90deg)', fontSize: 16 }} />}
                    sx={{ height: 32, borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                >
                    {typeFilter === 'all' ? 'All Files' : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
                </Button>

                <Menu
                    anchorEl={filterAnchorEl}
                    open={Boolean(filterAnchorEl)}
                    onClose={() => setFilterAnchorEl(null)}
                    PaperProps={{ sx: { borderRadius: 2, minWidth: 180, mt: 1, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' } }}
                >
                    <MenuItem onClick={() => { setTypeFilter('all'); setFilterAnchorEl(null); }} selected={typeFilter === 'all'}>
                        <ListItemIcon><MoreVertIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="All Files" primaryTypographyProps={{ fontSize: '0.85rem' }} />
                    </MenuItem>
                    <Divider />
                    {[
                        { id: 'folder', name: 'Folders', icon: <FolderIcon fontSize="small" /> },
                        { id: 'image', name: 'Images', icon: <CollectionsIcon fontSize="small" /> },
                        { id: 'video', name: 'Videos', icon: <UploadFileIcon fontSize="small" /> },
                        { id: 'pdf', name: 'PDF Documents', icon: <PictureAsPdfIcon fontSize="small" /> },
                        { id: 'code', name: 'Code Files', icon: <InsertDriveFileIcon fontSize="small" /> },
                        { id: 'zip', name: 'Archives (ZIP)', icon: <FolderZipIcon fontSize="small" /> },
                    ].map((filter) => (
                        <MenuItem 
                            key={filter.id} 
                            onClick={() => { setTypeFilter(filter.id); setFilterAnchorEl(null); }} 
                            selected={typeFilter === filter.id}
                        >
                            <ListItemIcon>{filter.icon}</ListItemIcon>
                            <ListItemText primary={filter.name} primaryTypographyProps={{ fontSize: '0.85rem' }} />
                        </MenuItem>
                    ))}
                </Menu>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                <Tooltip title="List View">
                    <IconButton size="small" onClick={() => setViewMode('list')} color={viewMode === 'list' ? 'primary' : 'default'}>
                        <MoreVertIcon sx={{ transform: 'rotate(90deg)', fontSize: 20 }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Grid View">
                    <IconButton size="small" onClick={() => setViewMode('grid')} color={viewMode === 'grid' ? 'primary' : 'default'}>
                        <CollectionsIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Stack>
        </Box>
    );
};

export default MaterialsToolbar;
