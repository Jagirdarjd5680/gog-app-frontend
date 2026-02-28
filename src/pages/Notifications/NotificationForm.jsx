import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    MenuItem,
    Autocomplete,
    Chip,
    Avatar,
    CircularProgress,
    FormControlLabel,
    Switch,
    Alert,
    Collapse
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    message: Yup.string().required('Message is required'),
    recipientRole: Yup.string().required('Recipient role is required'),
});

const NotificationForm = () => {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [fetchingUsers, setFetchingUsers] = useState(false);
    const [pushResult, setPushResult] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setFetchingUsers(true);
            try {
                const response = await api.get('/users');
                if (response.data.success) {
                    setUsers(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch users:', error);
            } finally {
                setFetchingUsers(false);
            }
        };
        fetchUsers();
    }, []);

    const initialValues = {
        title: '',
        message: '',
        type: 'info',
        recipientRole: 'all',
        recipients: [],
        sendPush: false,
    };

    const handleSubmit = async (values, { resetForm }) => {
        setLoading(true);
        setPushResult(null);
        try {
            // Prepare data: if specific role is selected, we send IDs
            const payload = {
                title: values.title,
                message: values.message,
                type: values.type,
                recipientRole: values.recipientRole.startsWith('specific_') ? 'specific' : values.recipientRole,
                recipients: values.recipients.map(u => u._id),
                sendPush: values.sendPush,
            };

            const res = await api.post('/notifications', payload);
            toast.success('Notification sent successfully');

            if (res.data.pushResult) {
                setPushResult(res.data.pushResult);
            }
            resetForm();
        } catch (error) {
            toast.error('Failed to send notification');
        } finally {
            setLoading(false);
        }
    };

    const getFilteredUsers = (role) => {
        if (role === 'specific_student') return users.filter(u => u.role === 'student');
        if (role === 'specific_teacher') return users.filter(u => u.role === 'teacher');
        return users;
    };

    return (
        <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                    Send New Notification
                </Typography>

                {/* Push result feedback */}
                <Collapse in={!!pushResult}>
                    {pushResult && (
                        <Alert
                            severity={pushResult.success ? 'success' : 'warning'}
                            onClose={() => setPushResult(null)}
                            sx={{ mb: 3, borderRadius: 2 }}
                        >
                            <strong>Push Notification:</strong>{' '}
                            {pushResult.sent > 0
                                ? `✅ Delivered to ${pushResult.sent} device(s).`
                                : 'No devices received the push.'}
                            {pushResult.failed > 0 && ` ⚠️ ${pushResult.failed} failed.`}
                            {pushResult.errors?.length > 0 && (
                                <Box sx={{ mt: 0.5, fontSize: '0.8rem', color: 'text.secondary' }}>
                                    {pushResult.errors.join(' | ')}
                                </Box>
                            )}
                        </Alert>
                    )}
                </Collapse>

                <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                    {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
                        <Form>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <TextField
                                    fullWidth
                                    label="Title"
                                    name="title"
                                    value={values.title}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.title && Boolean(errors.title)}
                                    helperText={touched.title && errors.title}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Message"
                                    name="message"
                                    value={values.message}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.message && Boolean(errors.message)}
                                    helperText={touched.message && errors.message}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />

                                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Notification Type"
                                        name="type"
                                        value={values.type}
                                        onChange={handleChange}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    >
                                        <MenuItem value="info">Information</MenuItem>
                                        <MenuItem value="success">Success</MenuItem>
                                        <MenuItem value="warning">Warning</MenuItem>
                                        <MenuItem value="error">Critical Error</MenuItem>
                                        <MenuItem value="announcement">Announcement</MenuItem>
                                    </TextField>

                                    <TextField
                                        fullWidth
                                        select
                                        label="Send To"
                                        name="recipientRole"
                                        value={values.recipientRole}
                                        onChange={(e) => {
                                            handleChange(e);
                                            // Reset recipients if role changes
                                            setFieldValue('recipients', []);
                                        }}
                                        onBlur={handleBlur}
                                        error={touched.recipientRole && Boolean(errors.recipientRole)}
                                        helperText={touched.recipientRole && errors.recipientRole}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    >
                                        <MenuItem value="all">All Users</MenuItem>
                                        <MenuItem value="student">All Students</MenuItem>
                                        <MenuItem value="teacher">All Teachers</MenuItem>
                                        <MenuItem value="specific_student">Specific Students</MenuItem>
                                        <MenuItem value="specific_teacher">Specific Teachers</MenuItem>
                                        <MenuItem value="specific_users">Specific Individual Users</MenuItem>
                                        <MenuItem value="admin">Admins Only</MenuItem>
                                    </TextField>
                                </Box>

                                {values.recipientRole.startsWith('specific_') && (
                                    <Box sx={{ mt: 1 }}>
                                        <Autocomplete
                                            multiple
                                            options={getFilteredUsers(values.recipientRole)}
                                            getOptionLabel={(option) => `${option.name} (${option.email})`}
                                            value={values.recipients}
                                            loading={fetchingUsers}
                                            onChange={(_, newValue) => {
                                                setFieldValue('recipients', newValue);
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label={`Select ${values.recipientRole.includes('student') ? 'Students' : values.recipientRole.includes('teacher') ? 'Teachers' : 'Users'}`}
                                                    placeholder="Search by name or email"
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        endAdornment: (
                                                            <>
                                                                {fetchingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                                                                {params.InputProps.endAdornment}
                                                            </>
                                                        ),
                                                    }}
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                />
                                            )}
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => {
                                                    const { key, ...tagProps } = getTagProps({ index });
                                                    return (
                                                        <Chip
                                                            key={key}
                                                            avatar={<Avatar src={option.avatar}>{option.name[0]}</Avatar>}
                                                            label={option.name}
                                                            size="small"
                                                            {...tagProps}
                                                        />
                                                    );
                                                })
                                            }
                                        />
                                    </Box>
                                )}

                                {/* Send Push Notification toggle */}
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: values.sendPush ? 'primary.main' : 'action.hover',
                                    color: values.sendPush ? '#fff' : 'text.primary',
                                    transition: 'all 0.3s ease',
                                    border: '1px solid',
                                    borderColor: values.sendPush ? 'primary.main' : 'divider',
                                }}>
                                    <NotificationsActiveIcon sx={{
                                        color: values.sendPush ? '#fff' : 'text.secondary',
                                        fontSize: 22,
                                    }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight={600}>
                                            Send Push Notification (FCM)
                                        </Typography>
                                        <Typography variant="caption" sx={{
                                            opacity: 0.8,
                                            color: values.sendPush ? '#fff' : 'text.secondary',
                                        }}>
                                            Also send to users' mobile devices via Firebase
                                        </Typography>
                                    </Box>
                                    <Switch
                                        checked={values.sendPush}
                                        onChange={(e) => setFieldValue('sendPush', e.target.checked)}
                                        color="default"
                                        sx={{
                                            '& .MuiSwitch-thumb': {
                                                bgcolor: values.sendPush ? '#fff' : 'grey.400',
                                            },
                                            '& .MuiSwitch-track': {
                                                bgcolor: values.sendPush ? 'rgba(255,255,255,0.3)' : 'grey.300',
                                            },
                                        }}
                                    />
                                </Box>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={loading || (values.recipientRole.startsWith('specific_') && values.recipients.length === 0)}
                                    sx={{
                                        mt: 2,
                                        py: 1.5,
                                        borderRadius: 2,
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        boxShadow: '0 4px 12px rgba(var(--mui-palette-primary-mainChannel), 0.3)'
                                    }}
                                >
                                    {loading ? 'Processing...' : 'Broadcast Notification'}
                                </Button>
                            </Box>
                        </Form>
                    )}
                </Formik>
            </CardContent>
        </Card>
    );
};

export default NotificationForm;

