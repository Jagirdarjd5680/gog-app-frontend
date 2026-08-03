import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    InputBase,
    FormControl,
    Select,
    MenuItem,
    Stack,
    ToggleButtonGroup,
    ToggleButton,
    ClickAwayListener
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import { hasModulePermission } from '../../../utils/permissions';

const CourseHeader = ({
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    handleAddCourse,
    user,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    categoryFilter,
    setCategoryFilter,
    categories = [],
    totalCount = 0
}) => {
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [localSearch, setLocalSearch] = useState(searchTerm);

    useEffect(() => {
        setLocalSearch(searchTerm);
    }, [searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== searchTerm) {
                setSearchTerm(localSearch);
            }
        }, 150);
        return () => clearTimeout(timer);
    }, [localSearch, searchTerm, setSearchTerm]);

    const selectStyles = {
        bgcolor: 'var(--color-vc-canvas)',
        color: 'var(--color-vc-body)',
        borderRadius: '6px',
        fontSize: '13px',
        fontFamily: 'inherit',
        fontWeight: 500,
        height: 36,
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-vc-hairline)' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-vc-hairline-strong)' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-vc-hairline-strong)' },
        '& .MuiSvgIcon-root': { color: 'var(--color-vc-mute)' }
    };

    const menuStyles = {
        PaperProps: {
            sx: {
                bgcolor: 'var(--color-vc-canvas)',
                color: 'var(--color-vc-ink)',
                border: '1px solid var(--color-vc-hairline)',
                borderRadius: '6px',
                boxShadow: '0px 8px 16px -4px rgba(0,0,0,0.08)',
                '& .MuiMenuItem-root': {
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    py: 1,
                    '&:hover': {
                        bgcolor: 'var(--color-vc-canvas-soft)'
                    }
                }
            }
        }
    };

    return (
        <Box sx={{ mb: 3 }}>
            <Box 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    flexWrap: 'wrap', 
                    gap: 2,
                    position: 'relative',
                    minHeight: 48
                }}
            >
                {/* Left Area: Search (Overlay) + Filters */}
                <Box 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        flex: 1, 
                        minWidth: 0, 
                        position: 'relative',
                        height: 36
                    }}
                >
                    {/* Search Component - absolute positioned to overlay filters when expanded */}
                    <ClickAwayListener onClickAway={() => setIsSearchExpanded(false)}>
                        <Box
                            sx={{
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 10,
                                display: 'flex',
                                alignItems: 'center',
                                height: 36,
                                bgcolor: 'var(--color-vc-canvas)',
                                border: '1px solid var(--color-vc-hairline)',
                                borderRadius: '6px',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                width: isSearchExpanded ? 240 : 36,
                                boxShadow: isSearchExpanded ? '0px 4px 12px rgba(0, 0, 0, 0.05)' : 'none',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                '&:hover': { borderColor: 'var(--color-vc-hairline-strong)' },
                                '&:focus-within': { borderColor: 'var(--color-vc-hairline-strong)' }
                            }}
                            onClick={() => setIsSearchExpanded(true)}
                        >
                            <IconButton 
                                sx={{ p: '8px', color: 'var(--color-vc-mute)', minWidth: 34 }}
                                onClick={(e) => {
                                    if (isSearchExpanded) {
                                        e.stopPropagation();
                                        setIsSearchExpanded(false);
                                    }
                                }}
                            >
                                <SearchIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                            <InputBase
                                sx={{ 
                                    ml: 0.5, 
                                    flex: 1, 
                                    color: 'var(--color-vc-ink)', 
                                    fontSize: '13px', 
                                    fontFamily: 'inherit',
                                    opacity: isSearchExpanded ? 1 : 0,
                                    transition: 'opacity 0.15s ease'
                                }}
                                placeholder="Search courses..."
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                autoFocus={isSearchExpanded}
                            />
                        </Box>
                    </ClickAwayListener>

                    {/* Filters Components */}
                    <Stack 
                        direction="row" 
                        spacing={1.5} 
                        alignItems="center"
                        sx={{ 
                            pl: '48px', 
                            width: '100%',
                            transition: 'opacity 0.2s ease',
                            opacity: isSearchExpanded ? 0.2 : 1,
                            pointerEvents: isSearchExpanded ? 'none' : 'auto',
                            overflow: 'hidden'
                        }}
                    >
                        <IconButton size="small" sx={{ border: '1px solid var(--color-vc-hairline)', borderRadius: '6px', height: 36, width: 36, color: 'var(--color-vc-mute)', bgcolor: 'var(--color-vc-canvas)' }}>
                            <FilterListIcon fontSize="small" />
                        </IconButton>

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                displayEmpty
                                sx={selectStyles}
                                MenuProps={menuStyles}
                            >
                                <MenuItem value="all">Every Status</MenuItem>
                                <MenuItem value="published">Published</MenuItem>
                                <MenuItem value="draft">Draft</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                displayEmpty
                                sx={selectStyles}
                                MenuProps={menuStyles}
                            >
                                <MenuItem value="all">All Types</MenuItem>
                                <MenuItem value="online">Online</MenuItem>
                                <MenuItem value="offline">Offline</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <Select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                displayEmpty
                                sx={selectStyles}
                                MenuProps={menuStyles}
                            >
                                <MenuItem value="all">All Categories</MenuItem>
                                {categories.map(cat => (
                                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </Box>

                {/* Right Area: ViewMode + Add Button + Total */}
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexShrink: 0, ml: 'auto' }}>
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)', fontFamily: '"JetBrains Mono", monospace', mr: 1 }}>
                        Total: {totalCount}
                    </Typography>

                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(e, v) => v && setViewMode(v)}
                        size="small"
                        sx={{
                            height: 36,
                            bgcolor: 'var(--color-vc-canvas)',
                            borderRadius: '6px',
                            border: '1px solid var(--color-vc-hairline)',
                            '& .MuiToggleButtonGroup-grouped': {
                                border: 0,
                                borderRadius: '4px',
                                mx: 0.5,
                                my: 0.5,
                                height: 28,
                                width: 32,
                                color: 'var(--color-vc-mute)',
                                '&.Mui-selected': {
                                    bgcolor: 'var(--color-vc-canvas-soft-2)',
                                    color: 'var(--color-vc-ink)',
                                    '&:hover': {
                                        bgcolor: 'var(--color-vc-canvas-soft-2)',
                                    }
                                },
                                '&:hover': {
                                    bgcolor: 'var(--color-vc-canvas-soft)',
                                }
                            }
                        }}
                    >
                        <ToggleButton value="grid"><GridViewIcon sx={{ fontSize: 16 }} /></ToggleButton>
                        <ToggleButton value="list"><ViewListIcon sx={{ fontSize: 16 }} /></ToggleButton>
                    </ToggleButtonGroup>

                    {hasModulePermission(user, 'courses', 'add') && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon fontSize="small" />}
                            onClick={handleAddCourse}
                            disabled={user?.role === 'teacher' && user?.permissions === 'read'}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 500,
                                fontSize: '13px',
                                fontFamily: 'inherit',
                                boxShadow: 'none',
                                borderRadius: '6px',
                                height: 36,
                                bgcolor: 'var(--color-vc-primary)',
                                color: 'var(--color-vc-on-primary)',
                                '&:hover': {
                                    bgcolor: 'var(--color-vc-primary)',
                                    opacity: 0.9,
                                    boxShadow: 'none'
                                }
                            }}
                        >
                            New Course
                        </Button>
                    )}
                </Stack>
            </Box>
        </Box>
    );
};

export default CourseHeader;
