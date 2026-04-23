import { useRef, useState, useEffect } from 'react';
import {
    Grid, TextField, MenuItem, FormControl, InputLabel, Select, Box, Typography, Button, Divider,
    Card, CardContent, InputAdornment, CircularProgress, Switch, FormControlLabel, Stack, Chip,
    ToggleButtonGroup, ToggleButton, Alert, Autocomplete
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TitleIcon from '@mui/icons-material/Title';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import CategoryIcon from '@mui/icons-material/Category';
import PaymentsIcon from '@mui/icons-material/Payments';
import SettingsIcon from '@mui/icons-material/Settings';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CollectionsIcon from '@mui/icons-material/Collections';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import GroupsIcon from '@mui/icons-material/Groups';
import VideoCallIcon from '@mui/icons-material/VideoCall';
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
                p: 1, borderRadius: '10px', bgcolor: 'primary.light', color: 'primary.main',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1e293b', lineHeight: 1.2 }}>
                    {title}
                </Typography>
                {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
            </Box>
        </Stack>
    </Box>
);

const BasicInfoStep = ({ values, errors, touched, handleChange, setFieldValue, categories = [] }) => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [allBatches, setAllBatches] = useState([]);

    useEffect(() => {
        // Fetch batches for offline course assignment
        const fetchBatches = async () => {
            try {
                const res = await api.get('/batches');
                if (res.data.success) setAllBatches(res.data.data);
            } catch {}
        };
        fetchBatches();
    }, []);

    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerType, setPickerType] = useState('image');
    const [pickerTarget, setPickerTarget] = useState('thumbnail');

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
                setFieldValue('thumbnailPreview', URL.createObjectURL(file));

                const result = await uploadFile(file);
                if (result.success) {
                    setFieldValue('thumbnail', result.url);
                    setFieldValue('thumbnailPreview', fixUrl(result.url));
                    toast.success('Image uploaded successfully');
                }
            } catch (error) {
                console.error('Upload Error:', error);
                toast.error('Failed to upload image');
                setFieldValue('thumbnailPreview', '');
            } finally {
                setUploading(false);
            }
        }
    };

    return (
        <Box sx={{ p: 1 }}>
            <Grid container spacing={3}>
                {/* Main Content Area */}
                <Grid item xs={12} md={8}>
                    <Stack spacing={3}>
                        {/* General Information Card */}
                        <Card className="premium-card">
                            <CardContent sx={{ p: 4 }}>
                                <SectionHeader 
                                    icon={<TitleIcon />} 
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
                                            InputProps={{ sx: { borderRadius: '10px' } }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth error={touched.category && Boolean(errors.category)}>
                                            <InputLabel id="category-label">Category</InputLabel>
                                            <Select
                                                labelId="category-label"
                                                id="category"
                                                name="category"
                                                value={categories.some(cat => cat._id === values.category) ? values.category : ''}
                                                label="Category"
                                                onChange={handleChange}
                                                sx={{ borderRadius: '10px' }}
                                            >
                                                <MenuItem value=""><em>Select Category</em></MenuItem>
                                                {categories.map((cat) => (
                                                    <MenuItem key={cat._id} value={cat._id}>
                                                        {cat.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel id="level-label">Level</InputLabel>
                                            <Select
                                                labelId="level-label"
                                                id="level"
                                                name="level"
                                                value={values.level}
                                                label="Level"
                                                onChange={handleChange}
                                                sx={{ borderRadius: '10px' }}
                                            >
                                                <MenuItem value="beginner">Beginner</MenuItem>
                                                <MenuItem value="intermediate">Intermediate</MenuItem>
                                                <MenuItem value="advanced">Advanced</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                                            Course Overview (Rich Text)
                                        </Typography>
                                        <Box sx={{ 
                                            '& .ql-toolbar': { 
                                                borderRadius: '12px 12px 0 0', 
                                                border: '1px solid rgba(0,0,0,0.1) !important',
                                                bgcolor: '#f8fafc' 
                                            },
                                            '& .ql-container': { 
                                                borderRadius: '0 0 12px 12px', 
                                                border: '1px solid rgba(0,0,0,0.1) !important',
                                                minHeight: '220px',
                                                fontSize: '1rem',
                                                bgcolor: 'white'
                                            },
                                            '& .ql-editor': {
                                                minHeight: '220px'
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
                        <Card className="premium-card">
                            <CardContent sx={{ p: 4 }}>
                                <SectionHeader
                                    icon={<PublicIcon />}
                                    title="Course Type"
                                    subtitle="Online courses are public; Offline courses are private and batch-only"
                                />
                                <Stack direction="row" spacing={2}>
                                    <Box
                                        onClick={() => setFieldValue('courseType', 'online')}
                                        sx={{
                                            flex: 1, p: 2.5, borderRadius: 3, cursor: 'pointer', transition: 'all 0.2s',
                                            border: '2px solid',
                                            borderColor: values.courseType !== 'offline' ? 'primary.main' : 'divider',
                                            bgcolor: values.courseType !== 'offline' ? 'rgba(99,102,241,0.08)' : 'transparent',
                                            '&:hover': { borderColor: 'primary.main' }
                                        }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <PublicIcon sx={{ color: values.courseType !== 'offline' ? 'primary.main' : 'text.secondary', fontSize: 28 }} />
                                            <Box>
                                                <Typography fontWeight={700}>Online Course</Typography>
                                                <Typography variant="caption" color="text.secondary">Visible on homepage, open to all</Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                    <Box
                                        onClick={() => setFieldValue('courseType', 'offline')}
                                        sx={{
                                            flex: 1, p: 2.5, borderRadius: 3, cursor: 'pointer', transition: 'all 0.2s',
                                            border: '2px solid',
                                            borderColor: values.courseType === 'offline' ? '#FF9800' : 'divider',
                                            bgcolor: values.courseType === 'offline' ? 'rgba(255,152,0,0.08)' : 'transparent',
                                            '&:hover': { borderColor: '#FF9800' }
                                        }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <LockIcon sx={{ color: values.courseType === 'offline' ? '#FF9800' : 'text.secondary', fontSize: 28 }} />
                                            <Box>
                                                <Typography fontWeight={700}>Offline Course</Typography>
                                                <Typography variant="caption" color="text.secondary">Private, assigned batches only</Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                </Stack>

                                {values.courseType === 'offline' && (
                                    <Box sx={{ mt: 3 }}>
                                        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                                            This course will <strong>NOT appear on the homepage</strong> or any public pages. Only students in assigned batches can view it.
                                        </Alert>
                                        <Autocomplete
                                            multiple
                                            options={allBatches}
                                            getOptionLabel={(b) => b.name}
                                            value={allBatches.filter(b => (values.assignedBatches || []).includes(b._id))}
                                            onChange={(e, newVal) => setFieldValue('assignedBatches', newVal.map(b => b._id))}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Assign Batches (required for offline)" placeholder="Select batches..."
                                                    InputProps={{ ...params.InputProps, sx: { borderRadius: '10px' } }} />
                                            )}
                                            renderTags={(tagValue, getTagProps) =>
                                                tagValue.map((option, index) => {
                                                    const { key, ...tagProps } = getTagProps({ index });
                                                    return <Chip key={key} label={option.name} {...tagProps} color="warning" size="small" />;
                                                })
                                            }
                                        />
                                        <FormControlLabel
                                            sx={{ mt: 2 }}
                                            control={
                                                <Switch
                                                    checked={values.allowOtherBatchMaterials || false}
                                                    onChange={(e) => setFieldValue('allowOtherBatchMaterials', e.target.checked)}
                                                    color="warning"
                                                />
                                            }
                                            label={
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>Allow Other Batches' Materials</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Students can view materials from other batches in this course
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pricing & GST Card */}
                        <Card className="premium-card">
                            <CardContent sx={{ p: 4 }}>
                                <SectionHeader 
                                    icon={<PaymentsIcon />} 
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
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                                inputProps: { min: 0 },
                                                sx: { borderRadius: '10px' }
                                            }}
                                            value={values.originalPrice}
                                            onChange={handleChange}
                                            helperText="Original price shown to users"
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            id="price"
                                            name="price"
                                            label="Selling Price (Active)"
                                            type="number"
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                                inputProps: { min: 0 },
                                                sx: { borderRadius: '10px' }
                                            }}
                                            value={values.price}
                                            onChange={handleChange}
                                            error={touched.price && Boolean(errors.price)}
                                            helperText={touched.price && errors.price}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel id="gst-type-label">GST Status</InputLabel>
                                            <Select
                                                labelId="gst-type-label"
                                                id="gstType"
                                                name="gstType"
                                                value={values.gstType || 'none'}
                                                label="GST Status"
                                                onChange={handleChange}
                                                sx={{ borderRadius: '10px' }}
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
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                                    inputProps: { min: 0, max: 100 },
                                                    sx: { borderRadius: '10px' }
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
                        <Card className="premium-card">
                            <CardContent sx={{ p: 4 }}>
                                <SectionHeader 
                                    icon={<SettingsIcon />} 
                                    title="Additional Options" 
                                    subtitle="Course duration, certificates, and social proof"
                                />
                                <Grid container spacing={4}>
                                    <Grid item xs={12} sm={6}>
                                        <Stack spacing={1}>
                                            <Typography variant="body2" fontWeight={600}>Course Valid For</Typography>
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
                                                    InputProps={{ sx: { borderRadius: '8px' } }}
                                                />
                                                <Select
                                                    size="small"
                                                    name="durationUnit"
                                                    value={values.durationUnit || 'months'}
                                                    onChange={handleChange}
                                                    sx={{ minWidth: 100, borderRadius: '8px' }}
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
                                            <Typography variant="body2" fontWeight={600}>Estimated Reading Time</Typography>
                                            <Stack direction="row" spacing={1}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    id="readingDurationValue"
                                                    name="readingDurationValue"
                                                    type="number"
                                                    value={values.readingDurationValue || 0}
                                                    onChange={handleChange}
                                                    InputProps={{ sx: { borderRadius: '8px' } }}
                                                />
                                                <Select
                                                    size="small"
                                                    name="readingDurationUnit"
                                                    value={values.readingDurationUnit || 'hours'}
                                                    onChange={handleChange}
                                                    sx={{ minWidth: 100, borderRadius: '8px' }}
                                                >
                                                    <MenuItem value="hours">Hours</MenuItem>
                                                    <MenuItem value="days">Days</MenuItem>
                                                </Select>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Divider />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <Box>
                                                <Typography variant="body2" fontWeight={700}>Certificate Issuance</Typography>
                                                <Typography variant="caption" color="text.secondary">Offer a verified certificate on completion</Typography>
                                            </Box>
                                            <Switch
                                                name="isCertificate"
                                                checked={values.isCertificate || false}
                                                onChange={handleChange}
                                                color="primary"
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
                                                InputProps={{ sx: { borderRadius: '10px' } }}
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
                                            InputProps={{ 
                                                startAdornment: <InputAdornment position="start">♥</InputAdornment>,
                                                sx: { borderRadius: '10px' } 
                                            }}
                                            helperText="Initial likes shown to prospective students"
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
                        <Card className="premium-card">
                            <CardContent sx={{ p: 3 }}>
                                <SectionHeader icon={<CloudUploadIcon />} title="Course Thumbnail" subtitle="Ideal size: 1280x720 (16:9)" />
                                
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: 200,
                                        border: '2px dashed #cbd5e1',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        transition: 'all 0.3s ease',
                                        bgcolor: 'rgba(0,0,0,0.02)',
                                        '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(99, 102, 241, 0.05)' }
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {uploading && (
                                        <Box sx={{
                                            position: 'absolute', inset: 0, zIndex: 10,
                                            bgcolor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <CircularProgress size={40} />
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
                                            <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                                <CloudUploadIcon color="primary" sx={{ fontSize: 32 }} />
                                            </Box>
                                            <Typography variant="body2" fontWeight={600}>Click to upload</Typography>
                                            <Typography variant="caption" color="text.secondary">v. PNG, JPG or WEBP</Typography>
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
                                        InputProps={{ 
                                            sx: { borderRadius: '8px' },
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CollectionsIcon fontSize="small" color="action" />
                                                </InputAdornment>
                                            )
                                        }}
                                        helperText="Paste a URL or use the buttons below"
                                    />

                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="small"
                                            startIcon={<CategoryIcon />}
                                            sx={{ borderRadius: '8px', textTransform: 'none', bgcolor: '#1e293b', '&:hover': { bgcolor: '#0f172a' } }}
                                            onClick={() => handleOpenPicker('image', 'thumbnail')}
                                        >
                                            Library
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            startIcon={<CloudUploadIcon />}
                                            sx={{ borderRadius: '8px', textTransform: 'none' }}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            Upload
                                        </Button>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>

                        {/* Demo/Promo Video */}
                        <Card className="premium-card">
                            <CardContent sx={{ p: 3 }}>
                                <SectionHeader icon={<VideoLibraryIcon />} title="Course Teaser" subtitle="A short preview video for students" />
                                
                                <Box sx={{ mb: 2 }}>
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
                                        InputProps={{ sx: { borderRadius: '8px' } }}
                                    />
                                    <Divider><Typography variant="caption" color="text.disabled">OR</Typography></Divider>
                                    <Stack direction="row" spacing={1}>
                                         <Button
                                            variant="outlined"
                                            size="small"
                                            component="label"
                                            fullWidth
                                            sx={{ borderRadius: '8px' }}
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
                                                            const result = await uploadFile(file);
                                                            if (result.success) {
                                                                setFieldValue('demoVideoUrl', result.url);
                                                                toast.success('Video uploaded successfully');
                                                            }
                                                        } catch (error) {
                                                            console.error('Upload error:', error);
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
                                            sx={{ borderRadius: '8px' }}
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
        </Box>
    );
};

export default BasicInfoStep;

