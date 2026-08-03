import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import Hls from 'hls.js';
import { fixUrl } from '../../../utils/api';
import { getYoutubeEmbedUrl } from '../../../utils/youtube';
import { courseViewerService } from '../../../api/courseViewer/service';
import { RollNumberWatermark } from './RollNumberWatermark';

const HLS_STREAM_PATTERN = /\/media\/stream\/([^/]+)\//;

/**
 * Real HLS ("chunks") playback — the same approach already proven in
 * components/Common/VideoPreview.jsx (admin media picker), pulled into its own component here
 * since the course viewer needs onEnded/progress callbacks that preview component doesn't have.
 * A plain <video src="....m3u8"> only plays in Safari; every other browser needs hls.js.
 */
export function CourseVideoPlayer({ lesson, watermarkLabel, onEnded }) {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const hlsRef = useRef(null);
    const [ready, setReady] = useState(false);
    const [resolvedUrl, setResolvedUrl] = useState(null);

    // The browser's own fullscreen button (on the native <video> controls bar) fullscreens the
    // <video> element itself — which, per the Fullscreen API, hides every sibling, including the
    // watermark overlay below. Retarget: the instant the *video* (not our wrapper) goes
    // fullscreen, swap to fullscreening the wrapper instead, so the watermark stays visible and
    // reads as part of the video rather than something that vanishes the moment you go fullscreen.
    useEffect(() => {
        const handleFullscreenChange = () => {
            if (document.fullscreenElement === videoRef.current && containerRef.current) {
                document.exitFullscreen().then(() => containerRef.current?.requestFullscreen()).catch(() => {});
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const rawUrl = lesson?.url || '';
    const isPdf = lesson?.type === 'pdf';
    const youtubeUrl = !isPdf ? getYoutubeEmbedUrl(rawUrl) : null;

    // Mint a fresh playback token every time a lesson is opened, instead of reusing whatever the
    // URL already carried — so the token in the address actually changes on each open, not just
    // once at load time.
    useEffect(() => {
        let cancelled = false;
        setResolvedUrl(null);
        if (isPdf || youtubeUrl || !rawUrl) {
            setResolvedUrl(fixUrl(rawUrl));
            return undefined;
        }

        const base = fixUrl(rawUrl);
        const videoId = base?.match(HLS_STREAM_PATTERN)?.[1];
        if (!videoId) {
            setResolvedUrl(base);
            return undefined;
        }

        courseViewerService
            .getVideoPlaybackToken(videoId)
            .then((token) => {
                if (cancelled) return;
                const withoutToken = base.replace(/([?&])token=[^&]*&?/, '$1').replace(/[?&]$/, '');
                const separator = withoutToken.includes('?') ? '&' : '?';
                setResolvedUrl(`${withoutToken}${separator}token=${token}`);
            })
            .catch(() => !cancelled && setResolvedUrl(base));

        return () => {
            cancelled = true;
        };
    }, [rawUrl, isPdf, youtubeUrl]);

    const isHLS = typeof resolvedUrl === 'string' && resolvedUrl.includes('.m3u8');

    useEffect(() => {
        setReady(false);
        if (isPdf || youtubeUrl || !videoRef.current || !resolvedUrl) return undefined;

        const token = localStorage.getItem('token');

        if (isHLS) {
            if (Hls.isSupported()) {
                const hls = new Hls({
                    xhrSetup: (xhr) => {
                        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                    },
                });
                hls.loadSource(resolvedUrl);
                hls.attachMedia(videoRef.current);
                hls.on(Hls.Events.MANIFEST_PARSED, () => setReady(true));
                hlsRef.current = hls;
            } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                videoRef.current.src = resolvedUrl;
                setReady(true);
            }
        } else {
            videoRef.current.src = resolvedUrl;
            setReady(true);
        }

        return () => {
            hlsRef.current?.destroy();
            hlsRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedUrl, isHLS, isPdf, youtubeUrl]);

    // Blocks the native right-click menu (which includes "Cast...") across the whole player area.
    const blockContextMenu = (e) => e.preventDefault();

    if (!lesson) {
        return (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'grey.500' }}>
                No lecture selected
            </Box>
        );
    }

    if (isPdf) {
        return <iframe title={lesson.title} src={resolvedUrl} style={{ width: '100%', height: '100%', border: 0, background: 'white' }} />;
    }

    if (youtubeUrl) {
        return (
            <iframe
                title={lesson.title}
                src={youtubeUrl}
                style={{ width: '100%', height: '100%', border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        );
    }

    return (
        <Box
            ref={containerRef}
            sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                bgcolor: 'black',
                // When the container itself becomes the fullscreen element (see the retarget
                // above), it needs to actually fill the screen and center the video within it.
                '&:fullscreen': { display: 'flex', alignItems: 'center', justifyContent: 'center' },
            }}
            onContextMenu={blockContextMenu}
        >
            {!ready && (
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress sx={{ color: 'white' }} size={28} />
                </Box>
            )}
            <video
                key={lesson.id}
                ref={videoRef}
                controls
                autoPlay
                playsInline
                disablePictureInPicture
                controlsList="nodownload noremoteplayback"
                onContextMenu={blockContextMenu}
                onEnded={onEnded}
                style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: ready ? 1 : 0 }}
            >
                Your browser does not support the video tag.
            </video>
            {ready && watermarkLabel && <RollNumberWatermark label={watermarkLabel} />}
        </Box>
    );
}
