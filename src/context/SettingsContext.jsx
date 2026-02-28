import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                // Try fetching full settings (admin/auth)
                const response = await api.get('/settings');
                setSettings(response.data);
            } else {
                // Not logged in, fetch public settings directly
                const publicRes = await api.get('/settings/public');
                setSettings(publicRes.data);
            }
        } catch (error) {
            // Fallback for any other errors
            try {
                const publicRes = await api.get('/settings/public');
                setSettings(publicRes.data);
            } catch (innerError) {
                console.error('Failed to fetch settings:', innerError);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    // Update favicon and site title dynamically
    useEffect(() => {
        if (settings?.general) {
            const { siteName, siteFavicon } = settings.general;

            // Update Title
            if (siteName) {
                document.title = siteName;
            }

            // Update Favicon
            if (siteFavicon) {
                let link = document.querySelector("link[rel~='icon']");
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'icon';
                    document.getElementsByTagName('head')[0].appendChild(link);
                }
                link.href = siteFavicon;
            }
        }
    }, [settings]);

    const updateSettings = (newSettings) => {
        setSettings(newSettings);
    };

    return (
        <SettingsContext.Provider value={{ settings, loading, fetchSettings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
