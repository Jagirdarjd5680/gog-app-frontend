import axios from 'axios';

const ENDPOINT = 'https://backend.godofgraphics.in';
const API_BASE_URL = `${ENDPOINT}/api`;

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000, // 15s timeout for performance
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // Helps prevent CSRF
    },
});

// Simple caching to avoid redundant requests within 2 seconds
const cache = new Map();
const CACHE_DURATION = 2000;


// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Performance: Prevent redundant GET requests
        if (config.method === 'get') {
            const cacheKey = config.url + JSON.stringify(config.params || {});
            const cachedResponse = cache.get(cacheKey);

            if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_DURATION) {
                config.adapter = () => Promise.resolve({
                    data: cachedResponse.data,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config,
                });
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        // Performance: Cache GET responses
        if (response.config.method === 'get') {
            const cacheKey = response.config.url + JSON.stringify(response.config.params || {});
            cache.set(cacheKey, {
                data: response.data,
                timestamp: Date.now()
            });
        }
        return response;
    },
    (error) => {
        // Avoid redirecting for public settings
        if (error.config?.url?.includes('/settings/public')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            // Remove full redirect, let the page handle it via AuthContext state
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export const fixUrl = (url) => {
    if (!url) return '';
    if (typeof url !== 'string') return url;

    // If it's a blob/data URL, return as is
    if (url.startsWith('blob:') || url.startsWith('data:')) return url;

    const endpoint = 'https://backend.godofgraphics.in';

    // Handle full localhost URLs when environment is different
    if (url.includes('localhost:5000') && !endpoint.includes('localhost')) {
        return url.replace('http://localhost:5000', endpoint);
    }

    // Handle relative path starting with /uploads
    if (url.startsWith('/uploads')) {
        return `${endpoint}${url}`;
    }

    // Handle raw filenames (e.g. video-123.mp4) returned by our local storage
    if (url.startsWith('video-') || url.startsWith('image-') || url.startsWith('audio-') || url.startsWith('raw-')) {
        return `${endpoint}/uploads/${url}`;
    }

    return url;
};

export default api;
