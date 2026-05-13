import React from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { fixUrl } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';

const VideoPreview = ({ url, file, height = 200 }) => {
    const { settings, loading } = useSettings();

    if (!url && !file) return null;

    // Handle Loading State
    if (loading && !file) {
        return (
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    height: height,
                    bgcolor: '#000',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #e0e0e0'
                }}
            >
                <CircularProgress size={24} sx={{ color: 'white' }} />
            </Paper>
        );
    }

    let processedUrl = fixUrl(url);
    let videoSrc = processedUrl;
    let isIframe = false;

    // Handle File Object
    if (file instanceof File) {
        videoSrc = URL.createObjectURL(file);
    }
    // Handle Video Source Logic
    else if (typeof url === 'string') {
        // 1. Detect YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            isIframe = true;
            let videoId = '';
            if (url.includes('list=')) {
                const listId = url.split('list=')[1]?.split('&')[0];
                videoSrc = `https://www.youtube.com/embed?listType=playlist&list=${listId}&modestbranding=1&rel=0&controls=1&disablekb=1`;
            } else {
                if (url.includes('v=')) {
                    videoId = url.split('v=')[1]?.split('&')[0];
                } else if (url.includes('youtu.be/')) {
                    videoId = url.split('youtu.be/')[1]?.split('?')[0];
                } else {
                    videoId = url.split('/').pop()?.split('?')[0];
                }
                videoSrc = `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&controls=1&disablekb=1`;
            }
        }
        // 2. Detect Bunny Stream GUID (Robust detection)
        else {
            const guidRegex = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
            const match = (url || '').trim().match(guidRegex);

            if (match) {
                const guid = match[1];
                let libraryId = settings?.storage?.bunnycdn?.streamLibraryId || settings?.bunnycdn?.streamLibraryId;

                // Support explicit library ID prefix (e.g. 123456:guid)
                const libraryPrefixMatch = url.trim().match(/^(\d+):/);
                if (libraryPrefixMatch) {
                    libraryId = libraryPrefixMatch[1];
                }

                if (libraryId) {
                    isIframe = true;
                    videoSrc = `https://player.mediadelivery.net/embed/${libraryId}/${guid}?autoplay=false&loop=false&muted=false&preload=true`;
                } else {
                    return (
                        <Box sx={{
                            height,
                            bgcolor: '#f8fafc',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px dashed #cbd5e1',
                            borderRadius: '12px',
                            p: 2,
                            textAlign: 'center'
                        }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Bunny Stream detected but <b>Library ID</b> is not configured.
                            </Typography>
                            <Typography variant="caption" color="error">
                                Please check Settings ＆ Storage
                            </Typography>
                        </Box>
                    );
                }
            }
        }
    }

    return (
        <Paper
            elevation={0}
            sx={{
                width: '100%',
                height: height,
                bgcolor: '#000',
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e0e0e0'
            }}
        >
            {isIframe ? (
                <iframe
                    key={videoSrc}
                    width="100%"
                    height="100%"
                    src={videoSrc}
                    title="Video Preview"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="no-referrer"
                    style={{ border: 'none' }}
                />
            ) : (
                <video
                    key={videoSrc}
                    src={videoSrc}
                    controls
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                >
                    Your browser does not support the video tag.
                </video>
            )}
        </Paper>
    );
};

export default VideoPreview;
