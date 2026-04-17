import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Dialog,
    IconButton,
    Divider,
    CircularProgress,
    Stack,
    Paper,
    Tooltip,
    Container,
    Avatar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import api from '../../../utils/api';
import { toast } from 'react-toastify';

import BasicInfoStep from './BasicInfoStep';
import CurriculumStep from './CurriculumStep';
import ReviewStep from './ReviewStep';

const steps = [
    { label: 'Basic Details', icon: <InfoOutlinedIcon />, description: 'Course title, price, and media' },
    { label: 'Curriculum', icon: <MenuBookOutlinedIcon />, description: 'Topics, lectures, and resources' },
    { label: 'Final Review', icon: <VisibilityOutlinedIcon />, description: 'Preview and publish course' }
];

const validationSchema = [
    Yup.object().shape({
        title: Yup.string().required('Title is required'),
        category: Yup.string().required('Category is required'),
        price: Yup.number().min(0, 'Price must be positive').required('Price is required'),
        description: Yup.string().required('Description is required'),
    }),
    Yup.object().shape({
        modules: Yup.array().min(1, 'At least one topic is required').of(
            Yup.object().shape({
                title: Yup.string().required('Topic title is required')
            })
        )
    }),
    Yup.object().shape({})
];

const CourseWizard = ({ open, onClose, courseId, onSuccess }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [categories, setCategories] = useState([]);
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
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                setCategories(data.data || []);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();

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
            const cleanModules = values.modules.map(mod => {
                const { id, ...moduleData } = mod;
                return {
                    ...moduleData,
                    videos: (moduleData.videos || []).map(vid => {
                        const { id: vId, ...videoData } = vid;
                        // Strip empty resource fields to prevent MongoDB cast errors
                        if (!videoData.resourceId) delete videoData.resourceId;
                        if (!videoData.resourceModel) delete videoData.resourceModel;
                        return videoData;
                    })
                };
            });

            const payload = {
                ...values,
                price: Number(values.price) || 0,
                originalPrice: Number(values.originalPrice) || 0,
                durationValue: Number(values.durationValue) || 0,
                readingDurationValue: Number(values.readingDurationValue) || 0,
                gstPercent: Number(values.gstPercent) || 0,
                fakeLikes: Number(values.fakeLikes) || 0,
                modules: cleanModules
            };
            delete payload.thumbnailPreview;

            if (isEditMode) {
                await api.put(`/courses/${courseId}`, payload);
                toast.success('Course updated successfully');
            } else {
                await api.post('/courses', payload);
                toast.success('Course created successfully');
            }
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save course');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStepClick = async (idx, validateForm, setTouched) => {
        if (idx === activeStep) return;

        // If trying to go to a future step, validate current first
        if (idx > activeStep) {
            const errors = await validateForm();
            if (Object.keys(errors).length > 0) {
                // Focus on the fields with errors by touching them
                setTouched(errors); 
                toast.error('Please fix validation errors before moving forward');
                return;
            }
        }

        setActiveStep(idx);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen
            PaperProps={{
                sx: { 
                    bgcolor: '#f8fafc',
                    overflow: 'hidden',
                    backgroundImage: 'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(168, 85, 247, 0.05) 0px, transparent 50%)' 
                }
            }}
        >
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema[activeStep]}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, errors, touched, handleChange, setFieldValue, isSubmitting, validateForm, setTouched }) => (
                    <Form style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {/* Header */}
                        <Box sx={{ 
                            px: 4, py: 2, 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(10px)',
                            borderBottom: '1px solid rgba(0,0,0,0.05)',
                            zIndex: 10
                        }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box sx={{ 
                                    width: 40, height: 40, 
                                    borderRadius: '12px', 
                                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    <MenuBookOutlinedIcon />
                                </Box>
                                <Box>
                                    <Typography variant="h6" fontWeight={800} sx={{ color: '#1e293b' }}>
                                        {isEditMode ? 'Edit Course' : 'Create New Course'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Step {activeStep + 1} of {steps.length}: {steps[activeStep].label}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Stack direction="row" spacing={2}>
                                <Button 
                                    variant="outlined" 
                                    startIcon={<SaveOutlinedIcon />}
                                    sx={{ borderRadius: '10px', textTransform: 'none', px: 3 }}
                                    onClick={() => toast.info('Draft auto-saved!')}
                                >
                                    Save Draft
                                </Button>
                                <IconButton onClick={onClose} sx={{ bgcolor: 'rgba(0,0,0,0.05)' }}>
                                    <CloseIcon />
                                </IconButton>
                            </Stack>
                        </Box>

                        <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                            {/* Sidebar Stepper */}
                            <Box sx={{ 
                                width: 320, 
                                borderRight: '1px solid rgba(0,0,0,0.05)', 
                                p: 4,
                                display: { xs: 'none', md: 'block' },
                                bgcolor: 'white'
                            }}>
                                <Stack spacing={4}>
                                    {steps.map((step, index) => (
                                        <Stack 
                                            key={index} 
                                            direction="row" 
                                            spacing={2} 
                                            alignItems="flex-start" 
                                            sx={{ 
                                                opacity: activeStep >= index ? 1 : 0.5,
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onClick={() => handleStepClick(index, validateForm, setTouched)}
                                        >
                                            <Box sx={{ 
                                                width: 44, height: 44, 
                                                borderRadius: '50%', 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                bgcolor: activeStep === index ? 'primary.main' : (activeStep > index ? 'success.light' : '#f1f5f9'),
                                                color: activeStep >= index ? 'white' : 'text.disabled',
                                                boxShadow: activeStep === index ? '0 0 20px rgba(99, 102, 241, 0.3)' : 'none',
                                                transition: 'all 0.3s ease'
                                            }}>
                                                {activeStep > index ? '✓' : step.icon}
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={700} color={activeStep === index ? 'primary' : 'text.primary'}>
                                                    {step.label}
                                                </Typography>
                                                <Typography variant="caption" display="block" color="text.secondary" sx={{ maxWidth: 180 }}>
                                                    {step.description}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Box>

                            {/* Main Content */}
                            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 2, md: 5 } }}>
                                <Box sx={{ maxWidth: 1100, mx: 'auto' }} className="animate-slide-up">
                                    {activeStep === 0 && (
                                        <BasicInfoStep
                                            values={values}
                                            errors={errors}
                                            touched={touched}
                                            handleChange={handleChange}
                                            setFieldValue={setFieldValue}
                                            categories={categories}
                                        />
                                    )}
                                    {activeStep === 1 && (
                                        <CurriculumStep
                                            values={values}
                                            setFieldValue={setFieldValue}
                                        />
                                    )}
                                    {activeStep === 2 && (
                                        <ReviewStep values={values} categories={categories} />
                                    )}
                                </Box>
                            </Box>
                        </Box>

                        {/* Footer Controls */}
                        <Paper sx={{ 
                            p: 3, px: 6, 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            bgcolor: 'white',
                            borderTop: '1px solid rgba(0,0,0,0.05)',
                            borderRadius: 0
                        }}>
                            <Button
                                disabled={activeStep === 0 || isSubmitting}
                                onClick={handleBack}
                                startIcon={<ArrowBackIcon />}
                                sx={{ borderRadius: '10px', px: 4, textTransform: 'none', fontWeight: 600 }}
                            >
                                Previous Step
                            </Button>
                            
                            <Button
                                variant="contained"
                                type="submit"
                                disabled={isSubmitting}
                                endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                                sx={{ 
                                    borderRadius: '10px', 
                                    px: 6, py: 1.5,
                                    textTransform: 'none', 
                                    fontWeight: 700,
                                    boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
                                }}
                            >
                                {activeStep === steps.length - 1
                                    ? (isEditMode ? 'Update & Publish' : 'Launch Course')
                                    : 'Save & Continue'}
                            </Button>
                        </Paper>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
};

export default CourseWizard;

