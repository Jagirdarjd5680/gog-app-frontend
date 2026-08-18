import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Box, Chip, Stack, IconButton, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { fixUrl } from '../../utils/api';
import { format } from 'date-fns';

const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg'];
const PDF_EXT = ['.pdf'];
const TEXT_EXT = ['.txt', '.md', '.csv', '.log', '.json'];

function getExtension(url) {
    if (!url) return '';
    const clean = url.split('?')[0].split('#')[0];
    const match = clean.match(/\.[a-z0-9]+$/i);
    return match ? match[0].toLowerCase() : '';
}

// Renders whatever the student submitted right inside the modal — images/PDFs/text preview
// inline, anything else (docx, zip, HEIC, ...) falls back to an "Open in new tab" / download
// link since the browser can't render those itself. Nothing navigates away by default.
const SubmissionPreviewModal = ({ open, onClose, submission }) => {
    if (!submission) return null;

    const rawUrl = submission.fileUrl;
    const url = rawUrl ? fixUrl(rawUrl) : null;
    const ext = getExtension(rawUrl);
    const isImage = IMAGE_EXT.includes(ext);
    const isPdf = PDF_EXT.includes(ext);
    const isText = TEXT_EXT.includes(ext);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box>
                    <Typography variant="subtitle1" fontWeight={800}>
                        {submission.student?.name || 'Submission'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {submission.assignmentTitle || ''}
                        {submission.assignmentTitle ? ' · ' : ''}
                        {submission.submittedAt ? format(new Date(submission.submittedAt), 'PPp') : ''}
                    </Typography>
                </Box>
                <IconButton size="small" onClick={onClose}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                            label={(submission.status || 'submitted').toUpperCase()}
                            size="small"
                            color={submission.status === 'graded' ? 'success' : 'warning'}
                        />
                        {submission.grade !== null && submission.grade !== undefined && (
                            <Chip label={`${submission.grade} Pts`} size="small" variant="outlined" />
                        )}
                    </Stack>

                    {submission.textAnswer && (
                        <Box>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">TEXT ANSWER</Typography>
                            <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>{submission.textAnswer}</Typography>
                        </Box>
                    )}

                    {submission.feedback && (
                        <Box>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">FEEDBACK</Typography>
                            <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>{submission.feedback}</Typography>
                        </Box>
                    )}

                    {url && <Divider />}

                    {url && isImage && (
                        <Box
                            component="img"
                            src={url}
                            alt="Submitted file"
                            sx={{ width: '100%', maxHeight: 480, objectFit: 'contain', borderRadius: 1, bgcolor: 'grey.100' }}
                        />
                    )}

                    {url && isPdf && (
                        <Box sx={{ width: '100%', height: 480 }}>
                            <iframe title="Submission PDF" src={url} style={{ width: '100%', height: '100%', border: 0 }} />
                        </Box>
                    )}

                    {url && isText && (
                        <Box sx={{ width: '100%', height: 320 }}>
                            <iframe title="Submission text" src={url} style={{ width: '100%', height: '100%', border: '1px solid', borderColor: '#e2e8f0', borderRadius: 4 }} />
                        </Box>
                    )}

                    {url && !isImage && !isPdf && !isText && (
                        <Box sx={{ py: 3, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 1 }}>
                            <InsertDriveFileIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                                This file type can't be previewed here — open it in a new tab instead.
                            </Typography>
                        </Box>
                    )}

                    {!url && !submission.textAnswer && (
                        <Typography variant="body2" color="text.secondary">No file was attached to this submission.</Typography>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                {url && (
                    <>
                        <Button startIcon={<OpenInNewIcon />} onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}>
                            Open in New Tab
                        </Button>
                        <Button startIcon={<DownloadIcon />} href={url} download target="_blank" rel="noopener noreferrer">
                            Download
                        </Button>
                    </>
                )}
                <Button onClick={onClose} variant="outlined">Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SubmissionPreviewModal;
