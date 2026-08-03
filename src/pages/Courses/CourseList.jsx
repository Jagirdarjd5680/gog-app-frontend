import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Grid, Skeleton, Paper } from '@mui/material';
import DataTable from '../../components/Common/DataTable';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

import CourseHeader from './components/CourseHeader';
import CourseCard from './components/CourseCard';
import CourseModals from './components/CourseModals';
import CourseMetrics from './components/CourseMetrics';
import { getCourseTableColumns } from './components/CourseTableColumns';

const CourseList = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    
    const wizardType = searchParams.get('wizard');
    const wizardCourseId = searchParams.get('id');
    const isModalOpen = wizardType === 'add' || wizardType === 'edit';
    const selectedCourseId = wizardType === 'edit' ? wizardCourseId : null;

    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedCourseData, setSelectedCourseData] = useState(null);
    const [assignExamModalOpen, setAssignExamModalOpen] = useState(false);
    const [assignAssignmentModalOpen, setAssignAssignmentModalOpen] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [liveClassesModalOpen, setLiveClassesModalOpen] = useState(false);
    const [selectedCourseForAction, setSelectedCourseForAction] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            let url = '/courses';
            if (user?.role === 'teacher' && user?.permissions === 'fullControl') {
                url += `?instructor=${user.id || user._id}`;
            }
            const { data } = await api.get(url);
            setCourses(data.data);
        } catch (error) {
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokens = urlParams.get('tokens');
        if (tokens) {
            localStorage.setItem('googleMeetTokens', tokens);
            window.history.replaceState({}, document.title, window.location.pathname);
            toast.success('Google Meet connected successfully!');
            const wizard = urlParams.get('wizard');
            const id = urlParams.get('id');
            if (wizard) setSearchParams({ wizard, ...(id && { id }) });
        }
        fetchCourses();
    }, [fetchCourses, setSearchParams]);

    const handleAddCourse = () => setSearchParams({ wizard: 'add' });
    const handleEditCourse = (courseId) => setSearchParams({ wizard: 'edit', id: courseId });
    const handleModalClose = () => {
        const params = new URLSearchParams(searchParams);
        params.delete('wizard');
        params.delete('id');
        setSearchParams(params);
    };

    const handleViewCourse = (course) => { setSelectedCourseData(course); setViewModalOpen(true); };
    const handleAssignExam = (course) => { setSelectedCourseForAction(course); setAssignExamModalOpen(true); };
    const handleAssignAssignment = (course) => { setSelectedCourseForAction(course); setAssignAssignmentModalOpen(true); };
    const handleReviewCourse = (course) => { setSelectedCourseForAction(course); setReviewModalOpen(true); };
    const handleManageLiveClasses = (course) => { setSelectedCourseForAction(course); setLiveClassesModalOpen(true); };
    const handleActionSuccess = () => fetchCourses();
    const handleModalSuccess = () => { handleActionSuccess(); handleModalClose(); };

    const handleTogglePublish = async (course) => {
        try {
            const updatedStatus = !course.isPublished;
            await api.put(`/courses/${course.id || course._id}/publish`, { isPublished: updatedStatus });
            toast.success(`Course ${updatedStatus ? 'published' : 'unpublished'} successfully`);
            fetchCourses();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const confirmDelete = async () => {
        if (!courseToDelete) return;
        try {
            await api.delete(`/courses/${courseToDelete.id || courseToDelete._id}`);
            toast.success('Course deleted successfully');
            fetchCourses();
        } catch (error) {
            toast.error('Failed to delete course');
        }
        setCourseToDelete(null);
        setDeleteDialogOpen(false);
    };

    const handleDuplicateCourse = async (courseId) => {
        try {
            setLoading(true);
            await api.post(`/courses/${courseId}/duplicate`);
            toast.success('Course duplicated successfully');
            fetchCourses();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to duplicate course');
        } finally {
            setLoading(false);
        }
    };

    const columnDefs = useMemo(() => getCourseTableColumns({
        user, handleViewCourse, handleAssignExam, handleAssignAssignment, handleReviewCourse, handleEditCourse, handleTogglePublish, setCourseToDelete, setDeleteDialogOpen, handleDuplicateCourse, handleManageLiveClasses
    }), [user, handleViewCourse, handleAssignExam, handleAssignAssignment, handleReviewCourse, handleEditCourse, handleTogglePublish, handleDuplicateCourse, handleManageLiveClasses]);

    const categories = useMemo(() => {
        const catNames = courses
            .map(c => c.category?.name || c.category)
            .filter(Boolean);
        return [...new Set(catNames)].sort();
    }, [courses]);

    const filteredCourses = useMemo(() => {
        return courses.filter(c => {
            // Search filter
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                const matchesSearch = c.title?.toLowerCase().includes(term) ||
                    (c.category?.name || c.category || '').toLowerCase().includes(term) ||
                    c.courseType?.toLowerCase().includes(term);
                if (!matchesSearch) return false;
            }

            // Status filter
            if (statusFilter !== 'all') {
                const isPub = statusFilter === 'published';
                if (c.isPublished !== isPub) return false;
            }

            // Type filter
            if (typeFilter !== 'all') {
                if (c.courseType !== typeFilter) return false;
            }

            // Category filter
            if (categoryFilter !== 'all') {
                const catName = c.category?.name || c.category || '';
                if (catName !== categoryFilter) return false;
            }

            return true;
        });
    }, [courses, searchTerm, statusFilter, typeFilter, categoryFilter]);

    const metrics = useMemo(() => {
        const total = courses.length;
        const published = courses.filter(c => c.isPublished).length;
        const online = courses.filter(c => c.courseType === 'online').length;
        const offline = courses.filter(c => c.courseType === 'offline').length;
        return { total, published, online, offline };
    }, [courses]);

    return (
        <Box sx={{ p: 0.5 }}>
            <CourseMetrics {...metrics} />

            <CourseHeader 
                searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
                viewMode={viewMode} setViewMode={setViewMode} 
                handleAddCourse={handleAddCourse} user={user} 
                statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                typeFilter={typeFilter} setTypeFilter={setTypeFilter}
                categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
                categories={categories} totalCount={filteredCourses.length}
            />

            {loading ? (
                <Grid container spacing={3}>
                    {[...Array(8)].map((_, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                            <Paper sx={{ 
                                p: 0, 
                                overflow: 'hidden', 
                                borderRadius: '8px', 
                                height: '100%',
                                bgcolor: 'var(--color-vc-canvas)',
                                border: '1px solid var(--color-vc-hairline)',
                                boxShadow: 'none'
                            }}>
                                <Skeleton variant="rectangular" height={160} sx={{ bgcolor: 'var(--color-vc-canvas-soft-2)' }} />
                                <Box sx={{ p: 2 }}>
                                    <Skeleton variant="text" height={24} width="80%" sx={{ mb: 1, bgcolor: 'var(--color-vc-canvas-soft-2)' }} />
                                    <Skeleton variant="text" height={16} width="60%" sx={{ mb: 2, bgcolor: 'var(--color-vc-canvas-soft-2)' }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                        <Skeleton variant="rounded" width={80} height={28} sx={{ bgcolor: 'var(--color-vc-canvas-soft-2)' }} />
                                        <Skeleton variant="circular" width={28} height={28} sx={{ bgcolor: 'var(--color-vc-canvas-soft-2)' }} />
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            ) : viewMode === 'list' ? (
                <DataTable rowData={filteredCourses} columnDefs={columnDefs} loading={loading} enableGlobalSearch={false} />
            ) : (
                <Grid container spacing={3}>
                    {filteredCourses.map((course) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={course.id || course._id}>
                            <CourseCard
                                course={course}
                                handleViewCourse={handleViewCourse} handleEditCourse={handleEditCourse}
                                handleAssignAssignment={handleAssignAssignment} handleAssignExam={handleAssignExam}
                                handleReviewCourse={handleReviewCourse} handleTogglePublish={handleTogglePublish}
                                setCourseToDelete={setCourseToDelete} setDeleteDialogOpen={setDeleteDialogOpen}
                                handleDuplicateCourse={handleDuplicateCourse}
                                handleManageLiveClasses={handleManageLiveClasses}
                                user={user}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            <CourseModals 
                deleteDialogOpen={deleteDialogOpen} setDeleteDialogOpen={setDeleteDialogOpen} 
                confirmDelete={confirmDelete} courseToDelete={courseToDelete} 
                isModalOpen={isModalOpen} handleModalClose={handleModalClose} 
                selectedCourseId={selectedCourseId} handleModalSuccess={handleModalSuccess} 
                viewModalOpen={viewModalOpen} setViewModalOpen={setViewModalOpen} 
                selectedCourseData={selectedCourseData} 
                assignExamModalOpen={assignExamModalOpen} setAssignExamModalOpen={setAssignExamModalOpen} 
                selectedCourseForAction={selectedCourseForAction} handleActionSuccess={handleActionSuccess} 
                assignAssignmentModalOpen={assignAssignmentModalOpen} setAssignAssignmentModalOpen={setAssignAssignmentModalOpen} 
                reviewModalOpen={reviewModalOpen} setReviewModalOpen={setReviewModalOpen}
                liveClassesModalOpen={liveClassesModalOpen} setLiveClassesModalOpen={setLiveClassesModalOpen}
            />
        </Box>
    );
};

export default CourseList;
