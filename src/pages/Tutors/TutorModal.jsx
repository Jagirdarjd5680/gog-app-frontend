import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, MenuItem, Grid, FormControl,
  InputLabel, Select, Checkbox, FormControlLabel, Box,
  CircularProgress
} from '@mui/material';
import axios from '../../utils/api';
import { toast } from 'react-toastify';

const skillOptions = ['Java', 'PHP', 'Python', 'React', 'Laravel', 'WordPress', 'Other'];

const TutorModal = ({ open, onClose, tutor, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', tutorId: '',
    skills: [], experience: 0, description: '',
    perConversation: 0, perHour: 0, defaultDuration: 30,
    googleMeetEnabled: false, userId: '', status: 'offline',
    password: '', minWithdrawal: 5
  });

  useEffect(() => {
    if (tutor) {
      setFormData({
        ...tutor,
        perConversation: tutor.charges.perConversation,
        perHour: tutor.charges.perHour,
        userId: tutor.user?._id || tutor.user,
        status: tutor.status || 'offline',
        password: ''
      });
    } else {
      setFormData({
        name: '', email: '', phone: '', tutorId: 'TUT-' + Math.floor(1000 + Math.random() * 9000),
        skills: [], experience: 0, description: '',
        perConversation: 0, perHour: 0, defaultDuration: 30,
        googleMeetEnabled: false, userId: '', status: 'offline',
        password: '', minWithdrawal: 5
      });
    }
  }, [tutor, open]);

  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      if (tutor) {
        await axios.put(`/tutors/${tutor._id}`, formData);
        toast.success('Tutor updated successfully');
      } else {
        await axios.post('/tutors', formData);
        toast.success('Tutor created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{tutor ? 'Edit Tutor' : 'Create New Tutor'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={6}><TextField fullWidth label="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></Grid>
          <Grid item xs={6}><TextField fullWidth label="Tutor ID" value={formData.tutorId} disabled /></Grid>
          <Grid item xs={6}><TextField fullWidth label="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></Grid>
          <Grid item xs={6}><TextField fullWidth label="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Skills</InputLabel>
              <Select multiple value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} label="Skills">
                {skillOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}><TextField fullWidth type="number" label="Experience (Years)" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} /></Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Default Duration</InputLabel>
              <Select value={formData.defaultDuration} onChange={(e) => setFormData({...formData, defaultDuration: e.target.value})} label="Default Duration">
                <MenuItem value={30}>30 Minutes</MenuItem>
                <MenuItem value={60}>1 Hour</MenuItem>
                <MenuItem value={120}>2 Hours</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField 
              fullWidth 
              type="number" 
              label="Per Conversation (₹)" 
              value={formData.perConversation} 
              onChange={(e) => setFormData({...formData, perConversation: e.target.value})} 
            />
          </Grid>
          <Grid item xs={6}>
            <TextField 
              fullWidth 
              type="number" 
              label="Min Withdrawal (Points)" 
              value={formData.minWithdrawal} 
              onChange={(e) => setFormData({...formData, minWithdrawal: e.target.value})}
              helperText="Minimum points tutor must have to withdraw"
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} label="Status">
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
                <MenuItem value="busy">Busy</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField 
              fullWidth 
              type="password" 
              label={tutor ? "New Password (Leave blank to keep same)" : "Password"} 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
          </Grid>
          <Grid item xs={12}>
            <TextField 
              fullWidth 
              label="Short Description" 
              multiline 
              rows={3} 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel 
              control={<Checkbox checked={formData.googleMeetEnabled} onChange={(e) => setFormData({...formData, googleMeetEnabled: e.target.checked})} />} 
              label="Enable Google Meet Access" 
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TutorModal;
