import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TextField, 
  Button, Chip, Avatar, CircularProgress, InputAdornment,
  Stack, IconButton, Tooltip
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Refresh as RefreshIcon,
  Chat as ChatIcon,
  FilterList as FilterIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  School as TutorIcon
} from '@mui/icons-material';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const SupportChatCenter = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/support-sessions/admin/all');
      if (data.success) {
        setSessions(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch support sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const searchLower = searchTerm.toLowerCase();
      const studentName = session.student?.name?.toLowerCase() || '';
      const tutorName = session.tutor?.user?.name?.toLowerCase() || '';
      const studentRoll = session.student?.rollNumber?.toLowerCase() || '';
      const sessionId = session._id?.toLowerCase() || '';
      const studentId = session.student?._id?.toLowerCase() || '';
      const tutorId = session.tutor?._id?.toLowerCase() || '';

      const matchesSearch = studentName.includes(searchLower) || 
                            tutorName.includes(searchLower) || 
                            studentRoll.includes(searchLower) ||
                            sessionId.includes(searchLower) ||
                            studentId.includes(searchLower) ||
                            tutorId.includes(searchLower);
      
      const matchesStatus = statusFilter === 'all' || session.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [sessions, searchTerm, statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted':
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="primary">Support Chat Center</Typography>
          <Typography variant="body2" color="text.secondary">Monitor and manage all live tutor-student support sessions</Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={fetchSessions} 
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          Refresh Data
        </Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Search by Student, Tutor, Roll Number or Session ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          <Box sx={{ minWidth: 200 }}>
            <TextField
              select
              fullWidth
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </TextField>
          </Box>
        </Stack>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tutor</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Chat ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                  <CircularProgress size={40} />
                  <Typography sx={{ mt: 2 }}>Loading sessions...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                  <Typography color="text.secondary">No sessions found matching your criteria</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredSessions.map((session) => (
                <TableRow key={session._id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar src={session.student?.avatar} sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                        {session.student?.name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>{session.student?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{session.student?.rollNumber || 'No Roll #'}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar src={session.tutor?.user?.avatar} sx={{ width: 36, height: 36, bgcolor: 'secondary.main' }}>
                        {session.tutor?.user?.name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>{session.tutor?.user?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">Expert Tutor</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip label={session.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', px: 1, py: 0.5, borderRadius: 1 }}>
                      {session._id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={session.status.toUpperCase()} 
                      color={getStatusColor(session.status)}
                      size="small"
                      sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimeIcon fontSize="inherit" color="action" />
                      <Typography variant="caption">
                        {format(new Date(session.createdAt), 'MMM dd, p')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Conversation History">
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ChatIcon />}
                        onClick={() => navigate(`/tutor/chat/${session._id}`)}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                      >
                        View Chat
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SupportChatCenter;
