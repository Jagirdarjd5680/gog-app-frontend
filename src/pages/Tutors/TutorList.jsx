import React, { useState, useRef } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Avatar,
  Box, Typography, Skeleton, Badge, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, CircularProgress, Divider
} from '@mui/material';
import {
  Edit as EditIcon, Delete as DeleteIcon, History as HistoryIcon,
  AccountBalanceWallet as WalletIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  CloudUpload as UploadIcon,
  Link as LinkIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import axios from '../../utils/api';
import { toast } from 'react-toastify';

const TutorList = ({ tutors, loading, onEdit, onDelete, onViewHistory, pendingWithdrawals = {}, withdrawalRequests = [], onWithdrawalProcessed }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tutorRequests, setTutorRequests] = useState([]);   // all pending for this tutor
  const [selectedReq, setSelectedReq] = useState(null);     // the one being processed
  const [step, setStep] = useState(1);                       // 1 = list, 2 = form
  const [transactionId, setTransactionId] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [proofImage, setProofImage] = useState('');       // final URL
  const [proofUrl, setProofUrl] = useState('');           // manual URL input
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const openWithdrawalDialog = (tutorId) => {
    const reqs = withdrawalRequests.filter(
      w => w.status === 'pending' && (w.tutor?._id || w.tutor) === tutorId
    );
    if (!reqs.length) return;
    setTutorRequests(reqs);
    setSelectedReq(null);
    setStep(1);
    setTransactionId('');
    setAdminNote('');
    setDialogOpen(true);
  };

  const handleSelectForApproval = (req) => {
    setSelectedReq(req);
    setTransactionId('');
    setAdminNote('');
    setProofImage('');
    setProofUrl('');
    setStep(2);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      setUploading(true);
      const { data } = await axios.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.url) {
        setProofImage(data.url);
        setProofUrl(data.url);
        toast.success('Image uploaded!');
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlInput = (val) => {
    setProofUrl(val);
    setProofImage(val);
  };

  const handleAction = async (status) => {
    if (status === 'approved' && !transactionId) {
      return toast.error('Transaction ID is required for approval');
    }
    try {
      setProcessing(true);
      const { data } = await axios.patch(`/withdrawals/admin/${selectedReq._id}`, {
        status, transactionId, adminNote, proofImage
      });
      if (data.success) {
        toast.success(`Request ${status} successfully!`);
        setDialogOpen(false);
        if (onWithdrawalProcessed) onWithdrawalProcessed();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  // hidden file input
  const HiddenInput = () => (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      style={{ display: 'none' }}
      onChange={handleFileUpload}
    />
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        {[1, 2, 3].map((i) => <Skeleton key={i} height={60} />)}
      </Box>
    );
  }

  return (
    <>
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell>Tutor</TableCell>
              <TableCell>Categories</TableCell>
              <TableCell>Charges</TableCell>
              <TableCell>Earnings</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tutors.map((tutor) => (
              <TableRow key={tutor._id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={tutor.profileImage} sx={{ mr: 2 }} />
                    <Box>
                      <Typography fontWeight="medium">{tutor.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{tutor.tutorId}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {tutor.skills.map((skill) => (
                      <Chip key={skill} label={skill} size="small" variant="outlined" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">₹{tutor.charges.perConversation}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold" color="primary">{tutor.earnings || 0} pts</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={tutor.status}
                    color={tutor.status === 'online' ? 'success' : tutor.status === 'busy' ? 'warning' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  {/* Withdrawal Icon — only shown when pending requests exist */}
                  {pendingWithdrawals[tutor._id] > 0 && (
                    <Tooltip title={`Process ${pendingWithdrawals[tutor._id]} Pending Withdrawal`}>
                      <IconButton
                        onClick={() => openWithdrawalDialog(tutor._id)}
                        sx={{
                          color: '#C40C0C',
                          animation: 'pulse 1.5s infinite',
                          '@keyframes pulse': {
                            '0%': { transform: 'scale(1)', opacity: 1 },
                            '50%': { transform: 'scale(1.15)', opacity: 0.8 },
                            '100%': { transform: 'scale(1)', opacity: 1 },
                          }
                        }}
                      >
                        <Badge badgeContent={pendingWithdrawals[tutor._id]} color="error">
                          <WalletIcon />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="View History">
                    <IconButton onClick={() => onViewHistory(tutor._id)} color="info">
                      <HistoryIcon />
                    </IconButton>
                  </Tooltip>
                  <IconButton onClick={() => onEdit(tutor)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => onDelete(tutor._id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {tutors.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  No tutors found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Inline Withdrawal Processing Dialog - Two Step */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <WalletIcon color="error" />
          {step === 1 ? `Pending Withdrawals (${tutorRequests.length})` : 'Approve Withdrawal'}
        </DialogTitle>

        <DialogContent dividers>
          {step === 1 ? (
            /* ─── STEP 1: List of all pending requests ─── */
            <Stack spacing={1.5} sx={{ mt: 0.5 }}>
              {tutorRequests.map((req, i) => (
                <Box
                  key={req._id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Box>
                    <Typography fontWeight="bold" color="primary">
                      {req.amount} Points
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      UPI: {req.upiId}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      startIcon={<RejectIcon />}
                      disabled={processing}
                      onClick={async () => {
                        setProcessing(true);
                        try {
                          const { data } = await axios.patch(`/withdrawals/admin/${req._id}`, { status: 'rejected' });
                          if (data.success) {
                            toast.success('Request rejected');
                            setDialogOpen(false);
                            if (onWithdrawalProcessed) onWithdrawalProcessed();
                          }
                        } catch (e) {
                          toast.error(e.response?.data?.message || 'Failed');
                        } finally {
                          setProcessing(false);
                        }
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      size="small"
                      color="success"
                      variant="contained"
                      startIcon={<ApproveIcon />}
                      onClick={() => handleSelectForApproval(req)}
                    >
                      Accept
                    </Button>
                  </Box>
                </Box>
              ))}
            </Stack>
          ) : (
            /* ─── STEP 2: Approval form for selected request ─── */
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography color="text.secondary">Amount:</Typography>
                <Typography fontWeight="bold" color="primary">{selectedReq?.amount} Points</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography color="text.secondary">UPI ID:</Typography>
                <Typography fontWeight="bold">{selectedReq?.upiId}</Typography>
              </Box>
              <TextField
                label="Transaction ID (UTR) *"
                fullWidth
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter payment reference number after paying"
                autoFocus
              />
              <TextField
                label="Admin Note (Optional)"
                fullWidth
                multiline
                rows={2}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Optional note for the tutor"
              />

              {/* ─── Proof Image ─── */}
              <Divider><Typography variant="caption" color="text.secondary">Payment Proof (Optional)</Typography></Divider>
              <HiddenInput />
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  label="Paste Image URL"
                  size="small"
                  fullWidth
                  value={proofUrl}
                  onChange={(e) => handleUrlInput(e.target.value)}
                  placeholder="https://..."
                  InputProps={{ startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} /> }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={uploading ? <CircularProgress size={14} /> : <UploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  sx={{ whiteSpace: 'nowrap', minWidth: 130 }}
                >
                  {uploading ? 'Uploading…' : 'Upload File'}
                </Button>
              </Box>
              {proofImage && (
                <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                  <img
                    src={proofImage}
                    alt="Payment proof"
                    style={{ width: '100%', maxHeight: 220, objectFit: 'contain', display: 'block' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          {step === 2 && (
            <Button onClick={() => setStep(1)} disabled={processing} sx={{ mr: 'auto' }}>
              ← Back
            </Button>
          )}
          <Button onClick={() => setDialogOpen(false)} disabled={processing}>Close</Button>
          {step === 2 && (
            <Button
              variant="contained"
              color="success"
              onClick={() => handleAction('approved')}
              disabled={processing}
              startIcon={processing ? <CircularProgress size={18} /> : <ApproveIcon />}
            >
              Approve & Mark Paid
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TutorList;

