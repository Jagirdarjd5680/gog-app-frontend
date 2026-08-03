import React from 'react';
import { Grid, Typography, Divider, Paper, Chip, Stack, Box, Button } from '@mui/material';
import { format } from 'date-fns';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupsIcon from '@mui/icons-material/Groups';
import EmailIcon from '@mui/icons-material/Email';

const GeneralTab = ({ user, loading, actionLoading, handleResendLetter }) => {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                    Full Name
                </Typography>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)' }}>
                    {user?.name}
                </Typography>
                <Divider sx={{ my: 1.5, borderColor: 'var(--color-vc-hairline)' }} />

                <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                    Email Address
                </Typography>
                <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-vc-ink)', fontFamily: '"JetBrains Mono", monospace' }}>
                    {user?.email}
                </Typography>
                <Divider sx={{ my: 1.5, borderColor: 'var(--color-vc-hairline)' }} />

                <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                    Phone Number
                </Typography>
                <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-vc-ink)', fontFamily: '"JetBrains Mono", monospace' }}>
                    {user?.phone || 'Not Provided'}
                </Typography>
                <Divider sx={{ my: 1.5, borderColor: 'var(--color-vc-hairline)' }} />

                <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
                    Assigned Batches
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <GroupsIcon sx={{ fontSize: 16, color: 'var(--color-vc-mute)' }} />
                    {(() => {
                        const batches = user?.batches || (user?.batch ? [user.batch] : []);
                        if (batches.length === 0) {
                            return <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)' }}>No Batches Assigned</Typography>;
                        }
                        return batches.map((b, i) => (
                            <Chip
                                key={i}
                                label={b}
                                size="small"
                                sx={{ 
                                    fontWeight: 500, 
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontFamily: '"JetBrains Mono", monospace',
                                    bgcolor: 'var(--color-vc-canvas-soft)',
                                    color: 'var(--color-vc-ink)',
                                    border: '1px solid var(--color-vc-hairline)',
                                    height: 22
                                }}
                            />
                        ));
                    })()}
                </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
                <Paper 
                    variant="outlined" 
                    sx={{ 
                        p: 2.5, 
                        bgcolor: 'var(--color-vc-canvas-soft)', 
                        borderColor: 'var(--color-vc-hairline)',
                        borderRadius: '6px'
                    }}
                >
                    <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
                        Account Status
                    </Typography>
                    <Chip
                        label={user?.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                            fontWeight: 600,
                            borderRadius: '4px',
                            fontSize: '10px',
                            height: 20,
                            bgcolor: user?.isActive ? 'var(--color-vc-success-soft)' : 'var(--color-vc-error-soft)',
                            color: user?.isActive ? 'var(--color-vc-success-deep)' : 'var(--color-vc-error-deep)',
                            border: '1px solid',
                            borderColor: user?.isActive ? 'var(--color-vc-success-soft)' : 'var(--color-vc-error-soft)'
                        }}
                    />
                    <Divider sx={{ my: 1.5, borderColor: 'var(--color-vc-hairline)' }} />

                    <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                        Enrolled Courses
                    </Typography>
                    <Typography sx={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-vc-ink)', fontFamily: '"JetBrains Mono", monospace' }}>
                        {user?.enrolledCourses?.length || 0}
                    </Typography>
                    <Divider sx={{ my: 1.5, borderColor: 'var(--color-vc-hairline)' }} />

                    <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
                        Last Activity
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <AccessTimeIcon sx={{ fontSize: 16, color: 'var(--color-vc-mute)' }} />
                        <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-body)', fontFamily: '"JetBrains Mono", monospace' }}>
                            {user?.lastSeen ? format(new Date(user.lastSeen), 'PPpp') : 'Never'}
                        </Typography>
                    </Stack>
                </Paper>

                <Box sx={{ mt: 3 }}>
                    <Button
                        fullWidth
                        startIcon={<EmailIcon />}
                        onClick={handleResendLetter}
                        disabled={actionLoading || loading}
                        variant="outlined"
                        sx={{
                            borderRadius: '6px',
                            fontWeight: 500,
                            textTransform: 'none',
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            color: 'var(--color-vc-ink)',
                            borderColor: 'var(--color-vc-hairline)',
                            bgcolor: 'var(--color-vc-canvas)',
                            py: 1,
                            '&:hover': {
                                bgcolor: 'var(--color-vc-canvas-soft)',
                                borderColor: 'var(--color-vc-hairline-strong)'
                            }
                        }}
                    >
                        {actionLoading ? 'Sending...' : 'Resend Registration Letter'}
                    </Button>
                </Box>
            </Grid>
        </Grid>
    );
};

export default GeneralTab;
