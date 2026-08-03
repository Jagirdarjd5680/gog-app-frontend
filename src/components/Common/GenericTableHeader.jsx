import React, { useState, useEffect } from 'react';
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
    ClickAwayListener
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

const GenericTableHeader = ({
    searchTerm,
    setSearchTerm,
    searchPlaceholder = "Search...",
    filters = [],
    actionButtonText,
    onActionClick,
    actionButtonIcon,
    totalCount,
    extraElement
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
                                width: isSearchExpanded ? 260 : 36,
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
                                placeholder={searchPlaceholder}
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                autoFocus={isSearchExpanded}
                            />
                        </Box>
                    </ClickAwayListener>

                    {/* Filters Components - shifted to the right of collapsed search icon */}
                    <Stack 
                        direction="row" 
                        spacing={1.5} 
                        alignItems="center"
                        sx={{ 
                            pl: '48px', // starts after collapsed search icon (36px + 12px gap)
                            width: '100%',
                            transition: 'opacity 0.2s ease',
                            opacity: isSearchExpanded ? 0.2 : 1,
                            pointerEvents: isSearchExpanded ? 'none' : 'auto',
                            overflow: 'hidden'
                        }}
                    >
                        {filters.length > 0 && (
                            <IconButton size="small" sx={{ border: '1px solid var(--color-vc-hairline)', borderRadius: '6px', height: 36, width: 36, color: 'var(--color-vc-mute)', bgcolor: 'var(--color-vc-canvas)' }}>
                                <FilterListIcon fontSize="small" />
                            </IconButton>
                        )}

                        {filters.map((filter, index) => (
                            <FormControl key={index} size="small" sx={{ minWidth: filter.minWidth || 120 }}>
                                <Select
                                    value={filter.value}
                                    onChange={(e) => filter.onChange(e.target.value)}
                                    displayEmpty
                                    sx={selectStyles}
                                    MenuProps={menuStyles}
                                >
                                    {filter.options.map((opt, oIdx) => (
                                        <MenuItem key={oIdx} value={opt.value}>
                                            {opt.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ))}
                    </Stack>
                </Box>

                {/* Right Area: Buttons + Total */}
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexShrink: 0, ml: 'auto' }}>
                    {totalCount !== undefined && (
                        <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)', fontFamily: '"JetBrains Mono", monospace', mr: 1 }}>
                            Total: {totalCount}
                        </Typography>
                    )}

                    {actionButtonText && (
                        <Button
                            variant="contained"
                            startIcon={actionButtonIcon}
                            onClick={onActionClick}
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
                            {actionButtonText}
                        </Button>
                    )}

                    {extraElement}
                </Stack>
            </Box>
        </Box>
    );
};

export default GenericTableHeader;
