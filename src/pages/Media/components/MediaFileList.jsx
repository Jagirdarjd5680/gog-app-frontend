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
    useTheme,
    Checkbox,
    Pagination,
    IconButton,
    Tooltip,
    alpha
} from '@mui/material';
import MediaCard from '../MediaCard';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { fixUrl } from '../../../utils/api';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const MediaFileList = ({
    files,
    viewMode,
    selectedFiles,
    onToggleSelection,
    onSelectAll,
    onDelete,
    onCopy,
    onPreview,
    onSelect,
    formatSize
}) => {
    const theme = useTheme();

    const getFileIcon = (format) => {
        const fmt = format?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fmt)) return <ImageIcon sx={{ color: '#2196f3', fontSize: '1.2rem' }} />;
        if (['mp4', 'webm', 'mov'].includes(fmt)) return <VideoLibraryIcon sx={{ color: '#f44336', fontSize: '1.2rem' }} />;
        if (fmt === 'pdf') return <DescriptionIcon sx={{ color: '#ff9800', fontSize: '1.2rem' }} />;
        if (['js', 'jsx', 'ts', 'tsx', 'json', 'html', 'css'].includes(fmt)) return <CodeIcon sx={{ color: '#4caf50', fontSize: '1.2rem' }} />;
        return <Box sx={{ fontWeight: 900, fontSize: '0.6rem', color: theme.palette.text.secondary }}>{fmt?.toUpperCase()}</Box>;
    };

    if (viewMode === 'grid') {
        return (
            <Box>
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2, color: 'text.secondary', opacity: 0.8 }}>
                    ALL MEDIA FILES
                </Typography>
                <Grid container spacing={2}>
                    {files.map((file, idx) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} xl={3} key={`${file._id}-${idx}`}>
                            <MediaCard
                                file={file}
                                isSelected={selectedFiles.includes(file.name)}
                                onToggleSelection={onToggleSelection}
                                onDelete={onDelete}
                                onCopy={onCopy}
                                onPreview={onPreview}
                                onSelect={onSelect}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2, color: 'text.secondary', opacity: 0.8 }}>
                PROJECT FILES
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    size="small"
                                    indeterminate={selectedFiles.length > 0 && selectedFiles.length < files.length}
                                    checked={files.length > 0 && selectedFiles.length === files.length}
                                    onChange={onSelectAll}
                                />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.7rem', color: 'text.secondary' }}>NAME</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.7rem', color: 'text.secondary' }}>SIZE</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.7rem', color: 'text.secondary' }}>UPLOADED</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.7rem', color: 'text.secondary' }} align="right">ACTION</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {files.map((file, idx) => (
                            <TableRow key={`${file._id}-${idx}`} hover selected={selectedFiles.includes(file.name)}>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        size="small"
                                        checked={selectedFiles.includes(file.name)}
                                        onChange={() => onToggleSelection(file.name)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ 
                                            width: 32, 
                                            height: 32, 
                                            borderRadius: 1, 
                                            bgcolor: alpha(theme.palette.action.active, 0.05), 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center' 
                                        }}>
                                            {getFileIcon(file.format)}
                                        </Box>
                                        <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 300 }}>
                                            {file.name}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.8rem' }}>{formatSize(file.size)}</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem' }}>{format(new Date(file.createdAt), 'dd MMM, yyyy')}</TableCell>
                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                        {onSelect && (
                                            <Tooltip title="Select File">
                                                <IconButton size="small" color="primary" onClick={() => onSelect(file)}>
                                                    <CheckBoxIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Tooltip title="Preview"><IconButton size="small" onClick={() => onPreview(file)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Copy Link"><IconButton size="small" onClick={() => onCopy(fixUrl(file.url))}><ContentCopyIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => onDelete(file)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default MediaFileList;

