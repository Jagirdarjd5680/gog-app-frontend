import React, { useState } from 'react';
import { 
    Box, Stack, TextField, InputAdornment, Button, Menu, MenuItem, 
    ListItemIcon, ListItemText, Divider, Tooltip, IconButton, Breadcrumbs, Link, Typography, Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FolderIcon from '@mui/icons-material/Folder';
import CollectionsIcon from '@mui/icons-material/Collections';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import LinkIcon from '@mui/icons-material/Link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import ClearIcon from '@mui/icons-material/Clear';

const MaterialsToolbar = ({ 
    searchQuery, setSearchQuery,
    typeFilter, setTypeFilter,
    viewMode, setViewMode,
    breadcrumbs, navigateToBreadcrumb,
    currentParent,
    isDark, borderColor
}) => {
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);

    const categories = [
        { id: 'all', name: 'All Types', icon: <FilterListIcon fontSize="small" /> },
        { id: 'folder', name: 'Folders', icon: <FolderIcon fontSize="small" sx={{ color: '#FFB300' }} /> },
        { id: 'pdf', name: 'PDF Documents', icon: <PictureAsPdfIcon fontSize="small" sx={{ color: '#ef4444' }} /> },
        { id: 'video', name: 'Videos', icon: <VideoLibraryIcon fontSize="small" sx={{ color: '#a855f7' }} /> },
        { id: 'image', name: 'Images', icon: <CollectionsIcon fontSize="small" sx={{ color: '#10b981' }} /> },
        { id: 'link', name: 'Links', icon: <LinkIcon fontSize="small" sx={{ color: '#3b82f6' }} /> },
        { id: 'code', name: 'Code Files', icon: <InsertDriveFileIcon fontSize="small" sx={{ color: '#f97316' }} /> },
        { id: 'zip', name: 'Archives (ZIP)', icon: <FolderZipIcon fontSize="small" sx={{ color: '#8b5cf6' }} /> },
    ];

    const currentFilterLabel = categories.find(c => c.id === typeFilter)?.name || 'Filter';

    return (
        <Box sx={{
            px: 2.5, py: 1.2,
            borderBottom: `1px solid ${borderColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5,
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'var(--color-vc-canvas, #ffffff)',
        }}>
            {/* Breadcrumbs Trail */}
            <Breadcrumbs 
                separator={<NavigateNextIcon sx={{ fontSize: 16, color: 'text.secondary' }} />} 
                sx={{ 
                    flex: 1, 
                    minWidth: 200,
                    '& .MuiBreadcrumbs-ol': { alignItems: 'center' } 
                }}
            >
                <Chip
                    icon={<HomeIcon sx={{ fontSize: '15px !important', color: currentParent ? 'primary.main' : 'inherit' }} />}
                    label="Root"
                    size="small"
                    onClick={() => navigateToBreadcrumb(-1)}
                    sx={{
                        cursor: 'pointer',
                        fontWeight: currentParent ? 500 : 700,
                        fontSize: '12px',
                        height: 26,
                        px: 0.5,
                        bgcolor: currentParent ? 'transparent' : 'action.selected',
                        border: '1px solid transparent',
                        '&:hover': {
                            bgcolor: 'action.hover',
                            borderColor: 'divider'
                        }
                    }}
                />

                {breadcrumbs.map((crumb, idx) => {
                    const isLast = idx === breadcrumbs.length - 1;
                    return isLast ? (
                        <Chip
                            key={crumb.id}
                            label={crumb.name}
                            size="small"
                            sx={{
                                fontWeight: 700,
                                fontSize: '12px',
                                height: 26,
                                bgcolor: 'primary.soft',
                                color: 'primary.main',
                                border: '1px solid',
                                borderColor: 'primary.light'
                            }}
                        />
                    ) : (
                        <Chip
                            key={crumb.id}
                            label={crumb.name}
                            size="small"
                            onClick={() => navigateToBreadcrumb(idx)}
                            sx={{
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: '12px',
                                height: 26,
                                bgcolor: 'transparent',
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                        />
                    );
                })}
            </Breadcrumbs>

            {/* Right Controls */}
            <Stack direction="row" spacing={1} alignItems="center">
                {/* Search Field */}
                <TextField
                    size="small"
                    placeholder="Search files & folders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                        endAdornment: searchQuery ? (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearchQuery('')}>
                                    <ClearIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                            </InputAdornment>
                        ) : null,
                        sx: { 
                            borderRadius: '8px', 
                            height: 34, 
                            fontSize: '13px', 
                            width: { xs: 140, sm: 200 },
                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'var(--color-vc-canvas-soft, #f4f5f8)',
                            '& fieldset': { borderColor: 'transparent' },
                            '&:hover fieldset': { borderColor: 'var(--color-vc-hairline-strong, rgba(0,0,0,0.2))' },
                            '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                        }
                    }}
                />
                
                {/* Category Filter Menu */}
                <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                    startIcon={<FilterListIcon sx={{ fontSize: 16 }} />}
                    sx={{ 
                        height: 34, 
                        borderRadius: '8px', 
                        textTransform: 'none', 
                        fontWeight: 600,
                        fontSize: '12px',
                        borderColor: 'divider',
                        color: 'text.primary',
                        bgcolor: typeFilter !== 'all' ? 'primary.soft' : 'transparent'
                    }}
                >
                    {currentFilterLabel}
                </Button>

                <Menu
                    anchorEl={filterAnchorEl}
                    open={Boolean(filterAnchorEl)}
                    onClose={() => setFilterAnchorEl(null)}
                    PaperProps={{ 
                        sx: { 
                            borderRadius: '10px', 
                            minWidth: 190, 
                            mt: 1, 
                            boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                            border: '1px solid',
                            borderColor: 'divider'
                        } 
                    }}
                >
                    {categories.map((cat, idx) => (
                        <React.Fragment key={cat.id}>
                            {idx === 1 && <Divider sx={{ my: 0.5 }} />}
                            <MenuItem 
                                onClick={() => { setTypeFilter(cat.id); setFilterAnchorEl(null); }} 
                                selected={typeFilter === cat.id}
                                sx={{ borderRadius: '6px', mx: 0.5, my: 0.2 }}
                            >
                                <ListItemIcon sx={{ minWidth: 28 }}>{cat.icon}</ListItemIcon>
                                <ListItemText primary={cat.name} primaryTypographyProps={{ fontSize: '13px', fontWeight: typeFilter === cat.id ? 700 : 500 }} />
                            </MenuItem>
                        </React.Fragment>
                    ))}
                </Menu>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, my: 'auto' }} />

                {/* View Mode Switches */}
                <Box sx={{ 
                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'var(--color-vc-canvas-soft, #f4f5f8)', 
                    p: 0.3, 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.3
                }}>
                    <Tooltip title="Grid View">
                        <IconButton 
                            size="small" 
                            onClick={() => setViewMode('grid')} 
                            sx={{ 
                                borderRadius: '6px',
                                p: 0.5,
                                bgcolor: viewMode === 'grid' ? 'background.paper' : 'transparent',
                                color: viewMode === 'grid' ? 'primary.main' : 'text.secondary',
                                boxShadow: viewMode === 'grid' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none'
                            }}
                        >
                            <GridViewIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="List View">
                        <IconButton 
                            size="small" 
                            onClick={() => setViewMode('list')} 
                            sx={{ 
                                borderRadius: '6px',
                                p: 0.5,
                                bgcolor: viewMode === 'list' ? 'background.paper' : 'transparent',
                                color: viewMode === 'list' ? 'primary.main' : 'text.secondary',
                                boxShadow: viewMode === 'list' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none'
                            }}
                        >
                            <ViewListIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Stack>
        </Box>
    );
};

export default MaterialsToolbar;
