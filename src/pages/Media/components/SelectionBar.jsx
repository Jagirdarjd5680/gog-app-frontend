import React from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Slide,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

const SelectionBar = (props) => {
    const selectedCount = props.selectedCount || 0;
    const handleClear = props.onClear || props.onClearSelection || (() => {});
    const handleDelete = props.onDelete || props.onDeleteSelected || (() => {});

    return (
        <Slide direction="up" in={selectedCount > 0} mountOnEnter unmountOnExit>
            <Paper
                elevation={0}
                sx={{
                    position: 'fixed',
                    bottom: 30,
                    left: '50%',
                    transform: 'translateX(-50%) !important',
                    background: 'var(--color-vc-ink, #09090b)',
                    color: 'var(--color-vc-canvas, #ffffff)',
                    px: 3,
                    py: 1.5,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2.5,
                    zIndex: 1300,
                    minWidth: 400,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    border: '1px solid var(--color-vc-hairline)'
                }}
            >
                <Box sx={{ 
                    width: 28, 
                    height: 28, 
                    borderRadius: '50%', 
                    bgcolor: 'var(--color-vc-primary)',
                    color: 'white',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 900
                }}>
                    {selectedCount}
                </Box>

                <Typography variant="body2" fontWeight={700}>
                    Items Selected
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                <Button
                    size="small"
                    startIcon={<DeleteIcon />}
                    variant="contained"
                    color="error"
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                    onClick={handleDelete}
                >
                    Delete Selected
                </Button>

                <IconButton size="small" onClick={handleClear} sx={{ color: 'var(--color-vc-mute)' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Paper>
        </Slide>
    );
};

export default SelectionBar;
