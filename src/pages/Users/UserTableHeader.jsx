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
    roleFilter,
    setRoleFilter,
    batchFilter,
    setBatchFilter,
    batches,
    handleAdd,
    setRecycleBinOpen,
    binCount,
    totalCount,
    isDark
}) => {
    const selectStyles = {
        bgcolor: 'transparent',
        color: isDark ? '#fff' : '#1e293b',
        borderRadius: '8px',
        fontSize: '0.85rem',
        fontWeight: 500,
        '& .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
        '& .MuiSvgIcon-root': { color: isDark ? '#fff' : '#64748b' }
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
                        bgcolor: 'transparent',
                        borderBottom: '1.5px solid',
                        borderColor: 'divider',
                        borderRadius: 0,
                        transition: 'border-color 0.2s',
                        '&:focus-within': { borderColor: 'primary.main' }
                    }}
                >
                    <IconButton sx={{ p: '10px', color: 'text.secondary' }} aria-label="search">
                        <SearchIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                    <InputBase
                        sx={{ ml: 1, flex: 1, color: 'inherit', fontSize: '0.95rem' }}
                        placeholder="Search students..."
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
                            <MenuItem value="android">Android App</MenuItem>
                            <MenuItem value="ios">iOS App</MenuItem>
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
                            <MenuItem value="mobile">Mobile OTP</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            displayEmpty
                            sx={selectStyles}
                            MenuProps={menuStyles}
                        >
                            <MenuItem value="all">All Roles</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="teacher">Teacher</MenuItem>
                            <MenuItem value="student">Student</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                            value={batchFilter}
                            onChange={(e) => setBatchFilter(e.target.value)}
                            displayEmpty
                            sx={selectStyles}
                            MenuProps={menuStyles}
                        >
                            <MenuItem value="all">All Batches</MenuItem>
                            {batches.map(b => (
                                <MenuItem key={b} value={b}>{b}</MenuItem>
                            ))}
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
