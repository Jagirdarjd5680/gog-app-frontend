import { Box, Typography, Paper } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { fixUrl } from '../../utils/api';

const VideoPreview = ({ url, file, height = 200 }) => {
    if (!url && !file) return null;

    let processedUrl = fixUrl(url);
    let videoSrc = processedUrl;
    let isYoutube = false;

    // Handle File Object
    if (file instanceof File) {
        videoSrc = URL.createObjectURL(file);
    }
    // Handle YouTube URL
    else if (typeof url === 'string') {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            isYoutube = true;
            let videoId = '';
            if (url.includes('v=')) {
                videoId = url.split('v=')[1]?.split('&')[0];
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1]?.split('?')[0];
            } else {
                videoId = url.split('/').pop()?.split('?')[0];
            }
            videoSrc = `https://www.youtube.com/embed/${videoId}`;
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
            {isYoutube ? (
                <iframe
                    width="100%"
                    height="100%"
                    src={videoSrc}
                    title="Video Preview"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            ) : (
                <video
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
