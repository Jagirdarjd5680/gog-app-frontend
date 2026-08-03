import api from './api';

export const uploadFile = async (file, onUploadProgress, title, courseId) => {
    const uploadId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Threshold for chunked upload (5MB for granular chunks)
    const CHUNK_SIZE = 5 * 1024 * 1024;
    const fileSize = file.size;

    console.log(`📤 [UploadUtil] Initializing upload for file: "${file.name}" (${fileSize} bytes)`);

    if (fileSize < CHUNK_SIZE) {
        console.log(`⚡ [UploadUtil] Using Direct Upload strategy (< 5MB)`);
        const formData = new FormData();
        formData.append('file', file);
        if (title) formData.append('title', title);
        if (courseId) formData.append('courseId', courseId);

        try {
            const response = await api.post('/upload', formData, {
                onUploadProgress: (progressEvent) => {
                    if (onUploadProgress && progressEvent.total) {
                        const rawPct = (progressEvent.loaded / progressEvent.total) * 100;
                        const formattedPct = Number(rawPct.toFixed(1));
                        console.log(`📊 [UploadUtil] Direct upload progress: ${formattedPct}%`);
                        onUploadProgress(formattedPct);
                    }
                }
            });
            console.log(`✅ [UploadUtil] Direct upload completed successfully:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`❌ [UploadUtil] Direct upload error for "${file.name}":`, error);
            throw error;
        }
    }

    // Chunked upload for large files (>5MB)
    const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
    console.log(`📦 [UploadUtil] Using Chunked Upload strategy (${totalChunks} total chunks)`);
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
        formData.append('chunkSize', CHUNK_SIZE);
        formData.append('fileSize', fileSize);
        formData.append('uploadId', uploadId);
        if (title) formData.append('title', title);
        if (courseId) formData.append('courseId', courseId);

        let chunkSuccess = false;
        let retries = 0;
        const MAX_RETRIES = 3;

        while (!chunkSuccess && retries <= MAX_RETRIES) {
            try {
                console.log(`🧩 [UploadUtil] Uploading chunk ${chunkIndex + 1}/${totalChunks}...`);
                const response = await api.post('/upload/chunk', formData, {
                    timeout: 300000,
                    onUploadProgress: (progressEvent) => {
                        if (onUploadProgress && progressEvent.total) {
                            const currentChunkProgress = progressEvent.loaded / progressEvent.total;
                            const rawPct = ((chunkIndex + currentChunkProgress) / totalChunks) * 100;
                            const formattedPct = Number(Math.min(rawPct, 99.9).toFixed(1));
                            console.log(`📊 [UploadUtil] Granular Chunk Progress: ${formattedPct}%`);
                            onUploadProgress(formattedPct);
                        }
                    }
                });

                if (onUploadProgress) {
                    const rawPct = ((chunkIndex + 1) / totalChunks) * 100;
                    const formattedPct = Number(Math.min(rawPct, 100).toFixed(1));
                    onUploadProgress(formattedPct);
                }

                if (response.data.message === 'Upload complete' || chunkIndex === totalChunks - 1) {
                    result = response.data;
                }
                chunkSuccess = true;
            } catch (error) {
                retries++;
                console.warn(`⚠️ [UploadUtil] Chunk ${chunkIndex + 1} attempt ${retries} failed:`, error.message);
                if (retries > MAX_RETRIES) {
                    console.error(`❌ [UploadUtil] Chunk ${chunkIndex + 1}/${totalChunks} failed permanently`);
                    throw new Error(`Chunk ${chunkIndex + 1}/${totalChunks} upload failed. Please try again.`);
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            }
        }
    }

    if (onUploadProgress) onUploadProgress(100);
    console.log(`🎉 [UploadUtil] Chunked upload completed successfully:`, result);
    return result;
};
