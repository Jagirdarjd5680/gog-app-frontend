import React from 'react';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const PageLoader = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                width: '100%',
                bgcolor: 'background.default',
                zIndex: 9999,
                position: 'fixed',
                top: 0,
                left: 0
            }}
        >
            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                {/* Outer Ring */}
                <Box
                    sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        border: '3px solid transparent',
                        borderTopColor: 'primary.main',
                        borderBottomColor: 'primary.light',
                        animation: `${spin} 1.5s linear infinite`
                    }}
                />

                {/* Inner Pulse Circle */}
                <Box
                    sx={{
                        position: 'absolute',
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        animation: `${pulse} 1.5s ease-in-out infinite`,
                        boxShadow: '0 0 15px rgba(var(--mui-palette-primary-mainChannel), 0.5)'
                    }}
                />
            </Box>

            <Typography
                variant="h6"
                sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: 2,
                    animation: `${pulse} 2s infinite`
                }}
            >
                LMS
            </Typography>
        </Box>
    );
};

export default PageLoader;
