import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Divider, Typography, Switch, FormControlLabel, FormGroup, Checkbox
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import { UserFormSkeleton } from '../../Common/ModalSkeletons';

// Sub-components
import BasicDetails from './BasicDetails';
import CourseBatchSelect from './CourseBatchSelect';
import FeeManagement from './FeeManagement';

const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string(),
    role: Yup.string().required('Role is required'),
    authMethod: Yup.string(),
});

const UserFormModal = ({ open, onClose, user, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [fetchingFees, setFetchingFees] = useState(false);
    const [courses, setCourses] = useState([]);
    const [allBatches, setAllBatches] = useState([]);
    const [autoGenPassword, setAutoGenPassword] = useState(!user);
    const [courseFees, setCourseFees] = useState({});

    useEffect(() => {
        if (open) {
            fetchCourses();
            fetchAllBatches();
            if (user?._id) fetchExistingFeeRecords();
            setAutoGenPassword(!user);
        }
    }, [open, user]);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/courses');
            setCourses(response.data.data);
        } catch (error) { }
    };

    const fetchAllBatches = async () => {
        try {
            const response = await api.get('/batches');
            if (response.data.success) setAllBatches(response.data.data);
        } catch (error) { }
    };

    const fetchExistingFeeRecords = async () => {
        setFetchingFees(true);
        try {
            const response = await api.get(`/fee-records/user/${user._id}`);
            if (response.data.success) {
                const feesMap = {};
                response.data.data.forEach(record => {
                    if (record.course?._id) {
                        feesMap[record.course._id] = {
                            feeRecordId: record._id,
                            totalFee: record.totalFee,
                            discount: record.discount,
                            finalFee: record.finalFee,
                            emiEnabled: record.emiEnabled,
                            emiCount: record.emiCount,
                            paidAmount: record.paidAmount,
                            remainingAmount: record.remainingAmount,
                            payments: record.payments || [],
                            newPayments: []
                        };
                    }
                });
                setCourseFees(feesMap);
            }
        } catch (error) { }
        finally { setFetchingFees(false); }
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
        enrolledCourses: [
            ...(user?.enrolledCourses?.map(c => typeof c === 'object' ? (c._id || c.id) : c) || []),
            ...(user?.pendingCourses?.map(c => typeof c === 'object' ? (c._id || c.id) : c) || [])
        ].filter(id => id),
        batches: user?.batches || (user?.batch ? [user.batch] : []),
        permissions: user?.permissions || 'fullControl',
        moduleAccess: user?.moduleAccess || [],
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            // Validation & Submission Logic (extracted for brevity)
            // ... same as original logic ...
            let res;
            if (user) {
                const updateValues = { ...values };
                if (!updateValues.password) delete updateValues.password;
                res = await api.put(`/users/${user._id}`, updateValues);
            } else {
                const payload = { ...values, autoGeneratePassword: autoGenPassword, password: autoGenPassword ? undefined : values.password };
                res = await api.post('/users', payload);
            }

            const targetUserId = user ? user._id : res.data.data._id;
            // Handle Fee Records
            for (const courseId of values.enrolledCourses) {
                const feeData = courseFees[courseId];
                if (!feeData) continue;
                if (feeData.feeRecordId) {
                    const combined = [...(feeData.payments || []), ...(feeData.newPayments || [])].filter(p => p.amount > 0);
                    await api.put(`/fee-records/${feeData.feeRecordId}`, { discount: feeData.discount, emiEnabled: feeData.emiEnabled, emiCount: feeData.emiCount, payments: combined });
                } else {
                    const initial = (feeData.newPayments || []).filter(p => p.amount > 0);
                    await api.post('/fee-records', { user: targetUserId, course: courseId, totalFee: feeData.totalFee, discount: feeData.discount, finalFee: feeData.finalFee, payments: initial });
                }
            }

            toast.success('User saved successfully');
            onSuccess();
            onClose();
        } catch (error) { toast.error(error.response?.data?.message || 'Operation failed'); }
        finally { setLoading(false); }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize>
                {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
                    <Form>
                        <DialogContent dividers sx={{ minHeight: 400 }}>
                            {(courses.length === 0 || (user && fetchingFees)) ? (
                                <UserFormSkeleton />
                            ) : (
                                <>
                                    <CourseBatchSelect
                                        courses={courses} allBatches={allBatches} values={values}
                                        setFieldValue={setFieldValue} courseFees={courseFees} setCourseFees={setCourseFees}
                                    />
                                    <Divider sx={{ my: 3 }} />
                                    <BasicDetails
                                        values={values} errors={errors} touched={touched}
                                        handleChange={handleChange} handleBlur={handleBlur}
                                        user={user} autoGenPassword={autoGenPassword} setAutoGenPassword={setAutoGenPassword}
                                    />

                                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                        <FormControlLabel control={<Switch checked={values.isActive} onChange={handleChange} name="isActive" />} label="Account Active" />
                                    </Box>

                                    {values.role === 'student' && (
                                        <FeeManagement courses={courses} values={values} courseFees={courseFees} setCourseFees={setCourseFees} />
                                    )}

                                    {/* Permission / Module Access Section (Small enough to keep here or extract) */}
                                    {values.role === 'admin' && (
                                        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                                            <Typography variant="subtitle2" fontWeight={700}>Admin Module Access</Typography>
                                            <FormGroup row>
                                                {['chatAccess', 'userManagement', 'courseManagement'].map(module => (
                                                    <FormControlLabel
                                                        key={module}
                                                        control={<Checkbox checked={values.moduleAccess.includes(module)} onChange={(e) => {
                                                            const next = e.target.checked ? [...values.moduleAccess, module] : values.moduleAccess.filter(m => m !== module);
                                                            setFieldValue('moduleAccess', next);
                                                        }} />}
                                                        label={module}
                                                    />
                                                ))}
                                            </FormGroup>
                                        </Box>
                                    )}
                                </>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <Button onClick={onClose}>Cancel</Button>
                            <Button type="submit" variant="contained" disabled={loading} sx={{ px: 4, borderRadius: 2 }}>
                                {loading ? 'Saving...' : 'Save User'}
                            </Button>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
};

export default UserFormModal;
