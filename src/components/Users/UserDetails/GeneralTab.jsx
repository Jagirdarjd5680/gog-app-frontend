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
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Full Name</Typography>
                <Typography variant="body1" fontWeight={500}>{user?.name}</Typography>
                <Divider sx={{ my: 1.5 }} />

                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Email Address</Typography>
                <Typography variant="body1" fontWeight={500}>{user?.email}</Typography>
                <Divider sx={{ my: 1.5 }} />

                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Phone Number</Typography>
                <Typography variant="body1" fontWeight={500}>{user?.phone || 'Not Provided'}</Typography>
                <Divider sx={{ my: 1.5 }} />

                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Assigned Batches</Typography>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <GroupsIcon fontSize="small" color="primary" />
                    {(() => {
                        const batches = user?.batches || (user?.batch ? [user.batch] : []);
                        if (batches.length === 0) {
                            return <Typography variant="body1" fontWeight={500} color="text.disabled">No Batches Assigned</Typography>;
                        }
                        return batches.map((b, i) => (
                            <Chip
                                key={i}
                                label={b}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ fontWeight: 600, borderRadius: 1.5 }}
                            />
                        ));
                    })()}
                </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Account Status</Typography>
                    <Chip
                        label={user?.isActive ? 'Active' : 'Inactive'}
                        color={user?.isActive ? 'success' : 'default'}
                        size="small"
                    />
                    <Divider sx={{ my: 1.5 }} />

                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Enrolled Courses</Typography>
                    <Typography variant="h6" fontWeight={700}>{user?.enrolledCourses?.length || 0}</Typography>
                    <Divider sx={{ my: 1.5 }} />

                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Last Activity</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
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
                        color="secondary"
                        sx={{ 
                            borderRadius: 2, 
                            fontWeight: 700, 
                            textTransform: 'none',
                            color: '#000',
                            borderColor: 'secondary.main',
                            py: 1.2
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
