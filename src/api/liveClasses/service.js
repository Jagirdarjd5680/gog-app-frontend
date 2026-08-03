import api from '../../utils/api';

export const liveClassesService = {
    async getCourseLiveClasses(courseId) {
        const { data } = await api.get(`/live-classes/course/${courseId}`);
        return data.data || [];
    },
};
