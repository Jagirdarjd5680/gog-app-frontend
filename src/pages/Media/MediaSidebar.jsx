import {
    Box,
    Typography,
    Button,
    Paper,
    Divider,
    FormControl,
    Select,
    MenuItem as SelectMenuItem,
    InputLabel,
    useTheme
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import ArchiveIcon from '@mui/icons-material/Archive';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

const MediaSidebar = ({
    activeTab,
    setActiveTab,
    uploaderTab,
    setUploaderTab,
    teachers,
    selectedTeacherId,
    setSelectedTeacherId,
    user
}) => {
    const theme = useTheme();

    const typeFilters = [
        { id: 'all', label: 'All Files', icon: <InsertDriveFileIcon size="small" /> },
        { id: 'image', label: 'Images', icon: <ImageIcon size="small" /> },
        { id: 'video', label: 'Videos', icon: <VideoLibraryIcon size="small" /> },
        { id: 'pdf', label: 'PDF Documents', icon: <PictureAsPdfIcon size="small" /> },
        { id: 'audio', label: 'Audio Lessons', icon: <AudioFileIcon size="small" /> },
        { id: 'other', label: 'Other Files', icon: <ArchiveIcon size="small" /> },
    ];

    const uploaderFilters = [
        { id: 'all', label: 'All Library', icon: <SupervisorAccountIcon size="small" /> },
        { id: 'admin', label: 'Admin Only', icon: <AdminPanelSettingsIcon size="small" /> },
        { id: 'teacher', label: 'Teacher Only', icon: <PersonIcon size="small" /> },
    ];

    return (
        <Paper
            elevation={0}
            sx={{
                width: 260,
                flexShrink: 0,
                borderRight: `1px solid ${theme.palette.divider}`,
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                p: 3,
                bgcolor: 'background.default'
            }}
        >
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                Filters
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {typeFilters.map((filter) => (
                    <Button
                        key={filter.id}
                        variant={activeTab === filter.id ? 'contained' : 'text'}
                        fullWidth
                        startIcon={filter.icon}
                        onClick={() => setActiveTab(filter.id)}
                        sx={{
                            justifyContent: 'flex-start',
                            py: 1.2,
                            px: 2,
                            borderRadius: 1.5,
                            textTransform: 'none',
                            fontWeight: activeTab === filter.id ? 700 : 500,
                            color: activeTab === filter.id ? 'white' : 'text.secondary',
                            '&:hover': {
                                bgcolor: activeTab === filter.id ? 'primary.main' : 'action.hover'
                            }
                        }}
                    >
                        {filter.label}
                    </Button>
                ))}
            </Box>

            {user?.role === 'admin' && (
                <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Uploader Type
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {uploaderFilters.map((filter) => (
                            <Button
                                key={filter.id}
                                variant={uploaderTab === filter.id ? 'contained' : 'text'}
                                fullWidth
                                startIcon={filter.icon}
                                onClick={() => {
                                    setUploaderTab(filter.id);
                                    if (filter.id !== 'teacher') setSelectedTeacherId('');
                                }}
                                sx={{
                                    justifyContent: 'flex-start',
                                    py: 1.2,
                                    px: 2,
                                    borderRadius: 1.5,
                                    textTransform: 'none',
                                    fontWeight: uploaderTab === filter.id ? 700 : 500,
                                    color: uploaderTab === filter.id ? 'white' : 'text.secondary',
                                    bgcolor: uploaderTab === filter.id ? 'secondary.main' : 'transparent',
                                    '&:hover': {
                                        bgcolor: uploaderTab === filter.id ? 'secondary.dark' : 'action.hover'
                                    }
                                }}
                            >
                                {filter.label}
                            </Button>
                        ))}
                    </Box>

                    {uploaderTab === 'teacher' && (
                        <Box sx={{ mt: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Select Teacher</InputLabel>
                                <Select
                                    value={selectedTeacherId}
                                    label="Select Teacher"
                                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                                    sx={{ borderRadius: 1.5 }}
                                >
                                    <SelectMenuItem value="">All Teachers</SelectMenuItem>
                                    {teachers.map((t) => (
                                        <SelectMenuItem key={t._id} value={t._id}>
                                            {t.name}
                                        </SelectMenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    )}
                </>
            )}
        </Paper>
    );
};

export default MediaSidebar;
