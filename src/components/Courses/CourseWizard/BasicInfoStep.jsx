import { useRef, useState } from 'react';
import {
    Grid, TextField, MenuItem, FormControl, InputLabel, Select, Box, Typography, Button, Divider,
    Card, CardContent, InputAdornment, CircularProgress, LinearProgress, Switch, FormControlLabel, Stack, Alert,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TitleIcon from '@mui/icons-material/Title';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import CategoryIcon from '@mui/icons-material/Category';
import PaymentsIcon from '@mui/icons-material/Payments';
import SettingsIcon from '@mui/icons-material/Settings';
import CollectionsIcon from '@mui/icons-material/Collections';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import AddIcon from '@mui/icons-material/Add';
import LanguageIcon from '@mui/icons-material/Language';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import DevicesIcon from '@mui/icons-material/Devices';
import VideoPreview from '../../Common/VideoPreview';
import { uploadFile } from '../../../utils/upload';
import api, { fixUrl } from '../../../utils/api';
import { toast } from 'react-toastify';
import MediaPickerModal from '../../Media/MediaPickerModal';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const SectionHeader = ({ icon, title, subtitle }) => (
    <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ 
                p: 1, 
                borderRadius: '6px', 
                bgcolor: 'var(--color-vc-canvas-soft-2)', 
                color: 'var(--color-vc-ink)',
                border: '1px solid var(--color-vc-hairline)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
            }}>
                {icon}
            </Box>
            <Box>
                <Typography sx={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    {title}
                </Typography>
                {subtitle && <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit', mt: 0.25 }}>{subtitle}</Typography>}
            </Box>
        </Stack>
    </Box>
);

const BasicInfoStep = ({ values, errors, touched, handleChange, setFieldValue, categories = [], courseId, onCategoryCreated }) => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerType, setPickerType] = useState('image');
    const [pickerTarget, setPickerTarget] = useState('thumbnail');

    // New Category States
    const [newCatOpen, setNewCatOpen] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [addingCat, setAddingCat] = useState(false);

    const handleAddNewCategory = async () => {
        if (!newCatName.trim()) return toast.error('Category name is required');
        try {
            setAddingCat(true);
            const slug = newCatName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const { data } = await api.post('/categories', { name: newCatName.trim(), slug });
            if (data.success || data.name) {
                toast.success('Category added successfully!');
                const addedCat = data.data || data;
                if (onCategoryCreated) {
                    onCategoryCreated(addedCat);
                }
                setFieldValue('category', addedCat._id || addedCat.id);
                setNewCatName('');
                setNewCatOpen(false);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add category');
        } finally {
            setAddingCat(false);
        }
    };

    const handleOpenPicker = (type, target) => {
        setPickerType(type);
        setPickerTarget(target);
        setPickerOpen(true);
    };

    const handleMediaSelect = (file) => {
        if (pickerTarget === 'thumbnail') {
            setFieldValue('thumbnail', file.url);
            setFieldValue('thumbnailPreview', file.url);
        } else if (pickerTarget === 'demoVideoUrl') {
            setFieldValue('demoVideoUrl', file.url);
        }
        toast.success('Media selected from library');
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                setUploading(true);
                setUploadProgress(0);
                setFieldValue('thumbnailPreview', URL.createObjectURL(file));

                const result = await uploadFile(file, (progress) => {
                    setUploadProgress(progress);
                });
                if (result.success) {
                    setFieldValue('thumbnail', result.url);
                    setFieldValue('thumbnailPreview', fixUrl(result.url));
                    toast.success('Image uploaded successfully');
                }
            } catch (error) {
                toast.error('Failed to upload image');
                setFieldValue('thumbnailPreview', '');
            } finally {
                setUploading(false);
            }
        }
    };

    const inputStyles = {
        fontFamily: 'inherit',
        fontSize: '13px',
        color: 'var(--color-vc-ink)',
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-vc-hairline)',
            borderRadius: '6px'
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-vc-hairline-strong)'
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-vc-hairline-strong)'
        }
    };

    const labelStyles = {
        fontFamily: 'inherit',
        fontSize: '13px',
        color: 'var(--color-vc-mute)',
        '&.Mui-focused': {
            color: 'var(--color-vc-ink)'
        }
    };

    return (
        <Box sx={{ p: 0.5 }}>
            <Grid container spacing={3}>
                {/* Main Content Area */}
                <Grid item xs={12} md={8}>
                    <Stack spacing={3}>
                        {/* General Information Card */}
                        <Card variant="outlined" sx={{ borderRadius: '8px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none' }}>
                            <CardContent sx={{ p: 4 }}>
                                <SectionHeader 
                                    icon={<TitleIcon sx={{ fontSize: 18 }} />} 
                                    title="General Information" 
                                    subtitle="Define your course title, category, and level"
                                />
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            id="title"
                                            name="title"
                                            label="Course Title"
                                            placeholder="e.g. Complete React Mastery 2024"
                                            value={values.title || ''}
                                            onChange={handleChange}
                                            error={touched.title && Boolean(errors.title)}
                                            helperText={touched.title && errors.title}
                                            InputLabelProps={{ sx: labelStyles }}
                                            InputProps={{ sx: inputStyles }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                            <FormControl fullWidth error={touched.category && Boolean(errors.category)}>
                                                <InputLabel id="category-label" sx={labelStyles}>Category</InputLabel>
                                                <Select
                                                    labelId="category-label"
                                                    id="category"
                                                    name="category"
                                                    value={categories.some(cat => (cat._id || cat.id) === values.category) ? values.category : ''}
                                                    label="Category"
                                                    onChange={handleChange}
                                                    sx={inputStyles}
                                                >
                                                    <MenuItem value=""><em>Select Category</em></MenuItem>
                                                    {categories.map((cat) => (
                                                        <MenuItem key={cat._id || cat.id} value={cat._id || cat.id}>
                                                            {cat.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <IconButton 
                                                onClick={() => setNewCatOpen(true)}
                                                sx={{ 
                                                    mt: 0.5, 
                                                    border: '1px solid var(--color-vc-hairline)', 
                                                    borderRadius: '6px', 
                                                    bgcolor: 'var(--color-vc-canvas)', 
                                                    height: 38, 
                                                    width: 38,
                                                    color: 'primary.main',
                                                    '&:hover': {
                                                        bgcolor: 'var(--color-vc-canvas-soft)'
                                                    }
                                                }}
                                            >
                                                <AddIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel id="level-label" sx={labelStyles}>Level</InputLabel>
                                            <Select
                                                labelId="level-label"
                                                id="level"
                                                name="level"
                                                value={values.level}
                                                label="Level"
                                                onChange={handleChange}
                                                sx={inputStyles}
                                            >
                                                <MenuItem value="beginner">Beginner</MenuItem>
                                                <MenuItem value="intermediate">Intermediate</MenuItem>
                                                <MenuItem value="advanced">Advanced</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    
                                    <Grid item xs={12}>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)', mb: 1, display: 'block', fontFamily: 'inherit' }}>
                                            Course Overview (Rich Text)
                                        </Typography>
                                        <Box sx={{ 
                                            '& .ql-toolbar': { 
                                                borderRadius: '6px 6px 0 0', 
                                                border: '1px solid var(--color-vc-hairline) !important',
                                                bgcolor: 'var(--color-vc-canvas-soft)' 
                                            },
                                            '& .ql-container': { 
                                                borderRadius: '0 0 6px 6px', 
                                                border: '1px solid var(--color-vc-hairline) !important',
                                                minHeight: '220px',
                                                fontSize: '13px',
                                                fontFamily: 'inherit',
                                                bgcolor: 'var(--color-vc-canvas)',
                                                color: 'var(--color-vc-ink)'
                                            },
                                            '& .ql-editor': {
                                                minHeight: '220px',
                                                color: 'var(--color-vc-ink)'
                                            }
                                        }}>
                                            <ReactQuill
                                                theme="snow"
                                                value={values.description || ''}
                                                onChange={(content) => setFieldValue('description', content)}
                                                placeholder="Write a comprehensive guide on what this course covers..."
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Course Type Card */}
                        <Card variant="outlined" sx={{ borderRadius: '8px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none' }}>
                            <CardContent sx={{ p: 4 }}>
                                <SectionHeader
                                    icon={<PublicIcon sx={{ fontSize: 18 }} />}
                                    title="Course Type"
                                    subtitle="Online courses are public; Offline courses are private and batch-only"
                                />
                                <Stack direction="row" spacing={2.5}>
                                    <Box
                                        onClick={() => setFieldValue('courseType', 'online')}
                                        sx={{
                                            flex: 1, p: 2.5, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s',
                                            border: '1px solid',
                                            borderColor: values.courseType !== 'offline' ? 'var(--color-vc-ink)' : 'var(--color-vc-hairline)',
                                            bgcolor: values.courseType !== 'offline' ? 'var(--color-vc-canvas-soft)' : 'transparent',
                                            '&:hover': { borderColor: 'var(--color-vc-hairline-strong)' }
                                        }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <PublicIcon sx={{ color: values.courseType !== 'offline' ? 'var(--color-vc-ink)' : 'var(--color-vc-mute)', fontSize: 24 }} />
                                            <Box>
                                                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>Online Course</Typography>
                                                <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit', mt: 0.25 }}>Visible on homepage, open to all</Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                    <Box
                                        onClick={() => setFieldValue('courseType', 'offline')}
                                        sx={{
                                            flex: 1, p: 2.5, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s',
                                            border: '1px solid',
                                            borderColor: values.courseType === 'offline' ? 'var(--color-vc-ink)' : 'var(--color-vc-hairline)',
                                            bgcolor: values.courseType === 'offline' ? 'var(--color-vc-canvas-soft)' : 'transparent',
                                            '&:hover': { borderColor: 'var(--color-vc-hairline-strong)' }
                                        }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <LockIcon sx={{ color: values.courseType === 'offline' ? 'var(--color-vc-ink)' : 'var(--color-vc-mute)', fontSize: 24 }} />
                                            <Box>
                                                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>Offline Course</Typography>
                                                <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit', mt: 0.25 }}>Private, assigned batches only</Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                </Stack>

                                {values.courseType === 'offline' && (
                                    <Box sx={{ mt: 3 }}>
                                        <Alert 
                                            severity="warning" 
                                            sx={{ 
                                                mb: 2.5, 
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                bgcolor: 'var(--color-vc-canvas-soft)',
                                                border: '1px solid var(--color-vc-hairline)',
                                                color: 'var(--color-vc-ink)'
                                            }}
                                        >
                                            This course will <strong>NOT appear on the homepage</strong> or any public pages. It is private and only accessible via assigned batches.
                                        </Alert>
                                        <FormControlLabel
                                            sx={{ mt: 1 }}
                                            control={
                                                <Switch
                                                    checked={values.allowOtherBatchMaterials || false}
                                                    onChange={(e) => setFieldValue('allowOtherBatchMaterials', e.target.checked)}
                                                    sx={{
                                                        '& .MuiSwitch-thumb': {
                                                            bgcolor: values.allowOtherBatchMaterials ? 'var(--color-vc-ink)' : 'var(--color-vc-mute)'
                                                        },
                                                        '& .MuiSwitch-track': {
                                                            bgcolor: values.allowOtherBatchMaterials ? 'var(--color-vc-ink) !important' : 'var(--color-vc-hairline) !important'
                                                        }
                                                    }}
                                                />
                                            }
                                            label={
                                                <Box sx={{ ml: 1 }}>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>Allow Other Batches' Materials</Typography>
                                                    <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit', display: 'block', mt: 0.25 }}>
                                                        Students can view materials from other batches in this course
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Platform Access Card */}
                        <Card variant="outlined" sx={{ borderRadius: '8px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none' }}>
                            <CardContent sx={{ p: 4 }}>
                                <SectionHeader
                                    icon={<DevicesIcon sx={{ fontSize: 18 }} />}
                                    title="Allow This Course From"
                                    subtitle="Choose where students may open and purchase this course"
                                />
                                <Stack direction="row" spacing={2.5}>
                                    {[
                                        { value: 'web', label: 'Web Only', desc: 'Blocked in the mobile app', icon: LanguageIcon },
                                        { value: 'app', label: 'App Only', desc: 'Blocked on the website', icon: PhoneIphoneIcon },
                                        { value: 'both', label: 'Web & App', desc: 'Accessible everywhere', icon: DevicesIcon },
                                    ].map(({ value, label, desc, icon: OptionIcon }) => {
                                        const selected = (values.platformAccess || 'both') === value;
                                        return (
                                            <Box
                                                key={value}
                                                onClick={() => setFieldValue('platformAccess', value)}
                                                sx={{
                                                    flex: 1, p: 2.5, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s',
                                                    border: '1px solid',
                                                    borderColor: selected ? 'var(--color-vc-ink)' : 'var(--color-vc-hairline)',
                                                    bgcolor: selected ? 'var(--color-vc-canvas-soft)' : 'transparent',
                                                    '&:hover': { borderColor: 'var(--color-vc-hairline-strong)' }
                                                }}
                                            >
                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                    <OptionIcon sx={{ color: selected ? 'var(--color-vc-ink)' : 'var(--color-vc-mute)', fontSize: 24 }} />
                                                    <Box>
                                                        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>{label}</Typography>
                                                        <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit', mt: 0.25 }}>{desc}</Typography>
                                                    </Box>
                                                </Stack>
                                            </Box>
                                        );
                                    })}
                                </Stack>
                                {values.platformAccess && values.platformAccess !== 'both' && (
                                    <Alert
                                        severity="info"
                                        sx={{
                                            mt: 2.5,
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            bgcolor: 'var(--color-vc-canvas-soft)',
                                            border: '1px solid var(--color-vc-hairline)',
                                            color: 'var(--color-vc-ink)'
                                        }}
                                    >
                                        Students opening this course from {values.platformAccess === 'web' ? 'the mobile app' : 'the website'} will see a message telling them it's only available {values.platformAccess === 'web' ? 'on the web' : 'in the mobile application'}.
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pricing & GST Card */}
                        <Card variant="outlined" sx={{ borderRadius: '8px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none' }}>
                            <CardContent sx={{ p: 4 }}>
                                <SectionHeader 
                                    icon={<PaymentsIcon sx={{ fontSize: 18 }} />} 
                                    title="Pricing & Tax" 
                                    subtitle="Configure your course price and GST settings"
                                />
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            id="originalPrice"
                                            name="originalPrice"
                                            label="List Price (Stripped)"
                                            type="number"
                                            InputLabelProps={{ sx: labelStyles }}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start" sx={{ '& .MuiTypography-root': { color: 'var(--color-vc-mute)' } }}>₹</InputAdornment>,
                                                inputProps: { min: 0 },
                                                sx: inputStyles
                                            }}
                                            value={values.originalPrice}
                                            onChange={handleChange}
                                            helperText="Original price shown to users"
                                            FormHelperTextProps={{ sx: { color: 'var(--color-vc-mute)', fontSize: '11px', fontFamily: 'inherit' } }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            id="price"
                                            name="price"
                                            label="Selling Price (Active)"
                                            type="number"
                                            InputLabelProps={{ sx: labelStyles }}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start" sx={{ '& .MuiTypography-root': { color: 'var(--color-vc-mute)' } }}>₹</InputAdornment>,
                                                inputProps: { min: 0 },
                                                sx: inputStyles
                                            }}
                                            value={values.price}
                                            onChange={handleChange}
                                            error={touched.price && Boolean(errors.price)}
                                            helperText={touched.price && errors.price}
                                            FormHelperTextProps={{ sx: { color: 'var(--color-vc-mute)', fontSize: '11px', fontFamily: 'inherit' } }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel id="gst-type-label" sx={labelStyles}>GST Status</InputLabel>
                                            <Select
                                                labelId="gst-type-label"
                                                id="gstType"
                                                name="gstType"
                                                value={values.gstType || 'none'}
                                                label="GST Status"
                                                onChange={handleChange}
                                                sx={inputStyles}
                                            >
                                                <MenuItem value="none">No GST</MenuItem>
                                                <MenuItem value="inclusive">GST Inclusive</MenuItem>
                                                <MenuItem value="exclusive">GST Exclusive</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {values.gstType !== 'none' && (
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                id="gstPercent"
                                                name="gstPercent"
                                                label="GST rate (%)"
                                                type="number"
                                                InputLabelProps={{ sx: labelStyles }}
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end" sx={{ '& .MuiTypography-root': { color: 'var(--color-vc-mute)' } }}>%</InputAdornment>,
                                                    inputProps: { min: 0, max: 100 },
                                                    sx: inputStyles
                                                }}
                                                value={values.gstPercent}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                    )}
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Additional Settings Card */}
                        <Card variant="outlined" sx={{ borderRadius: '8px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none' }}>
                            <CardContent sx={{ p: 4 }}>
                                <SectionHeader 
                                    icon={<SettingsIcon sx={{ fontSize: 18 }} />} 
                                    title="Additional Options" 
                                    subtitle="Course duration, certificates, and social proof"
                                />
                                <Grid container spacing={4}>
                                    <Grid item xs={12} sm={6}>
                                        <Stack spacing={1}>
                                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>Course Valid For</Typography>
                                            <Stack direction="row" spacing={1}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    id="durationValue"
                                                    name="durationValue"
                                                    type="number"
                                                    value={values.durationValue || 0}
                                                    onChange={handleChange}
                                                    placeholder="0 = Forever"
                                                    InputProps={{ sx: inputStyles }}
                                                />
                                                <Select
                                                    size="small"
                                                    name="durationUnit"
                                                    value={values.durationUnit || 'months'}
                                                    onChange={handleChange}
                                                    sx={{ ...inputStyles, minWidth: 100 }}
                                                >
                                                    <MenuItem value="days">Days</MenuItem>
                                                    <MenuItem value="months">Months</MenuItem>
                                                    <MenuItem value="years">Years</MenuItem>
                                                </Select>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Stack spacing={1}>
                                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>Estimated Reading Time</Typography>
                                            <Stack direction="row" spacing={1}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    id="readingDurationValue"
                                                    name="readingDurationValue"
                                                    type="number"
                                                    value={values.readingDurationValue || 0}
                                                    onChange={handleChange}
                                                    InputProps={{ sx: inputStyles }}
                                                />
                                                <Select
                                                    size="small"
                                                    name="readingDurationUnit"
                                                    value={values.readingDurationUnit || 'hours'}
                                                    onChange={handleChange}
                                                    sx={{ ...inputStyles, minWidth: 100 }}
                                                >
                                                    <MenuItem value="hours">Hours</MenuItem>
                                                    <MenuItem value="days">Days</MenuItem>
                                                </Select>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Divider sx={{ borderColor: 'var(--color-vc-hairline)' }} />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ bgcolor: 'var(--color-vc-canvas-soft)', p: 2, borderRadius: '6px', border: '1px solid var(--color-vc-hairline)' }}>
                                            <Box>
                                                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>Certificate Issuance</Typography>
                                                <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit', display: 'block', mt: 0.25 }}>Offer a verified certificate on completion</Typography>
                                            </Box>
                                            <Switch
                                                name="isCertificate"
                                                checked={values.isCertificate || false}
                                                onChange={handleChange}
                                                sx={{
                                                    '& .MuiSwitch-thumb': {
                                                        bgcolor: values.isCertificate ? 'var(--color-vc-ink)' : 'var(--color-vc-mute)'
                                                    },
                                                    '& .MuiSwitch-track': {
                                                        bgcolor: values.isCertificate ? 'var(--color-vc-ink) !important' : 'var(--color-vc-hairline) !important'
                                                    }
                                                }}
                                            />
                                        </Stack>
                                    </Grid>

                                    {values.isCertificate && (
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                id="certificateName"
                                                name="certificateName"
                                                label="Certificate Title"
                                                value={values.certificateName || ''}
                                                onChange={handleChange}
                                                placeholder="e.g. Certified Data Scientist"
                                                InputLabelProps={{ sx: labelStyles }}
                                                InputProps={{ sx: inputStyles }}
                                            />
                                        </Grid>
                                    )}

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            id="fakeLikes"
                                            name="fakeLikes"
                                            label="Social Proof (Bonus Likes)"
                                            type="number"
                                            value={values.fakeLikes || 0}
                                            onChange={handleChange}
                                            InputLabelProps={{ sx: labelStyles }}
                                            InputProps={{ 
                                                startAdornment: <InputAdornment position="start" sx={{ '& .MuiTypography-root': { color: 'var(--color-vc-mute)' } }}>♥</InputAdornment>,
                                                sx: inputStyles 
                                            }}
                                            helperText="Initial likes shown to prospective students"
                                            FormHelperTextProps={{ sx: { color: 'var(--color-vc-mute)', fontSize: '11px', fontFamily: 'inherit' } }}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>

                {/* Sidebar Media Area */}
                <Grid item xs={12} md={4}>
                    <Stack spacing={3}>
                        {/* Course Thumbnail */}
                        <Card variant="outlined" sx={{ borderRadius: '8px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none' }}>
                            <CardContent sx={{ p: 3 }}>
                                <SectionHeader icon={<CloudUploadIcon sx={{ fontSize: 18 }} />} title="Course Thumbnail" subtitle="Ideal size: 1280x720 (16:9)" />
                                
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: 200,
                                        border: '2px dashed var(--color-vc-hairline)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        transition: 'all 0.2s ease',
                                        bgcolor: 'var(--color-vc-canvas-soft-2)',
                                        '&:hover': { borderColor: 'var(--color-vc-hairline-strong)', bgcolor: 'var(--color-vc-canvas-soft)' }
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {uploading && (
                                        <Box sx={{
                                            position: 'absolute', inset: 0, zIndex: 10,
                                            bgcolor: 'var(--color-vc-canvas)',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2
                                        }}>
                                            <CircularProgress size={32} thickness={4} sx={{ color: 'var(--color-vc-ink)' }} />
                                            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-vc-ink)', mt: 2, fontFamily: 'inherit' }}>
                                                {uploadProgress < 100 ? `🚀 UPLOADING ${uploadProgress}%` : '⚙️ PROCESSING & ENCRYPTING...'}
                                            </Typography>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={uploadProgress} 
                                                sx={{ width: '80%', mt: 1, borderRadius: 5, height: 4, '& .MuiLinearProgress-bar': { bgcolor: 'var(--color-vc-ink)' } }} 
                                            />
                                        </Box>
                                    )}
                                    {values.thumbnailPreview ? (
                                        <img
                                            src={fixUrl(values.thumbnailPreview)}
                                            alt="Thumbnail"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Stack spacing={1} alignItems="center">
                                            <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: 'var(--color-vc-canvas)', border: '1px solid var(--color-vc-hairline)' }}>
                                                <CloudUploadIcon sx={{ color: 'var(--color-vc-ink)', fontSize: 24 }} />
                                            </Box>
                                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>Click to upload</Typography>
                                            <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>PNG, JPG or WEBP</Typography>
                                        </Stack>
                                    )}
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                    />
                                </Box>

                                <Stack spacing={1.5} sx={{ mt: 2 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        id="thumbnail"
                                        name="thumbnail"
                                        label="Thumbnail Image URL"
                                        placeholder="Paste image URL here..."
                                        value={values.thumbnail || ''}
                                        onChange={(e) => {
                                            handleChange(e);
                                            setFieldValue('thumbnailPreview', e.target.value);
                                        }}
                                        InputLabelProps={{ sx: labelStyles }}
                                        InputProps={{ 
                                            sx: inputStyles,
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ '& .MuiTypography-root': { color: 'var(--color-vc-mute)' } }}>
                                                    <CollectionsIcon fontSize="small" />
                                                </InputAdornment>
                                            )
                                        }}
                                        helperText="Paste a URL or use the buttons below"
                                        FormHelperTextProps={{ sx: { color: 'var(--color-vc-mute)', fontSize: '11px', fontFamily: 'inherit' } }}
                                    />

                                    <Stack direction="row" spacing={1.5}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="small"
                                            startIcon={<CategoryIcon sx={{ fontSize: 14 }} />}
                                            sx={{ 
                                                borderRadius: '6px', 
                                                textTransform: 'none', 
                                                fontSize: '12px',
                                                height: 32,
                                                fontFamily: 'inherit',
                                                boxShadow: 'none',
                                                bgcolor: 'var(--color-vc-ink)',
                                                color: 'var(--color-vc-on-primary)',
                                                '&:hover': { bgcolor: 'var(--color-vc-ink)', opacity: 0.9, boxShadow: 'none' } 
                                            }}
                                            onClick={() => handleOpenPicker('image', 'thumbnail')}
                                        >
                                            Library
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            startIcon={<CloudUploadIcon sx={{ fontSize: 14 }} />}
                                            sx={{ 
                                                borderRadius: '6px', 
                                                textTransform: 'none',
                                                fontSize: '12px',
                                                height: 32,
                                                fontFamily: 'inherit',
                                                borderColor: 'var(--color-vc-hairline)',
                                                color: 'var(--color-vc-ink)',
                                                bgcolor: 'var(--color-vc-canvas)',
                                                '&:hover': { borderColor: 'var(--color-vc-hairline-strong)', bgcolor: 'var(--color-vc-canvas-soft)' }
                                            }}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            Upload
                                        </Button>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>

                        {/* Demo/Promo Video */}
                        <Card variant="outlined" sx={{ borderRadius: '8px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none' }}>
                            <CardContent sx={{ p: 3 }}>
                                <SectionHeader icon={<VideoLibraryIcon sx={{ fontSize: 18 }} />} title="Course Teaser" subtitle="A short preview video for students" />
                                
                                <Box sx={{ mb: 2, position: 'relative', borderRadius: '6px', overflow: 'hidden', minHeight: uploading ? 180 : 0 }}>
                                    {uploading && (
                                        <Box sx={{
                                            position: 'absolute', inset: 0, zIndex: 10,
                                            bgcolor: 'var(--color-vc-canvas)',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2
                                        }}>
                                            <CircularProgress size={32} thickness={4} sx={{ color: 'var(--color-vc-ink)' }} />
                                            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-vc-ink)', mt: 2, fontFamily: 'inherit' }}>
                                                {uploadProgress < 100 ? `🚀 UPLOADING ${uploadProgress}%` : '⚙️ PROCESSING & ENCRYPTING...'}
                                            </Typography>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={uploadProgress} 
                                                sx={{ width: '80%', mt: 1, borderRadius: 5, height: 4, '& .MuiLinearProgress-bar': { bgcolor: 'var(--color-vc-ink)' } }} 
                                            />
                                        </Box>
                                    )}
                                    <VideoPreview url={values.demoVideoUrl} height={180} />
                                </Box>

                                <Stack spacing={1.5}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        id="demoVideoUrl"
                                        name="demoVideoUrl"
                                        label="YouTube / Vimeo URL"
                                        placeholder="Paste link here..."
                                        value={values.demoVideoUrl || ''}
                                        onChange={handleChange}
                                        InputLabelProps={{ sx: labelStyles }}
                                        InputProps={{ sx: inputStyles }}
                                    />
                                    <Divider sx={{ borderColor: 'var(--color-vc-hairline)' }}><Typography sx={{ fontSize: '10px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>OR</Typography></Divider>
                                    <Stack direction="row" spacing={1.5}>
                                         <Button
                                            variant="outlined"
                                            size="small"
                                            component="label"
                                            fullWidth
                                            sx={{ 
                                                borderRadius: '6px',
                                                textTransform: 'none',
                                                fontSize: '12px',
                                                height: 32,
                                                fontFamily: 'inherit',
                                                borderColor: 'var(--color-vc-hairline)',
                                                color: 'var(--color-vc-ink)',
                                                bgcolor: 'var(--color-vc-canvas)',
                                                '&:hover': { borderColor: 'var(--color-vc-hairline-strong)', bgcolor: 'var(--color-vc-canvas-soft)' }
                                            }}
                                        >
                                            Upload File
                                            <input
                                                type="file"
                                                hidden
                                                accept="video/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        try {
                                                            setUploading(true);
                                                            setUploadProgress(0);
                                                            const result = await uploadFile(file, (progress) => {
                                                                setUploadProgress(progress);
                                                            });
                                                            if (result.success) {
                                                                setFieldValue('demoVideoUrl', result.url);
                                                                toast.success('Video uploaded successfully');
                                                            }
                                                        } catch (error) {
                                                            toast.error('Upload failed');
                                                        } finally {
                                                            setUploading(false);
                                                        }
                                                    }
                                                }}
                                            />
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            sx={{ 
                                                borderRadius: '6px',
                                                textTransform: 'none',
                                                fontSize: '12px',
                                                height: 32,
                                                fontFamily: 'inherit',
                                                borderColor: 'var(--color-vc-hairline)',
                                                color: 'var(--color-vc-ink)',
                                                bgcolor: 'var(--color-vc-canvas)',
                                                '&:hover': { borderColor: 'var(--color-vc-hairline-strong)', bgcolor: 'var(--color-vc-canvas-soft)' }
                                            }}
                                            onClick={() => handleOpenPicker('video', 'demoVideoUrl')}
                                        >
                                            Media Hub
                                        </Button>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>

            {/* Media Picker Modal */}
            <MediaPickerModal
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                type={pickerType}
                onSelect={handleMediaSelect}
            />

            {/* Dynamic Category Creation Dialog */}
            <Dialog open={newCatOpen} onClose={() => setNewCatOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontFamily: 'inherit', fontWeight: 600 }}>Add New Category</DialogTitle>
                <DialogContent>
                    <TextField 
                        autoFocus 
                        margin="dense" 
                        label="Category Name" 
                        fullWidth 
                        value={newCatName} 
                        onChange={(e) => setNewCatName(e.target.value)} 
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setNewCatOpen(false)} disabled={addingCat} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button 
                        onClick={handleAddNewCategory} 
                        variant="contained" 
                        color="primary"
                        disabled={addingCat}
                        startIcon={addingCat ? <CircularProgress size={16} color="inherit" /> : null}
                        sx={{ textTransform: 'none', boxShadow: 'none' }}
                    >
                        {addingCat ? 'Adding...' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BasicInfoStep;
