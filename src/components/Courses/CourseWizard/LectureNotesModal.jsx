import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    TextField,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    LinearProgress,
    CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NotesIcon from '@mui/icons-material/Notes';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import DescriptionIcon from '@mui/icons-material/Description';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { toast } from 'react-toastify';
import { uploadFile } from '../../../utils/upload';
import MediaPickerModal from '../../Media/MediaPickerModal';

const generateId = () => Math.random().toString(36).substr(2, 9);

function formatBytes(bytes) {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function fileTypeFromName(name) {
    const clean = (name || '').split('?')[0].split('#')[0];
    const ext = (clean.split('.').pop() || '').toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['zip', 'rar', '7z'].includes(ext)) return 'zip';
    if (['doc', 'docx'].includes(ext)) return 'doc';
    if (ext === 'txt') return 'txt';
    return 'other';
}

function noteIcon(fileType) {
    switch (fileType) {
        case 'pdf': return <PictureAsPdfIcon sx={{ color: 'var(--color-vc-error-deep)', fontSize: 20 }} />;
        case 'zip': return <FolderZipIcon sx={{ color: 'var(--color-vc-link-deep)', fontSize: 20 }} />;
        default: return <DescriptionIcon sx={{ color: 'var(--color-vc-mute)', fontSize: 20 }} />;
    }
}

const LectureNotesModal = ({ open, onClose, onSave, initialNotes, courseId, lectureTitle }) => {
    const [notes, setNotes] = useState([]);
    const [noteTitle, setNoteTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

    useEffect(() => {
        if (open) {
            setNotes(initialNotes || []);
            setNoteTitle('');
            setSelectedFile(null);
            setUploadProgress(0);
            setUploading(false);
        }
    }, [open, initialNotes]);

    const handleAddNote = async () => {
        if (!noteTitle.trim()) {
            toast.error('Please enter a note name');
            return;
        }
        if (!selectedFile) {
            toast.error('Please choose a file to upload');
            return;
        }

        try {
            setUploading(true);
            const result = await uploadFile(selectedFile, (progress) => setUploadProgress(progress), noteTitle, courseId);

            if (!result.success) {
                toast.error('Upload failed');
                return;
            }

            setNotes((prev) => [
                ...prev,
                {
                    id: generateId(),
                    title: noteTitle.trim(),
                    fileUrl: result.url,
                    fileType: fileTypeFromName(selectedFile.name),
                    fileSizeLabel: formatBytes(selectedFile.size),
                },
            ]);
            setNoteTitle('');
            setSelectedFile(null);
            setUploadProgress(0);
            toast.success('Note added');
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Upload failed';
            toast.error(`❌ ${errorMsg}`);
        } finally {
            setUploading(false);
        }
    };

    const handleSelectFromLibrary = (file) => {
        setNotes((prev) => [
            ...prev,
            {
                id: generateId(),
                title: file.title || file.name || 'Untitled',
                fileUrl: file.url,
                fileType: fileTypeFromName(file.title || file.name || file.url),
                fileSizeLabel: formatBytes(file.size),
            },
        ]);
        toast.success('Note added from media library');
    };

    const handleDeleteNote = (noteId) => {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
    };

    const handleDone = () => {
        onSave(notes);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: '8px',
                    p: 1,
                    bgcolor: 'var(--color-vc-canvas)',
                    color: 'var(--color-vc-ink)',
                    border: '1px solid var(--color-vc-hairline)',
                    boxShadow: '0px 24px 32px -8px rgba(0,0,0,0.1)',
                },
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 2, pb: 1.5 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ p: 1, borderRadius: '6px', bgcolor: 'var(--color-vc-canvas-soft-2)', border: '1px solid var(--color-vc-hairline)', display: 'flex' }}>
                        <NotesIcon sx={{ color: 'var(--color-vc-ink)', fontSize: 18 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit', letterSpacing: '-0.02em' }}>
                            Lecture Notes
                        </Typography>
                        {lectureTitle && (
                            <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>
                                {lectureTitle}
                            </Typography>
                        )}
                    </Box>
                </Stack>
                <IconButton onClick={onClose} size="small" sx={{ color: 'var(--color-vc-mute)', '&:hover': { color: 'var(--color-vc-ink)', bgcolor: 'var(--color-vc-canvas-soft)' } }}>
                    <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </DialogTitle>
            <Divider sx={{ borderColor: 'var(--color-vc-hairline)' }} />

            <DialogContent sx={{ px: 3, pt: 3 }}>
                <Stack spacing={1.5}>
                    {notes.length === 0 ? (
                        <Box sx={{ py: 3, textAlign: 'center', border: '1px dashed var(--color-vc-hairline)', borderRadius: '6px', bgcolor: 'var(--color-vc-canvas-soft)' }}>
                            <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '12px', fontFamily: 'inherit' }}>
                                No notes added yet. Upload a PDF, ZIP, or document below.
                            </Typography>
                        </Box>
                    ) : (
                        notes.map((note) => (
                            <Stack
                                key={note.id}
                                direction="row"
                                alignItems="center"
                                spacing={1.5}
                                sx={{ p: 1.25, borderRadius: '6px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)' }}
                            >
                                {noteIcon(note.fileType)}
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography noWrap sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>
                                        {note.title}
                                    </Typography>
                                    <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>
                                        {note.fileType?.toUpperCase()}{note.fileSizeLabel ? ` • ${note.fileSizeLabel}` : ''}
                                    </Typography>
                                </Box>
                                <IconButton size="small" onClick={() => handleDeleteNote(note.id)} sx={{ color: 'var(--color-vc-mute)', '&:hover': { color: 'var(--color-vc-error-deep)' } }}>
                                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Stack>
                        ))
                    )}

                    <Divider sx={{ borderColor: 'var(--color-vc-hairline)', my: 1 }} />

                    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'inherit' }}>
                        Add Note
                    </Typography>
                    <TextField
                        fullWidth
                        label="Note Name"
                        placeholder="e.g. Chapter 1 Summary"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        size="small"
                        InputLabelProps={{ sx: { fontFamily: 'inherit', fontSize: '13px', color: 'var(--color-vc-mute)' } }}
                        InputProps={{ sx: { fontFamily: 'inherit', fontSize: '13px', color: 'var(--color-vc-ink)' } }}
                    />
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Button
                            variant="outlined"
                            component="label"
                            sx={{
                                borderRadius: '6px',
                                textTransform: 'none',
                                fontSize: '13px',
                                fontFamily: 'inherit',
                                borderColor: 'var(--color-vc-hairline)',
                                color: 'var(--color-vc-ink)',
                                bgcolor: 'var(--color-vc-canvas)',
                                '&:hover': { borderColor: 'var(--color-vc-hairline-strong)', bgcolor: 'var(--color-vc-canvas-soft)' },
                            }}
                            disabled={uploading}
                        >
                            {selectedFile ? selectedFile.name : 'Choose File (PDF, ZIP, DOC...)'}
                            <input
                                type="file"
                                hidden
                                accept=".pdf,.zip,.rar,.7z,.doc,.docx,.txt"
                                onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                            />
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleAddNote}
                            disabled={uploading}
                            sx={{
                                borderRadius: '6px',
                                textTransform: 'none',
                                fontWeight: 500,
                                fontSize: '13px',
                                fontFamily: 'inherit',
                                boxShadow: 'none',
                                bgcolor: 'var(--color-vc-primary)',
                                color: 'var(--color-vc-on-primary)',
                                '&:hover': { bgcolor: 'var(--color-vc-primary)', opacity: 0.9, boxShadow: 'none' },
                            }}
                        >
                            {uploading ? <CircularProgress size={16} color="inherit" /> : 'Add'}
                        </Button>
                    </Box>
                    <Button
                        startIcon={<LibraryBooksIcon sx={{ fontSize: 16 }} />}
                        onClick={() => setMediaPickerOpen(true)}
                        disabled={uploading}
                        sx={{
                            alignSelf: 'flex-start',
                            borderRadius: '6px',
                            textTransform: 'none',
                            fontSize: '12px',
                            fontFamily: 'inherit',
                            color: 'var(--color-vc-link-deep)',
                            '&:hover': { bgcolor: 'var(--color-vc-canvas-soft)' },
                        }}
                    >
                        Or choose from Media Library
                    </Button>
                    {uploading && (
                        <LinearProgress
                            variant="determinate"
                            value={uploadProgress}
                            sx={{ borderRadius: 5, height: 4, '& .MuiLinearProgress-bar': { bgcolor: 'var(--color-vc-ink)' } }}
                        />
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 1.5 }}>
                <Button
                    onClick={onClose}
                    sx={{
                        borderRadius: '6px',
                        textTransform: 'none',
                        fontWeight: 500,
                        px: 3,
                        height: 36,
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        color: 'var(--color-vc-body)',
                        '&:hover': { bgcolor: 'var(--color-vc-canvas-soft)', color: 'var(--color-vc-ink)' },
                    }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleDone}
                    sx={{
                        borderRadius: '6px',
                        textTransform: 'none',
                        fontWeight: 500,
                        px: 4,
                        height: 36,
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        boxShadow: 'none',
                        bgcolor: 'var(--color-vc-primary)',
                        color: 'var(--color-vc-on-primary)',
                        '&:hover': { bgcolor: 'var(--color-vc-primary)', opacity: 0.9, boxShadow: 'none' },
                    }}
                >
                    Save Notes
                </Button>
            </DialogActions>

            <MediaPickerModal
                open={mediaPickerOpen}
                onClose={() => setMediaPickerOpen(false)}
                onSelect={handleSelectFromLibrary}
            />
        </Dialog>
    );
};

export default LectureNotesModal;
