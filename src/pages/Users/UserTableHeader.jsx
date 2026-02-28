import {
    Box,
    Typography,
    Button,
    IconButton,
    InputBase,
    Paper,
    FormControl,
    Select,
    MenuItem,
    Stack,
    Badge
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

const UserTableHeader = ({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sourceFilter,
    setSourceFilter,
    authFilter,
    setAuthFilter,
    handleAdd,
    setRecycleBinOpen,
    binCount,
    totalCount,
    isDark
}) => {
    const selectStyles = {
        bgcolor: isDark ? '#1e1e1e' : '#f8f9fa',
        color: isDark ? '#fff' : 'inherit',
        borderRadius: 1,
        '& .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0' },
        '& .MuiSvgIcon-root': { color: isDark ? '#fff' : 'inherit' }
    };

    const menuStyles = {
        PaperProps: {
            sx: {
                bgcolor: isDark ? '#1e1e1e' : '#fff',
                color: isDark ? '#fff' : 'inherit',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none'
            }
        }
    };

    return (
        <Box>
            {/* Top Header Row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: '2px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        width: 400,
                        bgcolor: isDark ? 'action.hover' : '#f8f9fa',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2
                    }}
                >
                    <IconButton sx={{ p: '10px' }} aria-label="search">
                        <SearchIcon />
                    </IconButton>
                    <InputBase
                        sx={{ ml: 1, flex: 1, color: 'inherit' }}
                        placeholder="Search by Name, Email or Roll Num..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Paper>

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAdd}
                        sx={{ textTransform: 'uppercase', fontWeight: 600, boxShadow: 'none', borderRadius: 1.5 }}
                    >
                        Add Student
                    </Button>

                    <Badge badgeContent={binCount} color="error" overlap="rectangular">
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteSweepIcon />}
                            onClick={() => setRecycleBinOpen(true)}
                            sx={{ textTransform: 'uppercase', fontWeight: 600, borderRadius: 1.5 }}
                        >
                            Recycle Bin
                        </Button>
                    </Badge>
                </Stack>
            </Box>

            {/* Filters Row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <IconButton size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <FilterListIcon fontSize="small" />
                    </IconButton>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            displayEmpty
                            sx={selectStyles}
                            MenuProps={menuStyles}
                        >
                            <MenuItem value="all">Every Status</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                            value={sourceFilter}
                            onChange={(e) => setSourceFilter(e.target.value)}
                            displayEmpty
                            sx={selectStyles}
                            MenuProps={menuStyles}
                        >
                            <MenuItem value="all">All Sources</MenuItem>
                            <MenuItem value="web">Web</MenuItem>
                            <MenuItem value="android">Android</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                            value={authFilter}
                            onChange={(e) => setAuthFilter(e.target.value)}
                            displayEmpty
                            sx={selectStyles}
                            MenuProps={menuStyles}
                        >
                            <MenuItem value="all">All Auth Types</MenuItem>
                            <MenuItem value="google">Google</MenuItem>
                            <MenuItem value="email">Email</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>

                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Total: {totalCount}
                </Typography>
            </Box>
        </Box>
    );
};

export default UserTableHeader;
