import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { courseViewerService } from '../api/courseViewer/service';

/**
 * Whether the current student has enrolled in at least one course — drives both
 * StudentSidebar's menu gating and RequireEnrollment's route gating. Non-students
 * always resolve `isEnrolled: true` (nothing to gate for admin/teacher/tutor).
 *
 * Cheap to call from multiple components at once: utils/api.js already caches
 * identical GET requests for 5s, so this never fires more than one real network
 * call per render pass even though both the sidebar and a gated page call it.
 */
export function useMyEnrollments() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'student') {
            setEnrollments([]);
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        courseViewerService.getMyEnrollments()
            .then((data) => { if (!cancelled) setEnrollments(data); })
            .catch(() => { if (!cancelled) setEnrollments([]); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [user?.id, user?._id, user?.role]);

    const isEnrolled = user && user.role !== 'student' ? true : enrollments.length > 0;

    return { enrollments, isEnrolled, loading };
}
