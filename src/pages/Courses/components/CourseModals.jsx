import React from 'react';
import DeleteConfirmDialog from '../../../components/Common/DeleteConfirmDialog';
import CourseWizard from '../../../components/Courses/CourseWizard/CourseWizard';
import CourseViewModal from '../../../components/Courses/CourseViewModal';
import AssignExamModal from '../../../components/Courses/AssignExamModal';
import AssignAssignmentModal from '../../../components/Courses/AssignAssignmentModal';
import ReviewModal from '../../../components/Courses/ReviewModal';

const CourseModals = ({
    deleteDialogOpen, setDeleteDialogOpen, confirmDelete, courseToDelete,
    isModalOpen, handleModalClose, selectedCourseId, handleModalSuccess,
    viewModalOpen, setViewModalOpen, selectedCourseData,
    assignExamModalOpen, setAssignExamModalOpen, selectedCourseForAction, handleActionSuccess,
    assignAssignmentModalOpen, setAssignAssignmentModalOpen,
    reviewModalOpen, setReviewModalOpen
}) => {
    return (
        <>
            <DeleteConfirmDialog
                open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={confirmDelete}
                title="Delete Course" message={`Delete "${courseToDelete?.title}"? This cannot be undone.`}
            />
            {isModalOpen && (
                <CourseWizard open={isModalOpen} onClose={handleModalClose} courseId={selectedCourseId} onSuccess={handleModalSuccess} />
            )}
            <CourseViewModal open={viewModalOpen} onClose={() => setViewModalOpen(false)} course={selectedCourseData} />
            {assignExamModalOpen && (
                <AssignExamModal open={assignExamModalOpen} onClose={() => setAssignExamModalOpen(false)} courseId={selectedCourseForAction?._id} courseTitle={selectedCourseForAction?.title} onSuccess={handleActionSuccess} />
            )}
            {assignAssignmentModalOpen && (
                <AssignAssignmentModal open={assignAssignmentModalOpen} onClose={() => setAssignAssignmentModalOpen(false)} courseId={selectedCourseForAction?._id} courseTitle={selectedCourseForAction?.title} onSuccess={handleActionSuccess} />
            )}
            {reviewModalOpen && (
                <ReviewModal open={reviewModalOpen} onClose={() => setReviewModalOpen(false)} courseId={selectedCourseForAction?._id} courseTitle={selectedCourseForAction?.title} onSuccess={handleActionSuccess} />
            )}
        </>
    );
};

export default CourseModals;
