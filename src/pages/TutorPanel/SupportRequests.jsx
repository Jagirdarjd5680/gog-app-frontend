import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, 
  Button, Chip, Avatar, CircularProgress, Collapse
} from '@mui/material';
import { 
  Check as AcceptIcon, 
  Close as RejectIcon,
  Chat as ChatIcon,
  Refresh as RefreshIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
  Stars as PointsIcon
} from '@mui/icons-material';
import axios from '../../utils/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Row = ({ studentId, group, navigate, handleAction }) => {
  const [open, setOpen] = useState(false);
  const student = group[0].student;

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' }, bgcolor: open ? '#fdf2f2' : 'inherit' }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={student?.profileImage} sx={{ width: 32, height: 32 }}>
              {student?.name?.[0]}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="bold">{student?.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {student?.rollNumber || 'No Roll #'} • {student?.email}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell>
          <Chip label={`${group.length} Sessions`} size="small" sx={{ fontWeight: 'bold' }} />
        </TableCell>
        {/* Points earned from this student */}
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PointsIcon sx={{ fontSize: 16, color: '#2e7d32' }} />
            <Typography fontWeight="bold" color="#2e7d32" variant="body2">
              + {group.filter(r => ['accepted', 'active', 'completed'].includes(r.status)).length} pts
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          {group.some(r => r.status === 'pending') ? (
            <Chip label="Pending Action" size="small" color="warning" />
          ) : (
            <Chip label="Active / Completed" size="small" color="success" />
          )}
        </TableCell>
        <TableCell align="right">
          <Typography variant="caption" color="textSecondary">
            Last: {new Date(group[0].createdAt).toLocaleTimeString()}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, p: 2, bgcolor: '#fff' }}>
              <Typography variant="h6" gutterBottom component="div" sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                Conversation History
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Chat ID</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Credits</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {group.map((req) => (
                    <TableRow key={req._id}>
                      <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', fontFamily: 'monospace' }}>
                        {req._id}
                      </TableCell>
                      <TableCell>{req.category}</TableCell>
                      <TableCell>{new Date(req.createdAt).toLocaleTimeString()}</TableCell>
                      {/* Per-session credit charge */}
                      <TableCell>
                        {['accepted', 'active', 'completed'].includes(req.status) ? (
                          <Chip
                            icon={<PointsIcon sx={{ fontSize: '14px !important', color: '#2e7d32 !important' }} />}
                            label="+ 1 Point"
                            size="small"
                            sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold', border: '1px solid #2e7d3233' }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.disabled">—</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={req.status} 
                          size="small" 
                          color={
                            req.status === 'pending' ? 'warning' : 
                            ['accepted', 'active', 'completed'].includes(req.status) ? 'success' : 'error'
                          }
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {req.status === 'pending' ? (
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button 
                              variant="contained" 
                              color="success" 
                              size="small" 
                              onClick={() => handleAction(req._id, 'accepted')}
                            >
                              Accept
                            </Button>
                            <Button 
                              variant="outlined" 
                              color="error" 
                              size="small" 
                              onClick={() => handleAction(req._id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </Box>
                        ) : (req.status === 'accepted' || req.status === 'active') ? (
                          <Button 
                            variant="contained" 
                            size="small" 
                            startIcon={<ChatIcon />}
                            onClick={() => navigate(`/tutor/chat/${req._id}`)}
                          >
                            Chat
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const SupportRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/tutors/my-requests');
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id, status) => {
    try {
      const { data } = await axios.put(`/tutors/requests/${id}`, { status });
      if (data.success) {
        toast.success(`Request ${status}`);
        fetchRequests();
        if (status === 'accepted') {
          
          navigate(`/tutor/chat/${id}`);
        }
      }
    } catch (error) {
      toast.error('Failed to update request');
    }
  };

  // Group requests by Student ID
  const groupedRequests = requests.reduce((acc, req) => {
    const studentId = req.student?._id;
    if (!acc[studentId]) acc[studentId] = [];
    acc[studentId].push(req);
    return acc;
  }, {});

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Live Support Requests</Typography>
        <Button startIcon={<RefreshIcon />} onClick={fetchRequests} disabled={loading}>
          Refresh
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell width={50} />
              <TableCell>Student</TableCell>
              <TableCell>Conversations</TableCell>
              <TableCell>Credits Spent</TableCell>
              <TableCell>Overall Status</TableCell>
              <TableCell align="right">Last Activity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  No active requests
                </TableCell>
              </TableRow>
            ) : (
              Object.entries(groupedRequests).map(([studentId, group]) => (
                <Row 
                  key={studentId} 
                  studentId={studentId} 
                  group={group} 
                  navigate={navigate} 
                  handleAction={handleAction} 
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SupportRequests;
