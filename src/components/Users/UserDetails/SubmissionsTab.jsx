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
    const [gradingSub, setGradingSub] = React.useState(null);
    const [gradeData, setGradeData] = React.useState({ grade: '', feedback: '' });

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
            <Typography variant="h6" fontWeight={700} gutterBottom>Assignment Submissions</Typography>
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
                        <Accordion key={batchName} defaultExpanded={idx === 0} sx={{ mb: 2, borderRadius: '8px !important', overflow: 'hidden', border: '1px solid #eee' }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'grey.50' }}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <FolderIcon color="primary" />
                                    <Typography fontWeight={700} color="primary.main">{batchName}</Typography>
                                    <Chip label={`${batchSubmissions.length} Items`} size="small" variant="outlined" />
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0 }}>
                                <TableContainer component={Paper} elevation={0} sx={{ border: 'none' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700 }}>Assignment</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Submitted On</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Work</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Grade</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {batchSubmissions.map((sub) => (
                                                <TableRow key={sub.assignmentId} hover>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight={600}>{sub.title || 'Untitled Assignment'}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{sub.course || 'General'}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {sub.submissionDetails?.submittedAt 
                                                            ? format(new Date(sub.submissionDetails.submittedAt), 'PPp') 
                                                            : 'Not Submitted'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {sub.submissionDetails?.fileUrl ? (
                                                            <Link href={fixUrl(sub.submissionDetails.fileUrl)} target="_blank" underline="hover" sx={{ fontWeight: 600 }}>File</Link>
                                                        ) : sub.submissionDetails?.textAnswer ? (
                                                            <Typography variant="caption" sx={{ display: 'block', maxWidth: 150, noWrap: true, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {sub.submissionDetails.textAnswer}
                                                            </Typography>
                                                        ) : 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {sub.submissionDetails?.status === 'graded' ? (
                                                            <Chip label={`${sub.submissionDetails.grade}/100`} size="small" color="success" sx={{ fontWeight: 800 }} />
                                                        ) : sub.submitted ? (
                                                            <Chip label="PENDING" size="small" color="warning" sx={{ fontWeight: 800 }} />
                                                        ) : (
                                                            <Chip label="MISSING" size="small" variant="outlined" />
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {sub.submitted && (
                                                            <Button size="small" onClick={() => handleOpenGrading(sub)} sx={{ textTransform: 'none' }}>
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
                    <Typography variant="body1" color="text.secondary">No submissions yet.</Typography>
                </Box>
            )}

            <Dialog open={Boolean(gradingSub)} onClose={() => setGradingSub(null)} PaperProps={{ sx: { borderRadius: 3, width: 400 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Manual Grading</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Grading for: <strong>{gradingSub?.title}</strong>
                    </Typography>
                    <TextField
                        fullWidth label="Grade (0-100)" type="number" margin="normal" size="small"
                        value={gradeData.grade} onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                    />
                    <TextField
                        fullWidth label="Feedback" multiline rows={3} margin="normal" size="small"
                        value={gradeData.feedback} onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setGradingSub(null)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save Grade</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SubmissionsTab;
