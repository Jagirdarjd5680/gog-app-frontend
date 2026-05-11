import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Grid, CircularProgress, Skeleton, Paper } from '@mui/material';
import DataTable from '../../components/Common/DataTable';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

import CourseHeader from './components/CourseHeader';
import CourseCard from './components/CourseCard';
import CourseModals from './components/CourseModals';
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
    const [selectedCourseForAction, setSelectedCourseForAction] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            let url = '/courses';
            if (user?.role === 'teacher' && user?.permissions === 'fullControl') {
                url += `?instructor=${user._id}`;
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
    const handleActionSuccess = () => fetchCourses();
    const handleModalSuccess = () => { handleActionSuccess(); handleModalClose(); };

    const handleTogglePublish = async (course) => {
        try {
            const updatedStatus = !course.isPublished;
            await api.put(`/courses/${course._id}/publish`, { isPublished: updatedStatus });
            toast.success(`Course ${updatedStatus ? 'published' : 'unpublished'} successfully`);
            fetchCourses();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const confirmDelete = async () => {
        if (!courseToDelete) return;
        try {
            await api.delete(`/courses/${courseToDelete._id}`);
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
        user, handleViewCourse, handleAssignExam, handleAssignAssignment, handleReviewCourse, handleEditCourse, handleTogglePublish, setCourseToDelete, setDeleteDialogOpen, handleDuplicateCourse
    }), [user, handleViewCourse, handleAssignExam, handleAssignAssignment, handleReviewCourse, handleEditCourse, handleTogglePublish, handleDuplicateCourse]);

    const filteredCourses = useMemo(() => {
        if (!searchTerm) return courses;
        const term = searchTerm.toLowerCase();
        return courses.filter(c => 
            c.title?.toLowerCase().includes(term) ||
            c.category?.name?.toLowerCase().includes(term) ||
            c.courseType?.toLowerCase().includes(term)
        );
    }, [courses, searchTerm]);

    return (
        <Box sx={{ p: 2 }}>
            <CourseHeader 
                searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
                viewMode={viewMode} setViewMode={setViewMode} 
                handleAddCourse={handleAddCourse} user={user} 
            />

            {loading ? (
                <Grid container spacing={3}>
                    {[...Array(8)].map((_, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                            <Paper sx={{ p: 0, overflow: 'hidden', borderRadius: 2, height: '100%' }}>
                                <Skeleton variant="rectangular" height={160} />
                                <Box sx={{ p: 2 }}>
                                    <Skeleton variant="text" height={32} width="80%" sx={{ mb: 1 }} />
                                    <Skeleton variant="text" height={20} width="60%" sx={{ mb: 1 }} />
                                    <Skeleton variant="text" height={20} width="90%" />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                        <Skeleton variant="circular" width={32} height={32} />
                                        <Skeleton variant="rounded" width={80} height={32} />
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
                        <Grid item xs={12} sm={6} md={4} lg={3} key={course._id}>
                            <CourseCard 
                                course={course} 
                                handleViewCourse={handleViewCourse} handleEditCourse={handleEditCourse} 
                                handleAssignAssignment={handleAssignAssignment} handleAssignExam={handleAssignExam} 
                                handleReviewCourse={handleReviewCourse} handleTogglePublish={handleTogglePublish} 
                                setCourseToDelete={setCourseToDelete} setDeleteDialogOpen={setDeleteDialogOpen} 
                                handleDuplicateCourse={handleDuplicateCourse}
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
            />
        </Box>
    );
};

export default CourseList;
