import React from 'react';
import { 
    Box, Button, Stack, Typography, Divider, List, ListItemButton, 
    ListItemIcon, ListItemText, Checkbox, IconButton, Collapse, Tooltip 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import AddLinkIcon from '@mui/icons-material/AddLink';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { FileIcon } from './MaterialsView';

const MaterialsSidebar = ({ 
    allItems = [],
    currentParent,
    selectedIds = [],
    expandedFolders = {},
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

    const getItemId = (item) => item?._id || item?.id;
    const getItemParentId = (item) => item?.parent?._id || item?.parent?.id || item?.parent;

    const renderFolderTree = (parentId = null, level = 0) => {
        const items = allItems.filter(f => {
            const pid = getItemParentId(f);
            return parentId === null ? (!pid || pid === 'null') : String(pid) === String(parentId);
        });

        if (items.length === 0 && level > 0) return null;

        const sortedItems = [...items].sort((a, b) => {
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (a.type !== 'folder' && b.type === 'folder') return 1;
            return (a.name || a.title || '').localeCompare(b.name || b.title || '');
        });

        return (
            <List component="div" disablePadding>
                {sortedItems.map((item) => {
                    const id = getItemId(item);
                    const isExpanded = !!expandedFolders[id];
                    const isActive = String(currentParent) === String(id);
                    const isFolder = item.type === 'folder';
                    const hasChildren = isFolder && allItems.some(f => String(getItemParentId(f)) === String(id));

                    return (
                        <Box key={id}>
                            <ListItemButton
                                selected={isActive}
                                onClick={() => handleItemClick(item)}
                                sx={{
                                    pl: level * 1.5 + 1,
                                    pr: 1,
                                    py: 0.6,
                                    borderRadius: '8px',
                                    mx: 1,
                                    mb: 0.3,
                                    transition: 'all 0.15s ease',
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.main',
                                        color: '#ffffff',
                                        boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                                        '&:hover': { bgcolor: 'primary.dark' },
                                        '& .MuiListItemIcon-root': { color: '#ffffff' },
                                        '& .MuiTypography-root': { color: '#ffffff', fontWeight: 700 }
                                    },
                                    '&:hover:not(.Mui-selected)': {
                                        bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
                                    }
                                }}
                            >
                                <Checkbox 
                                    size="small" 
                                    checked={selectedIds.includes(id)}
                                    onChange={(e) => handleToggleSelect(e, id)}
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{ 
                                        p: 0.3, 
                                        mr: 0.5,
                                        color: isActive ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                                        '&.Mui-checked': { color: isActive ? '#ffffff' : 'primary.main' }
                                    }}
                                />
                                
                                <ListItemIcon sx={{ minWidth: 24, mr: 0.5 }}>
                                    {isFolder ? (
                                        isExpanded ? (
                                            <FolderOpenIcon sx={{ fontSize: 19, color: isActive ? '#ffffff' : '#FFA000' }} />
                                        ) : (
                                            <FolderIcon sx={{ fontSize: 19, color: isActive ? '#ffffff' : '#FFB300' }} />
                                        )
                                    ) : (
                                        <FileIcon type={item.type} url={item.url} size={18} color={isActive ? '#ffffff' : undefined} />
                                    )}
                                </ListItemIcon>

                                <ListItemText 
                                    primary={item.name || item.title || 'Untitled'} 
                                    primaryTypographyProps={{ 
                                        variant: 'caption', 
                                        fontWeight: isActive ? 700 : 500,
                                        noWrap: true,
                                        sx: { 
                                            fontSize: '12px',
                                            fontFamily: 'inherit',
                                            color: isActive ? '#ffffff' : 'text.primary'
                                        }
                                    }} 
                                />

                                {hasChildren && (
                                    <IconButton 
                                        size="small" 
                                        onClick={(e) => toggleFolderExpand(e, id)}
                                        sx={{ 
                                            color: isActive ? '#ffffff' : 'text.secondary', 
                                            p: 0.2,
                                            ml: 0.5
                                        }}
                                    >
                                        {isExpanded ? (
                                            <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                                        ) : (
                                            <KeyboardArrowRightIcon sx={{ fontSize: 16 }} />
                                        )}
                                    </IconButton>
                                )}
                            </ListItemButton>
                            
                            {hasChildren && (
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    {renderFolderTree(id, level + 1)}
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
            width: { sm: 250, md: 270 },
            borderRight: `1px solid ${borderColor}`,
            bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'var(--color-vc-canvas-soft, #fcfcfe)',
            overflowY: 'auto',
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'column',
            py: 2
        }}>
            {/* Top Primary Actions */}
            <Box sx={{ px: 2, mb: 2 }}>
                <Button
                    fullWidth
                    variant="contained"
                    size="medium"
                    startIcon={<CloudUploadIcon sx={{ fontSize: 20 }} />}
                    sx={{ 
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                        color: '#ffffff',
                        boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                        borderRadius: '9px',
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease',
                        '&:hover': { 
                            background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                            boxShadow: '0 6px 18px rgba(99,102,241,0.45)',
                            transform: 'translateY(-1px)'
                        }
                    }}
                    onClick={() => {
                        setSelectedFiles([]);
                        setUploadModalOpen(true);
                    }}
                >
                    Upload Files
                </Button>

                <Stack direction="row" spacing={1} sx={{ mt: 1.2 }}>
                    <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={<CreateNewFolderIcon sx={{ fontSize: 16 }} />}
                        onClick={() => setFolderDialogOpen(true)}
                        sx={{ 
                            borderRadius: '7px', 
                            fontSize: '11px', 
                            py: 0.6,
                            fontWeight: 600,
                            textTransform: 'none',
                            fontFamily: 'inherit',
                            borderColor: 'divider',
                            color: 'text.primary',
                            '&:hover': {
                                bgcolor: 'action.hover',
                                borderColor: 'primary.main'
                            }
                        }}
                    >
                        + Folder
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={<AddLinkIcon sx={{ fontSize: 16 }} />}
                        onClick={() => setLinkDialogOpen(true)}
                        sx={{ 
                            borderRadius: '7px', 
                            fontSize: '11px', 
                            py: 0.6,
                            fontWeight: 600,
                            textTransform: 'none',
                            fontFamily: 'inherit',
                            borderColor: 'divider',
                            color: 'text.primary',
                            '&:hover': {
                                bgcolor: 'action.hover',
                                borderColor: 'secondary.main'
                            }
                        }}
                    >
                        + Link
                    </Button>
                </Stack>
            </Box>

            <Box sx={{ px: 2, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '10px', letterSpacing: '0.8px' }}>
                    EXPLORER NAVIGATION
                </Typography>
            </Box>

            <Divider sx={{ mx: 2, mb: 1 }} />

            {/* Folder Navigation Tree */}
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                {renderFolderTree(null)}
            </Box>
        </Box>
    );
};

export default MaterialsSidebar;
