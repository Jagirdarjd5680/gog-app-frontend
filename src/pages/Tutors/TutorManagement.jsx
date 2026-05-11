import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Typography, Paper, 
  Container, Breadcrumbs, Link 
} from '@mui/material';
import { 
  Add as AddIcon,
  AccountBalanceWallet as WalletIcon,
  CheckCircle as PaidIcon,
  Timer as PendingIcon,
  People as TutorsIcon
} from '@mui/icons-material';
import { Grid, Card, CardContent } from '@mui/material';
import axios from '../../utils/api';
import { toast } from 'react-toastify';
import TutorList from './TutorList';
import TutorModal from './TutorModal';
import TutorHistoryModal from './TutorHistoryModal';

const TutorManagement = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyTutorId, setHistoryTutorId] = useState(null);
  const [pendingWithdrawals, setPendingWithdrawals] = useState({});
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const [tutorRes, withdrawRes] = await Promise.all([
        axios.get('/tutors'),
        axios.get('/withdrawals/admin/all')
      ]);
      if (tutorRes.data.success) setTutors(tutorRes.data.data);
      if (withdrawRes.data.success) {
        const allReqs = withdrawRes.data.data;
        setWithdrawalRequests(allReqs);
        // Build a map: tutorId -> pendingCount
        const counts = {};
        allReqs
          .filter(w => w.status === 'pending')
          .forEach(w => {
            const tid = w.tutor?._id || w.tutor;
            counts[tid] = (counts[tid] || 0) + 1;
          });
        setPendingWithdrawals(counts);
      }
    } catch (error) {
      toast.error('Failed to fetch tutors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  const handleAddClick = () => {
    setSelectedTutor(null);
    setModalOpen(true);
  };

  const handleEditClick = (tutor) => {
    setSelectedTutor(tutor);
    setModalOpen(true);
  };

  const handleViewHistory = (tutorId) => {
    setHistoryTutorId(tutorId);
    setHistoryModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tutor?')) {
      const toastId = toast.loading('Deleting tutor...');
      try {
        await axios.delete(`/tutors/${id}`);
        toast.update(toastId, { render: 'Tutor deleted successfully', type: 'success', isLoading: false, autoClose: 3000 });
        fetchTutors();
      } catch (error) {
        toast.update(toastId, { render: 'Failed to delete tutor', type: 'error', isLoading: false, autoClose: 3000 });
      }
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">Tutor Management</Typography>
            <Breadcrumbs sx={{ mt: 1 }}>
              <Link color="inherit" href="/">Dashboard</Link>
              <Typography color="text.primary">Tutors</Typography>
            </Breadcrumbs>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleAddClick}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Create Tutor
          </Button>
        </Box>

        {/* Financial Summary */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(237, 108, 2, 0.1)' }}>
                  <PendingIcon color="warning" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Total Pending Payouts</Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {withdrawalRequests
                      .filter(w => w.status === 'pending')
                      .reduce((sum, w) => sum + (w.amount || 0), 0)} pts
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(46, 125, 50, 0.1)' }}>
                  <PaidIcon color="success" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Total Paid Out</Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {withdrawalRequests
                      .filter(w => w.status === 'approved')
                      .reduce((sum, w) => sum + (w.amount || 0), 0)} pts
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(2, 136, 209, 0.1)' }}>
                  <TutorsIcon color="info" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Active Tutors</Typography>
                  <Typography variant="h5" fontWeight="bold">{tutors.length}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 3 }}>
          <TutorList 
            tutors={tutors} 
            loading={loading} 
            onEdit={handleEditClick} 
            onDelete={handleDelete} 
            onViewHistory={handleViewHistory}
            pendingWithdrawals={pendingWithdrawals}
            withdrawalRequests={withdrawalRequests}
            onWithdrawalProcessed={fetchTutors}
          />
        </Paper>
      </Box>

      <TutorModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        tutor={selectedTutor} 
        onSuccess={fetchTutors} 
      />

      <TutorHistoryModal
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        tutorId={historyTutorId}
      />
    </Container>
  );
};

export default TutorManagement;
