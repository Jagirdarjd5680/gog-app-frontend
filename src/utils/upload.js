import api from './api';

export const uploadFile = async (file, onUploadProgress) => {
    

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            timeout: 3600000, // 1 hour timeout for very large files (1GB+)
            onUploadProgress: (progressEvent) => {
                if (onUploadProgress) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    
                    onUploadProgress(percentCompleted);
                }
            }
        });

        
        return response.data;
    } catch (error) {
        
        throw error;
    }
};
