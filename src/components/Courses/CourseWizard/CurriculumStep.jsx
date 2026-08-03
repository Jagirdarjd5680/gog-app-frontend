import { useState, useCallback, useMemo } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
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
import NotesIcon from '@mui/icons-material/Notes';
import LectureModal from './LectureModal';
import LectureNotesModal from './LectureNotesModal';

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Sortable Item Component for Lectures ---
const SortableLecture = ({ video, vIndex, moduleId, onEdit, onDelete, onManageNotes, getLectureIcon, isDraggingGlobal }) => {
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
        opacity: isDragging ? 0.35 : 1,
        zIndex: isDragging ? 999 : 1,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            elevation={0}
            sx={{
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                borderRadius: '6px',
                bgcolor: 'var(--color-vc-canvas)',
                border: '1px solid var(--color-vc-hairline)',
                '&:hover': { borderColor: 'var(--color-vc-hairline-strong)', bgcolor: 'var(--color-vc-canvas-soft)' },
                touchAction: 'none'
            }}
        >
            <Box {...attributes} {...listeners} sx={{ mr: 1.5, color: 'var(--color-vc-mute)', cursor: 'grab', display: 'flex' }}>
                <DragIndicatorIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box sx={{ mr: 1.5 }}>
                {getLectureIcon(video.type)}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>
                    {video.title}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
                    <Typography sx={{ fontSize: '10px', color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'inherit' }}>
                        {video.type || 'video'}
                    </Typography>
                    <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'var(--color-vc-mute)' }} />
                    <Typography sx={{ fontSize: '10px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>
                        {video.duration ? `${Math.round(video.duration / 60)} min` : 'No duration'}
                    </Typography>
                    {video.freePreview && (
                        <Chip 
                            label="Free Preview" 
                            size="small" 
                            sx={{ 
                                height: 16, 
                                fontSize: '9px', 
                                bgcolor: 'rgba(41, 188, 155, 0.15)', 
                                color: 'var(--color-vc-cyan-deep)', 
                                fontWeight: 600,
                                borderRadius: '4px'
                            }} 
                        />
                    )}
                </Stack>
            </Box>
            <Stack direction="row" spacing={0.5}>
                {video.type === 'video' && (
                    <Tooltip title={video.notes?.length ? `${video.notes.length} note(s)` : 'Add lecture notes'}>
                        <IconButton
                            size="small"
                            onClick={() => onManageNotes(moduleId, video, vIndex)}
                            sx={{
                                color: video.notes?.length ? 'var(--color-vc-link-deep)' : 'var(--color-vc-body)',
                                '&:hover': { color: 'var(--color-vc-ink)' }
                            }}
                        >
                            <NotesIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                )}
                <IconButton
                    size="small"
                    onClick={() => onEdit(moduleId, video, vIndex)}
                    sx={{ color: 'var(--color-vc-body)', '&:hover': { color: 'var(--color-vc-ink)' } }}
                >
                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton
                    size="small"
                    onClick={() => onDelete(moduleId, vIndex)}
                    sx={{ color: 'var(--color-vc-mute)', '&:hover': { color: 'var(--color-vc-error-deep)' } }}
                >
                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Stack>
        </Card>
    );
};

// --- Sortable Item Component for Modules ---
const SortableModule = ({
    module, index, onDeleteModule, onAddLecture,
    onEditLecture, onDeleteLecture, onManageNotes, getLectureIcon, editingModuleId,
    moduleTitle, setModuleTitle, saveModuleTitle, startEditingModule
}) => {
    const lectureIds = useMemo(() => 
        (module.videos || []).filter(v => v && v.id).map(v => v.id),
        [module.videos]
    );

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
            elevation={0}
            sx={{ 
                borderRadius: '6px', 
                overflow: 'hidden',
                border: '1px solid var(--color-vc-hairline)',
                bgcolor: 'var(--color-vc-canvas)'
            }}
        >
            <Accordion defaultExpanded elevation={0} disableGutters sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: 'var(--color-vc-mute)' }} />}
                    sx={{
                        px: 3, py: 1,
                        bgcolor: isDragging ? 'var(--color-vc-canvas-soft-2)' : 'var(--color-vc-canvas-soft)',
                        borderBottom: '1px solid var(--color-vc-hairline)'
                    }}
                >
                    <Box {...attributes} {...listeners} sx={{ display: 'flex', alignItems: 'center', mr: 1.5, color: 'var(--color-vc-mute)', cursor: 'grab', '&:hover': { color: 'var(--color-vc-ink)' } }}>
                        <DragIndicatorIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 600, color: 'var(--color-vc-mute)', mr: 1.5, fontSize: '13px', fontFamily: 'inherit', display: 'flex', alignItems: 'center' }}>
                        Module {index + 1}:
                    </Typography>

                    {editingModuleId === module.id ? (
                        <Box sx={{ flexGrow: 1, mr: 2, display: 'flex', alignItems: 'center' }}>
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
                                sx={{ '& .MuiInput-root': { fontWeight: 600, fontSize: '14px', color: 'var(--color-vc-ink)', fontFamily: 'inherit' } }}
                            />
                        </Box>
                    ) : (
                        <Typography 
                            sx={{ flexGrow: 1, fontWeight: 600, fontSize: '14px', color: 'var(--color-vc-ink)', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', '&:hover': { color: 'var(--color-vc-link)' } }} 
                            onClick={(e) => { e.stopPropagation(); startEditingModule(module.id, module.title); }}
                        >
                            {module.title}
                        </Typography>
                    )}

                    <Stack direction="row" spacing={0.5} sx={{ ml: 'auto' }}>
                        <IconButton 
                            size="small" 
                            onClick={(e) => { e.stopPropagation(); startEditingModule(module.id, module.title); }}
                            sx={{ color: 'var(--color-vc-body)', '&:hover': { color: 'var(--color-vc-ink)' } }}
                        >
                            <EditOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton 
                            size="small" 
                            onClick={(e) => { e.stopPropagation(); onDeleteModule(index); }}
                            sx={{ color: 'var(--color-vc-mute)', '&:hover': { color: 'var(--color-vc-error-deep)' } }}
                        >
                            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Stack>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 2.5, bgcolor: 'var(--color-vc-canvas)' }}>
                    <Box ref={setDroppableRef} sx={{ minHeight: 40 }}>
                        <SortableContext 
                            items={lectureIds} 
                            strategy={verticalListSortingStrategy}
                        >
                            <Stack spacing={1.5}>
                                {(module.videos || []).map((video, vIndex) => video && video.id && (
                                    <SortableLecture 
                                        key={video.id} 
                                        video={video} 
                                        vIndex={vIndex} 
                                        moduleId={module.id} 
                                        onEdit={onEditLecture}
                                        onDelete={onDeleteLecture}
                                        onManageNotes={onManageNotes}
                                        getLectureIcon={getLectureIcon}
                                    />
                                ))}
                                {(module.videos || []).length === 0 && (
                                    <Box sx={{ py: 3, textAlign: 'center', border: '1px dashed var(--color-vc-hairline)', borderRadius: '6px', bgcolor: 'var(--color-vc-canvas-soft)' }}>
                                        <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '12px', fontFamily: 'inherit' }}>Empty Module. Drag lectures here or add new ones.</Typography>
                                    </Box>
                                )}
                                <Button
                                    fullWidth
                                    startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                                    onClick={() => onAddLecture(module.id)}
                                    sx={{ 
                                        py: 1.25, 
                                        borderRadius: '6px', 
                                        border: '1px dashed var(--color-vc-hairline)', 
                                        color: 'var(--color-vc-body)',
                                        textTransform: 'none', 
                                        fontSize: '13px',
                                        fontFamily: 'inherit',
                                        fontWeight: 500,
                                        '&:hover': { borderColor: 'var(--color-vc-hairline-strong)', color: 'var(--color-vc-ink)', bgcolor: 'var(--color-vc-canvas-soft)' }
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

const CurriculumStep = ({ values, setFieldValue, courseId }) => {
    const [editingModuleId, setEditingModuleId] = useState(null);
    const [moduleTitle, setModuleTitle] = useState('');
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [currentModuleId, setCurrentModuleId] = useState(null);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [activeId, setActiveId] = useState(null);
    const [notesModalOpen, setNotesModalOpen] = useState(false);
    const [notesModuleId, setNotesModuleId] = useState(null);
    const [notesVideoIndex, setNotesVideoIndex] = useState(null);
    const [notesVideo, setNotesVideo] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const moduleIds = useMemo(() => 
        (values.modules || []).filter(m => m && m.id).map(m => m.id), 
        [values.modules]
    );

    const findContainer = useCallback((id) => {
        if (values.modules.some(m => m.id === id)) return id;
        const module = values.modules.find(m => (m.videos || []).some(v => v && v.id === id));
        return module ? module.id : null;
    }, [values.modules]);

    const handleDragOver = ({ active, over }) => {
        const overId = over?.id;
        if (!overId || active.id === overId) return;

        const activeContainer = findContainer(active.id);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer === overContainer) return;

        const activeModuleIdx = values.modules.findIndex(m => m.id === activeContainer);
        const overModuleIdx = values.modules.findIndex(m => m.id === overContainer);
        const activeLectureIdx = values.modules[activeModuleIdx].videos.findIndex(v => v && v.id === active.id);
        
        let overLectureIdx = values.modules[overModuleIdx].videos.findIndex(v => v && v.id === overId);
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
                const newModules = arrayMove(values.modules, activeModuleIdx, overModuleIdx);
                setFieldValue('modules', newModules);
            } else if (activeContainer === overContainer) {
                const activeLectureIdx = values.modules[activeModuleIdx].videos.findIndex(v => v && v.id === activeId);
                const overLectureIdx = values.modules[overModuleIdx].videos.findIndex(v => v && v.id === overId);
                
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
            duration: lectureData.duration ? Number(lectureData.duration) : 0,
            // LectureModal's form has no concept of notes, so carry over whatever
            // was attached via the Notes modal instead of silently dropping it.
            notes: currentVideoIndex !== null ? (selectedVideo?.notes || []) : []
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

    const openNotesModal = (moduleId, video, videoIndex) => {
        setNotesModuleId(moduleId);
        setNotesVideoIndex(videoIndex);
        setNotesVideo(video);
        setNotesModalOpen(true);
    };

    const handleSaveNotes = (notes) => {
        const newModules = values.modules.map(module => {
            if (module.id !== notesModuleId) return module;
            const updatedVideos = [...(module.videos || [])];
            if (notesVideoIndex !== null && updatedVideos[notesVideoIndex]) {
                updatedVideos[notesVideoIndex] = { ...updatedVideos[notesVideoIndex], notes };
            }
            return { ...module, videos: updatedVideos };
        });

        setFieldValue('modules', newModules);
        setNotesModalOpen(false);
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
        const iconStyles = { p: 0.75, borderRadius: '4px', bgcolor: 'var(--color-vc-canvas-soft-2)', border: '1px solid var(--color-vc-hairline)', display: 'flex' };
        switch (type) {
            case 'pdf': return <Box sx={iconStyles}><DescriptionIcon fontSize="small" sx={{ color: 'var(--color-vc-error-deep)', fontSize: 16 }} /></Box>;
            case 'audio': return <Box sx={iconStyles}><AudiotrackIcon fontSize="small" sx={{ color: 'var(--color-vc-violet-deep)', fontSize: 16 }} /></Box>;
            case 'zip': return <Box sx={iconStyles}><FolderZipIcon fontSize="small" sx={{ color: 'var(--color-vc-link-deep)', fontSize: 16 }} /></Box>;
            default: return <Box sx={iconStyles}><OndemandVideoIcon fontSize="small" sx={{ color: 'var(--color-vc-cyan-deep)', fontSize: 16 }} /></Box>;
        }
    };

    return (
        <Box sx={{ p: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
                <Box>
                    <Typography sx={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-vc-ink)', letterSpacing: '-0.02em', fontFamily: 'inherit' }}>Curriculum Builder</Typography>
                    <Typography sx={{ fontSize: '13px', color: 'var(--color-vc-mute)', fontFamily: 'inherit', mt: 0.25 }}>Organize your course into modules and lectures. Smooth drag-to-reorder enabled.</Typography>
                </Box>
                <Button
                    variant="contained" 
                    startIcon={<AddIcon sx={{ fontSize: 16 }} />} 
                    onClick={addModule}
                    sx={{ 
                        borderRadius: '6px', 
                        px: 3, 
                        height: 36,
                        boxShadow: 'none',
                        bgcolor: 'var(--color-vc-primary)',
                        color: 'var(--color-vc-on-primary)',
                        textTransform: 'none', 
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        fontWeight: 500,
                        '&:hover': { bgcolor: 'var(--color-vc-primary)', opacity: 0.9, boxShadow: 'none' } 
                    }}
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
                <SortableContext items={moduleIds} strategy={verticalListSortingStrategy}>
                    <Stack spacing={3.5}>
                        {values.modules.map((module, index) => (
                            <SortableModule 
                                key={module.id} 
                                module={module} 
                                index={index}
                                onDeleteModule={deleteModule}
                                onAddLecture={openVideoModal}
                                onEditLecture={openVideoModal}
                                onDeleteLecture={deleteVideo}
                                onManageNotes={openNotesModal}
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
                courseId={courseId}
            />

            <LectureNotesModal
                open={notesModalOpen}
                onClose={() => setNotesModalOpen(false)}
                onSave={handleSaveNotes}
                initialNotes={notesVideo?.notes}
                courseId={courseId}
                lectureTitle={notesVideo?.title}
            />
        </Box>
    );
};

export default CurriculumStep;
