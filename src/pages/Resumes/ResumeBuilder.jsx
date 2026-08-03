import React, { useState, useRef, useEffect } from 'react';
import { 
    Box, Typography, Grid, Paper, TextField, Button, IconButton, 
    Avatar, Stack, Divider, Tabs, Tab, Chip, useTheme, Card, CardContent, CardActions,
    Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress
} from '@mui/material';
import { 
    FileText, Download, Briefcase, GraduationCap, Wrench, Printer, Eye, User,
    Plus, Trash2, Sparkles, Image as ImageIcon, Link as LinkIcon, Upload
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
// SEPARATE COMPONENT: RESUME EDITOR
// ----------------------------------------------------------------------
const ResumeEditor = ({ resumeData, setResumeData, handlePersonalInfoChange, handleAIImprove }) => {
    const theme = useTheme();
    const [activeSection, setActiveSection] = useState(0);
    const [skillInput, setSkillInput] = useState('');
    const [languageInput, setLanguageInput] = useState('');
    const [hobbyInput, setHobbyInput] = useState('');

    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [imageUrlInput, setImageUrlInput] = useState('');
    
    const fileInputRef = useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrlInput(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const addExperience = () => {
        setResumeData(prev => ({ ...prev, experience: [...prev.experience, { _id: Date.now().toString(), company: '', duration: '', desc: '' }] }));
    };
    const removeExperience = (id) => {
        setResumeData(prev => ({ ...prev, experience: prev.experience.filter(exp => (exp._id || exp.id) !== id) }));
    };
    const addEducation = () => {
        setResumeData(prev => ({ ...prev, education: [...prev.education, { _id: Date.now().toString(), school: '', degree: '', year: '' }] }));
    };
    const removeEducation = (id) => {
        setResumeData(prev => ({ ...prev, education: prev.education.filter(edu => (edu._id || edu.id) !== id) }));
    };
    const addListItem = (field, input, setInput) => (e) => {
        if (e.key === 'Enter' && input.trim()) {
            setResumeData(prev => ({ ...prev, [field]: [...prev[field], input.trim()] }));
            setInput('');
        }
    };
    const removeListItem = (field, index) => {
        setResumeData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    };

    const handleImageSave = () => {
        handlePersonalInfoChange('image', imageUrlInput);
        setImageDialogOpen(false);
    };

    return (
        <Paper elevation={0} sx={{ borderRadius: '10px', border: '1px solid var(--color-vc-hairline, #e2e8f0)', bgcolor: 'white', position: 'sticky', top: 24 }}>
            <Tabs 
                value={activeSection} 
                onChange={(_, v) => setActiveSection(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ 
                    borderBottom: '1px solid var(--color-vc-hairline, #e2e8f0)', bgcolor: '#f8fafc',
                    '& .MuiTab-root': { py: 2, minHeight: 60, color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'none' },
                    '& .Mui-selected': { color: 'var(--color-vc-primary, #2563eb)', fontWeight: 700 }
                }}
            >
                <Tab icon={<User size={16} />} iconPosition="start" label="Profile" />
                <Tab icon={<Briefcase size={16} />} iconPosition="start" label="Experience" />
                <Tab icon={<GraduationCap size={16} />} iconPosition="start" label="Education" />
                <Tab icon={<Wrench size={16} />} iconPosition="start" label="Extra" />
            </Tabs>

            <Box sx={{ p: 3, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                {activeSection === 0 && (
                    <Stack spacing={2.5}>
                        {/* Image Upload Section */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Avatar src={resumeData.personalInfo.image} sx={{ width: 64, height: 64, border: '2px solid var(--color-vc-hairline, #e2e8f0)' }}>
                                {!resumeData.personalInfo.image && resumeData.personalInfo.name.charAt(0)}
                            </Avatar>
                            <Button 
                                variant="outlined" size="small" startIcon={<ImageIcon size={16} />}
                                onClick={() => { setImageUrlInput(resumeData.personalInfo.image || ''); setImageDialogOpen(true); }}
                                sx={{ borderRadius: '8px', textTransform: 'none' }}
                            >
                                Change Photo
                            </Button>
                        </Box>

                        <TextField label="Full Name" size="small" fullWidth value={resumeData.personalInfo.name} onChange={(e) => handlePersonalInfoChange('name', e.target.value)} InputProps={{ sx: { borderRadius: '10px' } }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField label="Email" size="small" fullWidth value={resumeData.personalInfo.email} onChange={(e) => handlePersonalInfoChange('email', e.target.value)} InputProps={{ sx: { borderRadius: '10px' } }} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField label="Phone" size="small" fullWidth value={resumeData.personalInfo.phone} onChange={(e) => handlePersonalInfoChange('phone', e.target.value)} InputProps={{ sx: { borderRadius: '10px' } }} />
                            </Grid>
                        </Grid>
                        <TextField label="Address" size="small" fullWidth value={resumeData.personalInfo.address} onChange={(e) => handlePersonalInfoChange('address', e.target.value)} InputProps={{ sx: { borderRadius: '10px' } }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField label="LinkedIn" size="small" fullWidth value={resumeData.personalInfo.linkedIn} onChange={(e) => handlePersonalInfoChange('linkedIn', e.target.value)} InputProps={{ sx: { borderRadius: '10px' } }} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField label="Website" size="small" fullWidth value={resumeData.personalInfo.website} onChange={(e) => handlePersonalInfoChange('website', e.target.value)} InputProps={{ sx: { borderRadius: '10px' } }} />
                            </Grid>
                        </Grid>
                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Professional Summary</Typography>
                                <Button size="small" startIcon={<Sparkles size={14} />} onClick={handleAIImprove} sx={{ borderRadius: '10px', textTransform: 'none' }}>AI Optimize</Button>
                            </Stack>
                            <TextField fullWidth multiline rows={4} size="small" value={resumeData.personalInfo.summary} onChange={(e) => handlePersonalInfoChange('summary', e.target.value)} InputProps={{ sx: { borderRadius: '10px' } }} />
                        </Box>
                    </Stack>
                )}

                {/* Other sections (Experience, Education, Skills) are identical to before */}
                {activeSection === 1 && (
                    <Stack spacing={2}>
                        {resumeData.experience.map((exp, idx) => (
                            <Card key={exp._id || exp.id || idx} variant="outlined" sx={{ borderRadius: '10px' }}>
                                <CardContent sx={{ p: 2, position: 'relative' }}>
                                    <IconButton onClick={() => removeExperience(exp._id || exp.id)} size="small" sx={{ position: 'absolute', top: 4, right: 4, color: 'error.main' }}><Trash2 size={16} /></IconButton>
                                    <Stack spacing={2} sx={{ mt: 1 }}>
                                        <TextField label="Company & Role" size="small" fullWidth value={exp.company} onChange={(e) => { const next = [...resumeData.experience]; next[idx].company = e.target.value; setResumeData({ ...resumeData, experience: next }); }} InputProps={{ sx: { borderRadius: '10px' } }} />
                                        <TextField label="Duration" size="small" fullWidth value={exp.duration} onChange={(e) => { const next = [...resumeData.experience]; next[idx].duration = e.target.value; setResumeData({ ...resumeData, experience: next }); }} InputProps={{ sx: { borderRadius: '10px' } }} />
                                        <TextField label="Responsibilities" size="small" fullWidth multiline rows={4} value={exp.desc} onChange={(e) => { const next = [...resumeData.experience]; next[idx].desc = e.target.value; setResumeData({ ...resumeData, experience: next }); }} InputProps={{ sx: { borderRadius: '10px' } }} />
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                        <Button variant="outlined" startIcon={<Plus size={16} />} onClick={addExperience} sx={{ borderRadius: '10px', py: 1.5, borderStyle: 'dashed' }}>Add Experience</Button>
                    </Stack>
                )}

                {activeSection === 2 && (
                    <Stack spacing={2}>
                        {resumeData.education.map((edu, idx) => (
                            <Card key={edu._id || edu.id || idx} variant="outlined" sx={{ borderRadius: '10px' }}>
                                <CardContent sx={{ p: 2, position: 'relative' }}>
                                    <IconButton onClick={() => removeEducation(edu._id || edu.id)} size="small" sx={{ position: 'absolute', top: 4, right: 4, color: 'error.main' }}><Trash2 size={16} /></IconButton>
                                    <Stack spacing={2} sx={{ mt: 1 }}>
                                        <TextField label="Degree" size="small" fullWidth value={edu.degree} onChange={(e) => { const next = [...resumeData.education]; next[idx].degree = e.target.value; setResumeData({ ...resumeData, education: next }); }} InputProps={{ sx: { borderRadius: '10px' } }} />
                                        <TextField label="School & Location" size="small" fullWidth value={edu.school} onChange={(e) => { const next = [...resumeData.education]; next[idx].school = e.target.value; setResumeData({ ...resumeData, education: next }); }} InputProps={{ sx: { borderRadius: '10px' } }} />
                                        <TextField label="Year" size="small" fullWidth value={edu.year} onChange={(e) => { const next = [...resumeData.education]; next[idx].year = e.target.value; setResumeData({ ...resumeData, education: next }); }} InputProps={{ sx: { borderRadius: '10px' } }} />
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                        <Button variant="outlined" startIcon={<Plus size={16} />} onClick={addEducation} sx={{ borderRadius: '10px', py: 1.5, borderStyle: 'dashed' }}>Add Education</Button>
                    </Stack>
                )}

                {activeSection === 3 && (
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, color: '#334155' }}>Additional Skills</Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>{resumeData.skills.map((skill, idx) => <Chip key={idx} label={skill} onDelete={() => removeListItem('skills', idx)} size="small" sx={{ borderRadius: '6px' }} />)}</Stack>
                            <TextField size="small" fullWidth placeholder="Type skill & press Enter" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={addListItem('skills', skillInput, setSkillInput)} InputProps={{ sx: { borderRadius: '10px' } }} />
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, color: '#334155' }}>Languages</Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>{resumeData.languages.map((lang, idx) => <Chip key={idx} label={lang} onDelete={() => removeListItem('languages', idx)} size="small" sx={{ borderRadius: '6px' }} />)}</Stack>
                            <TextField size="small" fullWidth placeholder="Type language & press Enter" value={languageInput} onChange={(e) => setLanguageInput(e.target.value)} onKeyDown={addListItem('languages', languageInput, setLanguageInput)} InputProps={{ sx: { borderRadius: '10px' } }} />
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, color: '#334155' }}>Hobbies</Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>{resumeData.hobbies.map((hobby, idx) => <Chip key={idx} label={hobby} onDelete={() => removeListItem('hobbies', idx)} size="small" sx={{ borderRadius: '6px' }} />)}</Stack>
                            <TextField size="small" fullWidth placeholder="Type hobby & press Enter" value={hobbyInput} onChange={(e) => setHobbyInput(e.target.value)} onKeyDown={addListItem('hobbies', hobbyInput, setHobbyInput)} InputProps={{ sx: { borderRadius: '10px' } }} />
                        </Box>
                    </Stack>
                )}
            </Box>

            {/* Image Source Dialog */}
            <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Update Profile Photo</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">Paste an image URL, or upload a file directly.</Typography>
                        <TextField 
                            label="Image URL" fullWidth size="small" 
                            value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)}
                            InputProps={{ startAdornment: <LinkIcon size={16} style={{ marginRight: 8, color: '#94a3b8' }} /> }}
                        />
                        <Stack direction="row" spacing={1}>
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                onChange={handleFileUpload} 
                            />
                            <Button variant="outlined" startIcon={<Upload size={16} />} onClick={() => fileInputRef.current?.click()}>Upload File</Button>
                            <Button variant="outlined" startIcon={<ImageIcon size={16} />} disabled>From Library</Button>
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setImageDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleImageSave} sx={{ boxShadow: 'none' }}>Save Image</Button>
                </DialogActions>
            </Dialog>

        </Paper>
    );
};


// ----------------------------------------------------------------------
// SEPARATE COMPONENT: RESUME PREVIEW
// ----------------------------------------------------------------------
const ResumePreview = React.forwardRef(({ resumeData }, ref) => {
    return (
        <Paper ref={ref} elevation={3} sx={{ width: '100%', maxWidth: '800px', mx: 'auto', minHeight: '1131px', bgcolor: 'white', overflow: 'hidden', display: 'flex', borderRadius: 0 }}>
            {/* LEFT COLUMN: Dark Sidebar */}
            <Box sx={{ width: '32%', bgcolor: '#2b343b', color: 'white', p: 4, display: 'flex', flexDirection: 'column' }}>
                
                {/* Profile Photo */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Avatar 
                        src={resumeData.personalInfo.image}
                        variant="square"
                        sx={{ width: 140, height: 160, bgcolor: 'var(--color-vc-hairline, #e2e8f0)', color: '#64748b', fontSize: '3rem', border: '4px solid #3f4851' }}
                    >
                        {!resumeData.personalInfo.image && resumeData.personalInfo.name.charAt(0)}
                    </Avatar>
                </Box>

                {/* Name */}
                <Typography variant="h5" sx={{ fontWeight: 500, textAlign: 'center', mb: 4, fontFamily: 'Arial, sans-serif' }}>
                    {resumeData.personalInfo.name || 'Your Name'}
                </Typography>

                {/* Contact Section */}
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', borderBottom: '1px solid #4a5568', pb: 0.5, mb: 2, fontFamily: 'Arial, sans-serif' }}>Contact</Typography>
                <Stack spacing={2} sx={{ mb: 4 }}>
                    {resumeData.personalInfo.address && <Box><Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>Address:</Typography><Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{resumeData.personalInfo.address}</Typography></Box>}
                    {resumeData.personalInfo.phone && <Box><Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>Phone:</Typography><Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{resumeData.personalInfo.phone}</Typography></Box>}
                    {resumeData.personalInfo.email && <Box><Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>E-mail:</Typography><Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#cbd5e1', wordBreak: 'break-all' }}>{resumeData.personalInfo.email}</Typography></Box>}
                    {resumeData.personalInfo.linkedIn && <Box><Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>LinkedIn:</Typography><Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#cbd5e1', wordBreak: 'break-all' }}>{resumeData.personalInfo.linkedIn}</Typography></Box>}
                    {resumeData.personalInfo.website && <Box><Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>WWW:</Typography><Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#cbd5e1', wordBreak: 'break-all' }}>{resumeData.personalInfo.website}</Typography></Box>}
                </Stack>

                {/* Additional Skills */}
                {resumeData.skills.length > 0 && (
                    <>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', borderBottom: '1px solid #4a5568', pb: 0.5, mb: 2, fontFamily: 'Arial, sans-serif' }}>Additional Skills</Typography>
                        <Stack spacing={0.5}>
                            {resumeData.skills.map((skill, idx) => <Typography key={idx} variant="body2" sx={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', alignItems: 'flex-start' }}><span style={{ marginRight: '8px' }}>•</span> {skill}</Typography>)}
                        </Stack>
                    </>
                )}
            </Box>

            {/* RIGHT COLUMN: Main Content */}
            <Box sx={{ width: '68%', bgcolor: 'white', p: 4, pt: 6, color: '#1a202c', fontFamily: 'Arial, sans-serif' }}>
                
                {/* Professional Summary */}
                {resumeData.personalInfo.summary && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', borderBottom: '2px solid #cbd5e1', pb: 0.5, mb: 1.5 }}>Professional Summary</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem', lineHeight: 1.6 }}>{resumeData.personalInfo.summary}</Typography>
                    </Box>
                )}

                {/* Work Experience */}
                {resumeData.experience.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', borderBottom: '2px solid #cbd5e1', pb: 0.5, mb: 2 }}>Work Experience</Typography>
                        <Stack spacing={3}>
                            {resumeData.experience.map((exp, idx) => (
                                <Box key={exp._id || exp.id || idx}>
                                    <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', fontWeight: 'bold', color: '#4a5568', mb: 0.5 }}>{exp.duration}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>{exp.company}</Typography>
                                    <Typography variant="body2" sx={{ fontSize: '0.85rem', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{exp.desc}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                )}

                {/* Education */}
                {resumeData.education.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', borderBottom: '2px solid #cbd5e1', pb: 0.5, mb: 2 }}>Education</Typography>
                        <Stack spacing={2}>
                            {resumeData.education.map((edu, idx) => (
                                <Box key={edu._id || edu.id || idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{edu.degree}</Typography>
                                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{edu.school}</Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#4a5568' }}>{edu.year}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                )}

                {/* Languages */}
                {resumeData.languages.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', borderBottom: '2px solid #cbd5e1', pb: 0.5, mb: 2 }}>Languages</Typography>
                        <Stack spacing={1}>
                            {resumeData.languages.map((lang, idx) => <Typography key={idx} variant="body2" sx={{ fontSize: '0.85rem' }}>{lang}</Typography>)}
                        </Stack>
                    </Box>
                )}

                {/* Hobby */}
                {resumeData.hobbies.length > 0 && (
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', borderBottom: '2px solid #cbd5e1', pb: 0.5, mb: 2 }}>Hobby</Typography>
                        <Stack spacing={1}>
                            {resumeData.hobbies.map((hobby, idx) => <Typography key={idx} variant="body2" sx={{ fontSize: '0.85rem', display: 'flex', alignItems: 'flex-start' }}><span style={{ marginRight: '8px' }}>•</span> {hobby}</Typography>)}
                        </Stack>
                    </Box>
                )}
            </Box>
        </Paper>
    );
});


// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

const ResumeBuilder = () => {
    const theme = useTheme();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Application State
    const currentResumeId = searchParams.get('id');
    const mode = currentResumeId ? 'edit' : 'list';
    
    const [resumes, setResumes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const res = await api.get('/resumes');
                if (res.data.success) {
                    setResumes(res.data.data);
                }
            } catch (err) {
                
                toast.error('Failed to fetch resumes');
            } finally {
                setIsLoading(false);
            }
        };
        fetchResumes();
    }, []);

    // Derived state for the active editor
    const activeResume = mode === 'edit' ? resumes.find(r => r._id === currentResumeId) : null;
    // For direct PDF printing from list view
    const [printResumeId, setPrintResumeId] = useState(null);
    const [isPrinting, setIsPrinting] = useState(null); // holds the ID of the resume being printed or 'edit'
    const printResumeData = resumes.find(r => r._id === printResumeId) || resumes[0];

    const printComponentRef = useRef();
    
    // React-to-print hook
    const handlePrint = useReactToPrint({
        contentRef: printComponentRef,
        documentTitle: `Resume_${printResumeData?.personalInfo?.name?.replace(/\s+/g, '_') || 'Export'}`,
        onAfterPrint: () => {
            setIsPrinting(null);
            if (mode === 'list') setPrintResumeId(null); 
        },
        onPrintError: () => setIsPrinting(null)
    });

    const handleDirectPrint = (id) => {
        setIsPrinting(id);
        setPrintResumeId(id);
        setTimeout(() => handlePrint(), 300); 
    };

    const handleCreateNew = async () => {
        const newResumeData = {
            personalInfo: { name: '', image: '', address: '', phone: '', email: '', linkedIn: '', website: '', summary: '' },
            experience: [], education: [], skills: [], languages: [], hobbies: []
        };
        try {
            const res = await api.post('/resumes', newResumeData);
            if (res.data.success) {
                setResumes([res.data.data, ...resumes]);
                setSearchParams({ id: res.data.data._id });
                toast.success('New resume created');
            }
        } catch (err) {
            toast.error('Failed to create resume');
        }
    };

    const handleEdit = (id) => {
        setSearchParams({ id: id });
    };

    const handleDeleteResume = async (id) => {
        if (window.confirm("Are you sure you want to delete this resume?")) {
            try {
                await api.delete(`/resumes/${id}`);
                setResumes(resumes.filter(r => r._id !== id));
                toast.success('Resume deleted successfully');
            } catch (err) {
                toast.error('Failed to delete resume');
            }
        }
    };

    const handleSaveAndClose = async () => {
        if (activeResume) {
            try {
                await api.put(`/resumes/${activeResume._id}`, activeResume);
                toast.success('Resume saved successfully');
                setSearchParams({});
            } catch (err) {
                toast.error('Failed to save resume');
            }
        } else {
            setSearchParams({});
        }
    };

    const handleUpdateActiveResume = (updater) => {
        setResumes(prevResumes => prevResumes.map(r => {
            if (r._id === currentResumeId) {
                return typeof updater === 'function' ? updater(r) : updater;
            }
            return r;
        }));
    };

    const handlePersonalInfoChange = (field, value) => {
        handleUpdateActiveResume(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, [field]: value }
        }));
    };

    const handleAIImprove = () => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 2000)),
            { loading: 'AI is optimizing summary...', success: 'Summary improved!', error: 'AI failed.' }
        );
    };

    // ------------------------------------------------------------------
    // RENDER: LIST VIEW
    // ------------------------------------------------------------------
    if (isLoading) return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

    if (mode === 'list') {
        return (
            <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f1f5f9' }}>
                <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 4 }}>
                        <Box>
                            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
                                <FileText size={24} style={{ color: 'var(--color-vc-primary, #2563eb)' }} />
                                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>Placements & Resumes</Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ color: '#64748b' }}>Manage student resumes and placements.</Typography>
                        </Box>
                        <Button variant="contained" startIcon={<Plus size={16} />} onClick={handleCreateNew} sx={{ borderRadius: '10px', textTransform: 'none', boxShadow: 'none' }}>
                            Create New Resume
                        </Button>
                    </Stack>

                    <Grid container spacing={3}>
                        {resumes.map(resume => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={resume._id}>
                                <Card sx={{ position: 'relative', borderRadius: '12px', border: '1px solid var(--color-vc-hairline, #e2e8f0)', boxShadow: 'none', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' } }}>
                                    <IconButton 
                                        size="small" 
                                        onClick={() => handleDeleteResume(resume._id)} 
                                        sx={{ position: 'absolute', top: 8, right: 8, color: 'error.main', bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'error.light', color: 'white' } }}
                                    >
                                        <Trash2 size={16} />
                                    </IconButton>
                                    <CardContent sx={{ p: 3, pt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                        <Avatar 
                                            src={resume.personalInfo.image}
                                            sx={{ width: 80, height: 80, mb: 2, border: '3px solid #f1f5f9' }}
                                        >
                                            {(!resume.personalInfo.image && resume.personalInfo.name) ? resume.personalInfo.name.charAt(0) : <User />}
                                        </Avatar>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1.1rem', mb: 0.5 }}>
                                            {resume.personalInfo.name || 'Untitled Student'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#64748b', mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {resume.personalInfo.summary || 'No summary provided.'}
                                        </Typography>
                                    </CardContent>
                                    <Divider />
                                    <CardActions sx={{ p: 2, justifyContent: 'space-between', bgcolor: '#f8fafc' }}>
                                        <Button size="small" variant="outlined" onClick={() => handleEdit(resume._id)} sx={{ borderRadius: '8px', textTransform: 'none' }}>
                                            Edit Builder
                                        </Button>
                                        <Button 
                                            size="small" 
                                            variant="contained" 
                                            color="secondary" 
                                            disabled={isPrinting === resume._id}
                                            startIcon={isPrinting === resume._id ? <CircularProgress size={14} color="inherit" /> : <Download size={14} />} 
                                            onClick={() => handleDirectPrint(resume._id)} 
                                            sx={{ borderRadius: '8px', textTransform: 'none', boxShadow: 'none' }}
                                        >
                                            {isPrinting === resume._id ? 'Loading...' : 'PDF'}
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
                
                {/* Hidden component for direct PDF printing from list */}
                {printResumeData && (
                    <Box sx={{ position: 'absolute', top: '-9999px', left: '-9999px', overflow: 'hidden', height: 0, opacity: 0 }}>
                        <ResumePreview ref={printComponentRef} resumeData={printResumeData} />
                    </Box>
                )}
            </Box>
        );
    }

    // ------------------------------------------------------------------
    // RENDER: EDITOR VIEW
    // ------------------------------------------------------------------
    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f1f5f9' }}>
            <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 4 }}>
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
                            <Button size="small" onClick={handleSaveAndClose} sx={{ minWidth: 'auto', p: 1, mr: 1, color: '#64748b' }}>&larr; Back</Button>
                            <FileText size={24} style={{ color: 'var(--color-vc-primary, #2563eb)' }} />
                            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>Resume Editor</Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ color: '#64748b', ml: 7 }}>Editing: {activeResume?.personalInfo.name || 'New Resume'}</Typography>
                    </Box>

                    <Stack direction="row" spacing={2}>
                        <Button 
                            variant="outlined" 
                            disabled={isPrinting === 'edit'}
                            onClick={() => { setIsPrinting('edit'); setPrintResumeId(currentResumeId); setTimeout(handlePrint, 300); }} 
                            startIcon={isPrinting === 'edit' ? <CircularProgress size={16} color="inherit" /> : <Printer size={16} />} 
                            sx={{ borderRadius: '10px', textTransform: 'none' }}
                        >
                            {isPrinting === 'edit' ? 'Loading...' : 'Print / PDF'}
                        </Button>
                        <Button variant="contained" onClick={handleSaveAndClose} sx={{ borderRadius: '10px', textTransform: 'none', boxShadow: 'none' }}>Save & Close</Button>
                    </Stack>
                </Stack>

                <Grid container spacing={3}>
                    {/* LEFT: Editor Component */}
                    <Grid item xs={12} lg={5}>
                        {activeResume && (
                            <ResumeEditor 
                                resumeData={activeResume} 
                                setResumeData={handleUpdateActiveResume} 
                                handlePersonalInfoChange={handlePersonalInfoChange}
                                handleAIImprove={handleAIImprove}
                            />
                        )}
                    </Grid>

                    {/* RIGHT: Live Preview Component */}
                    <Grid item xs={12} lg={7} sx={{ display: 'flex', justifyContent: 'center' }}>
                        {activeResume && (
                            <ResumePreview ref={printComponentRef} resumeData={activeResume} />
                        )}
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default ResumeBuilder;
