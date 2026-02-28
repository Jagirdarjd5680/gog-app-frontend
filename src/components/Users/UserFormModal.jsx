import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    FormControlLabel,
    Switch,
    Autocomplete,
    Chip,
    Typography,
    Box,
    Checkbox,
    FormGroup,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string(),
    role: Yup.string().required('Role is required'),
    source: Yup.string(),
    authMethod: Yup.string(),
});

const UserFormModal = ({ open, onClose, user, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        if (open) {
            fetchCourses();
        }
    }, [open]);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/courses');
            setCourses(response.data.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const initialValues = {
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        role: user?.role || 'student',
        password: '',
        isActive: user?.isActive !== undefined ? user.isActive : true,
        source: user?.source || 'web',
        authMethod: user?.authMethod || 'email',
        enrolledCourses: user?.enrolledCourses?.map(c => typeof c === 'object' ? c._id : c) || [],
        permissions: user?.permissions || 'fullControl',
        moduleAccess: user?.moduleAccess || [],
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            if (user) {
                // Update
                await api.put(`/users/${user._id}`, values);
                toast.success('User updated successfully');
            } else {
                // Create
                await api.post('/users', values);
                toast.success('User created successfully');
            }
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize>
                {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
                    <Form>
                        <DialogContent>
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                value={values.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.name && Boolean(errors.name)}
                                helperText={touched.name && errors.name}
                                margin="normal"
                            />

                            {user?.rollNumber && (
                                <TextField
                                    fullWidth
                                    label="Roll Number"
                                    value={user.rollNumber}
                                    margin="normal"
                                    InputProps={{ readOnly: true }}
                                    variant="filled"
                                    helperText="Auto-generated sequential roll number"
                                />
                            )}

                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.email && Boolean(errors.email)}
                                helperText={touched.email && errors.email}
                                margin="normal"
                            />

                            <TextField
                                fullWidth
                                label="Phone"
                                name="phone"
                                value={values.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                margin="normal"
                            />

                            <TextField
                                fullWidth
                                select
                                label="Role"
                                name="role"
                                value={values.role}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.role && Boolean(errors.role)}
                                helperText={touched.role && errors.role}
                                margin="normal"
                            >
                                <MenuItem value="student">Student</MenuItem>
                                <MenuItem value="teacher">Teacher</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </TextField>

                            {!user && (
                                <TextField
                                    fullWidth
                                    label="Password"
                                    name="password"
                                    type="password"
                                    value={values.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    margin="normal"
                                    required={!user}
                                />
                            )}

                            <TextField
                                fullWidth
                                select
                                label="Source"
                                name="source"
                                value={values.source}
                                onChange={handleChange}
                                margin="normal"
                            >
                                <MenuItem value="web">Web</MenuItem>
                                <MenuItem value="android">Android</MenuItem>
                                <MenuItem value="ios">iOS</MenuItem>
                            </TextField>

                            <TextField
                                fullWidth
                                select
                                label="Auth Method"
                                name="authMethod"
                                value={values.authMethod}
                                onChange={handleChange}
                                margin="normal"
                            >
                                <MenuItem value="email">Email/Password</MenuItem>
                                <MenuItem value="google">Google</MenuItem>
                                <MenuItem value="phone">Phone</MenuItem>
                            </TextField>

                            <FormControlLabel
                                control={<Switch checked={values.isActive} onChange={handleChange} name="isActive" />}
                                label="Active"
                                sx={{ mt: 2 }}
                            />

                            {values.role === 'student' && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>Assign Courses</Typography>
                                    <Autocomplete
                                        multiple
                                        id="enrolledCourses"
                                        options={courses}
                                        getOptionLabel={(option) => option.title}
                                        value={courses.filter(c => values.enrolledCourses?.includes(c._id))}
                                        onChange={(event, newValue) => {
                                            setFieldValue('enrolledCourses', newValue.map(v => v._id));
                                        }}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Select Courses" placeholder="Courses" />
                                        )}
                                        renderTags={(tagValue, getTagProps) =>
                                            tagValue.map((option, index) => {
                                                const { key, ...tagProps } = getTagProps({ index });
                                                return (
                                                    <Chip
                                                        key={key}
                                                        label={option.title}
                                                        {...tagProps}
                                                        color="primary"
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                );
                                            })
                                        }
                                    />
                                </Box>
                            )}

                            {values.role === 'teacher' && (
                                <>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Permissions"
                                        name="permissions"
                                        value={values.permissions}
                                        onChange={handleChange}
                                        margin="normal"
                                    >
                                        <MenuItem value="read">Only Read</MenuItem>
                                        <MenuItem value="readWrite">Read and Write</MenuItem>
                                        <MenuItem value="fullControl">Full Control (Own Work)</MenuItem>
                                    </TextField>

                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2">Module Access</Typography>
                                        <FormGroup>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={values.moduleAccess.includes('courseManagement')}
                                                        onChange={(e) => {
                                                            const nextValue = e.target.checked
                                                                ? [...values.moduleAccess, 'courseManagement']
                                                                : values.moduleAccess.filter(i => i !== 'courseManagement');
                                                            setFieldValue('moduleAccess', nextValue);
                                                        }}
                                                    />
                                                }
                                                label="Course Management"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={values.moduleAccess.includes('examManagement')}
                                                        onChange={(e) => {
                                                            const nextValue = e.target.checked
                                                                ? [...values.moduleAccess, 'examManagement']
                                                                : values.moduleAccess.filter(i => i !== 'examManagement');
                                                            setFieldValue('moduleAccess', nextValue);
                                                        }}
                                                    />
                                                }
                                                label="Exam Management"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={values.moduleAccess.includes('questionManagement')}
                                                        onChange={(e) => {
                                                            const nextValue = e.target.checked
                                                                ? [...values.moduleAccess, 'questionManagement']
                                                                : values.moduleAccess.filter(i => i !== 'questionManagement');
                                                            setFieldValue('moduleAccess', nextValue);
                                                        }}
                                                    />
                                                }
                                                label="Question Management"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={values.moduleAccess.includes('mediaAccess')}
                                                        onChange={(e) => {
                                                            const nextValue = e.target.checked
                                                                ? [...values.moduleAccess, 'mediaAccess']
                                                                : values.moduleAccess.filter(i => i !== 'mediaAccess');
                                                            setFieldValue('moduleAccess', nextValue);
                                                        }}
                                                    />
                                                }
                                                label="Media Access"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={values.moduleAccess.includes('liveClasses')}
                                                        onChange={(e) => {
                                                            const nextValue = e.target.checked
                                                                ? [...values.moduleAccess, 'liveClasses']
                                                                : values.moduleAccess.filter(i => i !== 'liveClasses');
                                                            setFieldValue('moduleAccess', nextValue);
                                                        }}
                                                    />
                                                }
                                                label="Live Classes"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={values.moduleAccess.includes('assignments')}
                                                        onChange={(e) => {
                                                            const nextValue = e.target.checked
                                                                ? [...values.moduleAccess, 'assignments']
                                                                : values.moduleAccess.filter(i => i !== 'assignments');
                                                            setFieldValue('moduleAccess', nextValue);
                                                        }}
                                                    />
                                                }
                                                label="Assignments"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={values.moduleAccess.includes('notifications')}
                                                        onChange={(e) => {
                                                            const nextValue = e.target.checked
                                                                ? [...values.moduleAccess, 'notifications']
                                                                : values.moduleAccess.filter(i => i !== 'notifications');
                                                            setFieldValue('moduleAccess', nextValue);
                                                        }}
                                                    />
                                                }
                                                label="Notifications"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={values.moduleAccess.includes('coupons')}
                                                        onChange={(e) => {
                                                            const nextValue = e.target.checked
                                                                ? [...values.moduleAccess, 'coupons']
                                                                : values.moduleAccess.filter(i => i !== 'coupons');
                                                            setFieldValue('moduleAccess', nextValue);
                                                        }}
                                                    />
                                                }
                                                label="Coupons"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={values.moduleAccess.includes('chatAccess')}
                                                        onChange={(e) => {
                                                            const nextValue = e.target.checked
                                                                ? [...values.moduleAccess, 'chatAccess']
                                                                : values.moduleAccess.filter(i => i !== 'chatAccess');
                                                            setFieldValue('moduleAccess', nextValue);
                                                        }}
                                                    />
                                                }
                                                label="Chat Access"
                                            />
                                        </FormGroup>
                                    </Box>
                                </>
                            )}
                        </DialogContent>

                        <DialogActions>
                            <Button onClick={onClose}>Cancel</Button>
                            <Button type="submit" variant="contained" disabled={loading}>
                                {loading ? 'Saving...' : 'Save'}
                            </Button>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog >
    );
};

export default UserFormModal;
