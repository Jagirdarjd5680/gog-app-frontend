import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend.godofgraphics.in/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 3600000, // 1 hour timeout for large transfers
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        // Lets the backend enforce Course.platformAccess ("web" | "app" | "both") —
        // see backend_nestjs/src/common/platform.ts. native-app sends "app" the same way.
        'X-Platform': 'web',
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

        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
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
        if (url.startsWith('/uploads') || url.includes('localhost:5001')) {
            endpoint = 'http://localhost:5001';
        }
    }

    // Fix hardcoded localhost:5001 if we are in production
    if (!isLocalFrontend && url.includes('localhost:5001')) {
        return url.replace('http://localhost:5001', endpoint);
    }

    // Fix hardcoded localhost:5001 if we are on local but port is different
    if (isLocalFrontend && url.includes('localhost:5001') && endpoint.includes('localhost') && !endpoint.includes(':5001')) {
        return url.replace('http://localhost:5001', endpoint);
    }

    let finalUrl = url;

    // /api/secure-media/... URLs (backend_nestjs/src/media-access) already carry a short-lived,
    // per-user signed token — the backend's MediaUrlSigningInterceptor rewrites any raw
    // /uploads/... path into one of these before the response ever reaches this file. Just
    // host-prefix it; never append the raw login token to it (see step 2 below, which already
    // guards against double-appending, but this path never needed a token to begin with).
    if (url.startsWith('/api/secure-media') && !url.includes('://')) {
        return `${endpoint}${url}`;
    }

    // 1. Resolve Endpoint and Base URL
    if (url.startsWith('/uploads') || url.startsWith('/api/media')) {
        finalUrl = `${endpoint}${url}`;
    } else if (url.match(/^(video-|image-|audio-|raw-)/) && !url.includes('://')) {
        finalUrl = `${endpoint}/uploads/${url}`;
    } else if (url.startsWith('http://localhost:5001')) {
        finalUrl = url.replace('http://localhost:5001', endpoint);
    }

    // 2. Append Token for Security
    // NOTE: any /uploads/... or /api/media/... left unsigned here means the response that
    // returned it bypassed MediaUrlSigningInterceptor (e.g. an unauthenticated/public endpoint,
    // which intentionally isn't signed — see docs/tasks/01-secure-media-tokens.md). Appending the
    // long-lived login JWT below is legacy weaker-than-ideal behavior kept only for that
    // unmigrated remainder, not a substitute for the interceptor.
    const token = localStorage.getItem('token');
    if (token && (finalUrl.includes('/api/media/') || finalUrl.includes('/uploads/'))) {
        if (!finalUrl.includes('token=')) {
            const separator = finalUrl.includes('?') ? '&' : '?';
            finalUrl = `${finalUrl}${separator}token=${token}`;
        }
    }
    
    return finalUrl;
};

export default api;
