import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Drawer, Box, Menu, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import { useTheme } from '../../context/ThemeContext';
import api, { fixUrl } from '../../utils/api';
import { toast } from 'react-toastify';
import MediaPickerModal from '../Media/MediaPickerModal';

// Modular Components
import MaterialsHeader from './BatchMaterials/MaterialsHeader';
import MaterialsSidebar from './BatchMaterials/MaterialsSidebar';
import MaterialsToolbar from './BatchMaterials/MaterialsToolbar';
import MaterialsView from './BatchMaterials/MaterialsView';
import MaterialsModals from './BatchMaterials/MaterialsModals';

const BatchMaterialsModal = ({ open, onClose, batch }) => {
    const { isDark } = useTheme();
    const [searchParams, setSearchParams] = useSearchParams();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [downloading, setDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [selectedIds, setSelectedIds] = useState([]);

    // Navigation
    const [currentParent, setCurrentParent] = useState(null);
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    const [expandedFolders, setExpandedFolders] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [previewItem, setPreviewItem] = useState(null);

    // Modals & Forms State
    const [folderDialogOpen, setFolderDialogOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [newLinkName, setNewLinkName] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

    // Curriculum targeting
    const [selectedModule, setSelectedModule] = useState('');
    const [selectedLecture, setSelectedLecture] = useState('');
    const [courseModules, setCourseModules] = useState([]);
    const [courseLectures, setCourseLectures] = useState([]);
    const [courseAssignments, setCourseAssignments] = useState([]);
    const [courseExams, setCourseExams] = useState([]);
    const [selectedAssignments, setSelectedAssignments] = useState([]);
    const [selectedExams, setSelectedExams] = useState([]);

    // Context menu
    const [anchorEl, setAnchorEl] = useState(null);
    const [contextItem, setContextItem] = useState(null);
    const [allItems, setAllItems] = useState([]);

    const batchId = batch?._id || batch?.id;

    const fetchAllItems = useCallback(async () => {
        if (!batchId) return;
        try {
            const res = await api.get(`/batch-materials/${batchId}/all`);
            if (res.data.success) setAllItems(res.data.data || []);
        } catch (error) {}
    }, [batchId]);

    const fetchMaterials = useCallback(async (parentId = null) => {
        if (!batchId) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('parent', parentId || 'null');
            const res = await api.get(`/batch-materials/${batchId}?${params}`);
            if (res.data.success) setMaterials(res.data.data || []);
        } catch (error) {
            toast.error('Failed to load materials');
        } finally {
            setLoading(false);
        }
    }, [batchId]);

    useEffect(() => {
        if (open && batchId) {
            const folderId = searchParams.get('folderId');
            const parentId = folderId || null;
            setCurrentParent(parentId);
            setSelectedIds([]);
            fetchAllItems();
            fetchMaterials(parentId);
            fetchCourseCurriculum();
        }
    }, [open, batchId, fetchAllItems, fetchMaterials]);

    const fetchCourseCurriculum = async () => {
        const courseId = typeof batch?.course === 'object' ? (batch.course._id || batch.course.id) : batch?.course;
        if (!courseId) return;
        try {
            const res = await api.get(`/courses/${courseId}`);
            if (res.data.success) setCourseModules(res.data.data.modules || []);
        } catch (error) {}
    };

    useEffect(() => {
        if (selectedModule) {
            const module = courseModules.find(m => String(m._id || m.id) === String(selectedModule));
            setCourseLectures(module?.videos || []);
            fetchAssignments(selectedModule, selectedLecture);
            fetchExams(selectedModule, selectedLecture);
        } else {
            setCourseLectures([]);
            setCourseAssignments([]);
            setCourseExams([]);
        }
    }, [selectedModule, selectedLecture, courseModules]);

    const fetchExams = async (modId, lecId) => {
        const courseId = typeof batch?.course === 'object' ? (batch.course._id || batch.course.id) : batch?.course;
        if (!courseId) return;
        try {
            const res = await api.get(`/exams?course=${courseId}`);
            if (res.data.success) {
                let filtered = (res.data.data || []).filter(e => String(e.moduleId) === String(modId));
                if (lecId) filtered = filtered.filter(e => String(e.lectureId) === String(lecId));
                else filtered = filtered.filter(e => !e.lectureId);
                setCourseExams(filtered);
            }
        } catch (error) {}
    };

    const fetchAssignments = async (modId, lecId) => {
        const courseId = typeof batch?.course === 'object' ? (batch.course._id || batch.course.id) : batch?.course;
        if (!courseId) return;
        try {
            const res = await api.get(`/assignments?course=${courseId}&limit=100`);
            if (res.data.success) {
                let filtered = (res.data.data || []).filter(a => String(a.moduleId) === String(modId));
                if (lecId) filtered = filtered.filter(a => String(a.lectureId) === String(lecId));
                else filtered = filtered.filter(a => !a.lectureId);
                setCourseAssignments(filtered);
            }
        } catch (error) {}
    };

    const getPathToItem = useCallback((itemId, items) => {
        const path = [];
        let current = items.find(f => String(f._id || f.id) === String(itemId));
        while (current) {
            const cId = current._id || current.id;
            path.unshift({ id: cId, name: current.name });
            const parentId = current.parent?._id || current.parent?.id || current.parent;
            current = items.find(f => String(f._id || f.id) === String(parentId));
        }
        return path;
    }, []);

    useEffect(() => {
        if (open && allItems.length > 0) {
            if (currentParent) {
                const path = getPathToItem(currentParent, allItems);
                setBreadcrumbs(path);
                const expansions = {};
                path.forEach(p => expansions[p.id] = true);
                setExpandedFolders(prev => ({ ...prev, ...expansions }));
            } else {
                setBreadcrumbs([]);
            }
        }
    }, [currentParent, allItems, open, getPathToItem]);

    const navigateToBreadcrumb = useCallback((index) => {
        let parentId = null;
        if (index === -1) {
            setCurrentParent(null);
            parentId = null;
        } else {
            const crumb = breadcrumbs[index];
            setCurrentParent(crumb.id);
            parentId = crumb.id;
        }
        fetchMaterials(parentId);
    }, [breadcrumbs, fetchMaterials]);

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        try {
            await api.post('/batch-materials', {
                batch: batchId,
                name: newFolderName.trim(),
                type: 'folder',
                parent: currentParent || null
            });
            toast.success('Folder created successfully');
            setNewFolderName('');
            setFolderDialogOpen(false);
            fetchMaterials(currentParent);
            fetchAllItems();
        } catch (error) {
            toast.error('Failed to create folder');
        }
    };

    const handleAddLink = async () => {
        if (!newLinkName.trim() || !newLinkUrl.trim()) return;
        try {
            await api.post('/batch-materials', {
                batch: batchId,
                name: newLinkName.trim(),
                type: 'link',
                url: newLinkUrl.trim(),
                parent: currentParent || null,
                moduleId: selectedModule,
                lectureId: selectedLecture,
                assignmentIds: selectedAssignments,
                examIds: selectedExams
            });
            toast.success('Link added successfully');
            setNewLinkName(''); setNewLinkUrl('');
            setLinkDialogOpen(false);
            fetchMaterials(currentParent);
            fetchAllItems();
        } catch (error) {
            toast.error('Failed to add link');
        }
    };

    const handleUploadSubmit = async () => {
        if (!selectedModule) return toast.error('Please select a module');
        setUploading(true); setUploadModalOpen(false); setUploadProgress(0);
        let successCount = 0;

        const courseId = typeof batch?.course === 'object' ? (batch.course._id || batch.course.id) : batch?.course;

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('batch', batchId);
            if (courseId) formData.append('course', courseId);
            formData.append('moduleId', selectedModule);
            if (selectedLecture) formData.append('lectureId', selectedLecture);
            selectedAssignments.forEach(id => formData.append('assignmentIds[]', id));
            selectedExams.forEach(id => formData.append('examIds[]', id));
            if (currentParent) formData.append('parent', currentParent);

            try {
                await api.post('/batch-materials/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total))
                });
                successCount++;
            } catch (error) {
                toast.error(`${file.name}: ${error.response?.data?.message || 'Upload failed'}`);
            }
        }

        if (successCount > 0) toast.success(`${successCount} file(s) uploaded successfully`);
        setUploading(false); fetchMaterials(currentParent); fetchAllItems(); setSelectedFiles([]);
    };

    const handleDeleteItem = async (item) => {
        const itemId = item._id || item.id;
        if (!window.confirm(`Delete "${item.name}"?`)) return;
        try {
            await api.delete(`/batch-materials/${itemId}`);
            toast.success('Deleted successfully');
            if (currentParent === itemId) setCurrentParent(null);
            fetchMaterials(currentParent); fetchAllItems();
            setSelectedIds(prev => prev.filter(id => id !== itemId));
            if ((previewItem?._id || previewItem?.id) === itemId) setPreviewItem(null);
        } catch { toast.error('Delete failed'); }
        setAnchorEl(null);
    };

    const handleDownload = async (item) => {
        if (!item.url) return;
        setDownloading(true); setDownloadProgress(0);
        try {
            const response = await api.get(fixUrl(item.url), {
                responseType: 'blob',
                onDownloadProgress: (p) => setDownloadProgress(Math.round((p.loaded * 100) / p.total))
            });
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl; link.setAttribute('download', item.name);
            document.body.appendChild(link); link.click(); link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch { toast.error('Download failed'); }
        finally { setDownloading(false); setDownloadProgress(0); }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length || !window.confirm(`Delete ${selectedIds.length} items?`)) return;
        try {
            setLoading(true);
            await api.post('/batch-materials/bulk-delete', { ids: selectedIds });
            toast.success('Items deleted successfully');
            if (selectedIds.includes(currentParent)) setCurrentParent(null);
            fetchMaterials(currentParent); fetchAllItems(); setSelectedIds([]);
        } catch { toast.error('Bulk delete failed'); }
        finally { setLoading(false); }
    };

    const filteredMaterials = materials.filter(m => {
        const nameStr = (m?.name || m?.title || '').toLowerCase();
        const queryStr = (searchQuery || '').toLowerCase();
        return nameStr.includes(queryStr) && (typeFilter === 'all' || m?.type === typeFilter);
    });

    const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

    return (
        <Drawer anchor="right" open={open} onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 650, md: 900, lg: 1050 },
                    height: '100vh', 
                    bgcolor: isDark ? 'var(--color-vc-canvas, #16181d)' : 'var(--color-vc-canvas, #fcfcfd)',
                    color: 'var(--color-vc-ink, inherit)',
                    overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    borderLeft: `1px solid ${borderColor}`,
                    boxShadow: '-16px 0 48px rgba(0,0,0,0.15)'
                }
            }}
        >
            <MaterialsHeader 
                batch={batch} onClose={onClose} 
                uploading={uploading} uploadProgress={uploadProgress}
                downloading={downloading} downloadProgress={downloadProgress}
            />

            <MaterialsToolbar 
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                typeFilter={typeFilter} setTypeFilter={setTypeFilter}
                viewMode={viewMode} setViewMode={setViewMode}
                breadcrumbs={breadcrumbs} navigateToBreadcrumb={navigateToBreadcrumb}
                currentParent={currentParent} isDark={isDark} borderColor={borderColor}
            />

            <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <MaterialsSidebar 
                    allItems={allItems} currentParent={currentParent} selectedIds={selectedIds}
                    expandedFolders={expandedFolders}
                    toggleFolderExpand={(e, id) => { e.stopPropagation(); setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] })); }}
                    handleToggleSelect={(e, id) => { e.stopPropagation(); setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]); }}
                    handleItemClick={(item) => {
                        const itemId = item._id || item.id;
                        if (item.type === 'folder') {
                            setCurrentParent(itemId); fetchMaterials(itemId);
                            setExpandedFolders(prev => ({ ...prev, [itemId]: !prev[itemId] }));
                        } else setPreviewItem(item);
                    }}
                    setUploadModalOpen={setUploadModalOpen} setFolderDialogOpen={setFolderDialogOpen}
                    setLinkDialogOpen={setLinkDialogOpen} setSelectedFiles={setSelectedFiles}
                    borderColor={borderColor} isDark={isDark}
                    truncateWords={(str) => (str.split(' ').length <= 4 ? str : str.split(' ').slice(0, 4).join(' ') + '...')}
                />

                <MaterialsView 
                    filteredMaterials={filteredMaterials} selectedIds={selectedIds}
                    handleSelectAll={(e) => setSelectedIds(e.target.checked ? filteredMaterials.map(m => m._id || m.id) : [])}
                    handleBulkDelete={handleBulkDelete}
                    handleItemClick={(item) => {
                        const itemId = item._id || item.id;
                        if (item.type === 'folder') {
                            setCurrentParent(itemId); 
                            fetchMaterials(itemId);
                        } else {
                            setPreviewItem(item);
                        }
                    }}
                    handleToggleSelect={(e, id) => { e.stopPropagation(); setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]); }}
                    handleContextMenu={(e, item) => { e.stopPropagation(); setAnchorEl(e.currentTarget); setContextItem(item); }}
                    handleDownload={handleDownload} previewItem={previewItem} setPreviewItem={setPreviewItem}
                    loading={loading} downloading={downloading} downloadProgress={downloadProgress}
                    viewMode={viewMode} isDark={isDark} borderColor={borderColor}
                    setUploadModalOpen={setUploadModalOpen}
                    setFolderDialogOpen={setFolderDialogOpen}
                />
            </Box>

            <MaterialsModals 
                folderDialogOpen={folderDialogOpen} setFolderDialogOpen={setFolderDialogOpen}
                newFolderName={newFolderName} setNewFolderName={setNewFolderName}
                handleCreateFolder={handleCreateFolder}
                linkDialogOpen={linkDialogOpen} setLinkDialogOpen={setLinkDialogOpen}
                newLinkName={newLinkName} setNewLinkName={setNewLinkName}
                newLinkUrl={newLinkUrl} setNewLinkUrl={setNewLinkUrl}
                handleAddLink={handleAddLink}
                uploadModalOpen={uploadModalOpen} setUploadModalOpen={setUploadModalOpen}
                selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles}
                handleUploadSubmit={handleUploadSubmit}
                selectedModule={selectedModule} setSelectedModule={setSelectedModule}
                selectedLecture={selectedLecture} setSelectedLecture={setSelectedLecture}
                selectedAssignments={selectedAssignments} setSelectedAssignments={setSelectedAssignments}
                selectedExams={selectedExams} setSelectedExams={setSelectedExams}
                courseModules={courseModules} courseLectures={courseLectures}
                courseAssignments={courseAssignments} courseExams={courseExams}
            />

            <Menu 
                anchorEl={anchorEl} 
                open={Boolean(anchorEl)} 
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                    sx: {
                        borderRadius: '8px',
                        minWidth: 160,
                        bgcolor: 'var(--color-vc-canvas, #ffffff)',
                        border: '1px solid var(--color-vc-hairline, rgba(0,0,0,0.1))',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                        '& .MuiMenuItem-root': {
                            fontSize: '13px',
                            fontWeight: 500,
                            py: 1,
                            gap: 1
                        }
                    }
                }}
            >
                {contextItem?.url && contextItem?.type !== 'folder' && (
                    <MenuItem onClick={() => { handleDownload(contextItem); setAnchorEl(null); }}>
                        <DriveFileMoveIcon sx={{ fontSize: 18, color: 'primary.main' }} /> Download
                    </MenuItem>
                )}
                <MenuItem onClick={() => handleDeleteItem(contextItem)} sx={{ color: 'error.main' }}>
                    <DeleteIcon sx={{ fontSize: 18 }} /> Delete
                </MenuItem>
            </Menu>

            <MediaPickerModal open={mediaPickerOpen} onClose={() => setMediaPickerOpen(false)}
                onSelect={async (file) => {
                    try {
                        await api.post('/batch-materials/from-media', { batch: batchId, mediaId: file._id || file.id, parent: currentParent || null });
                        toast.success('Added from media library'); fetchMaterials(currentParent); fetchAllItems();
                    } catch { toast.error('Failed to add from media library'); }
                }}
            />
        </Drawer>
    );
};

export default BatchMaterialsModal;
