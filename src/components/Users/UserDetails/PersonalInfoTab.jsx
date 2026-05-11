import React from 'react';
import { Box, Typography, Chip, Stack, Button, Grid, Divider, TableContainer, Paper, Table, TableBody, TableRow, TableCell, TextField, Alert, CircularProgress } from '@mui/material';
import { format } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import SyncIcon from '@mui/icons-material/Sync';
import DownloadIcon from '@mui/icons-material/Download';
import { fixUrl } from '../../../utils/api';

const PersonalInfoTab = ({ 
    user, isEditingProfile, setIsEditingProfile, editedProfile, 
    handleProfileChange, handleSaveProfile, handleApproveRegistration, 
    handleRejectRegistration, handleResendLetter, actionLoading 
}) => {
    const [pdfLoading, setPdfLoading] = React.useState(false);

    const handleDownloadPdf = async () => {
        setPdfLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/users/${user._id}/download-registration-pdf`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to generate PDF');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Registration_${user.name?.replace(/ /g, '_')}_${user.rollNumber || 'N_A'}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            alert('PDF download failed: ' + e.message);
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6" fontWeight={700}>Detailed Profile</Typography>
                    <Chip 
                        label={user?.registrationStatus?.toUpperCase() || 'NONE'} 
                        size="small" 
                        color={
                            user?.registrationStatus === 'approved' ? 'success' : 
                            user?.registrationStatus === 'pending' ? 'warning' : 
                            user?.registrationStatus === 'rejected' ? 'error' : 'default'
                        }
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                    />
                </Box>
                <Stack direction="row" spacing={1}>
                    {!isEditingProfile ? (
                        <Button startIcon={<EditIcon />} onClick={() => setIsEditingProfile(true)}>Edit Profile</Button>
                    ) : (
                        <Button startIcon={<SaveIcon />} color="success" onClick={handleSaveProfile} disabled={actionLoading}>Save Profile</Button>
                    )}

                    {(user?.registrationStatus === 'pending' || user?.registrationStatus === 'none') && (
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={handleApproveRegistration}
                                disabled={actionLoading}
                            >
                                {actionLoading ? <CircularProgress size={24} color="inherit" /> : 'Approve & Send PDF'}
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleRejectRegistration}
                                disabled={actionLoading}
                            >
                                Reject
                            </Button>
                        </Stack>
                    )}
                    {user?.registrationStatus === 'approved' && (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Chip label="OFFICIALLY REGISTERED" color="success" icon={<SyncIcon />} />
                            <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                startIcon={pdfLoading ? <CircularProgress size={14} /> : <DownloadIcon />}
                                onClick={handleDownloadPdf}
                                disabled={pdfLoading}
                                sx={{ fontSize: '0.72rem', fontWeight: 700 }}
                            >
                                {pdfLoading ? 'Generating...' : 'Download PDF'}
                            </Button>
                            <Button
                                size="small"
                                color="error"
                                variant="text"
                                onClick={handleRejectRegistration}
                                disabled={actionLoading}
                                sx={{ fontSize: '0.6rem' }}
                            >
                                (Reject Instead)
                            </Button>
                        </Stack>
                    )}
                    {user?.registrationStatus === 'rejected' && (
                        <Chip label="REGISTRATION REJECTED" color="error" variant="outlined" />
                    )}
                </Stack>
            </Box>

            {user?.studentProfile || isEditingProfile ? (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="subtitle2" color="primary" fontWeight={700}>Profile Information</Typography>
                            <Chip label={user.studentProfile?.educationType || 'College'} size="small" color="secondary" variant="outlined" />
                        </Stack>
                        <Divider sx={{ mb: 2 }} />

                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                            <Table size="small">
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: 'grey.50', width: '30%', fontWeight: 600 }}>Contact Number 2</TableCell>
                                        <TableCell>{isEditingProfile ? <TextField fullWidth size="small" name="contact2" value={editedProfile.contact2 || ''} onChange={handleProfileChange} /> : user.studentProfile?.contact2 || '-'}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 600 }}>Parent Details</TableCell>
                                        <TableCell>{isEditingProfile ? <TextField fullWidth size="small" name="parentDetails" value={editedProfile.parentDetails || ''} onChange={handleProfileChange} /> : user.studentProfile?.parentDetails || '-'}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 600 }}>Date of Birth / Age</TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                {isEditingProfile ? (
                                                    <>
                                                        <TextField type="date" size="small" name="dob" value={editedProfile.dob ? format(new Date(editedProfile.dob), 'yyyy-MM-dd') : ''} onChange={handleProfileChange} />
                                                        <TextField type="number" label="Age" size="small" name="age" value={editedProfile.age || ''} onChange={handleProfileChange} sx={{ width: 80 }} />
                                                    </>
                                                ) : (
                                                    <Typography variant="body2">
                                                        {user.studentProfile?.dob && !isNaN(new Date(user.studentProfile.dob).getTime()) ? format(new Date(user.studentProfile.dob), 'PP') : '-'}
                                                        ({user.studentProfile?.age ? `${user.studentProfile.age} yrs` : '-'})
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 600 }}>Address & Pincode</TableCell>
                                        <TableCell>
                                            {isEditingProfile ? (
                                                <Stack spacing={1}>
                                                    <TextField fullWidth size="small" name="address" value={editedProfile.address || ''} onChange={handleProfileChange} label="Full Address" />
                                                    <TextField size="small" name="pincode" value={editedProfile.pincode || ''} onChange={handleProfileChange} label="Pincode" sx={{ width: 150 }} />
                                                </Stack>
                                            ) : (
                                                <Typography variant="body2">{user.studentProfile?.address || '-'} (Pincode: {user.studentProfile?.pincode || '-'})</Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 600 }}>Education Details</TableCell>
                                        <TableCell>
                                            {user.studentProfile?.educationType === 'School' ? (
                                                <Box>
                                                    <Typography variant="body2"><b>School:</b> {user.studentProfile?.schoolName || '-'}</Typography>
                                                    <Typography variant="body2"><b>Class:</b> {user.studentProfile?.className || '-'}</Typography>
                                                </Box>
                                            ) : (
                                                <Box>
                                                    <Typography variant="body2"><b>College:</b> {user.studentProfile?.collegeName || '-'}</Typography>
                                                    <Typography variant="body2"><b>Branch:</b> {user.studentProfile?.branchName || '-'}</Typography>
                                                    <Typography variant="body2"><b>Semester:</b> {user.studentProfile?.semester || '-'}</Typography>
                                                </Box>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 600 }}>Registration Info</TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2"><b>Join Date:</b> {user.studentProfile?.dateOfJoining && !isNaN(new Date(user.studentProfile.dateOfJoining).getTime()) ? format(new Date(user.studentProfile.dateOfJoining), 'PP') : '-'}</Typography>
                                                <Typography variant="body2"><b>Exp. Ending:</b> {user.studentProfile?.expectedEndingDate && !isNaN(new Date(user.studentProfile.expectedEndingDate).getTime()) ? format(new Date(user.studentProfile.expectedEndingDate), 'PP') : '-'}</Typography>
                                                <Typography variant="body2"><b>Training:</b> {user.studentProfile?.trainingMode || '-'}</Typography>
                                                <Typography variant="body2"><b>Reference:</b> {user.studentProfile?.reference || '-'}</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>

                     <Grid item xs={12}>
                        <Typography variant="subtitle2" color="primary" fontWeight={700} gutterBottom sx={{ mt: 1 }}>Documents & Photos</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            {[
                                { label: 'Passport Photo', url: user.studentProfile?.photo1 },
                                { label: 'Face ID (Biometric)', url: user.studentProfile?.biometricFace },
                                { label: 'Aadhar / ID Card', url: user.studentProfile?.idCard },
                                { label: 'Other Document', url: user.studentProfile?.document },
                                { label: 'Payment Receipt', url: user.studentProfile?.paymentScreenshot }
                            ].map((doc, idx) => (
                                doc.url && (
                                    <Grid item xs={12} sm={6} md={3} key={idx}>
                                        <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
                                            <Typography variant="caption" display="block" sx={{ mb: 1, fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>{doc.label}</Typography>
                                            <Box
                                                component="img"
                                                src={fixUrl(doc.url)}
                                                alt={doc.label}
                                                sx={{ width: '100%', height: 140, objectFit: 'contain', cursor: 'pointer', borderRadius: 1, mb: 1, bgcolor: '#fff' }}
                                                onClick={() => window.open(fixUrl(doc.url), '_blank')}
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Invalid+Path'; }}
                                            />
                                            <Button fullWidth size="small" variant="text" startIcon={<DownloadIcon />} onClick={() => window.open(fixUrl(doc.url), '_blank')} sx={{ mt: 'auto', fontSize: '0.7rem' }}>View Full</Button>
                                        </Paper>
                                    </Grid>
                                )
                            ))}
                            {!(user.studentProfile?.photo1 || user.studentProfile?.idCard || user.studentProfile?.document || user.studentProfile?.paymentScreenshot) && (
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>No documents uploaded yet.</Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="primary" fontWeight={700} gutterBottom sx={{ mt: 1 }}>Fees & Payment Verification</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                            <Table size="small">
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: 'grey.50', width: '30%', fontWeight: 600 }}>Fees Summary</TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={4}>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">Total Fees</Typography>
                                                    <Typography variant="body1" fontWeight={700}>₹{user.studentProfile?.fees || 0}</Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">Total Installments</Typography>
                                                    <Typography variant="body1" fontWeight={700}>₹{user.studentProfile?.totalInstallment || 0}</Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">Net Fees (Total Payable)</Typography>
                                                    <Typography variant="body1" fontWeight={700} color="primary">₹{user.studentProfile?.totalFees || 0}</Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 600 }}>Payment Details</TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2"><b>Method:</b> {user.studentProfile?.modeOfPayment || 'Offline'}</Typography>
                                                {user.studentProfile?.modeOfPayment === 'Online' && (
                                                    <Typography variant="body2"><b>Transaction ID:</b> {user.studentProfile?.transactionId || '-'}</Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            ) : (
                <Alert severity="info">Student has not filled their detailed profile yet.</Alert>
            )}
        </>
    );
};

export default PersonalInfoTab;
