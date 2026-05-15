import React from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Slide,
    IconButton,
    alpha,
    useTheme
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

const SelectionBar = ({ selectedCount, onClear, onDelete, onDownload }) => {
    const theme = useTheme();

    return (
        <Slide direction="up" in={selectedCount > 0} mountOnEnter unmountOnExit>
            <Paper
                elevation={0}
                sx={{
                    position: 'fixed',
                    bottom: 30,
                    left: '50%',
                    transform: 'translateX(-50%) !important',
                    background: 'linear-gradient(135deg, #1a237e 0%, #4a148c 100%)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    px: 3,
                    py: 1.5,
                    borderRadius: 5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    zIndex: 1300,
                    minWidth: 450,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 20px rgba(74, 20, 140, 0.4)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                {/* Count Circle */}
                <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    bgcolor: 'white',
                    color: '#1a237e',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                }}>
                    <Typography variant="body2" fontWeight={900}>{selectedCount}</Typography>
                </Box>

                <Typography variant="body2" fontWeight={700} sx={{ letterSpacing: 0.5 }}>
                    Files Selected
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        size="small"
                        startIcon={<CloudDownloadIcon />}
                        variant="text"
                        sx={{ 
                            color: 'white', 
                            textTransform: 'none', 
                            fontWeight: 700,
                            borderRadius: 2,
                            px: 2,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                        }}
                        onClick={onDownload}
                    >
                        Download
                    </Button>
                    <Button
                        size="small"
                        startIcon={<DeleteIcon />}
                        variant="contained"
                        color="error"
                        sx={{ 
                            textTransform: 'none', 
                            fontWeight: 700, 
                            borderRadius: 2,
                            px: 2,
                            boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
                        }}
                        onClick={onDelete}
                    >
                        Delete
                    </Button>
                </Box>

                <IconButton 
                    size="small" 
                    onClick={onClear} 
                    sx={{ 
                        color: 'white', 
                        ml: 1,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Paper>
        </Slide>
    );
};

export default SelectionBar;
