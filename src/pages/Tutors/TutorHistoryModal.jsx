import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, Box, Typography, 
  CircularProgress, Grid, Paper, Divider, IconButton,
  Table, TableBody, TableCell, TableHead, TableRow, Chip
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
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
      const res = await axios.get(`/tutors/${tutorId}/detailed?t=${Date.now()}`);
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
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: '12px',
          border: '1px solid var(--color-vc-hairline, #eaeaea)',
          bgcolor: 'var(--color-vc-canvas, #fff)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2.5, px: 3, borderBottom: '1px solid var(--color-vc-hairline, #eaeaea)' }}>
        <Typography variant="h6" fontWeight="800" sx={{ letterSpacing: '-0.02em', fontFamily: 'Inter, Outfit, sans-serif' }}>
          Tutor History & Analytics
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ bgcolor: 'var(--color-vc-canvas-soft, #fcfcfc)', p: 3, border: 'none' }}>
        {loading || !data ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <Box>
            {/* Top Stats */}
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              <Grid item xs={12} md={3}>
                <Paper sx={{ 
                  p: 2.5, 
                  borderRadius: '10px', 
                  border: '1px solid var(--color-vc-hairline, #eaeaea)',
                  bgcolor: 'var(--color-vc-canvas, #fff)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.01)',
                  borderTop: '4px solid #3b82f6'
                }}>
                  <Typography sx={{ fontSize: '11px', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Sessions</Typography>
                  <Typography variant="h4" fontWeight="800" sx={{ mt: 1, fontFamily: 'Outfit, sans-serif' }}>{data.stats.totalSessions}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ 
                  p: 2.5, 
                  borderRadius: '10px', 
                  border: '1px solid var(--color-vc-hairline, #eaeaea)',
                  bgcolor: 'var(--color-vc-canvas, #fff)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.01)',
                  borderTop: '4px solid #10b981'
                }}>
                  <Typography sx={{ fontSize: '11px', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed Sessions</Typography>
                  <Typography variant="h4" fontWeight="800" sx={{ mt: 1, fontFamily: 'Outfit, sans-serif' }}>{data.stats.completedSessions}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ 
                  p: 2.5, 
                  borderRadius: '10px', 
                  border: '1px solid var(--color-vc-hairline, #eaeaea)',
                  bgcolor: 'var(--color-vc-canvas, #fff)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.01)',
                  borderTop: '4px solid #eab308'
                }}>
                  <Typography sx={{ fontSize: '11px', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Balance</Typography>
                  <Typography variant="h4" fontWeight="800" sx={{ mt: 1, fontFamily: 'Outfit, sans-serif' }}>{data.stats.totalEarnings} pts</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ 
                  p: 2.5, 
                  borderRadius: '10px', 
                  border: '1px solid var(--color-vc-hairline, #eaeaea)',
                  bgcolor: 'var(--color-vc-canvas, #fff)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.01)',
                  borderTop: '4px solid #8b5cf6'
                }}>
                  <Typography sx={{ fontSize: '11px', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Withdrawn</Typography>
                  <Typography variant="h4" fontWeight="800" sx={{ mt: 1, fontFamily: 'Outfit, sans-serif' }}>{data.stats.totalWithdrawn} pts</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              {/* Support Sessions Table */}
              <Grid item xs={12} md={7}>
                <Paper sx={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--color-vc-hairline, #eaeaea)', bgcolor: 'var(--color-vc-canvas, #fff)' }}>
                  <Box sx={{ p: 2, borderBottom: '1px solid var(--color-vc-hairline, #eaeaea)' }}>
                    <Typography fontWeight="700" sx={{ fontSize: '14px', letterSpacing: '-0.01em' }}>Recent Support Sessions</Typography>
                  </Box>
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <Table stickyHeader size="small">
                      <TableHead sx={{ '& th': { bgcolor: 'var(--color-vc-canvas-soft, #fcfcfc)', borderBottom: '1px solid var(--color-vc-hairline, #eaeaea)' } }}>
                        <TableRow>
                          <TableCell sx={{ py: 1.5, fontWeight: 600, fontSize: '11px', color: 'text.secondary' }}>Student</TableCell>
                          <TableCell sx={{ py: 1.5, fontWeight: 600, fontSize: '11px', color: 'text.secondary' }}>Date & Time</TableCell>
                          <TableCell sx={{ py: 1.5, fontWeight: 600, fontSize: '11px', color: 'text.secondary' }}>Duration</TableCell>
                          <TableCell sx={{ py: 1.5, fontWeight: 600, fontSize: '11px', color: 'text.secondary' }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.sessions.length === 0 ? (
                          <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary', fontSize: '13px' }}>No sessions found</TableCell></TableRow>
                        ) : (
                          data.sessions.map(s => (
                            <TableRow key={s._id} hover sx={{ '& td': { py: 1.8, borderBottom: '1px solid var(--color-vc-hairline, #eaeaea)' } }}>
                              <TableCell>
                                <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>{s.student?.name}</Typography>
                                <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>{s.student?.email}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontSize: '13px' }}>{new Date(s.createdAt).toLocaleDateString()}</Typography>
                                <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>{new Date(s.createdAt).toLocaleTimeString()}</Typography>
                              </TableCell>
                              <TableCell sx={{ fontSize: '13px' }}>{s.duration ? `${s.duration} min` : '-'}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={s.status} 
                                  size="small" 
                                  sx={{
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    bgcolor: s.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : s.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                    color: s.status === 'completed' ? '#10b981' : s.status === 'rejected' ? '#ef4444' : '#f59e0b',
                                  }}
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
                <Paper sx={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--color-vc-hairline, #eaeaea)', bgcolor: 'var(--color-vc-canvas, #fff)' }}>
                  <Box sx={{ p: 2, borderBottom: '1px solid var(--color-vc-hairline, #eaeaea)' }}>
                    <Typography fontWeight="700" sx={{ fontSize: '14px', letterSpacing: '-0.01em' }}>Withdrawal History</Typography>
                  </Box>
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <Table stickyHeader size="small">
                      <TableHead sx={{ '& th': { bgcolor: 'var(--color-vc-canvas-soft, #fcfcfc)', borderBottom: '1px solid var(--color-vc-hairline, #eaeaea)' } }}>
                        <TableRow>
                          <TableCell sx={{ py: 1.5, fontWeight: 600, fontSize: '11px', color: 'text.secondary' }}>Date</TableCell>
                          <TableCell sx={{ py: 1.5, fontWeight: 600, fontSize: '11px', color: 'text.secondary' }}>Amount</TableCell>
                          <TableCell sx={{ py: 1.5, fontWeight: 600, fontSize: '11px', color: 'text.secondary' }}>Status</TableCell>
                          <TableCell sx={{ py: 1.5, fontWeight: 600, fontSize: '11px', color: 'text.secondary' }}>Trans. ID</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.withdrawals.length === 0 ? (
                          <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary', fontSize: '13px' }}>No withdrawals found</TableCell></TableRow>
                        ) : (
                          data.withdrawals.map(w => (
                            <TableRow key={w._id} hover sx={{ '& td': { py: 1.8, borderBottom: '1px solid var(--color-vc-hairline, #eaeaea)' } }}>
                              <TableCell sx={{ fontSize: '13px' }}>
                                {new Date(w.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell sx={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-vc-primary, #3b82f6)' }}>{w.amount} pts</TableCell>
                              <TableCell>
                                <Chip 
                                  label={w.status} 
                                  size="small" 
                                  sx={{
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    bgcolor: w.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : w.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                    color: w.status === 'approved' ? '#10b981' : w.status === 'rejected' ? '#ef4444' : '#f59e0b',
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ fontSize: '12px', fontFamily: 'monospace', color: 'text.secondary' }}>
                                {w.transactionId || '-'}
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
