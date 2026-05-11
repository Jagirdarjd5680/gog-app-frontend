import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Card, CardContent, Grid, Avatar, Chip, 
    Button, IconButton, Stack, TextField, InputAdornment,
    Drawer, Divider, List, ListItem, ListItemText, ListItemSecondaryAction,
    Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
    Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DownloadIcon from '@mui/icons-material/Download';
import api, { fixUrl } from '../../utils/api';
import { toast } from 'react-toastify';

const BatchSubmissions = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const batchId = searchParams.get('batchId');
    const studentIdParam = searchParams.get('studentId');

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [viewingAssignment, setViewingAssignment] = useState(null);
    const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (batchId) {
            fetchSubmissions();
        } else {
            setLoading(false);
        }
    }, [batchId]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/assignments/batch/${batchId}/submissions`);
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };

    // Auto-open student drawer if studentId is in URL
    useEffect(() => {
        if (data && studentIdParam) {
            const student = data.students.find(s => s._id === studentIdParam);
            if (student) {
                setSelectedStudent(student);
            }
        } else if (data && !studentIdParam) {
            setSelectedStudent(null);
        }
    }, [studentIdParam, data]);

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        const newParams = new URLSearchParams(searchParams);
        newParams.set('studentId', student._id);
        setSearchParams(newParams);
    };

    const handleCloseDrawer = () => {
        setSelectedStudent(null);
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('studentId');
        setSearchParams(newParams);
    };

    const filteredStudents = data?.students.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleOpenGrading = (submission) => {
        setGradingSubmission(submission);
        setGradeData({
            grade: submission.grade || '',
            feedback: submission.feedback || ''
        });
    };

    const handleSubmitGrade = async () => {
        if (!gradeData.grade) {
            toast.error('Please enter a grade');
            return;
        }

        setSubmitting(true);
        try {
            await api.put(`/assignments/${gradingSubmission.assignmentId}/grade`, {
                submissionId: gradingSubmission._id,
                grade: Number(gradeData.grade),
                feedback: gradeData.feedback
            });
            toast.success('Grade submitted successfully');
            
            // Real-time state update (AJAX style)
            setData(prev => {
                const newData = { ...prev };
                newData.students = newData.students.map(student => {
                    // Update the student who owns the submission
                    const submissionIndex = student.submissions.findIndex(s => s._id === gradingSubmission._id);
                    if (submissionIndex !== -1) {
                        const updatedSubmissions = [...student.submissions];
                        updatedSubmissions[submissionIndex] = {
                            ...updatedSubmissions[submissionIndex],
                            status: 'graded',
                            grade: Number(gradeData.grade),
                            feedback: gradeData.feedback
                        };
                        return { ...student, submissions: updatedSubmissions };
                    }
                    return student;
                });
                return newData;
            });

            // Update selectedStudent if it's the one we're grading
            if (selectedStudent) {
                setSelectedStudent(prev => {
                    const updatedSubmissions = prev.submissions.map(s => 
                        s._id === gradingSubmission._id 
                            ? { ...s, status: 'graded', grade: Number(gradeData.grade), feedback: gradeData.feedback }
                            : s
                    );
                    return { ...prev, submissions: updatedSubmissions };
                });
            }

            setGradingSubmission(null);
        } catch (error) {
            toast.error('Failed to submit grade');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'white', boxShadow: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h4" fontWeight={800}>
                        Batch Submissions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {data?.batchName} — {data?.assignments.length} Assignments
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Search students by name or roll number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 3, bgcolor: 'white' }
                    }}
                />
            </Box>

            <Grid container spacing={3}>
                {filteredStudents.map((student) => {
                    const submissionCount = student.submissions.length;
                    const pendingCount = student.submissions.filter(s => s.status === 'pending').length;
                    
                    return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={student._id}>
                            <Card 
                                sx={{ 
                                    borderRadius: 4, 
                                    transition: 'all 0.3s ease',
                                    border: '1px solid #eef2f6',
                                    '&:hover': { 
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 12px 24px rgba(0,0,0,0.08)'
                                    },
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleSelectStudent(student)}
                            >
                                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                    <Avatar 
                                        src={fixUrl(student.profileImage)} 
                                        sx={{ width: 80, height: 80, mx: 'auto', mb: 2, border: '4px solid #f8f9fa' }}
                                    />
                                    <Typography variant="h6" fontWeight={700} noWrap>
                                        {student.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" gutterBottom>
                                        {student.rollNumber || 'NO ROLL NO'}
                                    </Typography>

                                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2, mb: 2 }}>
                                        <Tooltip title="Completed Assignments">
                                            <Chip 
                                                icon={<AssignmentTurnedInIcon sx={{ fontSize: '14px !important' }} />}
                                                label={submissionCount} 
                                                size="small" 
                                                color="success" 
                                                variant="soft"
                                                sx={{ fontWeight: 700 }}
                                            />
                                        </Tooltip>
                                        {pendingCount > 0 && (
                                            <Tooltip title="Pending Reviews">
                                                <Chip 
                                                    icon={<PendingActionsIcon sx={{ fontSize: '14px !important' }} />}
                                                    label={pendingCount} 
                                                    size="small" 
                                                    color="warning" 
                                                    variant="soft"
                                                    sx={{ fontWeight: 700 }}
                                                />
                                            </Tooltip>
                                        )}
                                    </Stack>

                                    <Button 
                                        fullWidth 
                                        variant="outlined" 
                                        size="small"
                                        startIcon={<VisibilityIcon />}
                                        onClick={() => handleSelectStudent(student)}
                                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                                    >
                                        View Submissions
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Student Submissions Drawer */}
            <Drawer
                anchor="right"
                open={Boolean(selectedStudent)}
                onClose={handleCloseDrawer}
                PaperProps={{ sx: { width: { xs: '100%', sm: 550 }, p: 3, bgcolor: '#f8f9fa', transition: 'width 0.3s' } }}
            >
                {selectedStudent && (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" fontWeight={800}>Submissions</Typography>
                            <IconButton onClick={handleCloseDrawer}><CloseIcon /></IconButton>
                        </Box>

                        <Box sx={{ textAlign: 'center', mb: 4, p: 3, bgcolor: 'white', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                            <Avatar 
                                src={fixUrl(selectedStudent.profileImage)} 
                                sx={{ width: 64, height: 64, mx: 'auto', mb: 1.5 }}
                            />
                            <Typography variant="subtitle1" fontWeight={700}>{selectedStudent.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{selectedStudent.email}</Typography>
                        </Box>

                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary', textTransform: 'uppercase' }}>
                            Assignments ({selectedStudent.submissions.length})
                        </Typography>

                        <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {selectedStudent.submissions.map((sub) => (
                                <ListItem 
                                    key={sub._id}
                                    sx={{ 
                                        bgcolor: 'white', 
                                        borderRadius: 3, 
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        p: 2
                                    }}
                                >
                                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography fontWeight={700} color="primary.main">{sub.assignmentTitle}</Typography>
                                            <IconButton 
                                                size="small" 
                                                onClick={() => {
                                                    const originalAsm = data?.assignments?.find(a => a._id === sub.assignmentId);
                                                    setViewingAssignment(originalAsm);
                                                }}
                                                sx={{ p: 0.5 }}
                                            >
                                                <InfoIcon fontSize="small" color="action" />
                                            </IconButton>
                                        </Stack>
                                        <Chip 
                                            label={sub.status.toUpperCase()} 
                                            size="small" 
                                            color={sub.status === 'graded' ? 'success' : 'warning'}
                                            sx={{ fontSize: 10, height: 20, fontWeight: 800 }}
                                        />
                                    </Box>

                                    {sub.textAnswer && (
                                        <Box sx={{ p: 1.5, bgcolor: '#f1f5f9', borderRadius: 2, width: '100%', mb: 1.5 }}>
                                            <Typography variant="body2">{sub.textAnswer}</Typography>
                                        </Box>
                                    )}

                                     <Divider sx={{ width: '100%', my: 1.5 }} />
                                     
                                     {/* Submission Content Viewer */}
                                     <Box sx={{ width: '100%', mb: 1.5, p: 1.5, borderRadius: 2, bgcolor: '#f5f5f5' }}>
                                         <Typography variant="caption" color="text.secondary" fontWeight={700}>SUBMISSION CONTENT</Typography>
                                         {sub.content && (
                                             <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                                                 {sub.content}
                                             </Typography>
                                         )}
                                         {sub.fileUrl && (
                                             <Button 
                                                 size="small" 
                                                 variant="outlined" 
                                                 startIcon={<DownloadIcon />}
                                                 href={sub.fileUrl.startsWith('http') ? sub.fileUrl : `https://backend.godofgraphics.in${sub.fileUrl}`}
                                                 target="_blank"
                                                 sx={{ mt: 1, borderRadius: 2, textTransform: 'none' }}
                                             >
                                                 View Attached File
                                             </Button>
                                         )}
                                         {!sub.content && !sub.fileUrl && (
                                             <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                                                 No text or file attached.
                                             </Typography>
                                         )}
                                     </Box>

                                     <Divider sx={{ width: '100%', my: 1.5 }} />

                                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        {sub.status === 'graded' ? (
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" display="block">Score</Typography>
                                                <Typography variant="h6" fontWeight={800} color="success.main">
                                                    {sub.grade} / {data?.assignments?.find(a => a._id === sub.assignmentId)?.totalMarks || 100}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">Not graded yet</Typography>
                                        )}
                                        <Button 
                                            variant="contained" 
                                            size="small" 
                                            onClick={() => handleOpenGrading(sub)}
                                            startIcon={<StarIcon />}
                                            sx={{ borderRadius: 2, textTransform: 'none' }}
                                        >
                                            {sub.status === 'graded' ? 'Edit Grade' : 'Grade Now'}
                                        </Button>
                                    </Box>
                                </ListItem>
                            ))}
                        </List>

                        {selectedStudent.submissions.length === 0 && (
                            <Box sx={{ py: 5, textAlign: 'center' }}>
                                <PendingActionsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                <Typography color="text.secondary">No submissions found for this batch.</Typography>
                            </Box>
                        )}
                    </Box>
                )}
            </Drawer>

            {/* Grading Dialog */}
            <Dialog 
                open={Boolean(gradingSubmission)} 
                onClose={() => setGradingSubmission(null)}
                PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 400 } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Grade Submission</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
                        Enter the marks and feedback for <strong>{gradingSubmission?.assignmentTitle}</strong>.
                    </Typography>
                    <TextField
                        fullWidth
                        label={`Marks (0-${data?.assignments?.find(a => a._id === gradingSubmission?.assignmentId)?.totalMarks || 100})`}
                        type="number"
                        value={gradeData.grade}
                        onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                        margin="normal"
                        InputProps={{ sx: { borderRadius: 2 } }}
                    />
                    <TextField
                        fullWidth
                        label="Feedback / Comments"
                        multiline
                        rows={3}
                        value={gradeData.feedback}
                        onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                        margin="normal"
                        InputProps={{ sx: { borderRadius: 2 } }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setGradingSubmission(null)} color="inherit">Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSubmitGrade}
                        disabled={submitting}
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        {submitting ? 'Submitting...' : 'Save Grade'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Assignment Details Viewer */}
            <Dialog 
                open={Boolean(viewingAssignment)} 
                onClose={() => setViewingAssignment(null)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #eee', pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Assignment Details
                    <IconButton onClick={() => setViewingAssignment(null)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <Grid container>
                        {/* Sidebar with Image and Core Stats */}
                        <Grid item xs={12} md={4} sx={{ bgcolor: '#f8f9fa', p: 3, borderRight: '1px solid #eee' }}>
                            {viewingAssignment?.thumbnail ? (
                                <Box 
                                    component="img" 
                                    src={fixUrl(viewingAssignment.thumbnail)} 
                                    sx={{ width: '100%', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', mb: 2 }} 
                                />
                            ) : (
                                <Box sx={{ width: '100%', height: 160, bgcolor: 'divider', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                    <Typography color="text.secondary">No Thumbnail</Typography>
                                </Box>
                            )}

                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Course</Typography>
                                    <Typography variant="body2" fontWeight={600}>{viewingAssignment?.course?.title || 'General'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Module</Typography>
                                    <Typography variant="body2" fontWeight={600}>{viewingAssignment?.moduleTitle || 'N/A'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Lecture</Typography>
                                    <Typography variant="body2" fontWeight={600}>{viewingAssignment?.lectureTitle || 'N/A'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Total Marks</Typography>
                                    <Typography variant="h6" fontWeight={800} color="primary">{viewingAssignment?.totalMarks}</Typography>
                                </Box>
                            </Stack>
                        </Grid>

                        {/* Main Content */}
                        <Grid item xs={12} md={8} sx={{ p: 4 }}>
                            <Typography variant="h5" fontWeight={800} gutterBottom>{viewingAssignment?.title}</Typography>
                            
                            <Grid container spacing={3} sx={{ my: 2 }}>
                                <Grid item xs={6} sm={4}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700}>TYPE</Typography>
                                    <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                                        {viewingAssignment?.assignmentType?.replace('_', ' ')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700}>MAX SIZE</Typography>
                                    <Typography variant="body2" fontWeight={600}>{viewingAssignment?.maxMb || 10} MB</Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700}>DEADLINE</Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                        {viewingAssignment?.deadlineDays ? `${viewingAssignment.deadlineDays} Days After Unlock` : 'No Fixed Deadline'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700}>ALLOWED FORMATS</Typography>
                                    <Box sx={{ mt: 0.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {viewingAssignment?.allowedFormats?.split(',').map((ext, i) => (
                                            <Chip key={i} label={ext.trim()} size="small" sx={{ fontWeight: 700, bgcolor: 'rgba(0,0,0,0.05)' }} />
                                        ))}
                                    </Box>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={700}>DESCRIPTION / INSTRUCTIONS</Typography>
                            <Box 
                                className="html-content"
                                dangerouslySetInnerHTML={{ __html: viewingAssignment?.description || 'No description provided.' }} 
                                sx={{ 
                                    bgcolor: '#fff', 
                                    '& p': { m: 0, mb: 1.5 },
                                    '& ul': { pl: 2 }
                                }}
                            />

                            {viewingAssignment?.attachments?.length > 0 && (
                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={700}>REFERENCE ATTACHMENTS</Typography>
                                    <Stack spacing={1} sx={{ mt: 1 }}>
                                        {viewingAssignment.attachments.map((file, i) => (
                                            <Button 
                                                key={i}
                                                variant="outlined" 
                                                size="small" 
                                                startIcon={<AttachFileIcon />}
                                                component="a"
                                                href={fixUrl(file.url)}
                                                target="_blank"
                                                sx={{ justifyContent: 'flex-start', borderRadius: 2, textTransform: 'none', px: 2 }}
                                            >
                                                {file.title || 'Attachment'}
                                            </Button>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa', borderTop: '1px solid #eee' }}>
                    <Button onClick={() => setViewingAssignment(null)} variant="contained" sx={{ borderRadius: 2, px: 4 }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BatchSubmissions;
