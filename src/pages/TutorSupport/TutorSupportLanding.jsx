import React, { useState, useEffect } from 'react';
import { 
   Box, Typography, Grid, Card, CardContent, 
   Button, Avatar, Chip, Container, Paper,
   Stack, Divider
} from '@mui/material';
import { Support as SupportIcon, Timer as TimerIcon } from '@mui/icons-material';
import axios from '../../utils/api';
import { toast } from 'react-toastify';
import CreditHistory from './CreditHistory';
import socket from '../../utils/socket';

const TutorSupportLanding = () => {
  const [tutors, setTutors] = useState([]);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tutorsRes, creditRes] = await Promise.all([
        axios.get('/tutors'),
        axios.get('/credits/history')
      ]);
      setTutors(tutorsRes.data.data.filter(t => t.isActive));
      setCredits(creditRes.data.balance);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for real-time status updates from the socket server
    socket.connect();
    socket.on('tutor_status_changed', (data) => {
      setTutors(prevTutors => 
        prevTutors.map(t => 
          t._id === data.tutorId ? { ...t, status: data.status } : t
        )
      );
    });

    return () => {
      socket.off('tutor_status_changed');
    };
  }, []);

  const handleRequestHelp = async (tutorId) => {
    try {
      const { data } = await axios.post('/support-sessions/request', {
        tutorId,
        category: 'Live Support'
      });
      if (data.success) {
        toast.info('Support request sent! Waiting for tutor...');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Request failed');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, bgcolor: 'var(--color-vc-canvas, transparent)' }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" fontWeight={900} gutterBottom sx={{ color: 'var(--color-vc-ink, text.primary)' }}>Find a Tutor for Help</Typography>
          <Typography variant="body1" sx={{ color: 'var(--color-vc-mute, text.secondary)' }} mb={4}>
            Get instant help from our professional tutors in various categories.
          </Typography>

          <Grid container spacing={3}>
            {tutors.map((tutor) => (
              <Grid item xs={12} sm={6} key={tutor._id}>
                <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid var(--color-vc-hairline, rgba(0,0,0,0.08))', bgcolor: 'var(--color-vc-canvas-soft, #fff)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar src={tutor.profileImage} sx={{ width: 60, height: 60, mr: 2 }} />
                      <Box>
                        <Typography variant="h6" fontWeight="bold">{tutor.name}</Typography>
                        {tutor.status === 'live' ? (
                          <Chip 
                            label="LIVE NOW 🔴" 
                            color="error"
                            size="small" 
                            sx={{ 
                              fontWeight: 'bold', 
                              animation: 'pulse 1.5s infinite',
                              '@keyframes pulse': {
                                '0%': { opacity: 0.6 },
                                '50%': { opacity: 1 },
                                '100%': { opacity: 0.6 }
                              }
                            }}
                          />
                        ) : (
                          <Chip 
                            label={tutor.status.toUpperCase()} 
                            color={tutor.status === 'online' ? 'success' : (tutor.status === 'busy' ? 'warning' : 'default')} 
                            size="small" 
                            sx={{ fontWeight: 'bold' }}
                          />
                        )}
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" mb={2} noWrap>
                      {tutor.description || 'Expert tutor ready to help you.'}
                    </Typography>

                    <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
                      {tutor.skills.map(skill => (
                        <Chip key={skill} label={skill} size="small" variant="outlined" />
                      ))}
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" color="primary">₹{tutor.charges.perConversation}</Typography>
                        <Typography variant="caption">per session</Typography>
                      </Box>
                      <Button 
                        variant="contained" 
                        disabled={tutor.status !== 'online' && tutor.status !== 'live'}
                        onClick={() => handleRequestHelp(tutor._id)}
                      >
                        Request Help
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', bgcolor: 'var(--color-vc-primary, #2563eb)', color: 'white', mb: 3 }}>
            <Typography variant="h6">Your Support Credits</Typography>
            <Typography variant="h3" fontWeight={900}>₹{credits}</Typography>
            <Button variant="contained" sx={{ mt: 2, bgcolor: 'white', color: 'var(--color-vc-primary, #2563eb)', fontWeight: 700, borderRadius: '8px', '&:hover': { bgcolor: '#f1f5f9' } }}>
              Recharge Credits
            </Button>
          </Paper>

          <CreditHistory />
        </Grid>
      </Grid>
    </Container>
  );
};

export default TutorSupportLanding;
