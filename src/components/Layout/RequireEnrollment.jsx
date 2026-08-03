import { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useMyEnrollments } from '../../hooks/useMyEnrollments';

/**
 * Guards student-only routes (Payments, Referrals, My Rewards, ...) that only make
 * sense once a student has bought/enrolled in at least one course. StudentSidebar
 * already hides these links for a not-yet-enrolled student, but a direct URL visit
 * (bookmark, back button, typed address) bypasses the sidebar entirely — this is
 * the actual enforcement, redirecting to the dashboard with an explanatory toast.
 */
const RequireEnrollment = ({ children }) => {
    const { isEnrolled, loading } = useMyEnrollments();
    const toasted = useRef(false);

    useEffect(() => {
        if (!loading && !isEnrolled && !toasted.current) {
            toasted.current = true;
            toast.info('Please enroll in a course first to access this.');
        }
    }, [loading, isEnrolled]);

    if (loading) return null;
    if (!isEnrolled) return <Navigate to="/" replace />;
    return children;
};

export default RequireEnrollment;
