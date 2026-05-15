import React from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    IconButton,
    Tooltip,
    ToggleButton,
    ToggleButtonGroup,
    useTheme,
    alpha
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import LinkIcon from '@mui/icons-material/Link';
import SyncIcon from '@mui/icons-material/Sync';
import StorageIcon from '@mui/icons-material/Storage';

const MediaTopBar = ({ 
    searchQuery, 
    onSearchChange, 
    viewMode, 
    onViewModeChange,
    onSyncClick,
    onImportUrlClick,
    onStatsClick
}) => {
    const theme = useTheme();

    return (
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 4,
            gap: 2
        }}>
            {/* Search Bar */}
            <TextField
                placeholder="Search your library..."
                size="small"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                sx={{ 
                    width: 400,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        bgcolor: 'background.paper',
                    }
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: 'text.disabled' }} />
                        </InputAdornment>
                    ),
                }}
            />

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(e, mode) => mode && onViewModeChange(mode)}
                    size="small"
                    sx={{ mr: 2 }}
                >
                    <ToggleButton value="grid" sx={{ borderRadius: '12px 0 0 12px' }}>
                        <GridViewIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="list" sx={{ borderRadius: '0 12px 12px 0' }}>
                        <ViewListIcon fontSize="small" />
                    </ToggleButton>
                </ToggleButtonGroup>

                <Tooltip title="Import External URL">
                    <IconButton 
                        onClick={onImportUrlClick}
                        sx={{ 
                            bgcolor: alpha(theme.palette.info.main, 0.1), 
                            color: 'info.main',
                            '&:hover': { bgcolor: 'info.main', color: 'white' }
                        }}
                    >
                        <LinkIcon />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Sync Storage">
                    <IconButton 
                        onClick={onSyncClick}
                        sx={{ 
                            bgcolor: alpha(theme.palette.success.main, 0.1), 
                            color: 'success.main',
                            '&:hover': { bgcolor: 'success.main', color: 'white' }
                        }}
                    >
                        <SyncIcon />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Storage Statistics">
                    <IconButton 
                        onClick={onStatsClick}
                        sx={{ 
                            bgcolor: alpha(theme.palette.warning.main, 0.1), 
                            color: 'warning.main',
                            '&:hover': { bgcolor: 'warning.main', color: 'white' }
                        }}
                    >
                        <StorageIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
};

export default MediaTopBar;
