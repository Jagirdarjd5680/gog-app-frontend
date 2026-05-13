import React from 'react';
import { 
    Box, Button, Stack, Typography, Divider, List, ListItemButton, 
    ListItemIcon, ListItemText, Checkbox, IconButton, Collapse 
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FolderIcon from '@mui/icons-material/Folder';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { FileIcon } from './MaterialsView'; // We'll export FileIcon from MaterialsView

const MaterialsSidebar = ({ 
    allItems,
    currentParent,
    selectedIds,
    expandedFolders,
    toggleFolderExpand,
    handleToggleSelect,
    handleItemClick,
    setUploadModalOpen,
    setFolderDialogOpen,
    setLinkDialogOpen,
    setSelectedFiles,
    borderColor,
    isDark,
    truncateWords
}) => {

    const renderFolderTree = (parentId = null, level = 0) => {
        const items = allItems.filter(f => {
            const pid = f.parent?._id || f.parent;
            return parentId === null ? !pid : pid === parentId;
        });

        if (items.length === 0 && level > 0) return null;

        const sortedItems = [...items].sort((a, b) => {
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (a.type !== 'folder' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });

        return (
            <List component="div" disablePadding>
                {sortedItems.map((item) => {
                    const isExpanded = expandedFolders[item._id];
                    const isActive = currentParent === item._id;
                    const isFolder = item.type === 'folder';
                    const hasChildren = isFolder && allItems.some(f => (f.parent?._id || f.parent) === item._id);

                    return (
                        <Box key={item._id}>
                            <ListItemButton
                                selected={isActive}
                                onClick={() => handleItemClick(item)}
                                sx={{
                                    pl: level * 1.5 + 0.5,
                                    py: 0.3,
                                    borderRadius: 1,
                                    mx: 0.5,
                                    mb: 0.2,
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'primary.dark' },
                                        '& .MuiListItemIcon-root': { color: 'white' }
                                    }
                                }}
                            >
                                <Checkbox 
                                    size="small" 
                                    checked={selectedIds.includes(item._id)}
                                    onChange={(e) => handleToggleSelect(e, item._id)}
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{ 
                                        p: 0.5, 
                                        mr: 0.5,
                                        color: isActive ? 'rgba(255,255,255,0.7)' : 'inherit',
                                        '&.Mui-checked': { color: isActive ? 'white' : 'primary.main' }
                                    }}
                                />
                                <ListItemIcon sx={{ minWidth: 24 }}>
                                    {isFolder ? (
                                        <FolderIcon sx={{ fontSize: 18, color: isActive ? 'inherit' : '#FFB300' }} />
                                    ) : (
                                        <FileIcon type={item.type} url={item.url} size={18} color={isActive ? 'inherit' : undefined} />
                                    )}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={isFolder ? item.name : truncateWords(item.name)} 
                                    primaryTypographyProps={{ 
                                        variant: 'caption', 
                                        fontWeight: isActive ? 700 : 500,
                                        noWrap: true,
                                        sx: { fontSize: '0.75rem' }
                                    }} 
                                />
                                {hasChildren && (
                                    <IconButton 
                                        size="small" 
                                        onClick={(e) => toggleFolderExpand(e, item._id)}
                                        sx={{ color: 'inherit', p: 0.2 }}
                                    >
                                        {isExpanded ? <ExpandLess fontSize="small" sx={{ fontSize: 14 }} /> : <ExpandMore fontSize="small" sx={{ fontSize: 14 }} />}
                                    </IconButton>
                                )}
                            </ListItemButton>
                            {hasChildren && (
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    {renderFolderTree(item._id, level + 1)}
                                </Collapse>
                            )}
                        </Box>
                    );
                })}
            </List>
        );
    };

    return (
        <Box sx={{
            width: '30%',
            minWidth: 260,
            borderRight: `1px solid ${borderColor}`,
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fcfcff',
            overflowY: 'auto',
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'column',
            py: 2
        }}>
            <Box sx={{ px: 2, mb: 3 }}>
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<UploadFileIcon />}
                    sx={{ 
                        bgcolor: '#0097a7', 
                        '&:hover': { bgcolor: '#00838f' },
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 700
                    }}
                    onClick={() => {
                        setSelectedFiles([]);
                        setUploadModalOpen(true);
                    }}
                >
                    Upload Files
                </Button>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        onClick={() => setFolderDialogOpen(true)}
                        sx={{ borderRadius: 1, fontSize: '0.7rem', py: 0.5 }}
                    >
                        + Folder
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        onClick={() => setLinkDialogOpen(true)}
                        sx={{ borderRadius: 1, fontSize: '0.7rem', py: 0.5, color: 'black', borderColor: 'black' }}
                    >
                        + Link
                    </Button>
                </Stack>
            </Box>

            <Typography variant="overline" sx={{ px: 3, color: 'text.disabled', fontWeight: 700, fontSize: '0.65rem' }}>
                FOLDER NAVIGATION
            </Typography>
            <Divider sx={{ mx: 2, mb: 1 }} />
            {renderFolderTree(null)}
        </Box>
    );
};

export default MaterialsSidebar;
