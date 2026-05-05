import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, TextField, Button, Grid, Paper, Divider, 
    FormControlLabel, Radio, RadioGroup, FormLabel, Checkbox, 
    FormGroup, Stack, CircularProgress 
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';

const StudentProfileForm = () => {
    const { user, setUser, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [requesting, setRequesting] = useState(false);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [formData, setFormData] = useState({
        contact2: '',
        parentDetails: '',
        dateOfJoining: '',
        expectedEndingDate: '',
        pincode: '',
        address: '',
        dob: '',
        age: '',
        collegeName: '',
        semester: '',
        branchName: '',
        technicalStatus: 'Technical',
        otherDetails: 'None',
        otherSkills: 'None',
        anyMessage: 'None',
        trainingMode: '',
        reference: '',
        enrolledCourses: [],
        studentPhoto: '',
        document: '',
        totalFees: 0,
        discount: 0,
        netFees: 0,
        totalInstallment: 0,
        modeOfPayment: ''
    });

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get('/courses');
                if (res.data.success) {
                    setAvailableCourses(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch courses");
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        if (user?.studentProfile) {
            setFormData(prev => ({
                ...prev,
                ...user.studentProfile,
                dateOfJoining: user.studentProfile.dateOfJoining?.split('T')[0] || '',
                expectedEndingDate: user.studentProfile.expectedEndingDate?.split('T')[0] || '',
                dob: user.studentProfile.dob?.split('T')[0] || '',
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCourseChange = (courseId) => {
        setFormData(prev => {
            const courses = prev.enrolledCourses || [];
            if (courses.includes(courseId)) {
                return { ...prev, enrolledCourses: courses.filter(id => id !== courseId) };
            } else {
                return { ...prev, enrolledCourses: [...courses, courseId] };
            }
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await api.put('/users/student-profile', { profileData: formData });
            if (response.data.success) {
                toast.success('Profile saved successfully');
                // Update local user context
                updateUser(response.data.data); 
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handleRequestRegistration = async () => {
        setRequesting(true);
        try {
            const response = await api.post('/users/request-registration');
            if (response.data.success) {
                toast.success('Registration request sent to admin');
                // Update status locally if needed
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send request');
        } finally {
            setRequesting(false);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom align="center" color="primary">
                    Student Portal Form
                </Typography>
                <Divider sx={{ my: 3 }} />

                <Box component="form">
                    {/* Personal Details Section */}
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                        Personal Details
                    </Typography>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Full Name*" value={user?.name || ''} disabled size="small" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Email*" value={user?.email || ''} disabled size="small" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Contact Number 1*" value={user?.phone || ''} disabled size="small" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Contact Number 2" name="contact2" value={formData.contact2} onChange={handleChange} size="small" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Parent Details" name="parentDetails" value={formData.parentDetails} onChange={handleChange} size="small" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Date of Joining*" type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} InputLabelProps={{ shrink: true }} size="small" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Expected Ending Date*" type="date" name="expectedEndingDate" value={formData.expectedEndingDate} onChange={handleChange} InputLabelProps={{ shrink: true }} size="small" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} size="small" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Full Address" name="address" value={formData.address} onChange={handleChange} size="small" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="User Name*" value={user?.email?.split('@')[0] || ''} disabled size="small" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Date of Birth*" type="date" name="dob" value={formData.dob} onChange={handleChange} InputLabelProps={{ shrink: true }} size="small" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Age" type="number" name="age" value={formData.age} onChange={handleChange} size="small" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Student Photo URL" name="studentPhoto" value={formData.studentPhoto} onChange={handleChange} size="small" placeholder="https://..." />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Document URL" name="document" value={formData.document} onChange={handleChange} size="small" placeholder="https://..." />
                        </Grid>
                    </Grid>

                    {/* Education Details Section */}
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                        Education Details
                    </Typography>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="College Name*" name="collegeName" value={formData.collegeName} onChange={handleChange} size="small" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Semester" name="semester" value={formData.semester} onChange={handleChange} size="small" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Branch Name*" name="branchName" value={formData.branchName} onChange={handleChange} size="small" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormLabel component="legend">Technical & Non-technical*</FormLabel>
                            <RadioGroup row name="technicalStatus" value={formData.technicalStatus} onChange={handleChange}>
                                <FormControlLabel value="Technical" control={<Radio size="small" />} label="Technical" />
                                <FormControlLabel value="Non-Technical" control={<Radio size="small" />} label="Non-Technical" />
                            </RadioGroup>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Other Details" name="otherDetails" value={formData.otherDetails} onChange={handleChange} size="small" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Other Skills" name="otherSkills" value={formData.otherSkills} onChange={handleChange} size="small" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Any Message" name="anyMessage" value={formData.anyMessage} onChange={handleChange} size="small" />
                        </Grid>
                    </Grid>

                    {/* Type of Training Section */}
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                        Type of Training*
                    </Typography>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Mode Of Training*" name="trainingMode" value={formData.trainingMode} onChange={handleChange} size="small" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Reference" name="reference" value={formData.reference} onChange={handleChange} size="small" />
                        </Grid>
                    </Grid>

                    {/* Courses Section */}
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                        Courses*
                    </Typography>
                    <FormGroup row sx={{ mb: 4, pl: 2 }}>
                        {availableCourses.map(course => (
                            <FormControlLabel
                                key={course._id}
                                control={
                                    <Checkbox 
                                        checked={(formData.enrolledCourses || []).includes(course._id)}
                                        onChange={() => handleCourseChange(course._id)}
                                        size="small"
                                    />
                                }
                                label={course.title}
                            />
                        ))}
                    </FormGroup>

                    {/* Fees Structure Section */}
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                        Fees Structure
                    </Typography>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Fees" type="number" name="totalFees" value={formData.totalFees} onChange={handleChange} size="small" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Discount" type="number" name="discount" value={formData.discount} onChange={handleChange} size="small" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Total Fees" type="number" name="netFees" value={formData.netFees} onChange={handleChange} size="small" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Total Installment" type="number" name="totalInstallment" value={formData.totalInstallment} onChange={handleChange} size="small" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Mode of Payment" name="modeOfPayment" value={formData.modeOfPayment} onChange={handleChange} size="small" placeholder="Cash, UPI, EMI" />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    <Stack direction="row" spacing={2} justifyContent="center">
                        <Button 
                            variant="contained" 
                            color="primary" 
                            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            onClick={handleSave}
                            disabled={saving}
                            sx={{ px: 4, borderRadius: 2 }}
                        >
                            Save Details
                        </Button>

                        {(user?.registrationStatus === 'none' || user?.registrationStatus === 'rejected') && (
                            <Button 
                                variant="contained" 
                                color="secondary" 
                                startIcon={requesting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                                onClick={handleRequestRegistration}
                                disabled={requesting || !user?.studentProfile?.isProfileComplete}
                                sx={{ px: 4, borderRadius: 2 }}
                            >
                                {user?.registrationStatus === 'rejected' ? 'Fix & Resend Request' : 'Send Registration Request'}
                            </Button>
                        )}

                        {user?.registrationStatus === 'pending' && (
                            <Button variant="outlined" color="info" disabled sx={{ px: 4, borderRadius: 2 }}>
                                Request Pending Approval
                            </Button>
                        )}

                        {user?.registrationStatus === 'approved' && (
                            <Button variant="contained" color="success" disabled sx={{ px: 4, borderRadius: 2 }}>
                                Officially Registered ✅
                            </Button>
                        )}
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default StudentProfileForm;
