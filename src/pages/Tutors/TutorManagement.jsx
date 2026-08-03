import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Button, Typography } from '@mui/material';
import {
  Add as AddIcon,
  AccountBalanceWallet as WalletIcon,
  CheckCircle as PaidIcon,
  Timer as PendingIcon,
  People as TutorsIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from '../../utils/api';
import { toast } from 'react-toastify';
import TutorList from './TutorList';
import TutorModal from './TutorModal';
import TutorHistoryModal from './TutorHistoryModal';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';

const TutorManagement = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyTutorId, setHistoryTutorId] = useState(null);
  const [pendingWithdrawals, setPendingWithdrawals] = useState({});
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  // Filter and Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [skillOptions, setSkillOptions] = useState(['Java', 'PHP', 'Python', 'React', 'Laravel', 'WordPress', 'Other']);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const [tutorRes, withdrawRes] = await Promise.all([
        axios.get(`/tutors?t=${Date.now()}`),
        axios.get(`/withdrawals/admin/all?t=${Date.now()}`)
      ]);
      if (tutorRes.data.success) setTutors(tutorRes.data.data);
      if (withdrawRes.data.success) {
        const allReqs = withdrawRes.data.data;
        setWithdrawalRequests(allReqs);
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/categories?t=${Date.now()}`);
        if (data.success && data.data) {
          const names = data.data.map(cat => cat.name);
          setSkillOptions(Array.from(new Set([...names, 'Other'])));
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
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

  const onSelectionChanged = useCallback((event) => {
    setSelectedRows(event.api.getSelectedRows());
  }, []);

  const handleBulkDelete = useCallback(async () => {
    if (selectedRows.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} tutors?`)) {
      const toastId = toast.loading('Deleting tutors...');
      try {
        await Promise.all(selectedRows.map(t => axios.delete(`/tutors/${t._id}`)));
        toast.update(toastId, { render: `Deleted ${selectedRows.length} tutors`, type: 'success', isLoading: false, autoClose: 3000 });
        fetchTutors();
        setSelectedRows([]);
      } catch (error) {
        toast.update(toastId, { render: error.response?.data?.message || 'Bulk delete failed', type: 'error', isLoading: false, autoClose: 3000 });
      }
    }
  }, [selectedRows]);

  // Compute metrics data
  const metricsItems = useMemo(() => {
    const activeCount = tutors.filter(t => t.status === 'online' || t.status === 'busy').length;
    const pendingVal = withdrawalRequests
      .filter(w => w.status === 'pending')
      .reduce((sum, w) => sum + (w.amount || 0), 0);
    const paidVal = withdrawalRequests
      .filter(w => w.status === 'approved')
      .reduce((sum, w) => sum + (w.amount || 0), 0);

    return [
      { title: 'Total Tutors', value: tutors.length, icon: <TutorsIcon />, color: 'primary' },
      { title: 'Active Tutors', value: activeCount, icon: <PaidIcon />, color: 'success' },
      { title: 'Pending Payouts', value: `${pendingVal} pts`, icon: <PendingIcon />, color: 'warning' },
      { title: 'Total Paid Out', value: `${paidVal} pts`, icon: <WalletIcon />, color: 'info' }
    ];
  }, [tutors, withdrawalRequests]);

  // Filter list
  const filteredTutors = useMemo(() => {
    return tutors.filter(t => {
      const name = (t.name || '').toLowerCase();
      const email = (t.email || '').toLowerCase();
      const phone = (t.phone || '').toLowerCase();
      const tutorId = (t.tutorId || '').toLowerCase();
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch = name.includes(search) ||
        email.includes(search) ||
        phone.includes(search) ||
        tutorId.includes(search);

      if (!matchesSearch) return false;

      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (skillFilter !== 'all' && !t.skills?.includes(skillFilter)) return false;

      return true;
    });
  }, [tutors, searchTerm, statusFilter, skillFilter]);

  const filterConfigs = useMemo(() => [
    {
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: 'all', label: 'Every Status' },
        { value: 'online', label: 'Online' },
        { value: 'busy', label: 'Busy' },
        { value: 'offline', label: 'Offline' }
      ]
    },
    {
      value: skillFilter,
      onChange: setSkillFilter,
      options: [
        { value: 'all', label: 'All Categories' },
        ...skillOptions.map(s => ({ value: s, label: s }))
      ]
    }
  ], [statusFilter, skillFilter, skillOptions]);

  return (
    <Box sx={{ p: 0.5 }}>
      {/* Metrics Grid */}
      <GenericMetrics items={metricsItems} />

      <Box sx={{ bgcolor: 'transparent', px: 0 }}>
        {/* Header Search & Dropdowns */}
        <GenericTableHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchPlaceholder="Search tutors..."
          filters={filterConfigs}
          actionButtonText="Create Tutor"
          onActionClick={handleAddClick}
          actionButtonIcon={<AddIcon fontSize="small" />}
          totalCount={filteredTutors.length}
        />

        {selectedRows.length > 0 && (
          <Box sx={{
            p: 1.25, px: 2, 
            bgcolor: 'var(--color-vc-canvas-soft-2)',
            border: '1px solid var(--color-vc-hairline-strong)',
            borderRadius: '6px',
            mb: 2.5,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2
          }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-primary)', fontFamily: 'inherit' }}>
              {selectedRows.length} tutors selected
            </Typography>
            <Button 
              variant="contained" 
              size="small" 
              startIcon={<DeleteIcon sx={{ fontSize: 14 }} />} 
              onClick={handleBulkDelete} 
              sx={{ 
                borderRadius: '6px', 
                fontWeight: 500, 
                fontSize: '12px',
                fontFamily: 'inherit',
                textTransform: 'none',
                bgcolor: 'var(--color-vc-error-soft)',
                color: 'var(--color-vc-error-deep)',
                boxShadow: 'none',
                border: '1px solid var(--color-vc-error-soft)',
                '&:hover': {
                  bgcolor: 'var(--color-vc-error-deep)',
                  color: '#ffffff',
                  borderColor: 'var(--color-vc-error-deep)',
                  boxShadow: 'none'
                }
              }}
            >
              Bulk Delete
            </Button>
          </Box>
        )}

        <TutorList
          tutors={filteredTutors}
          loading={loading}
          onEdit={handleEditClick}
          onDelete={handleDelete}
          onViewHistory={handleViewHistory}
          pendingWithdrawals={pendingWithdrawals}
          withdrawalRequests={withdrawalRequests}
          onWithdrawalProcessed={fetchTutors}
          onSelectionChanged={onSelectionChanged}
          selectedIds={selectedRows.map(r => r._id)}
        />
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
    </Box>
  );
};

export default TutorManagement;
