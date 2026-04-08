import { useState, useCallback } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    useDroppable,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

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
    Divider,
    Stack,
    Paper,
    Tooltip,
    Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import DescriptionIcon from '@mui/icons-material/Description';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import LectureModal from './LectureModal';

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Sortable Item Component for Lectures ---
const SortableLecture = ({ video, vIndex, moduleId, onEdit, onDelete, getLectureIcon, isDraggingGlobal }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ 
        id: video.id,
        data: {
            type: 'lecture',
            moduleId: moduleId,
            video: video
        }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 999 : 1,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            elevation={isDragging ? 4 : 0}
            sx={{
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                borderRadius: '12px',
                bgcolor: 'white',
                border: '1px solid',
                borderColor: isDragging ? 'primary.main' : 'rgba(0,0,0,0.06)',
                '&:hover': { borderColor: 'primary.light', bgcolor: '#fcfdff' },
                touchAction: 'none'
            }}
        >
            <Box {...attributes} {...listeners} sx={{ mr: 2, color: 'text.disabled', cursor: 'grab' }}>
                <DragIndicatorIcon fontSize="small" />
            </Box>
            <Box sx={{ mr: 2 }}>
                {getLectureIcon(video.type)}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" fontWeight={700} sx={{ color: '#334155' }}>
                    {video.title}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {video.type || 'video'}
                    </Typography>
                    <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                    <Typography variant="caption" color="text.secondary">
                        {video.duration ? `${video.duration} min` : 'No duration'}
                    </Typography>
                    {video.freePreview && (
                        <Chip label="Free Preview" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: 'success.light', color: 'success.dark', fontWeight: 800 }} />
                    )}
                </Stack>
            </Box>
            <Stack direction="row" spacing={0.5}>
                <IconButton size="small" onClick={() => onEdit(moduleId, video, vIndex)}>
                    <EditOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => onDelete(moduleId, vIndex)}>
                    <DeleteOutlineIcon fontSize="small" />
                </IconButton>
            </Stack>
        </Card>
    );
};

// --- Sortable Item Component for Modules ---
const SortableModule = ({ 
    module, index, onDeleteModule, onAddLecture, 
    onEditLecture, onDeleteLecture, getLectureIcon, editingModuleId, 
    moduleTitle, setModuleTitle, saveModuleTitle, startEditingModule
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ 
        id: module.id,
        data: {
            type: 'module'
        }
    });

    const { setNodeRef: setDroppableRef } = useDroppable({
        id: module.id,
        data: {
            type: 'module'
        }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 998 : 1,
    };

    return (
        <Paper
            ref={setNodeRef}
            style={style}
            elevation={isDragging ? 10 : 0}
            sx={{ 
                borderRadius: '16px', 
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.08)',
                bgcolor: 'white',
                '&:hover': { borderColor: 'primary.main' }
            }}
        >
            <Accordion defaultExpanded elevation={0} disableGutters sx={{ '&:before': { display: 'none' } }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}
                    sx={{
                        px: 3, py: 1,
                        bgcolor: isDragging ? 'rgba(99, 102, 241, 0.05)' : '#f8fafc',
                    }}
                >
                    <Box {...attributes} {...listeners} sx={{ display: 'flex', alignItems: 'center', mr: 2, color: 'text.disabled', cursor: 'grab', '&:hover': { color: 'primary.main' } }}>
                        <DragIndicatorIcon />
                    </Box>
                    <Typography sx={{ fontWeight: 700, color: 'text.secondary', mr: 2, fontSize: '0.9rem' }}>
                        Module {index + 1}:
                    </Typography>

                    {editingModuleId === module.id ? (
                        <Box sx={{ flexGrow: 1, mr: 2 }}>
                            <TextField
                                size="small"
                                fullWidth
                                value={moduleTitle}
                                onChange={(e) => setModuleTitle(e.target.value)}
                                onBlur={() => saveModuleTitle(index)}
                                onKeyPress={(e) => e.key === 'Enter' && saveModuleTitle(index)}
                                autoFocus
                                variant="standard"
                                onClick={(e) => e.stopPropagation()}
                                sx={{ '& .MuiInput-root': { fontWeight: 700, fontSize: '1.1rem' } }}
                            />
                        </Box>
                    ) : (
                        <Typography 
                            sx={{ flexGrow: 1, fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', '&:hover': { color: 'primary.main' } }} 
                            onClick={(e) => { e.stopPropagation(); startEditingModule(module.id, module.title); }}
                        >
                            {module.title}
                        </Typography>
                    )}

                    <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); startEditingModule(module.id, module.title); }}>
                            <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDeleteModule(index); }}>
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </AccordionSummary>

                <Divider />

                <AccordionDetails sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.01)' }}>
                    <Box ref={setDroppableRef} sx={{ minHeight: 40 }}>
                        <SortableContext items={module.videos.map(v => v.id)} strategy={verticalListSortingStrategy}>
                            <Stack spacing={1.5}>
                                {module.videos.map((video, vIndex) => (
                                    <SortableLecture 
                                        key={video.id} 
                                        video={video} 
                                        vIndex={vIndex} 
                                        moduleId={module.id} 
                                        onEdit={onEditLecture}
                                        onDelete={onDeleteLecture}
                                        getLectureIcon={getLectureIcon}
                                    />
                                ))}
                                {module.videos.length === 0 && (
                                    <Box sx={{ py: 3, textAlign: 'center', border: '1px dashed rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                                        <Typography variant="caption" color="text.disabled">Empty Module. Drag lectures here or add new ones.</Typography>
                                    </Box>
                                )}
                                <Button
                                    fullWidth
                                    variant="dashed"
                                    startIcon={<AddIcon />}
                                    onClick={() => onAddLecture(module.id)}
                                    sx={{ 
                                        py: 1.5, borderRadius: '12px', border: '2px dashed #e2e8f0', color: 'text.secondary',
                                        textTransform: 'none', fontWeight: 600,
                                        '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: 'rgba(99, 102, 241, 0.02)' }
                                    }}
                                >
                                    Add Lecture / Resource
                                </Button>
                            </Stack>
                        </SortableContext>
                    </Box>
                </AccordionDetails>
            </Accordion>
        </Paper>
    );
};

const CurriculumStep = ({ values, setFieldValue }) => {
    const [editingModuleId, setEditingModuleId] = useState(null);
    const [moduleTitle, setModuleTitle] = useState('');
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [currentModuleId, setCurrentModuleId] = useState(null);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const findContainer = useCallback((id) => {
        if (values.modules.some(m => m.id === id)) return id;
        const module = values.modules.find(m => m.videos.some(v => v.id === id));
        return module ? module.id : null;
    }, [values.modules]);

    const handleDragOver = ({ active, over }) => {
        const overId = over?.id;
        if (!overId || active.id === overId) return;

        const activeContainer = findContainer(active.id);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer === overContainer) return;

        // Moving between containers
        const activeModuleIdx = values.modules.findIndex(m => m.id === activeContainer);
        const overModuleIdx = values.modules.findIndex(m => m.id === overContainer);
        const activeLectureIdx = values.modules[activeModuleIdx].videos.findIndex(v => v.id === active.id);
        
        // If we are over another lecture, find its index. If over a module, put at the end.
        let overLectureIdx = values.modules[overModuleIdx].videos.findIndex(v => v.id === overId);
        if (overLectureIdx === -1) overLectureIdx = values.modules[overModuleIdx].videos.length;

        const newModules = [...values.modules];
        const [movedLecture] = newModules[activeModuleIdx].videos.splice(activeLectureIdx, 1);
        newModules[overModuleIdx].videos.splice(overLectureIdx, 0, movedLecture);
        
        setFieldValue('modules', newModules);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (activeContainer && overContainer) {
            const activeModuleIdx = values.modules.findIndex(m => m.id === activeContainer);
            const overModuleIdx = values.modules.findIndex(m => m.id === overContainer);

            if (activeId === activeContainer && overId === overContainer) {
                // Reordering modules
                const newModules = arrayMove(values.modules, activeModuleIdx, overModuleIdx);
                setFieldValue('modules', newModules);
            } else if (activeContainer === overContainer) {
                // Sorting within same module (handleDragEnd handles if overId is a lecture)
                const activeLectureIdx = values.modules[activeModuleIdx].videos.findIndex(v => v.id === activeId);
                const overLectureIdx = values.modules[overModuleIdx].videos.findIndex(v => v.id === overId);
                
                if (activeLectureIdx !== -1 && overLectureIdx !== -1) {
                    const newModules = [...values.modules];
                    newModules[activeModuleIdx].videos = arrayMove(
                        newModules[activeModuleIdx].videos,
                        activeLectureIdx,
                        overLectureIdx
                    );
                    setFieldValue('modules', newModules);
                }
            }
        }
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const addModule = () => {
        const newModule = { id: generateId(), title: 'New Module Title', videos: [] };
        setFieldValue('modules', [...values.modules, newModule]);
        setEditingModuleId(newModule.id);
        setModuleTitle('New Module Title');
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

    const openVideoModal = (moduleId, video = null, videoIndex = null) => {
        setCurrentModuleId(moduleId);
        setCurrentVideoIndex(videoIndex);
        setSelectedVideo(video);
        setVideoModalOpen(true);
    };

    const handleSaveLecture = (lectureData) => {
        const refreshedLecture = {
            id: currentVideoIndex !== null ? selectedVideo.id : generateId(),
            ...lectureData,
            url: lectureData.videoUrl,
            freePreview: lectureData.isFree,
            duration: lectureData.duration ? Number(lectureData.duration) : 0
        };

        const newModules = values.modules.map(module => {
            if (module.id === currentModuleId) {
                const updatedVideos = [...(module.videos || [])];
                if (currentVideoIndex !== null) updatedVideos[currentVideoIndex] = refreshedLecture;
                else updatedVideos.push(refreshedLecture);
                return { ...module, videos: updatedVideos };
            }
            return module;
        });

        setFieldValue('modules', newModules);
        setVideoModalOpen(false);
    };

    const deleteVideo = (moduleId, videoIndex) => {
        const newModules = values.modules.map(module => {
            if (module.id === moduleId) {
                const refreshedVideos = module.videos.filter((_, vIdx) => vIdx !== videoIndex);
                return { ...module, videos: refreshedVideos };
            }
            return module;
        });
        setFieldValue('modules', newModules);
    };

    const getLectureIcon = (type) => {
        const iconStyles = { p: 0.8, borderRadius: '8px', bgcolor: 'rgba(0,0,0,0.03)', display: 'flex' };
        switch (type) {
            case 'pdf': return <Box sx={iconStyles}><DescriptionIcon fontSize="small" sx={{ color: '#ef4444' }} /></Box>;
            case 'audio': return <Box sx={iconStyles}><AudiotrackIcon fontSize="small" sx={{ color: '#f59e0b' }} /></Box>;
            case 'zip': return <Box sx={iconStyles}><FolderZipIcon fontSize="small" sx={{ color: '#3b82f6' }} /></Box>;
            default: return <Box sx={iconStyles}><OndemandVideoIcon fontSize="small" sx={{ color: '#10b981' }} /></Box>;
        }
    };

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
                <Box>
                    <Typography variant="h5" fontWeight={800} sx={{ color: '#1e293b' }}>Curriculum Builder</Typography>
                    <Typography variant="body2" color="text.secondary">Organize your course into modules and lectures. Smooth drag-to-reorder enabled.</Typography>
                </Box>
                <Button
                    variant="contained" startIcon={<AddIcon />} onClick={addModule}
                    sx={{ borderRadius: '10px', px: 3, py: 1, bgcolor: '#1e293b', '&:hover': { bgcolor: '#0f172a' }, textTransform: 'none', fontWeight: 600 }}
                >
                    Add Module
                </Button>
            </Box>

            <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
            >
                <SortableContext items={values.modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
                    <Stack spacing={3}>
                        {values.modules.map((module, index) => (
                            <SortableModule 
                                key={module.id} 
                                module={module} 
                                index={index}
                                onDeleteModule={deleteModule}
                                onAddLecture={openVideoModal}
                                onEditLecture={openVideoModal}
                                onDeleteLecture={deleteVideo}
                                getLectureIcon={getLectureIcon}
                                editingModuleId={editingModuleId}
                                moduleTitle={moduleTitle}
                                setModuleTitle={setModuleTitle}
                                saveModuleTitle={saveModuleTitle}
                                startEditingModule={startEditingModule}
                            />
                        ))}
                    </Stack>
                </SortableContext>
            </DndContext>

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

