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

const PERMISSION_MODULES = [
    { key: 'exams', label: 'Exams' },
    { key: 'courses', label: 'Courses' },
    { key: 'students', label: 'Students' },
    { key: 'chat', label: 'Chat' },
];
const PERMISSION_ACTIONS = [
    { key: 'view', label: 'View' },
    { key: 'add', label: 'Add' },
    { key: 'edit', label: 'Edit' },
    { key: 'delete', label: 'Delete' },
];

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
    const [courses, setCourses] = useState(null);
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
            setCourses(response.data.data || []);
        } catch (error) {
            setCourses([]);
        }
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
        modulePermissions: user?.modulePermissions || {},
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            // Validation & Submission Logic (extracted for brevity)
            // ... same as original logic ...
            let res;
            const existingId = user ? (user._id || user.id) : null;
            if (user && existingId) {
                const updateValues = { ...values };
                if (!updateValues.password) delete updateValues.password;
                res = await api.put(`/users/${existingId}`, updateValues);
            } else {
                const payload = { ...values, autoGeneratePassword: autoGenPassword, password: autoGenPassword ? undefined : values.password };
                res = await api.post('/users', payload);
            }

            const targetUserId = user ? (user._id || user.id) : (res.data?.data?._id || res.data?.data?.id);
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
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth 
            PaperProps={{ 
                sx: { 
                    borderRadius: '8px',
                    bgcolor: 'var(--color-vc-canvas)',
                    border: '1px solid var(--color-vc-hairline)',
                    boxShadow: '0px 32px 64px -12px rgba(0,0,0,0.16)',
                } 
            }}
        >
            <DialogTitle sx={{ 
                fontSize: '16px', 
                fontWeight: 600, 
                color: 'var(--color-vc-ink)', 
                fontFamily: 'inherit',
                pb: 1.5,
                borderBottom: '1px solid var(--color-vc-hairline)'
            }}>
                {user ? 'Edit User' : 'Add New User'}
            </DialogTitle>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize>
                {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
                    <Form>
                        <DialogContent sx={{ minHeight: 400, bgcolor: 'var(--color-vc-canvas)', py: 3 }}>
                            {(courses === null || (user && fetchingFees)) ? (
                                <UserFormSkeleton />
                            ) : (
                                <>
                                    <CourseBatchSelect
                                        courses={courses} allBatches={allBatches} values={values}
                                        setFieldValue={setFieldValue} courseFees={courseFees} setCourseFees={setCourseFees}
                                    />
                                    <Divider sx={{ my: 3, borderColor: 'var(--color-vc-hairline)' }} />
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

                                    {/* Permission / Module Access Section */}
                                    {values.role === 'admin' && (
                                        <Box sx={{ mt: 3, p: 2, bgcolor: 'var(--color-vc-canvas-soft)', border: '1px solid var(--color-vc-hairline)', borderRadius: '6px' }}>
                                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit', mb: 1 }}>Admin Module Access</Typography>
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

                                    {/* Teacher granular permissions: per-module View/Add/Edit/Delete grants,
                                        enforced both here (sidebar/route visibility) and on the backend
                                        (ModulePermissionsGuard) — see backend_nestjs/src/auth/module-permissions.guard.ts */}
                                    {values.role === 'teacher' && (
                                        <Box sx={{ mt: 3, p: 2, bgcolor: 'var(--color-vc-canvas-soft)', border: '1px solid var(--color-vc-hairline)', borderRadius: '6px' }}>
                                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit', mb: 1.5 }}>
                                                Teacher Permissions
                                            </Typography>
                                            <Box sx={{ overflowX: 'auto' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-vc-mute)', fontFamily: 'inherit', padding: '4px 8px' }}>
                                                                Module
                                                            </th>
                                                            {PERMISSION_ACTIONS.map((action) => (
                                                                <th key={action.key} style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-vc-mute)', fontFamily: 'inherit', padding: '4px 8px' }}>
                                                                    {action.label}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {PERMISSION_MODULES.map((mod) => (
                                                            <tr key={mod.key}>
                                                                <td style={{ fontSize: 13, color: 'var(--color-vc-ink)', fontFamily: 'inherit', padding: '4px 8px' }}>
                                                                    {mod.label}
                                                                </td>
                                                                {PERMISSION_ACTIONS.map((action) => {
                                                                    const checked = !!values.modulePermissions?.[mod.key]?.[action.key];
                                                                    return (
                                                                        <td key={action.key} style={{ textAlign: 'center', padding: '4px 8px' }}>
                                                                            <Checkbox
                                                                                size="small"
                                                                                checked={checked}
                                                                                onChange={(e) => {
                                                                                    const next = {
                                                                                        ...values.modulePermissions,
                                                                                        [mod.key]: { ...values.modulePermissions?.[mod.key], [action.key]: e.target.checked },
                                                                                    };
                                                                                    setFieldValue('modulePermissions', next);
                                                                                }}
                                                                            />
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </Box>
                                        </Box>
                                    )}
                                </>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ p: 2.5, borderTop: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', gap: 1 }}>
                            <Button 
                                onClick={onClose}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: '13px',
                                    fontFamily: 'inherit',
                                    color: 'var(--color-vc-mute)',
                                    '&:hover': {
                                        color: 'var(--color-vc-ink)',
                                        bgcolor: 'var(--color-vc-canvas-soft)'
                                    }
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                disabled={loading} 
                                sx={{ 
                                    px: 3, 
                                    borderRadius: '6px',
                                    height: 36,
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: '13px',
                                    fontFamily: 'inherit',
                                    boxShadow: 'none',
                                    bgcolor: 'var(--color-vc-primary)',
                                    color: 'var(--color-vc-on-primary)',
                                    '&:hover': {
                                        bgcolor: 'var(--color-vc-primary)',
                                        opacity: 0.9,
                                        boxShadow: 'none'
                                    }
                                }}
                            >
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
