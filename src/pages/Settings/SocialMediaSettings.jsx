import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    Button,
    Box,
    IconButton,
    Stack,
    Divider,
    Paper,
    CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const SocialMediaSettings = ({ settings, onSave, isSaving }) => {
    const [socialMedia, setSocialMedia] = useState(settings?.socialMedia || [
        { platform: 'Facebook', icon: 'fb-icon', link: '', order: 0 },
        { platform: 'Twitter', icon: 'tw-icon', link: '', order: 1 },
        { platform: 'Instagram', icon: 'ig-icon', link: '', order: 2 }
    ]);

    useEffect(() => {
        if (settings?.socialMedia) {
            setSocialMedia(settings.socialMedia);
        }
    }, [settings]);

    const handleAdd = () => {
        setSocialMedia([...socialMedia, { platform: '', icon: '', link: '', order: socialMedia.length }]);
    };

    const handleRemove = (index) => {
        setSocialMedia(socialMedia.filter((_, i) => i !== index));
    };

    const handleChange = (index, field, value) => {
        const updated = [...socialMedia];
        updated[index][field] = value;
        setSocialMedia(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ socialMedia });
    };

    return (
        <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>Social Media</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage links to your social media profiles.
                        </Typography>
                    </Box>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAdd}>
                        Add Profile
                    </Button>
                </Box>

                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        {socialMedia.map((item, index) => (
                            <Paper
                                key={index}
                                variant="outlined"
                                sx={{ p: 2, borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center' }}
                            >
                                <DragIndicatorIcon color="action" />
                                <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Platform Name"
                                            value={item.platform}
                                            onChange={(e) => handleChange(index, 'platform', e.target.value)}
                                            placeholder="e.g. LinkedIn"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Icon Class/URL"
                                            value={item.icon}
                                            onChange={(e) => handleChange(index, 'icon', e.target.value)}
                                            placeholder="fab fa-linkedin"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={5}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Profile URL"
                                            value={item.link}
                                            onChange={(e) => handleChange(index, 'link', e.target.value)}
                                            placeholder="https://..."
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <IconButton color="error" onClick={() => handleRemove(index)} size="small">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))}
                    </Stack>

                    {socialMedia.length === 0 && (
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4, bgcolor: 'action.hover', borderRadius: 2 }}>
                            No social profiles added. Click "Add Profile" to start.
                        </Typography>
                    )}

                    <Button
                        variant="contained"
                        type="submit"
                        startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        sx={{ mt: 4 }}
                        size="large"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save Social Profiles'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default SocialMediaSettings;
