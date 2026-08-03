import api from '../../utils/api';

/**
 * Dedicated API layer for the student course-buying/viewing flow (pages/StudentCourses,
 * pages/CourseViewer) — kept separate from the admin course-management calls sprinkled
 * through utils/api.js call sites, mirroring native-app's per-feature api/ folder convention.
 */
export const courseViewerService = {
    async getCourse(courseId) {
        const { data } = await api.get(`/courses/${courseId}`);
        return data.data;
    },

    async getMyEnrollments() {
        const { data } = await api.get('/courses/my/enrolled');
        return data.data || [];
    },

    async enrollFree(courseId) {
        const { data } = await api.post(`/courses/${courseId}/enroll`);
        return data.data;
    },

    async getProgressSummary(courseId) {
        const { data } = await api.get(`/course-progress/course/${courseId}`);
        return data.data;
    },

    async completeLecture(courseId, lectureId) {
        // courseId is often a route param string here (useParams() always returns strings) —
        // the backend expects a real number in the JSON body, not just in URL params where Nest's
        // @Param() + parseInt already handles it; a string body value crashes Prisma with
        // "Expected Int, provided String" instead of a clean 400.
        const { data } = await api.post('/course-progress/complete-lecture', { courseId: Number(courseId), lectureId: String(lectureId) });
        return data;
    },

    async createOrder(courseId) {
        const { data } = await api.post('/payments/create-order', { courseId: Number(courseId) });
        return data;
    },

    async verifyPayment(payload) {
        const { data } = await api.post('/payments/verify', payload);
        return data;
    },

    /**
     * Mints a fresh per-video playback token every time it's called (backend_nestjs's
     * media.service.ts issueToken) — same contract native-app/src/api/video/hooks.ts's
     * useSecureVideoUri already relies on. Called on every lesson open, not cached, so the
     * URL's token= actually changes each time the video is (re)opened rather than reusing one.
     */
    async getVideoPlaybackToken(videoId) {
        const { data } = await api.post(`/media/token/${videoId}`);
        return data.token;
    },

    async getReviews(courseId) {
        const { data } = await api.get(`/courses/${courseId}/reviews`);
        return data.data;
    },

    /** Upserts — same account editing an existing review (web or app) updates that one row. */
    async submitReview(courseId, rating, comment) {
        const { data } = await api.post(`/courses/${courseId}/reviews`, { rating, comment });
        return data.data;
    },

    async getCourseAssignments(courseId) {
        const { data } = await api.get('/assignments');
        return (data.data || data || []).filter((a) => Number(a.courseId) === Number(courseId));
    },
};
