import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Chip, 
  Avatar, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, CircularProgress
} from '@mui/material';
import { 
  Check as ApproveIcon, 
  Close as RejectIcon,
  Visibility as ViewIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import axios from '../../utils/api';
import { toast } from 'react-toastify';

const AdminTutorWithdrawals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/withdrawals/admin/all');
      setRequests(data.data);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status) => {
    if (status === 'approved' && !transactionId) {
      return toast.error('Transaction ID is required for approval');
    }

    try {
      setProcessing(true);
      const { data } = await axios.patch(`/withdrawals/admin/${selectedReq._id}`, {
        status,
        transactionId,
        adminNote
      });
      if (data.success) {
        toast.success(`Request ${status} successfully`);
        setDialogOpen(false);
        fetchRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  const openDialog = (req) => {
    setSelectedReq(req);
    setTransactionId(req.transactionId || '');
    setAdminNote(req.adminNote || '');
    setDialogOpen(true);
  };

  if (loading) return <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Tutor Withdrawal Requests</Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Tutor</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>UPI ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No withdrawal requests found</TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>{req.tutor?.name?.[0]}</Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">{req.tutor?.name}</Typography>
                        <Typography variant="caption" color="textSecondary">{req.tutor?.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell fontWeight="bold">{req.amount} pts</TableCell>
                  <TableCell>{req.upiId}</TableCell>
                  <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip 
                      label={req.status} 
                      size="small"
                      color={req.status === 'approved' ? 'success' : req.status === 'pending' ? 'warning' : 'error'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button 
                      size="small" 
                      startIcon={<ViewIcon />} 
                      onClick={() => openDialog(req)}
                    >
                      {req.status === 'pending' ? 'Process' : 'View'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Withdrawal Request Details</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="textSecondary">Tutor Name:</Typography>
              <Typography fontWeight="bold">{selectedReq?.tutor?.name}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="textSecondary">Requested Amount:</Typography>
              <Typography fontWeight="bold" color="primary">{selectedReq?.amount} Points</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="textSecondary">UPI ID:</Typography>
              <Typography fontWeight="bold">{selectedReq?.upiId}</Typography>
            </Box>

            {selectedReq?.status === 'pending' ? (
              <>
                <TextField
                  label="Transaction ID (UTR)"
                  fullWidth
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter the payment reference number"
                  required
                />
                <TextField
                  label="Admin Note"
                  fullWidth
                  multiline
                  rows={2}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Optional note for the tutor"
                />
              </>
            ) : (
              <>
                <Box>
                  <Typography color="textSecondary" variant="caption">Transaction ID:</Typography>
                  <Typography fontWeight="bold">{selectedReq?.transactionId || '-'}</Typography>
                </Box>
                <Box>
                  <Typography color="textSecondary" variant="caption">Admin Note:</Typography>
                  <Typography>{selectedReq?.adminNote || '-'}</Typography>
                </Box>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          {selectedReq?.status === 'pending' && (
            <>
              <Button 
                color="error" 
                onClick={() => handleAction('rejected')}
                disabled={processing}
                startIcon={<RejectIcon />}
              >
                Reject
              </Button>
              <Button 
                variant="contained" 
                color="success" 
                onClick={() => handleAction('approved')}
                disabled={processing}
                startIcon={processing ? <CircularProgress size={20} /> : <ApproveIcon />}
              >
                Approve & Mark Paid
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTutorWithdrawals;
