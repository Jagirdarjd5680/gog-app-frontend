import React from 'react';
import { Box, Typography, IconButton, LinearProgress, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

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
                px: 3, py: 2.2,
                bgcolor: 'var(--color-vc-canvas-soft, #1e2029)',
                background: 'linear-gradient(135deg, #1e2029 0%, #2a2d3d 100%)',
                color: '#ffffff',
                borderBottom: '1px solid var(--color-vc-hairline, rgba(255,255,255,0.1))',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
                    <Box sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(99,102,241,0.35)'
                    }}>
                        <FolderSpecialIcon sx={{ color: '#ffffff', fontSize: 24 }} />
                    </Box>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ color: '#ffffff', fontWeight: 700, fontSize: '17px', fontFamily: 'inherit', letterSpacing: '-0.2px' }}>
                                Batch Materials
                            </Typography>
                            {batch?.name && (
                                <Chip 
                                    label={batch.name} 
                                    size="small" 
                                    sx={{ 
                                        bgcolor: 'rgba(255,255,255,0.12)', 
                                        color: '#ffffff', 
                                        fontWeight: 600, 
                                        fontSize: '11px',
                                        height: 22,
                                        backdropFilter: 'blur(4px)',
                                        border: '1px solid rgba(255,255,255,0.15)'
                                    }} 
                                />
                            )}
                        </Box>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontFamily: 'inherit', mt: 0.2 }}>
                            Manage & organize files, folders, curriculum materials and resources
                        </Typography>
                    </Box>
                </Box>
                
                <IconButton 
                    onClick={onClose} 
                    sx={{ 
                        color: 'rgba(255,255,255,0.8)',
                        bgcolor: 'rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        p: 1,
                        transition: 'all 0.2s ease',
                        '&:hover': { 
                            color: '#ffffff',
                            bgcolor: 'rgba(255,255,255,0.18)',
                            transform: 'scale(1.05)'
                        } 
                    }}
                >
                    <CloseIcon sx={{ fontSize: 20 }} />
                </IconButton>
            </Box>

            {(uploading || downloading) && (
                <Box sx={{ width: '100%', position: 'relative', bgcolor: 'var(--color-vc-canvas-soft, #1e2029)' }}>
                    <LinearProgress
                        variant="determinate"
                        value={uploading ? uploadProgress : downloadProgress}
                        sx={{ 
                            height: 5,
                            bgcolor: 'rgba(255,255,255,0.1)',
                            '& .MuiLinearProgress-bar': {
                                background: uploading 
                                    ? 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)' 
                                    : 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)'
                            }
                        }}
                    />
                    <Box sx={{ 
                        py: 0.6, px: 2, 
                        bgcolor: 'rgba(0,0,0,0.4)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        backdropFilter: 'blur(8px)'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {uploading ? (
                                <CloudUploadIcon sx={{ color: '#10b981', fontSize: 16 }} />
                            ) : (
                                <CloudDownloadIcon sx={{ color: '#3b82f6', fontSize: 16 }} />
                            )}
                            <Typography sx={{ color: '#ffffff', fontWeight: 600, fontSize: '12px', fontFamily: 'inherit' }}>
                                {uploading ? `Uploading files... ${uploadProgress}%` : `Downloading file... ${downloadProgress}%`}
                            </Typography>
                        </Box>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontFamily: 'inherit' }}>
                            Please do not close this drawer
                        </Typography>
                    </Box>
                </Box>
            )}
        </>
    );
};

export default MaterialsHeader;
