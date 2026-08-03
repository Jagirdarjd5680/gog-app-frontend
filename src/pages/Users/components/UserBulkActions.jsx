import React from 'react';
import { Box, Stack, Typography, Button, FormControl, Select, MenuItem } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { hasModulePermission } from '../../../utils/permissions';

const UserBulkActions = ({ selectedCount, handleBulkSync, handleBulkBatchAssign, handleBulkDelete, handleBulkExport, batches, user }) => {
    return (
        <Box sx={{
            p: 1.25, px: 2, 
            bgcolor: 'var(--color-vc-canvas-soft-2)',
            border: '1px solid var(--color-vc-hairline-strong)',
            borderRadius: '6px',
            mb: 2.5,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2
        }}>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-primary)', fontFamily: 'inherit' }}>
                    {selectedCount} users selected
                </Typography>
                <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<SyncIcon sx={{ fontSize: 14 }} />} 
                    onClick={handleBulkSync} 
                    sx={{ 
                        borderRadius: '6px', 
                        fontWeight: 500, 
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        textTransform: 'none',
                        color: 'var(--color-vc-ink)',
                        borderColor: 'var(--color-vc-hairline)',
                        bgcolor: 'var(--color-vc-canvas)',
                        '&:hover': {
                            borderColor: 'var(--color-vc-hairline-strong)',
                            bgcolor: 'var(--color-vc-canvas-soft)'
                        }
                    }}
                >
                    Batch Sync
                </Button>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                        displayEmpty value="" onChange={(e) => handleBulkBatchAssign(e.target.value)}
                        sx={{ 
                            height: 32, 
                            fontSize: '12px', 
                            borderRadius: '6px', 
                            bgcolor: 'var(--color-vc-canvas)',
                            color: 'var(--color-vc-ink)',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-vc-hairline)' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-vc-hairline-strong)' }
                        }}
                        renderValue={() => (
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'var(--color-vc-ink)' }}>
                                <GroupAddIcon sx={{ fontSize: 14, color: 'var(--color-vc-mute)' }} />
                                <span style={{ fontFamily: 'inherit' }}>Assign Batch</span>
                            </Stack>
                        )}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    bgcolor: 'var(--color-vc-canvas)',
                                    color: 'var(--color-vc-ink)',
                                    border: '1px solid var(--color-vc-hairline)',
                                    borderRadius: '6px',
                                    '& .MuiMenuItem-root': {
                                        fontSize: '12px',
                                        fontFamily: 'inherit',
                                        py: 0.75
                                    }
                                }
                            }
                        }}
                    >
                        <MenuItem value=""><em>None / Clear</em></MenuItem>
                        {batches.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                    </Select>
                </FormControl>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FileDownloadIcon sx={{ fontSize: 14 }} />}
                    onClick={handleBulkExport}
                    sx={{
                        borderRadius: '6px',
                        fontWeight: 500,
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        textTransform: 'none',
                        color: 'var(--color-vc-ink)',
                        borderColor: 'var(--color-vc-hairline)',
                        bgcolor: 'var(--color-vc-canvas)',
                        '&:hover': {
                            borderColor: 'var(--color-vc-hairline-strong)',
                            bgcolor: 'var(--color-vc-canvas-soft)'
                        }
                    }}
                >
                    Export CSV
                </Button>
                {hasModulePermission(user, 'students', 'delete') && (
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<DeleteIcon sx={{ fontSize: 14 }} />}
                        onClick={handleBulkDelete}
                        sx={{
                            borderRadius: '6px',
                            fontWeight: 500,
                            fontSize: '12px',
                            fontFamily: 'inherit',
                            textTransform: 'none',
                            bgcolor: 'var(--color-vc-error-soft)',
                            color: 'var(--color-vc-error-deep)',
                            boxShadow: 'none',
                            border: '1px solid var(--color-vc-error-soft)',
                            '&:hover': {
                                bgcolor: 'var(--color-vc-error-deep)',
                                color: '#ffffff',
                                borderColor: 'var(--color-vc-error-deep)',
                                boxShadow: 'none'
                            }
                        }}
                    >
                        Bulk Delete
                    </Button>
                )}
            </Stack>
        </Box>
    );
};

export default UserBulkActions;
