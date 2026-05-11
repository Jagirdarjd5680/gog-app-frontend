import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, Box, Typography, 
  CircularProgress, Grid, Paper, Divider, IconButton,
  Table, TableBody, TableCell, TableHead, TableRow, Chip
} from '@mui/material';
import { Close as CloseIcon, Visibility as ViewIcon } from '@mui/icons-material';
import axios from '../../utils/api';
import { toast } from 'react-toastify';

const TutorHistoryModal = ({ open, onClose, tutorId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && tutorId) {
      fetchDetailedStats();
    }
  }, [open, tutorId]);

  const fetchDetailedStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/tutors/${tutorId}/detailed`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (error) {
      toast.error('Failed to load tutor history');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">Tutor History & Analytics</Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ bgcolor: '#f8fafc', p: 3 }}>
        {loading || !data ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {/* Top Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, borderRadius: 3, textAlign: 'center', borderTop: '4px solid #3b82f6' }}>
                  <Typography color="textSecondary" variant="caption" fontWeight="bold" textTransform="uppercase">Total Sessions</Typography>
                  <Typography variant="h4" fontWeight="bold">{data.stats.totalSessions}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, borderRadius: 3, textAlign: 'center', borderTop: '4px solid #10b981' }}>
                  <Typography color="textSecondary" variant="caption" fontWeight="bold" textTransform="uppercase">Completed Sessions</Typography>
                  <Typography variant="h4" fontWeight="bold">{data.stats.completedSessions}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, borderRadius: 3, textAlign: 'center', borderTop: '4px solid #eab308' }}>
                  <Typography color="textSecondary" variant="caption" fontWeight="bold" textTransform="uppercase">Current Balance</Typography>
                  <Typography variant="h4" fontWeight="bold">{data.stats.totalEarnings} pts</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, borderRadius: 3, textAlign: 'center', borderTop: '4px solid #8b5cf6' }}>
                  <Typography color="textSecondary" variant="caption" fontWeight="bold" textTransform="uppercase">Total Withdrawn</Typography>
                  <Typography variant="h4" fontWeight="bold">{data.stats.totalWithdrawn} pts</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              {/* Support Sessions Table */}
              <Grid item xs={12} md={7}>
                <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ p: 2, bgcolor: '#fff', borderBottom: '1px solid #eee' }}>
                    <Typography fontWeight="bold">Recent Support Sessions</Typography>
                  </Box>
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Student</TableCell>
                          <TableCell>Date & Time</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.sessions.length === 0 ? (
                          <TableRow><TableCell colSpan={4} align="center">No sessions found</TableCell></TableRow>
                        ) : (
                          data.sessions.map(s => (
                            <TableRow key={s._id} hover>
                              <TableCell>
                                <Typography variant="body2" fontWeight="bold">{s.student?.name}</Typography>
                                <Typography variant="caption" color="textSecondary">{s.student?.email}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{new Date(s.createdAt).toLocaleDateString()}</Typography>
                                <Typography variant="caption" color="textSecondary">{new Date(s.createdAt).toLocaleTimeString()}</Typography>
                              </TableCell>
                              <TableCell>{s.duration ? `${s.duration} min` : '-'}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={s.status} 
                                  size="small" 
                                  color={s.status === 'completed' ? 'success' : s.status === 'rejected' ? 'error' : 'warning'}
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                </Paper>
              </Grid>

              {/* Withdrawals Table */}
              <Grid item xs={12} md={5}>
                <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ p: 2, bgcolor: '#fff', borderBottom: '1px solid #eee' }}>
                    <Typography fontWeight="bold">Withdrawal History</Typography>
                  </Box>
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Trans. ID</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.withdrawals.length === 0 ? (
                          <TableRow><TableCell colSpan={4} align="center">No withdrawals found</TableCell></TableRow>
                        ) : (
                          data.withdrawals.map(w => (
                            <TableRow key={w._id} hover>
                              <TableCell>
                                <Typography variant="body2">{new Date(w.createdAt).toLocaleDateString()}</Typography>
                              </TableCell>
                              <TableCell fontWeight="bold" color="primary.main">{w.amount} pts</TableCell>
                              <TableCell>
                                <Chip 
                                  label={w.status} 
                                  size="small" 
                                  color={w.status === 'approved' ? 'success' : w.status === 'rejected' ? 'error' : 'warning'}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" fontFamily="monospace">
                                  {w.transactionId || '-'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TutorHistoryModal;
