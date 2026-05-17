import api from './api';

export const uploadFile = async (file, onUploadProgress, title, courseId) => {
    // Generate a simple unique ID for the upload session
    const uploadId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Threshold for chunked upload (10MB)
    const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB per chunk
    const fileSize = file.size;

    if (fileSize < CHUNK_SIZE) {
        // Simple upload for small files
        const formData = new FormData();
        formData.append('file', file);
        if (title) formData.append('title', title);
        if (courseId) formData.append('courseId', courseId);

        try {
            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
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
    }

    // Chunked upload for large files
    const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
    let result = null;

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, fileSize);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('fileName', file.name);
        formData.append('chunkIndex', chunkIndex);
        formData.append('totalChunks', totalChunks);
        formData.append('uploadId', uploadId);
        if (title) formData.append('title', title);
        if (courseId) formData.append('courseId', courseId);

        let chunkSuccess = false;
        let retries = 0;
        const MAX_RETRIES = 3;

        while (!chunkSuccess && retries <= MAX_RETRIES) {
            try {
                const response = await api.post('/upload/chunk', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    timeout: 300000, // 5 min per chunk
                });

                if (onUploadProgress) {
                    const overallProgress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
                    onUploadProgress(overallProgress);
                }

                if (response.data.message === 'Upload complete') {
                    result = response.data;
                }
                chunkSuccess = true; // Mark as success to exit retry loop
            } catch (error) {
                retries++;
                console.warn(`⚠️ Chunk ${chunkIndex} failed (Attempt ${retries}/${MAX_RETRIES + 1}):`, error.message);
                if (retries > MAX_RETRIES) {
                    console.error(`❌ Chunk ${chunkIndex} failed permanently after ${MAX_RETRIES} retries:`, error);
                    throw new Error(`Upload failed at chunk ${chunkIndex + 1}/${totalChunks} due to network error or timeout. Please check your connection and try again.`);
                }
                // Wait briefly before retrying (exponential backoff: 2s, 4s, 8s...)
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
            }
        }
    }

    return result;
};

