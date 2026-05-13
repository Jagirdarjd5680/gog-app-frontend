import React from 'react';
import { Box, Typography, IconButton, LinearProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

const MaterialsHeader = ({ 
    batch, 
    onClose, 
    uploading, 
    uploadProgress, 
    downloading, 
    downloadProgress 
}) => {
    return (
        <>
            <Box sx={{
                px: 3, py: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <FolderOpenIcon sx={{ color: 'white', fontSize: 28 }} />
                    <Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.2 }}>
                            Batch Materials
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                            {batch?.name} — File Manager
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {(uploading || downloading) && (
                <Box sx={{ width: '100%', position: 'relative' }}>
                    <LinearProgress
                        variant="determinate"
                        value={uploading ? uploadProgress : downloadProgress}
                        color={uploading ? "primary" : "secondary"}
                        sx={{ height: 4 }}
                    />
                    <Box sx={{ 
                        position: 'absolute', top: 6, right: 12, zIndex: 10,
                        bgcolor: 'background.paper', px: 1, borderRadius: 1, 
                        boxShadow: 1, display: 'flex', alignItems: 'center', gap: 1
                    }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            {uploading ? `Uploading: ${uploadProgress}%` : `Downloading: ${downloadProgress}%`}
                        </Typography>
                    </Box>
                </Box>
            )}
        </>
    );
};

export default MaterialsHeader;
