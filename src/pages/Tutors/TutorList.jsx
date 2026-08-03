import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  Box, Typography, Skeleton, Badge, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, CircularProgress, Divider
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  CloudUpload as UploadIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import axios from '../../utils/api';
import { toast } from 'react-toastify';
import TableUI from '../../components/UI/Table/TableUI';
import { getTutorTableColumns } from './components/TutorTableColumns';

const TutorList = ({ tutors, loading, onEdit, onDelete, onViewHistory, pendingWithdrawals = {}, withdrawalRequests = [], onWithdrawalProcessed, onSelectionChanged, selectedIds }) => {
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

  const openWithdrawalDialog = useCallback((tutorId) => {
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
  }, [withdrawalRequests]);

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

  // Hidden file input
  const HiddenInput = () => (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      style={{ display: 'none' }}
      onChange={handleFileUpload}
    />
  );

  const columnDefs = useMemo(() => getTutorTableColumns({
    handleEdit: onEdit,
    handleDelete: onDelete,
    handleViewHistory: onViewHistory,
    handleProcessWithdrawal: openWithdrawalDialog,
    pendingWithdrawals
  }), [onEdit, onDelete, onViewHistory, openWithdrawalDialog, pendingWithdrawals]);

  const getRowId = useCallback(row => row?._id || Math.random().toString(), []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        {[1, 2, 3].map((i) => <Skeleton key={i} height={60} />)}
      </Box>
    );
  }

  return (
    <>
      <TableUI
        rowData={tutors}
        columnDefs={columnDefs}
        loading={loading}
        pagination={true}
        paginationPageSize={10}
        getRowId={getRowId}
        onSelectionChanged={onSelectionChanged}
        selectedIds={selectedIds}
      />

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
              {tutorRequests.map((req) => (
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
