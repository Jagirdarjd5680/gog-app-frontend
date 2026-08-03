import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Stack, Paper, Chip, Button, CircularProgress } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { liveClassesService } from '../../../api/liveClasses/service';
import { getYoutubeEmbedUrl } from '../../../utils/youtube';
import { toast } from 'react-toastify';

const statusColor = (status) => {
    if (status === 'ongoing' || status === 'live') return 'error';
    if (status === 'completed') return 'success';
    if (status === 'cancelled') return 'default';
    return 'warning';
};

function LiveClassCard({ item }) {
    const embedUrl = getYoutubeEmbedUrl(item.meetingLink);
    return (
        <Paper elevation={0} sx={{ p: 2, borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                <Box>
                    <Typography variant="subtitle2" fontWeight={800}>{item.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {new Date(item.scheduledAt).toLocaleString()} · {item.durationMins} min
                    </Typography>
                </Box>
                <Chip label={(item.status || 'scheduled').toUpperCase()} color={statusColor(item.status)} size="small" />
            </Stack>
            {item.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{item.description}</Typography>
            )}
            {embedUrl ? (
                <Box sx={{ position: 'relative', width: '100%', pt: '56.25%', borderRadius: '8px', overflow: 'hidden' }}>
                    <iframe
                        title={item.title}
                        src={embedUrl}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </Box>
            ) : (
                <Button
                    variant="contained"
                    startIcon={<OpenInNewIcon />}
                    href={item.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ fontWeight: 700, borderRadius: '8px', textTransform: 'none' }}
                >
                    Join Live Class
                </Button>
            )}
        </Paper>
    );
}

export function LiveClassesTab({ courseId }) {
    const [liveClasses, setLiveClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const data = await liveClassesService.getCourseLiveClasses(courseId);
            setLiveClasses(data);
        } catch (err) {
            toast.error('Failed to load live classes');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        load();
    }, [load]);

    if (loading) {
        return (
            <Box sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (liveClasses.length === 0) {
        return (
            <Box sx={{ py: 6, textAlign: 'center' }}>
                <VideocamIcon sx={{ fontSize: 36, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                    No live classes scheduled for this course yet.
                </Typography>
            </Box>
        );
    }

    const now = Date.now();
    const upcoming = liveClasses
        .filter((c) => new Date(c.scheduledAt).getTime() >= now && c.status !== 'completed' && c.status !== 'cancelled')
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
    const past = liveClasses
        .filter((c) => !upcoming.includes(c))
        .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));

    return (
        <Box>
            {upcoming.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>Upcoming</Typography>
                    <Stack spacing={2}>
                        {upcoming.map((item) => <LiveClassCard key={item.id} item={item} />)}
                    </Stack>
                </Box>
            )}
            {past.length > 0 && (
                <Box>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>Past</Typography>
                    <Stack spacing={2}>
                        {past.map((item) => <LiveClassCard key={item.id} item={item} />)}
                    </Stack>
                </Box>
            )}
        </Box>
    );
}
