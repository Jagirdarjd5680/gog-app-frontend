import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useSettings } from './SettingsContext';

const ThemeContext = createContext(null);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const { settings } = useSettings();
    const [mode, setMode] = useState(() => {
        const savedMode = localStorage.getItem('themeMode');
        return savedMode || 'light';
    });

    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    // Dynamic Theme based on Settings
    const theme = useMemo(() => {
        const isLight = mode === 'light';
        const primary = isLight ? (settings?.theme?.primaryColor || '#1a237e') : '#3f51b5';
        const secondary = isLight ? (settings?.theme?.secondaryColor || '#ffc107') : '#f50057';

        return createTheme({
            palette: {
                mode,
                primary: {
                    main: primary,
                },
                secondary: {
                    main: secondary,
                },
                background: {
                    default: mode === 'light' ? '#f5f7fa' : '#121212',
                    paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
                },
                text: {
                    primary: mode === 'light' ? '#2c3e50' : '#ffffff',
                    secondary: mode === 'light' ? '#7f8c8d' : '#b0b0b0',
                },
            },
            typography: {
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                h1: {
                    fontWeight: 700,
                },
                h2: {
                    fontWeight: 600,
                },
                h3: {
                    fontWeight: 600,
                },
                button: {
                    textTransform: 'none',
                    fontWeight: 500,
                },
            },
            shape: {
                borderRadius: 12,
            },
            components: {
                MuiButton: {
                    styleOverrides: {
                        root: {
                            borderRadius: 8,
                            padding: '10px 24px',
                            boxShadow: 'none',
                            '&:hover': {
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            },
                        },
                    },
                },
                MuiCard: {
                    styleOverrides: {
                        root: {
                            borderRadius: 16,
                            boxShadow: mode === 'light'
                                ? '0 2px 8px rgba(0,0,0,0.08)'
                                : '0 2px 8px rgba(0,0,0,0.3)',
                        },
                    },
                },
                MuiPaper: {
                    styleOverrides: {
                        root: {
                            backgroundImage: 'none',
                        },
                    },
                },
            },
        });
    }, [mode, settings]);

    const value = {
        mode,
        toggleTheme,
        isDark: mode === 'dark',
    };

    return (
        <ThemeContext.Provider value={value}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};
