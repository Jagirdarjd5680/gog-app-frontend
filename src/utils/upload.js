import api from './api';

export const uploadFile = async (file, onUploadProgress) => {
    console.log('🚀 Starting upload:', {
        name: file.name,
        size: file.size,
        type: file.type
    });

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            timeout: 300000, // 5 minutes timeout for large files
            onUploadProgress: (progressEvent) => {
                if (onUploadProgress) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`📊 Upload progress: ${percentCompleted}%`);
                    onUploadProgress(percentCompleted);
                }
            }
        });

        console.log('✅ Upload completed:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Upload failed:', {
            message: error.message,
            response: error.response?.data,
            file: file.name
        });
        throw error;
    }
};
