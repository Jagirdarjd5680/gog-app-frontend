import React from 'react';
import { Box, Typography, Chip, Stack, Button, Grid, Divider, TableContainer, Paper, Table, TableBody, TableRow, TableCell, TextField, Alert, CircularProgress } from '@mui/material';
import { format } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import SyncIcon from '@mui/icons-material/Sync';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import { fixUrl } from '../../../utils/api';

const PersonalInfoTab = ({
    user, isEditingProfile, setIsEditingProfile, editedProfile,
    handleProfileChange, handleSaveProfile, handleApproveRegistration,
    handleRejectRegistration, handleResendLetter, handleSetPassword, actionLoading
}) => {
    const [pdfLoading, setPdfLoading] = React.useState(false);
    const [newPassword, setNewPassword] = React.useState('');
    const [passwordSaving, setPasswordSaving] = React.useState(false);

    const onSetPassword = async () => {
        if (!newPassword || newPassword.length < 6) return;
        setPasswordSaving(true);
        try {
            await handleSetPassword(newPassword);
            setNewPassword('');
        } finally {
            setPasswordSaving(false);
        }
    };

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
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography sx={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>
                        Detailed Profile
                    </Typography>
                    <Chip 
                        label={user?.registrationStatus?.toUpperCase() || 'NONE'} 
                        size="small" 
                        sx={{ 
                            fontWeight: 600, 
                            fontSize: '9px',
                            borderRadius: '4px',
                            height: 18,
                            bgcolor: user?.registrationStatus === 'approved' ? 'var(--color-vc-success-soft)' :
                                     user?.registrationStatus === 'pending' ? 'var(--color-vc-warning-soft)' :
                                     user?.registrationStatus === 'rejected' ? 'var(--color-vc-error-soft)' : 'var(--color-vc-canvas-soft)',
                            color: user?.registrationStatus === 'approved' ? 'var(--color-vc-success-deep)' :
                                   user?.registrationStatus === 'pending' ? 'var(--color-vc-warning-deep)' :
                                   user?.registrationStatus === 'rejected' ? 'var(--color-vc-error-deep)' : 'var(--color-vc-mute)',
                            border: '1px solid',
                            borderColor: user?.registrationStatus === 'approved' ? 'var(--color-vc-success-soft)' :
                                         user?.registrationStatus === 'pending' ? 'var(--color-vc-warning-soft)' :
                                         user?.registrationStatus === 'rejected' ? 'var(--color-vc-error-soft)' : 'var(--color-vc-hairline)'
                        }}
                    />
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {!isEditingProfile ? (
                        <Button 
                            startIcon={<EditIcon sx={{ fontSize: 14 }} />} 
                            onClick={() => setIsEditingProfile(true)}
                            sx={{
                                textTransform: 'none', fontSize: '12px', fontWeight: 500, fontFamily: 'inherit',
                                borderRadius: '6px', color: 'var(--color-vc-ink)', borderColor: 'var(--color-vc-hairline)',
                                bgcolor: 'var(--color-vc-canvas)', '&:hover': { bgcolor: 'var(--color-vc-canvas-soft)', borderColor: 'var(--color-vc-hairline-strong)' }
                            }}
                            variant="outlined"
                        >
                            Edit Profile
                        </Button>
                    ) : (
                        <Button 
                            startIcon={<SaveIcon sx={{ fontSize: 14 }} />} 
                            onClick={handleSaveProfile} 
                            disabled={actionLoading}
                            sx={{
                                textTransform: 'none', fontSize: '12px', fontWeight: 500, fontFamily: 'inherit',
                                borderRadius: '6px', color: '#fff', bgcolor: 'var(--color-vc-success)',
                                boxShadow: 'none', '&:hover': { bgcolor: 'var(--color-vc-success)', opacity: 0.9, boxShadow: 'none' }
                            }}
                            variant="contained"
                        >
                            Save Profile
                        </Button>
                    )}

                    <Button
                        startIcon={<EmailIcon sx={{ fontSize: 14 }} />}
                        onClick={handleResendLetter}
                        disabled={actionLoading}
                        variant="outlined"
                        sx={{
                            textTransform: 'none', fontSize: '12px', fontWeight: 500, fontFamily: 'inherit',
                            borderRadius: '6px', color: 'var(--color-vc-ink)', borderColor: 'var(--color-vc-hairline)',
                            bgcolor: 'var(--color-vc-canvas)', '&:hover': { bgcolor: 'var(--color-vc-canvas-soft)', borderColor: 'var(--color-vc-hairline-strong)' }
                        }}
                    >
                        {actionLoading ? 'Sending...' : 'Resend Registration Letter'}
                    </Button>

                    {(user?.registrationStatus === 'pending' || user?.registrationStatus === 'none') && (
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="contained"
                                onClick={handleApproveRegistration}
                                disabled={actionLoading}
                                sx={{
                                    textTransform: 'none', fontSize: '12px', fontWeight: 500, fontFamily: 'inherit',
                                    borderRadius: '6px', color: '#fff', bgcolor: 'var(--color-vc-primary)',
                                    boxShadow: 'none', '&:hover': { bgcolor: 'var(--color-vc-primary)', opacity: 0.9, boxShadow: 'none' }
                                }}
                            >
                                {actionLoading ? <CircularProgress size={16} color="inherit" /> : 'Approve & Send PDF'}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleRejectRegistration}
                                disabled={actionLoading}
                                sx={{
                                    textTransform: 'none', fontSize: '12px', fontWeight: 500, fontFamily: 'inherit',
                                    borderRadius: '6px', color: 'var(--color-vc-error-deep)', borderColor: 'var(--color-vc-error-soft)',
                                    bgcolor: 'var(--color-vc-canvas)', '&:hover': { bgcolor: 'var(--color-vc-error-soft)', borderColor: 'var(--color-vc-error-soft)' }
                                }}
                            >
                                Reject
                            </Button>
                        </Stack>
                    )}
                    {user?.registrationStatus === 'approved' && (
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                            <Chip 
                                label="OFFICIALLY REGISTERED" 
                                size="small" 
                                icon={<SyncIcon sx={{ fontSize: '12px !important' }} />}
                                sx={{ 
                                    fontWeight: 600, fontSize: '10px', height: 24, borderRadius: '4px',
                                    bgcolor: 'var(--color-vc-success-soft)', color: 'var(--color-vc-success-deep)' 
                                }}
                            />
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={pdfLoading ? <CircularProgress size={12} color="inherit" /> : <DownloadIcon sx={{ fontSize: 14 }} />}
                                onClick={handleDownloadPdf}
                                disabled={pdfLoading}
                                sx={{
                                    textTransform: 'none', fontSize: '11px', fontWeight: 500, fontFamily: 'inherit',
                                    borderRadius: '6px', color: 'var(--color-vc-primary)', borderColor: 'var(--color-vc-hairline)',
                                    '&:hover': { borderColor: 'var(--color-vc-hairline-strong)', bgcolor: 'var(--color-vc-canvas-soft)' }
                                }}
                            >
                                {pdfLoading ? 'Generating...' : 'Download PDF'}
                            </Button>
                            <Button
                                size="small"
                                onClick={handleRejectRegistration}
                                disabled={actionLoading}
                                sx={{ 
                                    textTransform: 'none', fontSize: '11px', fontWeight: 500, fontFamily: 'inherit',
                                    color: 'var(--color-vc-error-deep)', '&:hover': { bgcolor: 'var(--color-vc-error-soft)' } 
                                }}
                            >
                                (Reject Instead)
                            </Button>
                        </Stack>
                    )}
                    {user?.registrationStatus === 'rejected' && (
                        <Chip 
                            label="REGISTRATION REJECTED" 
                            size="small"
                            sx={{ 
                                fontWeight: 600, fontSize: '10px', height: 24, borderRadius: '4px',
                                bgcolor: 'var(--color-vc-error-soft)', color: 'var(--color-vc-error-deep)' 
                            }} 
                        />
                    )}
                </Stack>
            </Box>

            <Box sx={{ mb: 3, p: 2, borderRadius: '6px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)' }}>
                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-vc-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>
                    Login & Security
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="flex-start" flexWrap="wrap" useFlexGap>
                    <TextField
                        size="small"
                        type="password"
                        label="Set / Change Password"
                        placeholder="Minimum 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        sx={{ minWidth: 240, '& .MuiInputBase-root': { height: 36, fontSize: '12px', fontFamily: 'inherit' } }}
                    />
                    <Button
                        variant="contained"
                        onClick={onSetPassword}
                        disabled={passwordSaving || !newPassword || newPassword.length < 6}
                        sx={{
                            textTransform: 'none', fontSize: '12px', fontWeight: 500, fontFamily: 'inherit', height: 36,
                            borderRadius: '6px', color: '#fff', bgcolor: 'var(--color-vc-primary)',
                            boxShadow: 'none', '&:hover': { bgcolor: 'var(--color-vc-primary)', opacity: 0.9, boxShadow: 'none' }
                        }}
                    >
                        {passwordSaving ? 'Saving...' : 'Set Password'}
                    </Button>
                </Stack>
                <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', mt: 1 }}>
                    Student can log in with this password using their email{user?.phone ? ' or phone number' : ''} once set.
                </Typography>
            </Box>

            {user?.studentProfile || isEditingProfile ? (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-vc-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Profile Information
                            </Typography>
                            <Chip 
                                label={user.studentProfile?.educationType || 'College'} 
                                size="small" 
                                sx={{ 
                                    fontWeight: 500, fontSize: '10px', height: 20, borderRadius: '4px',
                                    bgcolor: 'var(--color-vc-canvas-soft)', color: 'var(--color-vc-ink)', border: '1px solid var(--color-vc-hairline)' 
                                }}
                            />
                        </Stack>
                        <Divider sx={{ mb: 2, borderColor: 'var(--color-vc-hairline)' }} />

                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '6px', borderColor: 'var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none' }}>
                            <Table size="small">
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: 'var(--color-vc-canvas-soft)', width: '30%', fontWeight: 600, fontSize: '12px', color: 'var(--color-vc-ink)', borderRight: '1px solid var(--color-vc-hairline)', borderBottom: '1px solid var(--color-vc-hairline)' }}>Contact Number 2</TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', py: 1 }}>{isEditingProfile ? <TextField fullWidth size="small" name="contact2" value={editedProfile.contact2 || ''} onChange={handleProfileChange} sx={{ '& .MuiInputBase-root': { height: 32, fontSize: '12px', fontFamily: 'inherit' } }} /> : <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '12px', color: 'var(--color-vc-body)' }}>{user.studentProfile?.contact2 || '-'}</span>}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: 'var(--color-vc-canvas-soft)', fontWeight: 600, fontSize: '12px', color: 'var(--color-vc-ink)', borderRight: '1px solid var(--color-vc-hairline)', borderBottom: '1px solid var(--color-vc-hairline)' }}>Parent Details</TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', py: 1 }}>{isEditingProfile ? <TextField fullWidth size="small" name="parentDetails" value={editedProfile.parentDetails || ''} onChange={handleProfileChange} sx={{ '& .MuiInputBase-root': { height: 32, fontSize: '12px', fontFamily: 'inherit' } }} /> : <span style={{ fontSize: '12px', color: 'var(--color-vc-body)' }}>{user.studentProfile?.parentDetails || '-'}</span>}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: 'var(--color-vc-canvas-soft)', fontWeight: 600, fontSize: '12px', color: 'var(--color-vc-ink)', borderRight: '1px solid var(--color-vc-hairline)', borderBottom: '1px solid var(--color-vc-hairline)' }}>Date of Birth / Age</TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', py: 1 }}>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                {isEditingProfile ? (
                                                    <>
                                                        <TextField type="date" size="small" name="dob" value={editedProfile.dob ? format(new Date(editedProfile.dob), 'yyyy-MM-dd') : ''} onChange={handleProfileChange} sx={{ '& .MuiInputBase-root': { height: 32, fontSize: '12px' } }} />
                                                        <TextField type="number" label="Age" size="small" name="age" value={editedProfile.age || ''} onChange={handleProfileChange} sx={{ width: 80, '& .MuiInputBase-root': { height: 32, fontSize: '12px' } }} />
                                                    </>
                                                ) : (
                                                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-body)' }}>
                                                        {user.studentProfile?.dob && !isNaN(new Date(user.studentProfile.dob).getTime()) ? format(new Date(user.studentProfile.dob), 'PP') : '-'}
                                                        {user.studentProfile?.age ? ` (${user.studentProfile.age} yrs)` : ''}
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: 'var(--color-vc-canvas-soft)', fontWeight: 600, fontSize: '12px', color: 'var(--color-vc-ink)', borderRight: '1px solid var(--color-vc-hairline)', borderBottom: '1px solid var(--color-vc-hairline)' }}>Address & Pincode</TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', py: 1 }}>
                                            {isEditingProfile ? (
                                                <Stack spacing={1}>
                                                    <TextField fullWidth size="small" name="address" value={editedProfile.address || ''} onChange={handleProfileChange} label="Full Address" sx={{ '& .MuiInputBase-root': { height: 32, fontSize: '12px' } }} />
                                                    <TextField size="small" name="pincode" value={editedProfile.pincode || ''} onChange={handleProfileChange} label="Pincode" sx={{ width: 150, '& .MuiInputBase-root': { height: 32, fontSize: '12px' } }} />
                                                </Stack>
                                            ) : (
                                                <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-body)' }}>{user.studentProfile?.address || '-'} (Pincode: <span style={{ fontFamily: '"JetBrains Mono", monospace' }}>{user.studentProfile?.pincode || '-'}</span>)</Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: 'var(--color-vc-canvas-soft)', fontWeight: 600, fontSize: '12px', color: 'var(--color-vc-ink)', borderRight: '1px solid var(--color-vc-hairline)', borderBottom: '1px solid var(--color-vc-hairline)' }}>Education Details</TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', py: 1.5 }}>
                                            {user.studentProfile?.educationType === 'School' ? (
                                                <Box>
                                                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-body)' }}><b>School:</b> {user.studentProfile?.schoolName || '-'}</Typography>
                                                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-body)', mt: 0.5 }}><b>Class:</b> {user.studentProfile?.className || '-'}</Typography>
                                                </Box>
                                            ) : (
                                                <Box>
                                                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-body)' }}><b>College:</b> {user.studentProfile?.collegeName || '-'}</Typography>
                                                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-body)', mt: 0.5 }}><b>Branch:</b> {user.studentProfile?.branchName || '-'}</Typography>
                                                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-body)', mt: 0.5 }}><b>Semester:</b> {user.studentProfile?.semester || '-'}</Typography>
                                                </Box>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: 'var(--color-vc-canvas-soft)', fontWeight: 600, fontSize: '12px', color: 'var(--color-vc-ink)', borderRight: '1px solid var(--color-vc-hairline)' }}>Registration Info</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Box>
                                                <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-body)' }}><b>Join Date:</b> {user.studentProfile?.dateOfJoining && !isNaN(new Date(user.studentProfile.dateOfJoining).getTime()) ? format(new Date(user.studentProfile.dateOfJoining), 'PP') : '-'}</Typography>
                                                <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-body)', mt: 0.5 }}><b>Exp. Ending:</b> {user.studentProfile?.expectedEndingDate && !isNaN(new Date(user.studentProfile.expectedEndingDate).getTime()) ? format(new Date(user.studentProfile.expectedEndingDate), 'PP') : '-'}</Typography>
                                                <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-body)', mt: 0.5 }}><b>Training:</b> {user.studentProfile?.trainingMode || '-'}</Typography>
                                                <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-body)', mt: 0.5 }}><b>Reference:</b> {user.studentProfile?.reference || '-'}</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-vc-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', mt: 1, mb: 1 }}>
                            Documents & Photos
                        </Typography>
                        <Divider sx={{ mb: 2, borderColor: 'var(--color-vc-hairline)' }} />
                        <Grid container spacing={2}>
                            {[
                                { label: 'Passport Photo', url: user.studentProfile?.photo1 },
                                { label: 'Face ID (Biometric)', url: user.studentProfile?.biometricFace },
                                { label: 'Aadhar / ID Card', url: user.studentProfile?.idCard },
                                { label: 'Other Document', url: user.studentProfile?.document },
                                { label: 'Payment Receipt', url: user.studentProfile?.paymentScreenshot }
                            ].map((doc, idx) => (
                                doc.url && (
                                    <Grid item xs={12} sm={6} md={2.4} key={idx}>
                                        <Paper 
                                            variant="outlined" 
                                            sx={{ 
                                                p: 1.5, 
                                                textAlign: 'center', 
                                                height: '100%', 
                                                display: 'flex', 
                                                flexDirection: 'column', 
                                                bgcolor: 'var(--color-vc-canvas-soft)', 
                                                borderColor: 'var(--color-vc-hairline)',
                                                borderRadius: '6px'
                                            }}
                                        >
                                            <Typography sx={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-vc-mute)', mb: 1, display: 'block' }}>
                                                {doc.label}
                                            </Typography>
                                            <Box
                                                component="img"
                                                src={fixUrl(doc.url)}
                                                alt={doc.label}
                                                sx={{ 
                                                    width: '100%', 
                                                    height: 120, 
                                                    objectFit: 'cover', 
                                                    cursor: 'pointer', 
                                                    borderRadius: '4px', 
                                                    mb: 1.5, 
                                                    bgcolor: 'var(--color-vc-canvas)', 
                                                    border: '1px solid var(--color-vc-hairline)' 
                                                }}
                                                onClick={() => window.open(fixUrl(doc.url), '_blank')}
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Invalid+Path'; }}
                                            />
                                            <Button 
                                                fullWidth 
                                                size="small" 
                                                variant="text" 
                                                startIcon={<DownloadIcon sx={{ fontSize: 12 }} />} 
                                                onClick={() => window.open(fixUrl(doc.url), '_blank')} 
                                                sx={{ 
                                                    mt: 'auto', 
                                                    fontSize: '11px', 
                                                    fontFamily: 'inherit',
                                                    textTransform: 'none',
                                                    color: 'var(--color-vc-link)' 
                                                }}
                                            >
                                                View Full
                                            </Button>
                                        </Paper>
                                    </Grid>
                                )
                            ))}
                            {!(user.studentProfile?.photo1 || user.studentProfile?.biometricFace || user.studentProfile?.idCard || user.studentProfile?.document || user.studentProfile?.paymentScreenshot) && (
                                <Grid item xs={12}>
                                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)', fontStyle: 'italic' }}>
                                        No documents uploaded yet.
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-vc-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', mt: 1, mb: 1 }}>
                            Fees & Payment Verification
                        </Typography>
                        <Divider sx={{ mb: 2, borderColor: 'var(--color-vc-hairline)' }} />
                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '6px', borderColor: 'var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none' }}>
                            <Table size="small">
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: 'var(--color-vc-canvas-soft)', width: '30%', fontWeight: 600, fontSize: '12px', color: 'var(--color-vc-ink)', borderRight: '1px solid var(--color-vc-hairline)', borderBottom: '1px solid var(--color-vc-hairline)' }}>Fees Summary</TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', py: 1.5 }}>
                                            <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
                                                <Box>
                                                    <Typography sx={{ fontSize: '10px', color: 'var(--color-vc-mute)', display: 'block' }}>Total Fees</Typography>
                                                    <Typography sx={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-vc-ink)', fontFamily: '"JetBrains Mono", monospace' }}>₹{user.studentProfile?.fees || 0}</Typography>
                                                </Box>
                                                <Box>
                                                    <Typography sx={{ fontSize: '10px', color: 'var(--color-vc-mute)', display: 'block' }}>Total Installments</Typography>
                                                    <Typography sx={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-vc-ink)', fontFamily: '"JetBrains Mono", monospace' }}>₹{user.studentProfile?.totalInstallment || 0}</Typography>
                                                </Box>
                                                <Box>
                                                    <Typography sx={{ fontSize: '10px', color: 'var(--color-vc-mute)', display: 'block' }}>Net Fees (Payable)</Typography>
                                                    <Typography sx={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-vc-link-deep)', fontFamily: '"JetBrains Mono", monospace' }}>₹{user.studentProfile?.totalFees || 0}</Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: 'var(--color-vc-canvas-soft)', fontWeight: 600, fontSize: '12px', color: 'var(--color-vc-ink)', borderRight: '1px solid var(--color-vc-hairline)' }}>Payment Details</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Box>
                                                <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-body)' }}><b>Method:</b> {user.studentProfile?.modeOfPayment || 'Offline'}</Typography>
                                                {user.studentProfile?.modeOfPayment === 'Online' && (
                                                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-body)', mt: 0.5 }}><b>Transaction ID:</b> <span style={{ fontFamily: '"JetBrains Mono", monospace' }}>{user.studentProfile?.transactionId || '-'}</span></Typography>
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
                <Alert 
                    severity="info"
                    sx={{ 
                        borderRadius: '6px',
                        bgcolor: 'var(--color-vc-canvas-soft)',
                        border: '1px solid var(--color-vc-hairline)',
                        color: 'var(--color-vc-body)',
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        '& .MuiAlert-message': { fontFamily: 'inherit' }
                    }}
                >
                    Student has not filled their detailed profile yet.
                </Alert>
            )}
        </>
    );
};

export default PersonalInfoTab;
