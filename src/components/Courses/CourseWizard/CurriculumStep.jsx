import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
    Box,
    Typography,
    Button,
    IconButton,
    TextField,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Card,
    Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import DescriptionIcon from '@mui/icons-material/Description';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import LectureModal from './LectureModal';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const CurriculumStep = ({ values, setFieldValue }) => {
    // State for Inline Module Editing
    const [editingModuleId, setEditingModuleId] = useState(null);
    const [moduleTitle, setModuleTitle] = useState('');

    // State for Lecture Modal
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [currentModuleId, setCurrentModuleId] = useState(null);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);

    // --- Drag and Drop Handlers ---
    const onDragEnd = (result) => {
        const { source, destination, type } = result;
        if (!destination) return;

        if (type === 'module') {
            const newModules = [...values.modules];
            const [reorderedModule] = newModules.splice(source.index, 1);
            newModules.splice(destination.index, 0, reorderedModule);
            setFieldValue('modules', newModules);
        } else if (type === 'lecture') {
            const newModules = [...values.modules];
            const sourceModuleIndex = newModules.findIndex(m => m.id === source.droppableId);
            const destModuleIndex = newModules.findIndex(m => m.id === destination.droppableId);

            if (sourceModuleIndex >= 0 && destModuleIndex >= 0) {
                const sourceModule = { ...newModules[sourceModuleIndex] };
                const destModule = sourceModuleIndex === destModuleIndex ? sourceModule : { ...newModules[destModuleIndex] };

                const sourceVideos = [...sourceModule.videos];
                const [movedVideo] = sourceVideos.splice(source.index, 1);

                if (sourceModuleIndex === destModuleIndex) {
                    sourceVideos.splice(destination.index, 0, movedVideo);
                    newModules[sourceModuleIndex] = { ...sourceModule, videos: sourceVideos };
                } else {
                    const destVideos = [...(destModule.videos || [])];
                    destVideos.splice(destination.index, 0, movedVideo);
                    newModules[sourceModuleIndex] = { ...sourceModule, videos: sourceVideos };
                    newModules[destModuleIndex] = { ...destModule, videos: destVideos };
                }
                setFieldValue('modules', newModules);
            }
        }
    };

    // --- Module Handlers ---
    const addModule = () => {
        const newModule = {
            id: generateId(),
            title: 'New Topic',
            videos: []
        };
        setFieldValue('modules', [...values.modules, newModule]);
        setEditingModuleId(newModule.id);
        setModuleTitle('New Topic');
    };

    const deleteModule = (index) => {
        const newModules = [...values.modules];
        newModules.splice(index, 1);
        setFieldValue('modules', newModules);
    };

    const startEditingModule = (moduleId, title) => {
        setEditingModuleId(moduleId);
        setModuleTitle(title);
    };

    const saveModuleTitle = (index) => {
        if (editingModuleId && moduleTitle.trim()) {
            const newModules = [...values.modules];
            newModules[index] = { ...newModules[index], title: moduleTitle.trim() };
            setFieldValue('modules', newModules);
        }
        setEditingModuleId(null);
        setModuleTitle('');
    };

    // --- Lecture Handlers ---
    const openVideoModal = (moduleId, video = null, videoIndex = null) => {
        setCurrentModuleId(moduleId);
        setCurrentVideoIndex(videoIndex);
        setSelectedVideo(video);
        setVideoModalOpen(true);
    };

    const handleSaveLecture = (lectureData) => {
        if (!currentModuleId) return;

        const refreshedLecture = {
            id: currentVideoIndex !== null ? selectedVideo.id : generateId(),
            ...lectureData,
            // Map common field names for consistency
            url: lectureData.videoUrl,
            freePreview: lectureData.isFree,
            duration: lectureData.duration ? Number(lectureData.duration) : 0
        };

        const newModules = values.modules.map(module => {
            if (module.id === currentModuleId) {
                const updatedVideos = [...(module.videos || [])];
                if (currentVideoIndex !== null) {
                    updatedVideos[currentVideoIndex] = refreshedLecture;
                } else {
                    updatedVideos.push(refreshedLecture);
                }
                return { ...module, videos: updatedVideos };
            }
            return module;
        });

        setFieldValue('modules', newModules);
        setVideoModalOpen(false);
    };

    const deleteVideo = (moduleIndex, videoIndex) => {
        const newModules = values.modules.map((module, mIdx) => {
            if (mIdx === moduleIndex) {
                const refreshedVideos = module.videos.filter((_, vIdx) => vIdx !== videoIndex);
                return { ...module, videos: refreshedVideos };
            }
            return module;
        });
        setFieldValue('modules', newModules);
    };

    const getLectureIcon = (type) => {
        switch (type) {
            case 'pdf': return <DescriptionIcon fontSize="small" color="secondary" />;
            case 'audio': return <AudiotrackIcon fontSize="small" color="warning" />;
            case 'zip': return <FolderZipIcon fontSize="small" color="error" />;
            default: return <OndemandVideoIcon fontSize="small" color="primary" />;
        }
    };

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} display="flex" alignItems="center" gap={1}>
                    <PlaylistAddCheckIcon color="primary" fontSize="small" /> Curriculum
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={addModule}
                    size="small"
                >
                    Add Topic
                </Button>
            </Box>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="curriculum" type="module">
                    {(provided) => (
                        <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {values.modules.map((module, index) => (
                                <Draggable key={module.id} draggableId={module.id} index={index}>
                                    {(provided) => (
                                        <Card
                                            variant="outlined"
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            sx={{ borderRadius: 1, bgcolor: 'background.paper' }}
                                        >
                                            <Accordion
                                                defaultExpanded
                                                elevation={0}
                                                disableGutters
                                                sx={{ '&:before': { display: 'none' } }}
                                            >
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon />}
                                                    sx={{
                                                        flexDirection: 'row-reverse',
                                                        '& .MuiAccordionSummary-content': { alignItems: 'center', ml: 1 },
                                                        bgcolor: 'action.hover',
                                                        minHeight: 48
                                                    }}
                                                >
                                                    <Box {...provided.dragHandleProps} sx={{ display: 'flex', alignItems: 'center', mr: 1, cursor: 'grab', color: 'text.secondary' }}>
                                                        <DragIndicatorIcon fontSize="small" />
                                                    </Box>

                                                    {editingModuleId === module.id ? (
                                                        <TextField
                                                            size="small"
                                                            value={moduleTitle}
                                                            onChange={(e) => setModuleTitle(e.target.value)}
                                                            onBlur={() => saveModuleTitle(index)}
                                                            onKeyPress={(e) => e.key === 'Enter' && saveModuleTitle(index)}
                                                            autoFocus
                                                            onClick={(e) => e.stopPropagation()}
                                                            sx={{ flexGrow: 1, mr: 2 }}
                                                        />
                                                    ) : (
                                                        <Typography sx={{ flexGrow: 1, fontWeight: 500 }} onClick={(e) => { e.stopPropagation(); startEditingModule(module.id, module.title); }}>
                                                            {module.title}
                                                        </Typography>
                                                    )}

                                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); deleteModule(index); }}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </AccordionSummary>

                                                <Divider />

                                                <AccordionDetails sx={{ p: 1, bgcolor: 'background.default' }}>
                                                    <Droppable droppableId={module.id} type="lecture">
                                                        {(provided) => (
                                                            <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                {module.videos.map((video, vIndex) => (
                                                                    <Draggable key={video.id} draggableId={video.id} index={vIndex}>
                                                                        {(provided) => (
                                                                            <Card
                                                                                variant="outlined"
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                                sx={{
                                                                                    p: 1,
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    borderRadius: 1,
                                                                                    bgcolor: 'background.paper'
                                                                                }}
                                                                            >
                                                                                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                                                                    <DragIndicatorIcon fontSize="small" />
                                                                                </Box>
                                                                                <Box sx={{ mr: 1 }}>
                                                                                    {getLectureIcon(video.type)}
                                                                                </Box>
                                                                                <Box sx={{ flexGrow: 1 }}>
                                                                                    <Typography variant="body2" fontWeight={500}>{video.title}</Typography>
                                                                                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                                                                        {video.type || 'video'} • {video.duration ? `${video.duration} min/mb` : 'Size not set'}
                                                                                    </Typography>
                                                                                </Box>
                                                                                <IconButton size="small" onClick={() => openVideoModal(module.id, video, vIndex)}>
                                                                                    <EditIcon fontSize="small" />
                                                                                </IconButton>
                                                                                <IconButton size="small" onClick={() => deleteVideo(index, vIndex)}>
                                                                                    <DeleteIcon fontSize="small" />
                                                                                </IconButton>
                                                                            </Card>
                                                                        )}
                                                                    </Draggable>
                                                                ))}
                                                                {provided.placeholder}
                                                                <Button
                                                                    startIcon={<AddIcon />}
                                                                    size="small"
                                                                    onClick={() => openVideoModal(module.id)}
                                                                    sx={{ alignSelf: 'flex-start', mt: 1 }}
                                                                >
                                                                    Add Lecture
                                                                </Button>
                                                            </Box>
                                                        )}
                                                    </Droppable>
                                                </AccordionDetails>
                                            </Accordion>
                                        </Card>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </Box>
                    )}
                </Droppable>
            </DragDropContext>

            <LectureModal
                open={videoModalOpen}
                onClose={() => setVideoModalOpen(false)}
                onSave={handleSaveLecture}
                initialData={selectedVideo}
            />
        </Box>
    );
};

export default CurriculumStep;
