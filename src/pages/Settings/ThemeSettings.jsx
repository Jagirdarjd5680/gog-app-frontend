import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    Button,
    Box,
    FormControlLabel,
    Switch,
    Divider,
    CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const ThemeSettings = ({ settings, onSave, isSaving }) => {
    const [formData, setFormData] = useState(settings?.theme || {});

    useEffect(() => {
        if (settings?.theme) {
            setFormData(settings.theme);
        }
    }, [settings]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ theme: formData });
    };

    return (
        <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>Theme Design</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Customize the look and feel of your application.
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>Primary Color</Typography>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <input
                                    type="color"
                                    name="primaryColor"
                                    value={formData.primaryColor || '#3f51b5'}
                                    onChange={handleChange}
                                    style={{ width: 60, height: 40, border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                />
                                <TextField
                                    size="small"
                                    name="primaryColor"
                                    value={formData.primaryColor || '#3f51b5'}
                                    onChange={handleChange}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>Secondary Color</Typography>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <input
                                    type="color"
                                    name="secondaryColor"
                                    value={formData.secondaryColor || '#f50057'}
                                    onChange={handleChange}
                                    style={{ width: 60, height: 40, border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                />
                                <TextField
                                    size="small"
                                    name="secondaryColor"
                                    value={formData.secondaryColor || '#f50057'}
                                    onChange={handleChange}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="subtitle1" fontWeight={700} gutterBottom color="primary">Sidebar Theme</Typography>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>Sidebar Background</Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <input type="color" name="sidebarBg" value={formData.sidebarBg || '#ffffff'} onChange={handleChange} style={{ width: 40, height: 32, border: 'none', borderRadius: 4 }} />
                                <TextField size="small" name="sidebarBg" value={formData.sidebarBg || '#ffffff'} onChange={handleChange} />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>Menu Text Color</Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <input type="color" name="menuText" value={formData.menuText || '#333333'} onChange={handleChange} style={{ width: 40, height: 32, border: 'none', borderRadius: 4 }} />
                                <TextField size="small" name="menuText" value={formData.menuText || '#333333'} onChange={handleChange} />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}></Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>Active Menu Bg</Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <input type="color" name="activeMenuBg" value={formData.activeMenuBg || '#3f51b5'} onChange={handleChange} style={{ width: 40, height: 32, border: 'none', borderRadius: 4 }} />
                                <TextField size="small" name="activeMenuBg" value={formData.activeMenuBg || '#3f51b5'} onChange={handleChange} />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>Active Menu Text</Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <input type="color" name="activeMenuText" value={formData.activeMenuText || '#ffffff'} onChange={handleChange} style={{ width: 40, height: 32, border: 'none', borderRadius: 4 }} />
                                <TextField size="small" name="activeMenuText" value={formData.activeMenuText || '#ffffff'} onChange={handleChange} />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}></Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>Hover Menu Bg</Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <input type="color" name="hoverMenuBg" value={formData.hoverMenuBg || '#f5f5f5'} onChange={handleChange} style={{ width: 40, height: 32, border: 'none', borderRadius: 4 }} />
                                <TextField size="small" name="hoverMenuBg" value={formData.hoverMenuBg || '#f5f5f5'} onChange={handleChange} />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>Hover Menu Text</Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <input type="color" name="hoverMenuText" value={formData.hoverMenuText || '#333333'} onChange={handleChange} style={{ width: 40, height: 32, border: 'none', borderRadius: 4 }} />
                                <TextField size="small" name="hoverMenuText" value={formData.hoverMenuText || '#333333'} onChange={handleChange} />
                            </Box>
                        </Grid>

                        <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.darkMode ?? false}
                                        onChange={handleChange}
                                        name="darkMode"
                                    />
                                }
                                label="Default Dark Mode"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                type="submit"
                                startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Applying...' : 'Save Theme Settings'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ThemeSettings;
