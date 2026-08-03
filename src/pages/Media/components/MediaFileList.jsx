import React from 'react';
import {
    Box,
    Grid,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    IconButton,
    Tooltip,
    Stack,
    Chip
} from '@mui/material';
import MediaCard from '../MediaCard';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import { format } from 'date-fns';
import { fixUrl } from '../../../utils/api';

const defaultFormatSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const MediaFileList = ({
    files = [],
    viewMode = 'grid',
    selectedFiles = [],
    onToggleSelection,
    onSelectAll,
    onDelete,
    onCopy,
    onPreview,
    onSelect,
    formatSize = defaultFormatSize
}) => {
    const getFileIcon = (format) => {
        const fmt = format?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fmt)) return <ImageIcon color="info" fontSize="small" />;
        if (['mp4', 'webm', 'mov'].includes(fmt)) return <VideoLibraryIcon color="primary" fontSize="small" />;
        if (fmt === 'pdf') return <DescriptionIcon color="error" fontSize="small" />;
        if (['js', 'jsx', 'ts', 'tsx', 'json', 'html', 'css'].includes(fmt)) return <CodeIcon color="success" fontSize="small" />;
        return <Typography variant="caption" fontWeight={800} sx={{ color: 'var(--color-vc-mute)' }}>{(fmt || 'FILE').toUpperCase()}</Typography>;
    };

    if (viewMode === 'grid') {
        return (
            <Box>
                <Grid container spacing={2}>
                    {files.map((file, idx) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} xl={3} key={`${file._id || file.id || file.name}-${idx}`}>
                            <MediaCard
                                file={file}
                                isSelected={selectedFiles.includes(file.name)}
                                onToggleSelection={() => onToggleSelection && onToggleSelection(file.name)}
                                onDelete={() => onDelete && onDelete(file.name)}
                                onCopy={() => onCopy && onCopy(file)}
                                onPreview={() => onPreview && onPreview(file)}
                                onSelect={() => onSelect && onSelect(file)}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{
                borderRadius: '16px',
                border: '1px solid var(--color-vc-hairline)',
                bgcolor: 'var(--color-vc-canvas-soft)'
            }}
        >
            <Table stickyHeader size="small">
                <TableHead>
                    <TableRow sx={{ bgcolor: 'var(--color-vc-canvas)' }}>
                        <TableCell padding="checkbox">
                            <Checkbox
                                size="small"
                                indeterminate={selectedFiles.length > 0 && selectedFiles.length < files.length}
                                checked={files.length > 0 && selectedFiles.length === files.length}
                                onChange={onSelectAll}
                            />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--color-vc-mute)' }}>ASSET NAME</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--color-vc-mute)' }}>SIZE</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--color-vc-mute)' }}>TYPE</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--color-vc-mute)' }}>DATE</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--color-vc-mute)' }}>ACTIONS</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {files.map((file) => {
                        const isSelected = selectedFiles.includes(file.name);
                        return (
                            <TableRow
                                key={file._id || file.id || file.name}
                                hover
                                selected={isSelected}
                                sx={{ '&:hover': { bgcolor: 'var(--color-vc-canvas)' } }}
                            >
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        size="small"
                                        checked={isSelected}
                                        onChange={() => onToggleSelection && onToggleSelection(file.name)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        {getFileIcon(file.format || file.type)}
                                        <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                                            {file.title || file.name}
                                        </Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption" fontWeight={600} sx={{ color: 'var(--color-vc-mute)' }}>
                                        {formatSize(file.size)}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={(file.format || file.type || 'FILE').toUpperCase()}
                                        size="small"
                                        sx={{ fontWeight: 800, fontSize: '0.65rem', borderRadius: '6px' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>
                                        {file.createdAt ? format(new Date(file.createdAt), 'MMM dd, yyyy') : 'Recent'}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <Tooltip title="Preview">
                                            <IconButton size="small" onClick={() => onPreview && onPreview(file)} sx={{ color: 'var(--color-vc-link)' }}>
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Copy Link">
                                            <IconButton size="small" onClick={() => onCopy && onCopy(file)} sx={{ color: 'var(--color-vc-mute)' }}>
                                                <ContentCopyIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton size="small" onClick={() => onDelete && onDelete(file.name)} sx={{ color: 'var(--color-vc-error)' }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default MediaFileList;
