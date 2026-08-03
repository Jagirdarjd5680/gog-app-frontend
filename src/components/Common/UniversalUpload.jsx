import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Stack,
    CircularProgress,
    ToggleButton,
    ToggleButtonGroup,
    InputAdornment,
    IconButton,
    LinearProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinkIcon from '@mui/icons-material/Link';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { uploadFile } from '../../utils/upload';
import { toast } from 'react-toastify';
import MediaPickerModal from '../Media/MediaPickerModal';
import { fixUrl } from '../../utils/api';

const UniversalUpload = ({
    value,
    onChange,
    label = "Media",
    placeholder = "Enter URL or upload media...",
    type = "image", // 'image', 'video', 'pdf', 'all'
    accept = "image/*"
}) => {
    const [tab, setTab] = useState('manual');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [urlChecking, setUrlChecking] = useState(false);
    const [urlValid, setUrlValid] = useState(true);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (tab === 'url' && value) {
            if (!value.match(/^https?:\/\//i)) {
                setUrlValid(false);
                return;
            }
            setUrlChecking(true);
            const img = new Image();
            img.src = fixUrl(value);
            img.onload = () => {
                setUrlValid(true);
                setUrlChecking(false);
            };
            img.onerror = () => {
                setUrlValid(false);
                setUrlChecking(false);
            };
        } else {
            setUrlValid(true);
            setUrlChecking(false);
        }
    }, [value, tab]);

    const handleTabChange = (event, newTab) => {
        if (newTab !== null) {
            setTab(newTab);
        }
    };

    const handleManualUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);
        try {
            const res = await uploadFile(file, (progress) => {
                setUploadProgress(progress);
            });
            const url = res?.url || res?.data?.url || `/uploads/${file.name}`;
            onChange(url);
            toast.success('File uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload file.');
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleMediaSelect = (file) => {
        const url = file.url || file.fileUrl;
        onChange(url);
    };

    const handleClear = () => {
        onChange('');
    };

    return (
        <Box sx={{
            border: '1px solid var(--color-vc-hairline)',
            borderRadius: '12px',
            bgcolor: 'var(--color-vc-canvas)',
            p: 2,
            mb: 2,
            boxShadow: '0px 2px 4px rgba(0,0,0,0.02)'
        }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: 'var(--color-vc-ink)' }}>
                    {label}
                </Typography>
                
                <ToggleButtonGroup
                    value={tab}
                    exclusive
                    onChange={handleTabChange}
                    size="small"
                    sx={{
                        '& .MuiToggleButton-root': {
                            px: 2,
                            py: 0.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            color: 'var(--color-vc-mute)',
                            borderColor: 'var(--color-vc-hairline)',
                            '&.Mui-selected': {
                                bgcolor: 'var(--color-vc-primary)',
                                color: '#fff',
                                '&:hover': {
                                    bgcolor: 'var(--color-vc-primary)',
                                    opacity: 0.9
                                }
                            }
                        }
                    }}
                >
                    <ToggleButton value="url">
                        <LinkIcon sx={{ fontSize: 16, mr: 0.5 }} /> URL
                    </ToggleButton>
                    <ToggleButton value="media">
                        <PhotoLibraryIcon sx={{ fontSize: 16, mr: 0.5 }} /> Gallery
                    </ToggleButton>
                    <ToggleButton value="manual">
                        <CloudUploadIcon sx={{ fontSize: 16, mr: 0.5 }} /> Device
                    </ToggleButton>
                </ToggleButtonGroup>
            </Stack>

            {/* Input Area based on Tab */}
            <Box sx={{ minHeight: 60 }}>
                {tab === 'manual' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <input
                            accept={accept}
                            style={{ display: 'none' }}
                            id={`universal-upload-${label.replace(/\s+/g, '-')}`}
                            type="file"
                            ref={fileInputRef}
                            onChange={handleManualUpload}
                        />
                        <label htmlFor={`universal-upload-${label.replace(/\s+/g, '-')}`} style={{ width: '100%' }}>
                            <Button
                                fullWidth
                                component="span"
                                variant="outlined"
                                disabled={uploading}
                                sx={{
                                    py: 2,
                                    borderStyle: 'dashed',
                                    borderWidth: 2,
                                    borderColor: 'var(--color-vc-hairline)',
                                    color: 'var(--color-vc-body)',
                                    borderRadius: '8px',
                                    bgcolor: 'var(--color-vc-canvas-soft)',
                                    '&:hover': {
                                        borderColor: 'var(--color-vc-primary)',
                                        bgcolor: 'rgba(56, 189, 248, 0.05)'
                                    }
                                }}
                            >
                                {uploading ? (
                                    <Stack alignItems="center" spacing={1} sx={{ width: '100%' }}>
                                        <Typography variant="body2" fontWeight={700} color="primary">
                                            Uploading {uploadProgress}%
                                        </Typography>
                                        <LinearProgress variant="determinate" value={uploadProgress} sx={{ width: '80%', borderRadius: 1 }} />
                                    </Stack>
                                ) : (
                                    <Stack alignItems="center" spacing={0.5}>
                                        <CloudUploadIcon sx={{ fontSize: 28, color: 'var(--color-vc-mute)' }} />
                                        <Typography variant="body2" fontWeight={600}>
                                            Click to browse and upload from your device
                                        </Typography>
                                    </Stack>
                                )}
                            </Button>
                        </label>
                    </Box>
                )}

                {tab === 'media' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2, border: '2px dashed var(--color-vc-hairline)', borderRadius: '8px', bgcolor: 'var(--color-vc-canvas-soft)' }}>
                        <Button
                            variant="contained"
                            startIcon={<PhotoLibraryIcon />}
                            onClick={() => setMediaPickerOpen(true)}
                            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, px: 3, boxShadow: 'none' }}
                        >
                            Open Media Library
                        </Button>
                        <Typography variant="caption" sx={{ mt: 1, color: 'var(--color-vc-mute)' }}>
                            Select an existing file from your cloud storage
                        </Typography>
                    </Box>
                )}

                {tab === 'url' && (
                    <Stack spacing={1}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder={placeholder}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LinkIcon color="action" fontSize="small" />
                                    </InputAdornment>
                                ),
                                endAdornment: urlChecking && (
                                    <InputAdornment position="end">
                                        <CircularProgress size={16} />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '8px', bgcolor: 'var(--color-vc-canvas-soft)' }
                            }}
                        />
                        {value && (
                            <Box sx={{ px: 1 }}>
                                {urlChecking ? (
                                    <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>Fetching preview...</Typography>
                                ) : !urlValid ? (
                                    <Typography variant="caption" color="error">Invalid image URL</Typography>
                                ) : null}
                            </Box>
                        )}
                    </Stack>
                )}
            </Box>

            {/* Selected File Preview / Info */}
            {value && (tab !== 'url' || (urlValid && !urlChecking)) && (
                <Box sx={{ mt: 2, p: 1.5, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid var(--color-vc-hairline-strong)', borderRadius: '8px', bgcolor: 'var(--color-vc-canvas-soft)' }}>
                    {type === 'image' && (
                        <Box
                            component="img"
                            src={fixUrl(value)}
                            alt="Preview"
                            sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--color-vc-hairline)' }}
                        />
                    )}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={700} noWrap sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'var(--color-vc-ink)' }}>
                            <CheckCircleIcon color="success" sx={{ fontSize: 16 }} /> {tab === 'url' ? 'URL Verified & Loaded' : 'Media Selected'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                            {value}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={handleClear} color="error" title="Remove">
                        <ClearIcon fontSize="small" />
                    </IconButton>
                </Box>
            )}

            <MediaPickerModal
                open={mediaPickerOpen}
                onClose={() => setMediaPickerOpen(false)}
                onSelect={handleMediaSelect}
                type={type}
            />
        </Box>
    );
};

export default UniversalUpload;
