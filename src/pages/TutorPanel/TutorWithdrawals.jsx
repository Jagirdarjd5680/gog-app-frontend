import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, CircularProgress, Card, CardContent,
  Collapse, IconButton
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Send as SendIcon,
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ReceiptLong as ReceiptIcon
} from '@mui/icons-material';
import axios from '../../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const TutorWithdrawals = () => {
  const { user, updateUser } = useAuth();
  const [earnings, setEarnings] = useState(0);         // total earned
  const [available, setAvailable] = useState(0);        // earnings - pending
  const [pendingTotal, setPendingTotal] = useState(0);  // locked in pending requests
  const [ratePerPoint, setRatePerPoint] = useState(1);
  const [minWithdrawal, setMinWithdrawal] = useState(5);
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, reqRes] = await Promise.all([
        axios.get('/tutors/my-stats'),
        axios.get('/withdrawals/my')
      ]);
      const latestEarnings = statsRes.data.tutor.earnings || 0;
      const latestRate = statsRes.data.tutor.charges?.perConversation || 1;
      const latestMin = statsRes.data.tutor.minWithdrawal || 5;
      const latestAvailable = reqRes.data.available ?? latestEarnings;
      const latestPending = reqRes.data.pendingTotal ?? 0;

      setEarnings(latestEarnings);
      setAvailable(latestAvailable);
      setPendingTotal(latestPending);
      setRatePerPoint(latestRate);
      setMinWithdrawal(latestMin);
      setRequests(reqRes.data.data);

      // Sync header with AVAILABLE balance (source of truth)
      if (user?.tutorInfo) {
        updateUser({
          tutorInfo: {
            ...user.tutorInfo,
            earnings: latestAvailable
          }
        });
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    if (parseFloat(amount) < minWithdrawal) {
      return toast.error(`Minimum withdrawal is ${minWithdrawal} points`);
    }
    if (parseFloat(amount) > available) {
      return toast.error(`Insufficient available balance (${available} pts)`);
    }

    try {
      setSubmitting(true);
      const { data } = await axios.post('/withdrawals/request', { amount, upiId });
      if (data.success) {
        toast.success('Withdrawal request submitted!');
        setAmount('');
        setUpiId('');
        fetchData(); // refresh everything from server
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Earnings & Withdrawals</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#C40C0C', color: 'white', borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <WalletIcon />
                <Typography variant="h6">Available Balance</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">{available} Points</Typography>
              {pendingTotal > 0 && (
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  {earnings} earned &minus; {pendingTotal} pending = {available} available
                </Typography>
              )}
              {pendingTotal === 0 && (
                <Typography variant="caption">1 Point = ₹{ratePerPoint} &nbsp;|&nbsp; Min: {minWithdrawal} pts</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Request Withdrawal</Typography>
            <Box component="form" onSubmit={handleRequest} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label={`Amount (Min ${minWithdrawal})`}
                type="number"
                size="small"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                inputProps={{ min: minWithdrawal, max: earnings }}
                sx={{ flex: 1, minWidth: 150 }}
              />
              <TextField
                label="UPI ID"
                size="small"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                required
                placeholder="example@upi"
                sx={{ flex: 1, minWidth: 200 }}
              />
              <Button
                variant="contained"
                type="submit"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
                sx={{ bgcolor: '#C40C0C', '&:hover': { bgcolor: '#A00A0A' } }}
              >
                Request
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <HistoryIcon /> Transaction History
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>(Click a row to expand details)</Typography>
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell width={40} />
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>UPI ID</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <React.Fragment key={req._id}>
                  {/* Main Row — clickable */}
                  <TableRow
                    hover
                    onClick={() => setExpandedRow(expandedRow === req._id ? null : req._id)}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <TableCell>
                      <IconButton size="small">
                        {expandedRow === req._id ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                    <TableCell>
                      <Typography fontWeight="bold" color="error.main">- {req.amount} pts</Typography>
                    </TableCell>
                    <TableCell>{req.upiId}</TableCell>
                    <TableCell>
                      <Chip
                        label={req.status.toUpperCase()}
                        size="small"
                        color={req.status === 'approved' ? 'success' : req.status === 'pending' ? 'warning' : 'error'}
                      />
                    </TableCell>
                  </TableRow>

                  {/* Expanded Detail Row */}
                  <TableRow>
                    <TableCell colSpan={5} sx={{ p: 0, borderBottom: expandedRow === req._id ? undefined : 'none' }}>
                      <Collapse in={expandedRow === req._id} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 3, bgcolor: 'grey.50', display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ReceiptIcon fontSize="small" color="action" />
                            <Box>
                              <Typography variant="caption" color="text.secondary">Transaction ID</Typography>
                              <Typography fontWeight="bold" fontFamily="monospace">
                                {req.transactionId || '—'}
                              </Typography>
                            </Box>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Admin Note</Typography>
                            <Typography>{req.adminNote || '—'}</Typography>
                          </Box>
                          {req.proofImage && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">Payment Proof</Typography>
                              <Box
                                component="img"
                                src={req.proofImage}
                                alt="proof"
                                sx={{ display: 'block', maxHeight: 160, maxWidth: 260, borderRadius: 1, border: '1px solid', borderColor: 'divider', mt: 0.5, cursor: 'pointer' }}
                                onClick={(e) => { e.stopPropagation(); window.open(req.proofImage, '_blank'); }}
                              />
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TutorWithdrawals;
