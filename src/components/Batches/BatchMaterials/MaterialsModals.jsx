import React from 'react';
import { 
    Dialog, DialogTitle, DialogContent, Box, TextField, Button, Stack, 
    Divider, Typography, FormControl, InputLabel, Select, MenuItem, Checkbox, 
    ListItemText, InputAdornment 
} from '@mui/material';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import AddLinkIcon from '@mui/icons-material/AddLink';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LinkIcon from '@mui/icons-material/Link';

const MaterialsModals = ({
    folderDialogOpen, setFolderDialogOpen,
    newFolderName, setNewFolderName,
    handleCreateFolder,
    
    linkDialogOpen, setLinkDialogOpen,
    newLinkName, setNewLinkName,
    newLinkUrl, setNewLinkUrl,
    handleAddLink,
    
    uploadModalOpen, setUploadModalOpen,
    selectedFiles, setSelectedFiles,
    handleUploadSubmit,
    
    selectedModule, setSelectedModule,
    selectedLecture, setSelectedLecture,
    selectedAssignments, setSelectedAssignments,
    selectedExams, setSelectedExams,
    
    courseModules, courseLectures, 
    courseAssignments, courseExams
}) => {
    return (
        <>
            {/* Create Folder Dialog */}
            <Dialog open={folderDialogOpen} onClose={() => setFolderDialogOpen(false)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CreateNewFolderIcon color="primary" />
                        New Folder
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus fullWidth label="Folder Name"
                        value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                        margin="dense" sx={{ mt: 1 }}
                    />
                </DialogContent>
                <Box sx={{ px: 3, pb: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button onClick={() => setFolderDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>Create</Button>
                </Box>
            </Dialog>

            {/* Add Link Dialog */}
            <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AddLinkIcon color="secondary" />
                        Add Link
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            autoFocus fullWidth label="Link Name / Title"
                            value={newLinkName} onChange={(e) => setNewLinkName(e.target.value)}
                            size="small"
                        />
                        <TextField
                            fullWidth label="URL (https://...)"
                            value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)}
                            size="small"
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><LinkIcon sx={{ fontSize: 18 }} /></InputAdornment>
                            }}
                        />

                        <Divider sx={{ my: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>LINK PLACEMENT</Typography>
                        </Divider>

                        <FormControl fullWidth size="small">
                            <InputLabel>Module (Required)</InputLabel>
                            <Select
                                value={selectedModule} label="Module (Required)"
                                onChange={(e) => setSelectedModule(e.target.value)}
                            >
                                <MenuItem value=""><em>Select Module</em></MenuItem>
                                {courseModules.map(m => (
                                    <MenuItem key={m._id || m.id} value={m._id || m.id}>{m.title}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                            <InputLabel>Lecture (Optional)</InputLabel>
                            <Select
                                value={selectedLecture} label="Lecture (Optional)"
                                onChange={(e) => setSelectedLecture(e.target.value)}
                                disabled={!selectedModule}
                            >
                                <MenuItem value=""><em>No Lecture (Module Level)</em></MenuItem>
                                {courseLectures.map(l => (
                                    <MenuItem key={l._id || l.id} value={l._id || l.id}>{l.title}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
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
                                <MenuItem value="" disabled><em>Select Assignments</em></MenuItem>
                                {courseAssignments.map(a => (
                                    <MenuItem key={a._id} value={a._id}>
                                        <Checkbox checked={selectedAssignments.indexOf(a._id) > -1} size="small" />
                                        <ListItemText primary={a.title} primaryTypographyProps={{ fontSize: '0.85rem' }} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
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
                                <MenuItem value="" disabled><em>Select Exams</em></MenuItem>
                                {courseExams.map(e => (
                                    <MenuItem key={e._id} value={e._id}>
                                        <Checkbox checked={selectedExams.indexOf(e._id) > -1} size="small" />
                                        <ListItemText primary={e.title} primaryTypographyProps={{ fontSize: '0.85rem' }} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <Box sx={{ px: 3, pb: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="secondary" onClick={handleAddLink} disabled={!newLinkName.trim() || !newLinkUrl.trim() || !selectedModule}>
                        Add Link
                    </Button>
                </Box>
            </Dialog>

            {/* Upload Configuration Dialog */}
            <Dialog open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <UploadFileIcon color="primary" />
                        Configure Upload
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Please select the module/lecture and the files you want to upload.
                    </Typography>
                    
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Module (Required)</InputLabel>
                            <Select
                                value={selectedModule} label="Module (Required)"
                                onChange={(e) => setSelectedModule(e.target.value)}
                            >
                                <MenuItem value=""><em>Select Module</em></MenuItem>
                                {courseModules.map(m => (
                                    <MenuItem key={m._id || m.id} value={m._id || m.id}>{m.title}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                            <InputLabel>Lecture (Optional)</InputLabel>
                            <Select
                                value={selectedLecture} label="Lecture (Optional)"
                                onChange={(e) => setSelectedLecture(e.target.value)}
                                disabled={!selectedModule}
                            >
                                <MenuItem value=""><em>No Lecture (Module Level)</em></MenuItem>
                                {courseLectures.map(l => (
                                    <MenuItem key={l._id || l.id} value={l._id || l.id}>{l.title}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
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
                                <MenuItem value="" disabled><em>Select Assignments</em></MenuItem>
                                {courseAssignments.map(a => (
                                    <MenuItem key={a._id} value={a._id}>
                                        <Checkbox checked={selectedAssignments.indexOf(a._id) > -1} size="small" />
                                        <ListItemText primary={a.title} primaryTypographyProps={{ fontSize: '0.85rem' }} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
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
                                <MenuItem value="" disabled><em>Select Exams</em></MenuItem>
                                {courseExams.map(e => (
                                    <MenuItem key={e._id} value={e._id}>
                                        <Checkbox checked={selectedExams.indexOf(e._id) > -1} size="small" />
                                        <ListItemText primary={e.title} primaryTypographyProps={{ fontSize: '0.85rem' }} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button variant="outlined" component="label" fullWidth startIcon={<UploadFileIcon />}>
                            Select Files
                            <input type="file" multiple hidden onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} />
                        </Button>
                        
                        {selectedFiles.length > 0 && (
                            <Typography variant="caption" color="primary" sx={{ textAlign: 'center' }}>
                                {selectedFiles.length} file(s) selected
                            </Typography>
                        )}
                    </Stack>
                </DialogContent>
                <Box sx={{ px: 3, pb: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button onClick={() => setUploadModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleUploadSubmit} disabled={!selectedModule || selectedFiles.length === 0}>
                        Start Upload
                    </Button>
                </Box>
            </Dialog>
        </>
    );
};

export default MaterialsModals;
