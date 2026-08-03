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
    Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import QuizIcon from '@mui/icons-material/Quiz';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import { CourseWizardSkeleton } from '../../Common/ModalSkeletons';
import { getYoutubeVideoDuration } from '../../../utils/youtube';


import BasicInfoStep from './BasicInfoStep';
import CurriculumStep from './CurriculumStep';
import AssignmentStep from './AssignmentStep';
import ExamsStep from './ExamsStep';
import ReviewStep from './ReviewStep';

const steps = [
    { label: 'Basic Details', icon: <InfoOutlinedIcon sx={{ fontSize: 18 }} />, description: 'Course title, price, and media' },
    { label: 'Curriculum', icon: <MenuBookOutlinedIcon sx={{ fontSize: 18 }} />, description: 'Topics, lectures, and resources' },
    { label: 'Assignments', icon: <AssignmentOutlinedIcon sx={{ fontSize: 18 }} />, description: 'Add and link assignments' },
    { label: 'Exams & Quizzes', icon: <QuizIcon sx={{ fontSize: 18 }} />, description: 'Create and manage course quizzes' },
    { label: 'Final Review', icon: <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />, description: 'Preview and publish course' }
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
    Yup.object().shape({}),
    Yup.object().shape({}),
    Yup.object().shape({})
];

const CourseWizard = ({ open, onClose, courseId, onSuccess }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
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
        courseType: 'online',
        assignedBatches: [],
        allowOtherBatchMaterials: false,
        platformAccess: 'both',
    });

    const isEditMode = Boolean(courseId);
    // Tracks the course actually being worked on: the `courseId` prop when editing, or the
    // id we get back once a brand-new course is auto-saved as a draft on step 1 (see
    // handleSubmit) — Assignments/Exams steps need a real DB id to attach to, which doesn't
    // exist yet for a course that's still mid-creation.
    const [activeCourseId, setActiveCourseId] = useState(courseId || null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                setCategories(data.data || []);
            } catch (error) {

            }
        };
        fetchCategories();

        if (open) {
            setActiveStep(0);
            setActiveCourseId(courseId || null);
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
                    courseType: 'online',
                    assignedBatches: [],
                    allowOtherBatchMaterials: false,
                });
            }
        }
    }, [open, courseId]);

    const fetchCourseDetails = async () => {
        setLoading(true);
        try {
            // /courses/:id is the public, platform-gated (Course.platformAccess) student
            // endpoint — editing must bypass that restriction entirely, or a course locked
            // to "app" only 403s the moment an admin tries to open it here.
            const { data } = await api.get(`/courses/manage/${courseId}`);
            const courseData = data.data;

            const modulesWithIds = (courseData.modules || []).map(m => ({
                ...m,
                id: m._id || m.id || `topic-${Math.random().toString(36).substr(2, 9)}`,
                videos: (m.videos || []).map(v => ({
                    ...v,
                    videoUrl: v.url || v.videoUrl || '',
                    duration: v.duration || 0,
                    id: v._id || v.id || `vid-${Math.random().toString(36).substr(2, 9)}`
                }))
            }));

            setInitialValues({
                title: courseData.title || '',
                description: courseData.description || '',
                // Categories dropdown (fetched from /categories) matches on the string form of
                // the id — courseData.category is the raw Prisma relation object ({id, name,
                // slug, ...}), which has no _id field, so using it directly used to leave the
                // Select unable to match any option and render blank.
                category: String(courseData.category?.id ?? courseData.categoryId ?? ''),
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
                modules: modulesWithIds,
                courseType: courseData.courseType || 'online',
                assignedBatches: (courseData.assignedBatches || []).map(b => typeof b === 'object' ? b._id : b),
                allowOtherBatchMaterials: courseData.allowOtherBatchMaterials || false,
                platformAccess: courseData.platformAccess || 'both',
            });
        } catch (error) {
            toast.error('Failed to load course details');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

    // Shared between draft save, the step-1 auto-create, and final publish so numeric/boolean
    // fields (price, fakeLikes, gstPercent, isCertificate, ...) are always coerced to the real
    // types the backend's DTO validators expect — a raw string like "500" from a text field
    // fails `@IsNumber()` and used to make the whole save silently fail.
    const buildPayload = (values, isPublished) => {
        const cleanModules = values.modules.map(mod => {
            const { id, ...moduleData } = mod;
            return {
                ...moduleData,
                videos: (moduleData.videos || []).map(vid => {
                    const { id: vId, ...videoData } = vid;
                    if (!videoData.resourceId) delete videoData.resourceId;
                    if (!videoData.resourceModel) delete videoData.resourceModel;
                    return videoData;
                })
            };
        });

        const payload = {
            ...values,
            isPublished,
            price: Number(values.price) || 0,
            originalPrice: Number(values.originalPrice) || 0,
            durationValue: Number(values.durationValue) || 0,
            readingDurationValue: Number(values.readingDurationValue) || 0,
            gstPercent: Number(values.gstPercent) || 0,
            fakeLikes: Number(values.fakeLikes) || 0,
            isCertificate: !!values.isCertificate,
            certificateName: values.certificateName || '',
            modules: cleanModules,
        };
        delete payload.thumbnailPreview;
        return payload;
    };

    const handleSaveDraft = async (values) => {
        if (!values.title || !values.category) {
            toast.error('Please fill in title and category (Basic Details step) before saving');
            return;
        }
        try {
            setLoading(true);
            const payload = buildPayload(values, false);

            if (activeCourseId) {
                await api.put(`/courses/${activeCourseId}`, payload);
            } else {
                const { data } = await api.post('/courses', payload);
                setActiveCourseId(data.data.id);
            }
            toast.success('Draft saved successfully');
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save draft');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        if (activeStep !== steps.length - 1) {
            // Assignments/Exams steps need a real course id to attach records to — save a
            // draft the moment Basic Details is complete so the rest of the wizard has one,
            // instead of leaving those steps permanently disabled until final publish.
            if (activeStep === 0 && !activeCourseId) {
                try {
                    setLoading(true);
                    const payload = buildPayload(values, false);
                    const { data } = await api.post('/courses', payload);
                    setActiveCourseId(data.data.id);
                    toast.success('Draft created — you can now add curriculum, assignments & exams');
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to create course draft');
                    setSubmitting(false);
                    return;
                } finally {
                    setLoading(false);
                }
            }
            handleNext();
            setSubmitting(false);
            return;
        }

        try {
            const payload = buildPayload(values, true);

            if (activeCourseId) {
                await api.put(`/courses/${activeCourseId}`, payload);
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

    const handleStepClick = async (idx, values, validateForm, setTouched) => {
        if (idx === activeStep) return;

        if (idx > activeStep) {
            const errors = await validateForm();
            if (Object.keys(errors).length > 0) {
                setTouched(errors);
                toast.error('Please fix validation errors before moving forward');
                return;
            }

            // Same as handleSubmit: jumping past Basic Details via the sidebar stepper must
            // also create the draft, or Assignments/Exams stay disabled for a new course.
            if (activeStep === 0 && !activeCourseId) {
                try {
                    setLoading(true);
                    const payload = buildPayload(values, false);
                    const { data } = await api.post('/courses', payload);
                    setActiveCourseId(data.data.id);
                    toast.success('Draft created — you can now add curriculum, assignments & exams');
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to create course draft');
                    setLoading(false);
                    return;
                } finally {
                    setLoading(false);
                }
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
                    bgcolor: 'var(--color-vc-canvas-soft)',
                    color: 'var(--color-vc-ink)',
                    overflow: 'hidden'
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
                            bgcolor: 'var(--color-vc-canvas)',
                            borderBottom: '1px solid var(--color-vc-hairline)',
                            zIndex: 10
                        }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box sx={{ 
                                    width: 36, height: 36, 
                                    borderRadius: '6px', 
                                    bgcolor: 'var(--color-vc-primary)',
                                    display: 'flex', alignItems: 'center', justifycontent: 'center',
                                    color: 'var(--color-vc-on-primary)'
                                }}>
                                    <MenuBookOutlinedIcon sx={{ fontSize: 20 }} />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'var(--color-vc-ink)', letterSpacing: '-0.02em', fontFamily: 'inherit', lineHeight: 1.2 }}>
                                        {isEditMode ? 'Edit Course' : 'Create New Course'}
                                    </Typography>
                                    <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>
                                        Step {activeStep + 1} of {steps.length}: {steps[activeStep].label}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Button 
                                    variant="outlined" 
                                    startIcon={<SaveOutlinedIcon sx={{ fontSize: 16 }} />}
                                    sx={{ 
                                        borderRadius: '6px', 
                                        textTransform: 'none', 
                                        px: 2.5,
                                        height: 36,
                                        fontSize: '13px',
                                        fontFamily: 'inherit',
                                        fontWeight: 500,
                                        borderColor: 'var(--color-vc-hairline)',
                                        color: 'var(--color-vc-ink)',
                                        bgcolor: 'var(--color-vc-canvas)',
                                        '&:hover': {
                                            borderColor: 'var(--color-vc-hairline-strong)',
                                            bgcolor: 'var(--color-vc-canvas-soft)'
                                        }
                                    }}
                                    onClick={() => handleSaveDraft(values)}
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={16} /> : 'Save Draft'}
                                </Button>
                                <IconButton 
                                    onClick={onClose} 
                                    size="small"
                                    sx={{ 
                                        color: 'var(--color-vc-mute)',
                                        '&:hover': {
                                            color: 'var(--color-vc-ink)',
                                            bgcolor: 'var(--color-vc-canvas-soft)'
                                        }
                                    }}
                                >
                                    <CloseIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Stack>
                        </Box>

                        <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                            {/* Sidebar Stepper */}
                            <Box sx={{ 
                                width: 280, 
                                borderRight: '1px solid var(--color-vc-hairline)', 
                                p: 3.5,
                                display: { xs: 'none', md: 'block' },
                                bgcolor: 'var(--color-vc-canvas)'
                            }}>
                                <Stack spacing={3.5}>
                                    {steps.map((step, index) => {
                                        const isActive = activeStep === index;
                                        const isCompleted = activeStep > index;
                                        return (
                                            <Stack 
                                                key={index} 
                                                direction="row" 
                                                spacing={2} 
                                                alignItems="flex-start" 
                                                sx={{ 
                                                    opacity: activeStep >= index ? 1 : 0.45,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        opacity: 1
                                                    }
                                                }}
                                                onClick={() => handleStepClick(index, values, validateForm, setTouched)}
                                            >
                                                <Box sx={{ 
                                                    width: 32, height: 32, 
                                                    borderRadius: '50%', 
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    bgcolor: isActive ? 'var(--color-vc-ink)' : (isCompleted ? 'rgba(41, 188, 155, 0.15)' : 'var(--color-vc-canvas-soft-2)'),
                                                    color: isActive ? 'var(--color-vc-on-primary)' : (isCompleted ? 'var(--color-vc-cyan-deep)' : 'var(--color-vc-mute)'),
                                                    border: isCompleted ? '1px solid transparent' : '1px solid var(--color-vc-hairline)',
                                                    transition: 'all 0.2s ease'
                                                }}>
                                                    {isCompleted ? '✓' : index + 1}
                                                </Box>
                                                <Box>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--color-vc-ink)' : 'var(--color-vc-body)', fontFamily: 'inherit' }}>
                                                        {step.label}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit', mt: 0.25, maxWidth: 180 }}>
                                                        {step.description}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        );
                                    })}
                                </Stack>
                            </Box>

                            {/* Main Content */}
                            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 3, md: 5 } }}>
                                {loading ? (
                                    <CourseWizardSkeleton />
                                ) : (
                                    <Box sx={{ maxWidth: 1400, mx: 'auto', width: '100%' }}>
                                        {activeStep === 0 && (
                                            <BasicInfoStep
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                categories={categories}
                                                courseId={activeCourseId}
                                                onCategoryCreated={(newCat) => setCategories(prev => [...prev, newCat])}
                                            />
                                        )}
                                        {activeStep === 1 && (
                                            <CurriculumStep
                                                values={values}
                                                setFieldValue={setFieldValue}
                                                courseId={activeCourseId}
                                            />
                                        )}
                                        {activeStep === 2 && (
                                            <AssignmentStep
                                                values={values}
                                                setFieldValue={setFieldValue}
                                                courseId={activeCourseId}
                                            />
                                        )}
                                        {activeStep === 3 && (
                                            <ExamsStep
                                                values={values}
                                                setFieldValue={setFieldValue}
                                                courseId={activeCourseId}
                                            />
                                        )}
                                        {activeStep === 4 && (
                                            <ReviewStep values={values} categories={categories} courseId={activeCourseId} />
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {/* Footer Controls */}
                        <Paper sx={{ 
                            p: 2.5, px: 6, 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            bgcolor: 'var(--color-vc-canvas)',
                            borderTop: '1px solid var(--color-vc-hairline)',
                            borderRadius: 0
                        }}>
                            <Button
                                disabled={activeStep === 0 || isSubmitting}
                                onClick={handleBack}
                                startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
                                sx={{ 
                                    borderRadius: '6px', 
                                    px: 3, 
                                    textTransform: 'none', 
                                    fontWeight: 500,
                                    fontSize: '13px',
                                    fontFamily: 'inherit',
                                    height: 36,
                                    color: 'var(--color-vc-body)',
                                    '&:hover': {
                                        bgcolor: 'var(--color-vc-canvas-soft)',
                                        color: 'var(--color-vc-ink)'
                                    },
                                    '&:disabled': {
                                        color: 'var(--color-vc-mute)',
                                        opacity: 0.5
                                    }
                                }}
                            >
                                Previous Step
                            </Button>
                            
                            <Button
                                variant="contained"
                                type="submit"
                                disabled={isSubmitting}
                                endIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <ArrowForwardIcon sx={{ fontSize: 16 }} />}
                                sx={{ 
                                    borderRadius: '6px', 
                                    px: 4, 
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
