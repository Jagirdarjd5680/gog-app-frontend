import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Stack,
    Divider,
    Grid
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const PoliciesSettings = ({ settings, onSave, isSaving }) => {
    const [company, setCompany] = useState({
        address: settings?.company?.address || '',
        email: settings?.company?.email || '',
        contact: settings?.company?.contact || '',
        jurisdiction: settings?.company?.jurisdiction || ''
    });

    const [policies, setPolicies] = useState({
        privacyPolicy: settings?.policies?.privacyPolicy || '',
        termsAndConditions: settings?.policies?.termsAndConditions || ''
    });

    const handleCompanyChange = (e) => {
        setCompany(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePolicyChange = (value) => {
        setPolicies(prev => ({ ...prev, privacyPolicy: value }));
    };

    const handleSubmit = () => {
        onSave({ ...settings, company, policies });
    };

    return (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                Company Information & Policies
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                This information is dynamically used in generated PDFs like Registration Approvals and Fee Receipts.
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Company Address"
                        name="address"
                        multiline
                        rows={4}
                        value={company.address}
                        onChange={handleCompanyChange}
                        placeholder="424 Gala Empire,&#10;Opp. Door-darshan Tower,&#10;Ahmedabad"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label="Email Addresses (New line for multiple)"
                            name="email"
                            multiline
                            rows={2}
                            value={company.email}
                            onChange={handleCompanyChange}
                            placeholder="info@hntechno.com&#10;info.hntechno@gmail.com"
                        />
                        <Stack direction="row" spacing={2}>
                            <TextField
                                fullWidth
                                label="Contact Number"
                                name="contact"
                                value={company.contact}
                                onChange={handleCompanyChange}
                                placeholder="+91-9173026598"
                            />
                            <TextField
                                fullWidth
                                label="Jurisdiction"
                                name="jurisdiction"
                                value={company.jurisdiction}
                                onChange={handleCompanyChange}
                                placeholder="Gota"
                            />
                        </Stack>
                    </Stack>
                </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ mb: 4, '.ql-container': { height: '200px', fontSize: '16px' } }}>
                <ReactQuill
                    theme="snow"
                    value={policies.privacyPolicy}
                    onChange={handlePolicyChange}
                />
            </Box>

            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                PDF Terms & Conditions (One point per line)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                These points will appear at the bottom of the Fee Receipt PDF. Use a new line for each point.
            </Typography>
            <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                value={policies.termsAndConditions || ''}
                onChange={(e) => setPolicies(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                placeholder="1. Deposit is non-refundable.&#10;2. Price may change on current exchange rate."
                sx={{ mb: 4 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isSaving}
                    startIcon={<SaveIcon />}
                    size="large"
                >
                    {isSaving ? 'Saving...' : 'Save Policies & Info'}
                </Button>
            </Box>
        </Paper>
    );
};

export default PoliciesSettings;
