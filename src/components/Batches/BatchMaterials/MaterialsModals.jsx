import React from 'react';
import { 
    Dialog, DialogTitle, DialogContent, Box, TextField, Button, Stack, 
    Divider, Typography, FormControl, InputLabel, Select, MenuItem, Checkbox, 
    ListItemText, InputAdornment, IconButton, Paper, Chip 
} from '@mui/material';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import AddLinkIcon from '@mui/icons-material/AddLink';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const MaterialsModals = ({
    folderDialogOpen, setFolderDialogOpen,
    newFolderName, setNewFolderName,
    handleCreateFolder,
    
    linkDialogOpen, setLinkDialogOpen,
    newLinkName, setNewLinkName,
    newLinkUrl, setNewLinkUrl,
    handleAddLink,
    
    uploadModalOpen, setUploadModalOpen,
    selectedFiles = [], setSelectedFiles,
    handleUploadSubmit,
    
    selectedModule, setSelectedModule,
    selectedLecture, setSelectedLecture,
    selectedAssignments = [], setSelectedAssignments,
    selectedExams = [], setSelectedExams,
    
    courseModules = [], courseLectures = [], 
    courseAssignments = [], courseExams = []
}) => {

    const dialogPaperStyle = {
        borderRadius: '12px',
        bgcolor: 'var(--color-vc-canvas, #ffffff)',
        color: 'var(--color-vc-ink, inherit)',
        border: '1px solid var(--color-vc-hairline, rgba(0,0,0,0.1))',
        boxShadow: '0px 24px 48px -12px rgba(0,0,0,0.2)'
    };

    const fieldStyles = {
        '& .MuiInputBase-root': {
            borderRadius: '8px',
            color: 'var(--color-vc-ink)',
            bgcolor: 'var(--color-vc-canvas)',
            fontSize: '13px',
            fontFamily: 'inherit',
        },
        '& .MuiInputLabel-root': {
            color: 'var(--color-vc-mute, text.secondary)',
            fontFamily: 'inherit',
            fontSize: '13px',
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-vc-hairline, rgba(0,0,0,0.12))',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-vc-hairline-strong, primary.main)'
        }
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files);
            setSelectedFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <>
            {/* Create Folder Dialog */}
            <Dialog 
                open={folderDialogOpen} 
                onClose={() => setFolderDialogOpen(false)} 
                maxWidth="xs" 
                fullWidth
                PaperProps={{ sx: dialogPaperStyle }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: '16px', pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Box sx={{ p: 0.8, borderRadius: '8px', bgcolor: 'rgba(255,179,0,0.15)', color: '#FFB300', display: 'flex' }}>
                            <CreateNewFolderIcon sx={{ fontSize: 20 }} />
                        </Box>
                        Create New Folder
                    </Box>
                    <IconButton size="small" onClick={() => setFolderDialogOpen(false)}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ pt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '13px' }}>
                        Enter a descriptive name for the new folder.
                    </Typography>
                    <TextField
                        autoFocus fullWidth label="Folder Name"
                        value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                        placeholder="e.g. Lecture Notes, Project Files"
                        sx={fieldStyles}
                    />
                </DialogContent>

                <Box sx={{ px: 3, pb: 2.5, pt: 1, display: 'flex', justifyContent: 'flex-end', gap: 1.2 }}>
                    <Button onClick={() => setFolderDialogOpen(false)} sx={{ textTransform: 'none', fontWeight: 500 }}>
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleCreateFolder} 
                        disabled={!newFolderName.trim()}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 2.5 }}
                    >
                        Create Folder
                    </Button>
                </Box>
            </Dialog>

            {/* Add Link Dialog */}
            <Dialog 
                open={linkDialogOpen} 
                onClose={() => setLinkDialogOpen(false)} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{ sx: dialogPaperStyle }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: '16px', pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Box sx={{ p: 0.8, borderRadius: '8px', bgcolor: 'rgba(59,130,246,0.15)', color: '#3b82f6', display: 'flex' }}>
                            <AddLinkIcon sx={{ fontSize: 20 }} />
                        </Box>
                        Add External Link / Resource
                    </Box>
                    <IconButton size="small" onClick={() => setLinkDialogOpen(false)}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            autoFocus fullWidth label="Link Name / Title"
                            value={newLinkName} onChange={(e) => setNewLinkName(e.target.value)}
                            placeholder="e.g. Reference Documentation"
                            sx={fieldStyles}
                        />
                        <TextField
                            fullWidth label="URL (https://...)"
                            value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)}
                            placeholder="https://example.com/resource"
                            sx={fieldStyles}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><LinkIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment>
                            }}
                        />

                        <Box sx={{ p: 2, borderRadius: '8px', bgcolor: 'var(--color-vc-canvas-soft, #f8faee)', border: '1px solid var(--color-vc-hairline, rgba(0,0,0,0.08))' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: '13px' }}>
                                <MenuBookIcon sx={{ fontSize: 16, color: 'primary.main' }} /> Curriculum Placement Target
                            </Typography>
                            
                            <Stack spacing={1.5}>
                                <FormControl fullWidth size="small" sx={fieldStyles}>
                                    <InputLabel>Module (Required)</InputLabel>
                                    <Select
                                        value={selectedModule} label="Module (Required)"
                                        onChange={(e) => setSelectedModule(e.target.value)}
                                    >
                                        <MenuItem key="link-mod-default" value=""><em>Select Module</em></MenuItem>
                                        {courseModules.map(m => (
                                            <MenuItem key={String(m._id || m.id)} value={String(m._id || m.id)}>{m.title}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth size="small" sx={fieldStyles}>
                                    <InputLabel>Lecture (Optional)</InputLabel>
                                    <Select
                                        value={selectedLecture} label="Lecture (Optional)"
                                        onChange={(e) => setSelectedLecture(e.target.value)}
                                        disabled={!selectedModule}
                                    >
                                        <MenuItem key="link-lec-default" value=""><em>No Lecture (Module Level)</em></MenuItem>
                                        {courseLectures.map(l => (
                                            <MenuItem key={String(l._id || l.id)} value={String(l._id || l.id)}>{l.title}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth size="small" sx={fieldStyles}>
                                    <InputLabel>Target Assignments (Optional)</InputLabel>
                                    <Select
                                        multiple value={selectedAssignments}
                                        label="Target Assignments (Optional)"
                                        onChange={(e) => setSelectedAssignments(e.target.value)}
                                        renderValue={(selected) => {
                                            if (selected.length === 0) return <em>Unlock All in Lecture/Module</em>;
                                            return `${selected.length} assignment(s) selected`;
                                        }}
                                        disabled={!selectedModule}
                                    >
                                        {courseAssignments.map(a => {
                                            const idStr = String(a._id || a.id);
                                            return (
                                                <MenuItem key={idStr} value={idStr}>
                                                    <Checkbox checked={selectedAssignments.indexOf(idStr) > -1} size="small" />
                                                    <ListItemText primary={a.title} primaryTypographyProps={{ fontSize: '13px' }} />
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth size="small" sx={fieldStyles}>
                                    <InputLabel>Target Exams (Optional)</InputLabel>
                                    <Select
                                        multiple value={selectedExams}
                                        label="Target Exams (Optional)"
                                        onChange={(e) => setSelectedExams(e.target.value)}
                                        renderValue={(selected) => {
                                            if (selected.length === 0) return <em>Unlock All in Lecture/Module</em>;
                                            return `${selected.length} exam(s) selected`;
                                        }}
                                        disabled={!selectedModule}
                                    >
                                        {courseExams.map(ex => {
                                            const idStr = String(ex._id || ex.id);
                                            return (
                                                <MenuItem key={idStr} value={idStr}>
                                                    <Checkbox checked={selectedExams.indexOf(idStr) > -1} size="small" />
                                                    <ListItemText primary={ex.title} primaryTypographyProps={{ fontSize: '13px' }} />
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            </Stack>
                        </Box>
                    </Stack>
                </DialogContent>

                <Box sx={{ px: 3, pb: 2.5, pt: 1, display: 'flex', justifyContent: 'flex-end', gap: 1.2 }}>
                    <Button onClick={() => setLinkDialogOpen(false)} sx={{ textTransform: 'none', fontWeight: 500 }}>
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        onClick={handleAddLink} 
                        disabled={!newLinkName.trim() || !newLinkUrl.trim() || !selectedModule}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 2.5 }}
                    >
                        Add Link
                    </Button>
                </Box>
            </Dialog>

            {/* Upload Files Dialog */}
            <Dialog 
                open={uploadModalOpen} 
                onClose={() => setUploadModalOpen(false)} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{ sx: dialogPaperStyle }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: '16px', pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Box sx={{ p: 0.8, borderRadius: '8px', bgcolor: 'rgba(99,102,241,0.15)', color: '#6366f1', display: 'flex' }}>
                            <CloudUploadIcon sx={{ fontSize: 20 }} />
                        </Box>
                        Upload Files to Batch Materials
                    </Box>
                    <IconButton size="small" onClick={() => setUploadModalOpen(false)}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {/* Drag & Drop File Zone */}
                        <Box
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleFileDrop}
                            sx={{
                                border: '2px dashed',
                                borderColor: selectedFiles.length > 0 ? 'primary.main' : 'var(--color-vc-hairline-strong, rgba(0,0,0,0.2))',
                                borderRadius: '10px',
                                p: 3,
                                textAlign: 'center',
                                bgcolor: 'var(--color-vc-canvas-soft, #f8f9ff)',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    bgcolor: 'action.hover'
                                }
                            }}
                            component="label"
                        >
                            <input 
                                type="file" 
                                multiple 
                                hidden 
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    setSelectedFiles(prev => [...prev, ...files]);
                                }} 
                            />
                            <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1, opacity: 0.8 }} />
                            <Typography sx={{ fontWeight: 700, fontSize: '14px', color: 'text.primary', mb: 0.5 }}>
                                Drag and drop files here, or click to browse
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Supports documents, videos, audio, images, code files, archives
                            </Typography>
                        </Box>

                        {/* Selected Files Queue */}
                        {selectedFiles.length > 0 && (
                            <Box sx={{ maxHeight: 140, overflowY: 'auto', p: 1.5, borderRadius: '8px', border: '1px solid var(--color-vc-hairline, rgba(0,0,0,0.1))' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                        FILES TO UPLOAD ({selectedFiles.length})
                                    </Typography>
                                    <Button size="small" color="error" onClick={() => setSelectedFiles([])} sx={{ fontSize: '11px', textTransform: 'none', p: 0 }}>
                                        Clear All
                                    </Button>
                                </Box>
                                <Stack spacing={0.8}>
                                    {selectedFiles.map((file, idx) => (
                                        <Paper key={idx} elevation={0} sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid', borderColor: 'divider', borderRadius: '6px' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                                                <InsertDriveFileIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                                <Typography variant="caption" sx={{ fontWeight: 600, noWrap: true }}>
                                                    {file.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
                                                    ({(file.size / 1024).toFixed(1)} KB)
                                                </Typography>
                                            </Box>
                                            <IconButton size="small" onClick={() => removeFile(idx)} color="error">
                                                <DeleteIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        )}

                        {/* Curriculum Placement Target */}
                        <Box sx={{ p: 2, borderRadius: '8px', bgcolor: 'var(--color-vc-canvas-soft, #f8faee)', border: '1px solid var(--color-vc-hairline, rgba(0,0,0,0.08))' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: '13px' }}>
                                <SchoolIcon sx={{ fontSize: 16, color: 'primary.main' }} /> Target Module & Curriculum Location
                            </Typography>

                            <Stack spacing={1.5}>
                                <FormControl fullWidth size="small" sx={fieldStyles}>
                                    <InputLabel>Module (Required)</InputLabel>
                                    <Select
                                        value={selectedModule} label="Module (Required)"
                                        onChange={(e) => setSelectedModule(e.target.value)}
                                    >
                                        <MenuItem key="up-mod-default" value=""><em>Select Module</em></MenuItem>
                                        {courseModules.map(m => (
                                            <MenuItem key={String(m._id || m.id)} value={String(m._id || m.id)}>{m.title}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth size="small" sx={fieldStyles}>
                                    <InputLabel>Lecture (Optional)</InputLabel>
                                    <Select
                                        value={selectedLecture} label="Lecture (Optional)"
                                        onChange={(e) => setSelectedLecture(e.target.value)}
                                        disabled={!selectedModule}
                                    >
                                        <MenuItem key="up-lec-default" value=""><em>No Lecture (Module Level)</em></MenuItem>
                                        {courseLectures.map(l => (
                                            <MenuItem key={String(l._id || l.id)} value={String(l._id || l.id)}>{l.title}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth size="small" sx={fieldStyles}>
                                    <InputLabel>Target Assignments (Optional)</InputLabel>
                                    <Select
                                        multiple value={selectedAssignments}
                                        label="Target Assignments (Optional)"
                                        onChange={(e) => setSelectedAssignments(e.target.value)}
                                        renderValue={(selected) => {
                                            if (selected.length === 0) return <em>Unlock All in Lecture/Module</em>;
                                            return `${selected.length} assignment(s) selected`;
                                        }}
                                        disabled={!selectedModule}
                                    >
                                        {courseAssignments.map(a => {
                                            const idStr = String(a._id || a.id);
                                            return (
                                                <MenuItem key={idStr} value={idStr}>
                                                    <Checkbox checked={selectedAssignments.indexOf(idStr) > -1} size="small" />
                                                    <ListItemText primary={a.title} primaryTypographyProps={{ fontSize: '13px' }} />
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth size="small" sx={fieldStyles}>
                                    <InputLabel>Target Exams (Optional)</InputLabel>
                                    <Select
                                        multiple value={selectedExams}
                                        label="Target Exams (Optional)"
                                        onChange={(e) => setSelectedExams(e.target.value)}
                                        renderValue={(selected) => {
                                            if (selected.length === 0) return <em>Unlock All in Lecture/Module</em>;
                                            return `${selected.length} exam(s) selected`;
                                        }}
                                        disabled={!selectedModule}
                                    >
                                        {courseExams.map(ex => {
                                            const idStr = String(ex._id || ex.id);
                                            return (
                                                <MenuItem key={idStr} value={idStr}>
                                                    <Checkbox checked={selectedExams.indexOf(idStr) > -1} size="small" />
                                                    <ListItemText primary={ex.title} primaryTypographyProps={{ fontSize: '13px' }} />
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            </Stack>
                        </Box>
                    </Stack>
                </DialogContent>

                <Box sx={{ px: 3, pb: 2.5, pt: 1, display: 'flex', justifyContent: 'flex-end', gap: 1.2 }}>
                    <Button onClick={() => setUploadModalOpen(false)} sx={{ textTransform: 'none', fontWeight: 500 }}>
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleUploadSubmit} 
                        disabled={!selectedModule || selectedFiles.length === 0}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 3 }}
                    >
                        Start Upload ({selectedFiles.length})
                    </Button>
                </Box>
            </Dialog>
        </>
    );
};

export default MaterialsModals;
