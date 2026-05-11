import React from 'react';
import { Box, Typography, Stack, Paper, IconButton, InputBase, ToggleButtonGroup, ToggleButton, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import AddIcon from '@mui/icons-material/Add';

const CourseHeader = ({ searchTerm, setSearchTerm, viewMode, setViewMode, handleAddCourse, user }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 3, gap: 2 }}>
            <Box>
                <Typography variant="h5" fontWeight={800}>Course Management</Typography>
                <Typography variant="caption" color="text.secondary">Manage your curriculum and student access</Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
                <Paper elevation={0} sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: { xs: '100%', md: 300 }, bgcolor: 'rgba(0,0,0,0.04)', borderRadius: '12px' }}>
                    <IconButton sx={{ p: '10px' }} aria-label="search"><SearchIcon fontSize="small" /></IconButton>
                    <InputBase sx={{ ml: 1, flex: 1, fontSize: '0.875rem' }} placeholder="Search courses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </Paper>

                <ToggleButtonGroup value={viewMode} exclusive onChange={(e, v) => v && setViewMode(v)} size="small" sx={{ bgcolor: 'white', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)' }}>
                    <ToggleButton value="grid" sx={{ px: 2, borderRadius: '10px !important' }}><GridViewIcon fontSize="small" /></ToggleButton>
                    <ToggleButton value="list" sx={{ px: 2, borderRadius: '10px !important' }}><ViewListIcon fontSize="small" /></ToggleButton>
                </ToggleButtonGroup>

                <Button
                    variant="contained"
                    sx={{ textTransform: 'none', fontWeight: 700, px: 3, borderRadius: '12px', boxShadow: 'none', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }}
                    startIcon={<AddIcon />}
                    onClick={handleAddCourse}
                    disabled={user?.role === 'teacher' && user?.permissions === 'read'}
                >
                    New Course
                </Button>
            </Stack>
        </Box>
    );
};

export default CourseHeader;
