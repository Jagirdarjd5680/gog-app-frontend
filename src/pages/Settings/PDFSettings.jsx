import { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    TextField,
    Button,
    Divider,
    Stack,
    InputAdornment,
    Card,
    CardContent,
    MenuItem,
    Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import TagIcon from '@mui/icons-material/Tag';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';

const PDFSettings = ({ settings, onSave, isSaving }) => {
    const [pdfSettings, setPdfSettings] = useState({
        registrationPrefix: settings?.pdfSettings?.registrationPrefix || 'REG',
        receiptPrefix: settings?.pdfSettings?.receiptPrefix || 'REC',
        invoicePrefix: settings?.pdfSettings?.invoicePrefix || 'INV',
        emiReceiptPrefix: settings?.pdfSettings?.emiReceiptPrefix || 'EMI',
        admissionLetterPrefix: settings?.pdfSettings?.admissionLetterPrefix || 'ADM',
        numberPadding: settings?.pdfSettings?.numberPadding || 4,
        numberSeparator: settings?.pdfSettings?.numberSeparator || '-',
        prefixPosition: settings?.pdfSettings?.prefixPosition || 'start',
        suffix: settings?.pdfSettings?.suffix || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPdfSettings(prev => ({
            ...prev,
            [name]: name.includes('Prefix') || name === 'suffix' ? value.toUpperCase() : value
        }));
    };

    const handleSave = () => {
        onSave({ pdfSettings });
    };

    const getPreview = (prefix) => {
        const padding = pdfSettings.numberPadding || 4;
        const separator = pdfSettings.numberSeparator || '-';
        const position = pdfSettings.prefixPosition || 'start';
        const suffix = pdfSettings.suffix || '';

        const sequenceNumber = "0001".padStart(padding, '0').slice(-padding);

        let result = '';
        if (position === 'start') {
            result = `${prefix}${separator}${sequenceNumber}`;
        } else {
            result = `${sequenceNumber}${separator}${prefix}`;
        }

        if (suffix) {
            result += `${separator}${suffix}`;
        }

        return result;
    };

    const prefixFields = [
        { label: 'Registration Prefix', name: 'registrationPrefix' },
        { label: 'Receipt Prefix', name: 'receiptPrefix' },
        { label: 'Invoice Prefix', name: 'invoicePrefix' },
        { label: 'EMI Receipt Prefix', name: 'emiReceiptPrefix' },
        { label: 'Admission Letter Prefix', name: 'admissionLetterPrefix' },
    ];

    return (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Typography variant="h6" fontWeight={700}>PDF Numbering Settings</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Configure custom formats and prefixes for generated documents.</Typography>
            </Box>

            <Box sx={{ p: 3 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={7}>
                        <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TagIcon color="primary" /> Prefix Configuration
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Set the base identifiers for each document type.
                        </Typography>

                        <Stack spacing={2.5}>
                            {prefixFields.map((field) => (
                                <TextField
                                    key={field.name}
                                    label={field.label}
                                    name={field.name}
                                    value={pdfSettings[field.name]}
                                    onChange={handleChange}
                                    fullWidth
                                    size="small"
                                    helperText={<Typography variant="caption" color="primary.main" fontWeight={600}>Preview: {getPreview(pdfSettings[field.name])}</Typography>}
                                />
                            ))}
                        </Stack>

                        <Divider sx={{ my: 4 }} />

                        <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SettingsSuggestIcon color="primary" /> Formatting Options
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Customize how the sequential numbers and separators appear.
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    select fullWidth label="Prefix Position" name="prefixPosition" size="small"
                                    value={pdfSettings.prefixPosition} onChange={handleChange}
                                >
                                    <MenuItem value="start">Starting (Prefix-Number)</MenuItem>
                                    <MenuItem value="end">Ending (Number-Prefix)</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth label="Number Padding" name="numberPadding" size="small" type="number"
                                    value={pdfSettings.numberPadding} onChange={handleChange}
                                    helperText="e.g. 4 becomes 0001"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth label="Separator" name="numberSeparator" size="small"
                                    value={pdfSettings.numberSeparator} onChange={handleChange}
                                    placeholder="e.g. - or /"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth label="Global Suffix" name="suffix" size="small"
                                    value={pdfSettings.suffix} onChange={handleChange}
                                    placeholder="e.g. 2024"
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: 'rgba(0,0,0,0.02)', position: 'sticky', top: 20 }}>
                            <CardContent>
                                <Box sx={{ textAlign: 'center', mb: 2 }}>
                                    <PictureAsPdfIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.5 }} />
                                </Box>
                                <Typography variant="h6" align="center" fontWeight={700} gutterBottom>Format Previews</Typography>
                                <Stack spacing={1.5} sx={{ mt: 2 }}>
                                    {prefixFields.map(f => (
                                        <Box key={f.name} sx={{ p: 1.5, bgcolor: 'white', borderRadius: 2, border: '1px solid #eee' }}>
                                            <Typography variant="caption" color="text.secondary" display="block">{f.label}</Typography>
                                            <Typography variant="body1" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                                                #{getPreview(pdfSettings[f.name])}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                                <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                                    Changes will apply to all future documents generated. Existing document IDs in the database will not be changed.
                                </Alert>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={isSaving}
                        sx={{ borderRadius: 2, px: 4, py: 1.2 }}
                    >
                        {isSaving ? 'Saving...' : 'Save PDF Settings'}
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};

export default PDFSettings;

