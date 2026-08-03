import React, { useState } from 'react';
import {
    Box, Typography, Accordion, AccordionSummary, AccordionDetails,
    Stack, Chip, TableContainer, Paper, Table, TableHead, TableRow,
    TableCell, TableBody, Link, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import { format } from 'date-fns';
import { fixUrl } from '../../../utils/api';

const SubmissionsTab = ({ submissions, onGrade }) => {
    const [gradingSub, setGradingSub] = useState(null);
    const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });

    const handleOpenGrading = (sub) => {
        setGradingSub(sub);
        setGradeData({
            grade: sub.submissionDetails?.grade || '',
            feedback: sub.submissionDetails?.feedback || ''
        });
    };

    const handleSave = async () => {
        await onGrade(gradingSub.assignmentId, gradingSub.submissionDetails._id, gradeData);
        setGradingSub(null);
    };

    return (
        <>
            <Typography sx={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-vc-ink)', mb: 2, fontFamily: 'inherit' }}>
                Assignment Submissions
            </Typography>
            {submissions.length > 0 ? (
                <Box sx={{ mt: 2 }}>
                    {Object.entries(
                        (submissions || []).filter(s => s !== null).reduce((acc, sub) => {
                            const batchName = sub.batch || 'General';
                            if (!acc[batchName]) acc[batchName] = [];
                            acc[batchName].push(sub);
                            return acc;
                        }, {})
                    ).map(([batchName, batchSubmissions], idx) => (
                        <Accordion 
                            key={batchName} 
                            defaultExpanded={idx === 0} 
                            sx={{ 
                                mb: 2, 
                                borderRadius: '6px !important', 
                                overflow: 'hidden', 
                                border: '1px solid var(--color-vc-hairline)',
                                bgcolor: 'var(--color-vc-canvas)',
                                boxShadow: 'none',
                                '&::before': { display: 'none' }
                            }}
                        >
                            <AccordionSummary 
                                expandIcon={<ExpandMoreIcon sx={{ fontSize: 18, color: 'var(--color-vc-mute)' }} />} 
                                sx={{ 
                                    bgcolor: 'var(--color-vc-canvas-soft)', 
                                    borderBottom: '1px solid var(--color-vc-hairline)',
                                    minHeight: '44px !important',
                                    '& .MuiAccordionSummary-content': { my: '8px !important' }
                                }}
                            >
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <FolderIcon sx={{ color: 'var(--color-vc-mute)', fontSize: 18 }} />
                                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)' }}>
                                        {batchName}
                                    </Typography>
                                    <Chip 
                                        label={`${batchSubmissions.length} Items`} 
                                        size="small" 
                                        sx={{ 
                                            height: 18, 
                                            fontSize: '10px', 
                                            borderRadius: '4px',
                                            bgcolor: 'var(--color-vc-canvas)',
                                            color: 'var(--color-vc-mute)',
                                            border: '1px solid var(--color-vc-hairline)',
                                            fontWeight: 500
                                        }} 
                                    />
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0 }}>
                                <TableContainer component={Paper} elevation={0} sx={{ border: 'none', bgcolor: 'transparent' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)' }}>Assignment</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)' }}>Submitted On</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)' }}>Work</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)' }}>Grade</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '10px', color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)' }}>Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {batchSubmissions.map((sub) => (
                                                <TableRow key={sub.assignmentId} hover sx={{ '&:hover': { bgcolor: 'var(--color-vc-canvas-soft)' } }}>
                                                    <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', py: 1 }}>
                                                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-vc-ink)' }}>{sub.title || 'Untitled Assignment'}</Typography>
                                                        <Typography sx={{ fontSize: '10px', color: 'var(--color-vc-mute)' }}>{sub.course || 'General'}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', fontSize: '11px', color: 'var(--color-vc-body)', fontFamily: '"JetBrains Mono", monospace' }}>
                                                        {sub.submissionDetails?.submittedAt
                                                            ? format(new Date(sub.submissionDetails.submittedAt), 'PPp')
                                                            : 'Not Submitted'}
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', fontSize: '12px' }}>
                                                        {sub.submissionDetails?.fileUrl ? (
                                                            <Link href={fixUrl(sub.submissionDetails.fileUrl)} target="_blank" underline="hover" sx={{ fontWeight: 600, color: 'var(--color-vc-link)' }}>File</Link>
                                                        ) : sub.submissionDetails?.textAnswer ? (
                                                            <Typography sx={{ fontSize: '11px', display: 'block', maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-vc-body)' }}>
                                                                {sub.submissionDetails.textAnswer}
                                                            </Typography>
                                                        ) : 'N/A'}
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)' }}>
                                                        {sub.submissionDetails?.status === 'graded' ? (
                                                            <Chip 
                                                                label={`${sub.submissionDetails.grade}/100`} 
                                                                size="small" 
                                                                sx={{ 
                                                                    fontWeight: 700, 
                                                                    fontSize: '10px', 
                                                                    borderRadius: '4px',
                                                                    height: 20,
                                                                    bgcolor: 'var(--color-vc-success-soft)',
                                                                    color: 'var(--color-vc-success-deep)'
                                                                }} 
                                                            />
                                                        ) : sub.submitted ? (
                                                            <Chip 
                                                                label="PENDING" 
                                                                size="small" 
                                                                sx={{ 
                                                                    fontWeight: 700, 
                                                                    fontSize: '10px', 
                                                                    borderRadius: '4px',
                                                                    height: 20,
                                                                    bgcolor: 'var(--color-vc-warning-soft)',
                                                                    color: 'var(--color-vc-warning-deep)'
                                                                }} 
                                                            />
                                                        ) : (
                                                            <Chip 
                                                                label="MISSING" 
                                                                size="small" 
                                                                sx={{ 
                                                                    fontSize: '10px', 
                                                                    borderRadius: '4px',
                                                                    height: 20,
                                                                    bgcolor: 'var(--color-vc-canvas-soft)',
                                                                    color: 'var(--color-vc-mute)',
                                                                    border: '1px solid var(--color-vc-hairline)'
                                                                }} 
                                                            />
                                                        )}
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)' }}>
                                                        {sub.submitted && (
                                                            <Button 
                                                                size="small" 
                                                                onClick={() => handleOpenGrading(sub)} 
                                                                sx={{ 
                                                                    textTransform: 'none', 
                                                                    fontSize: '11px', 
                                                                    fontWeight: 600,
                                                                    color: 'var(--color-vc-link)',
                                                                    minWidth: 0,
                                                                    p: 0,
                                                                    '&:hover': { color: 'var(--color-vc-link-deep)', bgcolor: 'transparent' }
                                                                }}
                                                            >
                                                                {sub.submissionDetails?.status === 'graded' ? 'Edit Grade' : 'Grade'}
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            ) : (
                <Box sx={{ py: 5, textAlign: 'center' }}>
                    <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '13px', fontFamily: 'inherit' }}>
                        No submissions yet.
                    </Typography>
                </Box>
            )}

            <Dialog 
                open={Boolean(gradingSub)} 
                onClose={() => setGradingSub(null)} 
                PaperProps={{ 
                    sx: { 
                        borderRadius: '8px', 
                        width: 400,
                        bgcolor: 'var(--color-vc-canvas)',
                        border: '1px solid var(--color-vc-hairline)',
                        boxShadow: '0 32px 64px -12px rgba(0,0,0,0.16)'
                    } 
                }}
            >
                <DialogTitle sx={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-vc-ink)', borderBottom: '1px solid var(--color-vc-hairline)', pb: 2 }}>
                    Manual Grading
                </DialogTitle>
                <DialogContent sx={{ mt: 2, pb: 1 }}>
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)', mb: 2 }}>
                        Grading for: <strong style={{ color: 'var(--color-vc-ink)' }}>{gradingSub?.title}</strong>
                    </Typography>
                    <TextField
                        fullWidth 
                        label="Grade (0-100)" 
                        type="number" 
                        margin="normal" 
                        size="small"
                        value={gradeData.grade} 
                        onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                        sx={{ '& .MuiInputBase-root': { fontSize: '13px', fontFamily: 'inherit' } }}
                    />
                    <TextField
                        fullWidth 
                        label="Feedback" 
                        multiline 
                        rows={3} 
                        margin="normal" 
                        size="small"
                        value={gradeData.feedback} 
                        onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                        sx={{ '& .MuiInputBase-root': { fontSize: '13px', fontFamily: 'inherit' } }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2.5, borderTop: '1px solid var(--color-vc-hairline)', gap: 1 }}>
                    <Button 
                        onClick={() => setGradingSub(null)}
                        sx={{
                            textTransform: 'none', fontSize: '12px', fontWeight: 500, fontFamily: 'inherit',
                            borderRadius: '6px', color: 'var(--color-vc-mute)', '&:hover': { bgcolor: 'var(--color-vc-canvas-soft)' }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSave}
                        sx={{
                            textTransform: 'none', fontSize: '12px', fontWeight: 500, fontFamily: 'inherit',
                            borderRadius: '6px', color: '#fff', bgcolor: 'var(--color-vc-primary)',
                            boxShadow: 'none', '&:hover': { bgcolor: 'var(--color-vc-primary)', opacity: 0.9, boxShadow: 'none' }
                        }}
                    >
                        Save Grade
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SubmissionsTab;
