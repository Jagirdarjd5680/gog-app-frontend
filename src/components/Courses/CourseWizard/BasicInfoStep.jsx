import { useRef, useState, useEffect } from 'react';
import {
    Grid, TextField, MenuItem, FormControl, InputLabel, Select, Box, Typography, Button, Divider,
    Card, CardContent, InputAdornment, CircularProgress, Switch, FormControlLabel
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TitleIcon from '@mui/icons-material/Title';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import VideoPreview from '../../Common/VideoPreview';
import { uploadFile } from '../../../utils/upload';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import MediaPickerModal from '../../Media/MediaPickerModal';
import CollectionsIcon from '@mui/icons-material/Collections';

const BasicInfoStep = ({ values, errors, touched, handleChange, setFieldValue }) => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState([]);

    // Media Picker State
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
    }, []);

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                setUploading(true);
                setFieldValue('thumbnailPreview', URL.createObjectURL(file));

                const result = await uploadFile(file);
                if (result.success) {
                    setFieldValue('thumbnail', result.url);
                    setFieldValue('thumbnailPreview', result.url);
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
            <Grid container spacing={2}>
                {/* Main Info Column */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ height: '100%', borderRadius: 1 }} variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom display="flex" alignItems="center" gap={1}>
                                <TitleIcon color="primary" fontSize="small" /> Basic Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        id="title"
                                        name="title"
                                        label="Course Title"
                                        value={values.title || ''}
                                        onChange={handleChange}
                                        error={touched.title && Boolean(errors.title)}
                                        helperText={touched.title && errors.title}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth size="small" error={touched.category && Boolean(errors.category)}>
                                        <InputLabel id="category-label">Category</InputLabel>
                                        <Select
                                            labelId="category-label"
                                            id="category"
                                            name="category"
                                            value={values.category || ''}
                                            label="Category"
                                            onChange={handleChange}
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
                                    <FormControl fullWidth size="small">
                                        <InputLabel id="level-label">Level</InputLabel>
                                        <Select
                                            labelId="level-label"
                                            id="level"
                                            name="level"
                                            value={values.level}
                                            label="Level"
                                            onChange={handleChange}
                                        >
                                            <MenuItem value="beginner">Beginner</MenuItem>
                                            <MenuItem value="intermediate">Intermediate</MenuItem>
                                            <MenuItem value="advanced">Advanced</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        id="originalPrice"
                                        name="originalPrice"
                                        label="Original Price (₹) (Fake)"
                                        type="number"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                            inputProps: { min: 0 }
                                        }}
                                        value={values.originalPrice}
                                        onChange={handleChange}
                                        helperText="Higher price shown with a strikethrough"
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        id="price"
                                        name="price"
                                        label="Selling Price (₹) (Real)"
                                        type="number"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                            inputProps: { min: 0 }
                                        }}
                                        value={values.price}
                                        onChange={handleChange}
                                        error={touched.price && Boolean(errors.price)}
                                        helperText={touched.price && errors.price}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Grid container spacing={1}>
                                        <Grid item xs={8}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                id="durationValue"
                                                name="durationValue"
                                                label="Course Duration"
                                                type="number"
                                                value={values.durationValue || 0}
                                                onChange={handleChange}
                                                helperText="0 = Lifetime"
                                            />
                                        </Grid>
                                        <Grid item xs={4}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel id="duration-unit-label">Unit</InputLabel>
                                                <Select
                                                    labelId="duration-unit-label"
                                                    id="durationUnit"
                                                    name="durationUnit"
                                                    value={values.durationUnit || 'months'}
                                                    label="Unit"
                                                    onChange={handleChange}
                                                >
                                                    <MenuItem value="days">Days</MenuItem>
                                                    <MenuItem value="months">Months</MenuItem>
                                                    <MenuItem value="years">Years</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Grid container spacing={1}>
                                        <Grid item xs={8}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                id="readingDurationValue"
                                                name="readingDurationValue"
                                                label="Reading Duration"
                                                type="number"
                                                value={values.readingDurationValue || 0}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                        <Grid item xs={4}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel id="reading-duration-unit-label">Unit</InputLabel>
                                                <Select
                                                    labelId="reading-duration-unit-label"
                                                    id="readingDurationUnit"
                                                    name="readingDurationUnit"
                                                    value={values.readingDurationUnit || 'hours'}
                                                    label="Unit"
                                                    onChange={handleChange}
                                                >
                                                    <MenuItem value="hours">Hours</MenuItem>
                                                    <MenuItem value="days">Days</MenuItem>
                                                    <MenuItem value="months">Months</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                {/* ── GST Section ── */}
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel id="gst-type-label">GST Status</InputLabel>
                                        <Select
                                            labelId="gst-type-label"
                                            id="gstType"
                                            name="gstType"
                                            value={values.gstType || 'none'}
                                            label="GST Status"
                                            onChange={handleChange}
                                        >
                                            <MenuItem value="none">No GST</MenuItem>
                                            <MenuItem value="inclusive">GST Inclusive (Included in Price)</MenuItem>
                                            <MenuItem value="exclusive">GST Exclusive (Extra on top)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {values.gstType !== 'none' && (
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            id="gstPercent"
                                            name="gstPercent"
                                            label="GST Percentage (%)"
                                            type="number"
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                                inputProps: { min: 0, max: 100 }
                                            }}
                                            value={values.gstPercent}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                )}

                                <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                                {/* ── Certificate Section ── */}
                                <Grid item xs={12} sm={4}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                id="isCertificate"
                                                name="isCertificate"
                                                checked={values.isCertificate || false}
                                                onChange={handleChange}
                                                color="primary"
                                            />
                                        }
                                        label="Issue Certificate"
                                    />
                                </Grid>

                                {values.isCertificate && (
                                    <Grid item xs={12} sm={8}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            id="certificateName"
                                            name="certificateName"
                                            label="Certificate Name (e.g. Master in Graphic Design)"
                                            value={values.certificateName || ''}
                                            onChange={handleChange}
                                            placeholder="Enter the name printed on certificate"
                                        />
                                    </Grid>
                                )}

                                <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        id="fakeLikes"
                                        name="fakeLikes"
                                        label="Fake Likes (Social Proof)"
                                        type="number"
                                        value={values.fakeLikes || 0}
                                        onChange={handleChange}
                                        helperText="These likes are added to real user likes in the app"
                                    />
                                </Grid>

                                <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        id="description"
                                        name="description"
                                        label="Description"
                                        multiline
                                        rows={4}
                                        value={values.description || ''}
                                        onChange={handleChange}
                                        error={touched.description && Boolean(errors.description)}
                                        helperText={touched.description && errors.description}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Sidebar Column */}
                <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Thumbnail Card */}
                        <Card sx={{ borderRadius: 1 }} variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle1" fontWeight={600} gutterBottom display="flex" alignItems="center" gap={1}>
                                    <CloudUploadIcon color="info" fontSize="small" /> Course Thumbnail
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Box
                                    sx={{
                                        width: '100%',
                                        height: 160,
                                        border: '1px dashed',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        bgcolor: 'background.default',
                                        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.style.borderColor = 'primary.main';
                                    }}
                                    onDragLeave={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.12)';
                                    }}
                                    onDrop={async (e) => {
                                        e.preventDefault();
                                        const file = e.dataTransfer.files[0];
                                        if (file) {
                                            try {
                                                setUploading(true);
                                                setFieldValue('thumbnailPreview', URL.createObjectURL(file));
                                                const result = await uploadFile(file);
                                                if (result.success) {
                                                    setFieldValue('thumbnail', result.url);
                                                    setFieldValue('thumbnailPreview', result.url);
                                                    toast.success('Image uploaded successfully');
                                                }
                                            } catch (error) {
                                                console.error('Upload error:', error);
                                                toast.error('Upload failed');
                                            } finally {
                                                setUploading(false);
                                            }
                                        }
                                    }}
                                >
                                    {uploading && (
                                        <Box sx={{
                                            position: 'absolute', inset: 0, zIndex: 10,
                                            bgcolor: 'rgba(255,255,255,0.7)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <CircularProgress size={30} />
                                        </Box>
                                    )}
                                    {values.thumbnailPreview ? (
                                        <img
                                            src={values.thumbnailPreview}
                                            alt="Thumbnail"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Box sx={{ textAlign: 'center' }}>
                                            <CloudUploadIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
                                            <Typography variant="body2" color="text.secondary">Drag & Drop Image</Typography>
                                            <Typography variant="caption" color="text.disabled">Supports: JPG, PNG, WEBP</Typography>
                                        </Box>
                                    )}
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                    />
                                </Box>

                                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Thumbnail URL"
                                        placeholder="Paste image URL here"
                                        value={values.thumbnail || ''}
                                        onChange={(e) => {
                                            const url = e.target.value;
                                            setFieldValue('thumbnail', url);
                                            setFieldValue('thumbnailPreview', url);
                                        }}
                                        InputProps={{
                                            sx: { borderRadius: 1 }
                                        }}
                                    />
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        startIcon={<CollectionsIcon fontSize="small" />}
                                        sx={{ borderRadius: 1 }}
                                        onClick={() => handleOpenPicker('image', 'thumbnail')}
                                    >
                                        Select from Library
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Demo Video Card */}
                        <Card sx={{ borderRadius: 1 }} variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle1" fontWeight={600} gutterBottom display="flex" alignItems="center" gap={1}>
                                    <VideoLibraryIcon color="error" fontSize="small" /> Demo Video
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        id="demoVideoUrl"
                                        name="demoVideoUrl"
                                        label="Video URL"
                                        placeholder="YouTube / Video Link"
                                        value={values.demoVideoUrl || ''}
                                        onChange={handleChange}
                                    />
                                    <Divider>OR</Divider>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            component="label"
                                            startIcon={<VideoLibraryIcon fontSize="small" />}
                                            fullWidth
                                            sx={{ borderRadius: 1 }}
                                        >
                                            Upload
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
                                            startIcon={<CollectionsIcon fontSize="small" />}
                                            fullWidth
                                            sx={{ borderRadius: 1 }}
                                            onClick={() => handleOpenPicker('video', 'demoVideoUrl')}
                                        >
                                            Library
                                        </Button>
                                    </Box>
                                </Box>

                                <Box sx={{ mt: 2 }}>
                                    <VideoPreview url={values.demoVideoUrl} height={180} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
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
