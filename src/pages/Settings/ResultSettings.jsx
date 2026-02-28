import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, TextField, Button, Grid, FormControlLabel, Switch, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const ResultSettings = ({ settings, onSave, isSaving }) => {
    const [formData, setFormData] = useState(settings?.result || {
        showRank: true,
        showScorePercentage: true,
        enableCertificate: true,
        passingPercentage: 40
    });

    useEffect(() => {
        if (settings?.result) {
            setFormData(settings.result);
        }
    }, [settings]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ result: formData });
    };

    return (
        <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>Exam Result Settings</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Control how results and certificates are displayed to students.
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={<Switch checked={formData.showRank} onChange={handleChange} name="showRank" />}
                                label="Show Rank to Students"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={<Switch checked={formData.showScorePercentage} onChange={handleChange} name="showScorePercentage" />}
                                label="Show Score Percentage"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={<Switch checked={formData.enableCertificate} onChange={handleChange} name="enableCertificate" />}
                                label="Enable Auto-Generation of Certificates"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Default Passing Percentage (%)"
                                name="passingPercentage"
                                value={formData.passingPercentage}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                type="submit"
                                startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                sx={{ mt: 2 }}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Result Settings'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ResultSettings;
