import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Anti-piracy forensic watermark — deters/attributes screen recordings by keeping the viewing
 * student's identity visibly drifting over the video (matches the same idea already planned for
 * the native app's player, see docs/tasks/04-video-watermark.md). Semi-transparent by design (per
 * request: visible but not fully opaque), slowly drifting to random points so a static crop can't
 * simply cut it out of frame, and `pointerEvents: none` so it never blocks the video controls.
 */
export function RollNumberWatermark({ label }) {
    const containerRef = useRef(null);
    const [pos, setPos] = useState({ top: 10, left: 10 });

    useEffect(() => {
        const moveToRandomSpot = () => {
            const el = containerRef.current;
            const maxTop = el ? Math.max(el.clientHeight - 60, 10) : 80;
            const maxLeft = el ? Math.max(el.clientWidth - 160, 10) : 80;
            setPos({
                top: 10 + Math.random() * (maxTop - 10),
                left: 10 + Math.random() * (maxLeft - 10),
            });
        };

        moveToRandomSpot();
        // Slow drift — long enough to read as "moving," not distracting/flickering.
        const interval = setInterval(moveToRandomSpot, 6000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Box ref={containerRef} sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 5 }}>
            <Box
                sx={{
                    position: 'absolute',
                    top: `${pos.top}px`,
                    left: `${pos.left}px`,
                    transition: 'top 5s ease-in-out, left 5s ease-in-out',
                    px: 1.2,
                    py: 0.5,
                    borderRadius: '6px',
                    bgcolor: 'rgba(0,0,0,0.25)',
                }}
            >
                <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap', userSelect: 'none' }}>
                    {label}
                </Typography>
            </Box>
        </Box>
    );
}
