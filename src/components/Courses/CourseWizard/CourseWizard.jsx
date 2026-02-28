import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Divider,
    CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import api from '../../../utils/api';
import { toast } from 'react-toastify';

import BasicInfoStep from './BasicInfoStep';
import CurriculumStep from './CurriculumStep';
import ReviewStep from './ReviewStep';

const steps = ['Basic Info', 'Curriculum', 'Review'];

const validationSchema = [
    // Step 1: Basic Info
    Yup.object().shape({
        title: Yup.string().required('Title is required'),
        category: Yup.string().required('Category is required'),
        price: Yup.number().min(0, 'Price must be positive').required('Price is required'),
        description: Yup.string().required('Description is required'),
    }),
    // Step 2: Curriculum
    Yup.object().shape({
        modules: Yup.array().min(1, 'At least one topic is required').of(
            Yup.object().shape({
                title: Yup.string().required('Topic title is required')
            })
        )
    }),
    // Step 3: Review (No validation needed)
    Yup.object().shape({})
];

const CourseWizard = ({ open, onClose, courseId, onSuccess }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [initialValues, setInitialValues] = useState({
        title: '',
        description: '',
        category: '',
        level: 'beginner',
        price: 0,
        originalPrice: 0,
        durationValue: 0,
        durationUnit: 'months',
        readingDurationValue: 0,
        readingDurationUnit: 'hours',
        thumbnail: '',
        thumbnailPreview: '',
        demoVideoUrl: '',
        isPublished: false,
        isCertificate: false,
        certificateName: '',
        gstType: 'none',
        gstPercent: 0,
        fakeLikes: 0,
        modules: [],
    });

    const isEditMode = Boolean(courseId);

    useEffect(() => {
        if (open) {
            setActiveStep(0);
            if (isEditMode) {
                fetchCourseDetails();
            } else {
                setInitialValues({
                    title: '',
                    description: '',
                    category: '',
                    level: 'beginner',
                    price: 0,
                    originalPrice: 0,
                    durationValue: 0,
                    durationUnit: 'months',
                    readingDurationValue: 0,
                    readingDurationUnit: 'hours',
                    thumbnail: '',
                    thumbnailPreview: '',
                    demoVideoUrl: '',
                    isPublished: false,
                    isCertificate: false,
                    certificateName: '',
                    gstType: 'none',
                    gstPercent: 0,
                    fakeLikes: 0,
                    modules: [],
                });
            }
        }
    }, [open, courseId]);

    const fetchCourseDetails = async () => {
        try {
            const { data } = await api.get(`/courses/${courseId}`);
            const courseData = data.data;

            // Ensure IDs for dnd
            const modulesWithIds = (courseData.modules || []).map(m => ({
                ...m,
                id: m._id || m.id || `topic-${Math.random().toString(36).substr(2, 9)}`,
                videos: (m.videos || []).map(v => ({
                    ...v,
                    id: v._id || v.id || `vid-${Math.random().toString(36).substr(2, 9)}`
                }))
            }));

            setInitialValues({
                title: courseData.title || '',
                description: courseData.description || '',
                category: courseData.category?._id || courseData.category || '',
                level: courseData.level || 'beginner',
                price: courseData.price ?? 0,
                originalPrice: courseData.originalPrice ?? 0,
                durationValue: courseData.durationValue ?? 0,
                durationUnit: courseData.durationUnit || 'months',
                readingDurationValue: courseData.readingDurationValue ?? 0,
                readingDurationUnit: courseData.readingDurationUnit || 'hours',
                thumbnail: courseData.thumbnail || '',
                thumbnailPreview: courseData.thumbnail || '',
                demoVideoUrl: courseData.demoVideoUrl || '',
                isPublished: courseData.isPublished || false,
                isCertificate: courseData.isCertificate || false,
                certificateName: courseData.certificateName || '',
                gstType: courseData.gstType || 'none',
                gstPercent: courseData.gstPercent ?? 0,
                fakeLikes: courseData.fakeLikes ?? 0,
                modules: modulesWithIds
            });
        } catch (error) {
            console.error('Error fetching course:', error);
            toast.error('Failed to load course details');
            onClose();
        }
    };

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleSubmit = async (values, { setSubmitting }) => {
        if (activeStep !== steps.length - 1) {
            handleNext();
            setSubmitting(false);
            return;
        }

        try {
            // Clean payload for backend
            const cleanModules = values.modules.map(mod => {
                const { id, ...moduleData } = mod;
                return {
                    ...moduleData,
                    videos: (moduleData.videos || []).map(vid => {
                        const { id: vId, ...videoData } = vid;
                        return videoData;
                    })
                };
            });

            const payload = {
                ...values,
                modules: cleanModules
            };
            delete payload.thumbnailPreview; // Not needed by backend

            if (isEditMode) {
                const response = await api.put(`/courses/${courseId}`, payload);
                toast.success('Course updated successfully');
            } else {
                const response = await api.post('/courses', payload);
                toast.success('Course created successfully');
            }
            onSuccess(); // Close modal and refresh list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save course');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xl"
            PaperProps={{
                sx: { borderRadius: 1, minHeight: '80vh' } // Less rounded, wide/tall
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" component="span" fontWeight={600}>
                    {isEditMode ? 'Edit Course' : 'Create New Course'}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <Divider />

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema[activeStep]}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, errors, touched, handleChange, setFieldValue, isSubmitting }) => (
                    <Form style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <DialogContent sx={{ p: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ width: '100%', px: 3, py: 2, bgcolor: 'background.default' }}>
                                <Stepper activeStep={activeStep} alternativeLabel>
                                    {steps.map((label) => (
                                        <Step key={label}>
                                            <StepLabel>{label}</StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>
                            </Box>
                            <Divider />

                            <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
                                {activeStep === 0 && (
                                    <BasicInfoStep
                                        values={values}
                                        errors={errors}
                                        touched={touched}
                                        handleChange={handleChange}
                                        setFieldValue={setFieldValue}
                                    />
                                )}
                                {activeStep === 1 && (
                                    <CurriculumStep
                                        values={values}
                                        setFieldValue={setFieldValue}
                                    />
                                )}
                                {activeStep === 2 && (
                                    <ReviewStep values={values} />
                                )}
                            </Box>
                        </DialogContent>
                        <Divider />
                        <DialogActions sx={{ p: 2, bgcolor: 'background.paper' }}>
                            <Button
                                disabled={activeStep === 0 || isSubmitting}
                                onClick={handleBack}
                                sx={{ mr: 1 }}
                            >
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit" // Trigger Formik submit
                                disabled={isSubmitting}
                                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                            >
                                {activeStep === steps.length - 1
                                    ? (isEditMode ? 'Update/Publish' : 'Create Course')
                                    : 'Next'}
                            </Button>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
};

export default CourseWizard;
