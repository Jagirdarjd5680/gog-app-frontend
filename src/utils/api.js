import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend.godofgraphics.in/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30s timeout
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// Cache for GET requests
const cache = new Map();
const CACHE_DURATION = 5000; // 5 seconds cache
const pendingRequests = new Map(); // For request deduplication

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Only handle GET requests for caching and deduplication
        if (config.method?.toLowerCase() === 'get') {
            const cacheKey = config.url + JSON.stringify(config.params || {});

            // 1. Check Cache
            const cachedResponse = cache.get(cacheKey);
            if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_DURATION) {
                config.adapter = () => Promise.resolve({
                    data: cachedResponse.data,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config,
                });
                return config;
            }

            // 2. Request Deduplication
            if (pendingRequests.has(cacheKey)) {
                return pendingRequests.get(cacheKey).then(response => {
                    config.adapter = () => Promise.resolve(response);
                    return config;
                });
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        if (response.config.method?.toLowerCase() === 'get') {
            const cacheKey = response.config.url + JSON.stringify(response.config.params || {});
            
            // Cache the response
            cache.set(cacheKey, {
                data: response.data,
                timestamp: Date.now()
            });

            // Cleanup pending requests
            pendingRequests.delete(cacheKey);
        }
        return response;
    },
    (error) => {
        if (error.config?.method?.toLowerCase() === 'get') {
            const cacheKey = error.config.url + JSON.stringify(error.config.params || {});
            pendingRequests.delete(cacheKey);
        }

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

export const fixUrl = (url) => {
    if (!url || typeof url !== 'string') return url;
    if (url.startsWith('blob:') || url.startsWith('data:')) return url;

    // Detect environment
    const isLocalFrontend = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    let endpoint = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://backend.godofgraphics.in';
    
    // If running locally but pointing to production, and the URL is local-style, 
    // or if we just want to ensure local uploads work on local dev:
    if (isLocalFrontend && !endpoint.includes('localhost')) {
        // Only override if the URL is relative or looks like a local upload
        if (url.startsWith('/uploads') || url.includes('localhost:5000')) {
            endpoint = 'http://localhost:5000';
        }
    }

    // Fix hardcoded localhost:5000 if we are in production
    if (!isLocalFrontend && url.includes('localhost:5000')) {
        return url.replace('http://localhost:5000', endpoint);
    }

    // Fix hardcoded localhost:5000 if we are on local but port is different
    if (isLocalFrontend && url.includes('localhost:5000') && endpoint.includes('localhost') && !endpoint.includes(':5000')) {
        return url.replace('http://localhost:5000', endpoint);
    }

    // Handle relative /uploads path
    if (url.startsWith('/uploads')) {
        const result = `${endpoint}${url}`;
        console.log(`🔗 fixUrl (relative): ${url} -> ${result}`);
        return result;
    }

    // Handle raw filenames (e.g. from legacy or specific fields)
    if (url.match(/^(video-|image-|audio-|raw-)/) && !url.includes('://')) {
        const result = `${endpoint}/uploads/${url}`;
        console.log(`🔗 fixUrl (raw): ${url} -> ${result}`);
        return result;
    }
    
    // If it's already a full URL but needs protocol fix or host fix
    if (url.startsWith('http://localhost:5000')) {
        const result = url.replace('http://localhost:5000', endpoint);
        console.log(`🔗 fixUrl: ${url} -> ${result}`);
        return result;
    }

    const finalUrl = url;
    console.log(`🔗 fixUrl: ${url} -> ${finalUrl}`);
    return finalUrl;
};

export default api;
