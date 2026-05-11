import React from 'react';
import { Box, Stack, Typography, Button, FormControl, Select, MenuItem } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import DeleteIcon from '@mui/icons-material/Delete';

const UserBulkActions = ({ selectedCount, handleBulkSync, handleBulkBatchAssign, handleBulkDelete, batches, isDark }) => {
    return (
        <Box sx={{
            p: 1, px: 2, bgcolor: isDark ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)',
            borderBottom: '1px solid', borderColor: 'primary.main',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2
        }}>
            <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="subtitle2" color="primary.main" fontWeight={700}>{selectedCount} users selected</Typography>
                <Button variant="contained" color="primary" size="small" startIcon={<SyncIcon />} onClick={handleBulkSync} sx={{ borderRadius: 1.5, fontWeight: 700, textTransform: 'none' }}>Batch Sync</Button>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <Select
                        displayEmpty value="" onChange={(e) => handleBulkBatchAssign(e.target.value)}
                        sx={{ height: 32, fontSize: '0.8rem', borderRadius: 1.5, bgcolor: 'background.paper' }}
                        renderValue={() => (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <GroupAddIcon sx={{ fontSize: 16 }} />
                                <span>Assign Batch</span>
                            </Stack>
                        )}
                    >
                        <MenuItem value=""><em>None / Clear</em></MenuItem>
                        {batches.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                    </Select>
                </FormControl>
            </Stack>
            <Button variant="contained" color="error" size="small" startIcon={<DeleteIcon />} onClick={handleBulkDelete} sx={{ borderRadius: 1.5, fontWeight: 700, textTransform: 'none' }}>Bulk Delete</Button>
        </Box>
    );
};

export default UserBulkActions;
