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
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [mode]);

    // Update CSS custom properties dynamically when settings change
    useEffect(() => {
        const root = document.documentElement;
        if (settings?.theme) {
            const theme = settings.theme;
            
            // Primary and Secondary colors (only in light mode, matching MUI theme logic)
            if (mode === 'light') {
                if (theme.primaryColor) {
                    root.style.setProperty('--color-vc-primary', theme.primaryColor);
                } else {
                    root.style.removeProperty('--color-vc-primary');
                }
                if (theme.secondaryColor) {
                    root.style.setProperty('--color-vc-secondary', theme.secondaryColor);
                } else {
                    root.style.removeProperty('--color-vc-secondary');
                }
            } else {
                root.style.removeProperty('--color-vc-primary');
                root.style.removeProperty('--color-vc-secondary');
            }
            
            // Sidebar theme custom colors (only applied in light mode)
            if (mode === 'light' && theme.sidebarBg) {
                root.style.setProperty('--color-sidebar-bg', theme.sidebarBg);
            } else {
                root.style.removeProperty('--color-sidebar-bg');
            }
            if (mode === 'light' && theme.menuText) {
                root.style.setProperty('--color-sidebar-menu-text', theme.menuText);
                if (theme.menuText.startsWith('#')) {
                    const opacityHex = theme.menuText.length === 7 ? '20' : '';
                    root.style.setProperty('--color-sidebar-border', theme.menuText + opacityHex);
                } else {
                    root.style.removeProperty('--color-sidebar-border');
                }
            } else {
                root.style.removeProperty('--color-sidebar-menu-text');
                root.style.removeProperty('--color-sidebar-border');
            }
            if (mode === 'light' && theme.activeMenuBg) {
                root.style.setProperty('--color-sidebar-active-bg', theme.activeMenuBg);
            } else {
                root.style.removeProperty('--color-sidebar-active-bg');
            }
            if (mode === 'light' && theme.activeMenuText) {
                root.style.setProperty('--color-sidebar-active-text', theme.activeMenuText);
            } else {
                root.style.removeProperty('--color-sidebar-active-text');
            }
            if (mode === 'light' && theme.hoverMenuBg) {
                root.style.setProperty('--color-sidebar-hover-bg', theme.hoverMenuBg);
            } else {
                root.style.removeProperty('--color-sidebar-hover-bg');
            }
            if (mode === 'light' && theme.hoverMenuText) {
                root.style.setProperty('--color-sidebar-hover-text', theme.hoverMenuText);
            } else {
                root.style.removeProperty('--color-sidebar-hover-text');
            }

            // Topbar theme custom colors (only applied in light mode)
            if (mode === 'light' && theme.topbarBg) {
                root.style.setProperty('--color-topbar-bg', theme.topbarBg);
            } else {
                root.style.removeProperty('--color-topbar-bg');
            }
            if (mode === 'light' && theme.topbarText) {
                root.style.setProperty('--color-topbar-text', theme.topbarText);
                if (theme.topbarText.startsWith('#')) {
                    const opacityHex = theme.topbarText.length === 7 ? '20' : '';
                    root.style.setProperty('--color-topbar-border', theme.topbarText + opacityHex);
                } else {
                    root.style.removeProperty('--color-topbar-border');
                }
            } else {
                root.style.removeProperty('--color-topbar-text');
                root.style.removeProperty('--color-topbar-border');
            }
            if (mode === 'light' && theme.topbarHoverBg) {
                root.style.setProperty('--color-topbar-hover-bg', theme.topbarHoverBg);
            } else {
                root.style.removeProperty('--color-topbar-hover-bg');
            }

            // Font & Typography configuration
            if (theme.globalFont) {
                root.style.setProperty('--font-global', `"${theme.globalFont}", sans-serif`);
                const fontUrl = `https://fonts.googleapis.com/css2?family=${theme.globalFont.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;
                let link = document.querySelector(`link[href^="https://fonts.googleapis.com/css2?family=${theme.globalFont.replace(/ /g, '+')}"]`);
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = fontUrl;
                    document.head.appendChild(link);
                }
            } else {
                root.style.removeProperty('--font-global');
            }
            if (theme.sidebarFont) {
                root.style.setProperty('--font-sidebar', `"${theme.sidebarFont}", sans-serif`);
                const fontUrl = `https://fonts.googleapis.com/css2?family=${theme.sidebarFont.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;
                let link = document.querySelector(`link[href^="https://fonts.googleapis.com/css2?family=${theme.sidebarFont.replace(/ /g, '+')}"]`);
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = fontUrl;
                    document.head.appendChild(link);
                }
            } else {
                root.style.removeProperty('--font-sidebar');
            }
            if (theme.sidebarFontSize) {
                root.style.setProperty('--font-size-sidebar', theme.sidebarFontSize);
            } else {
                root.style.removeProperty('--font-size-sidebar');
            }
        } else {
            root.style.removeProperty('--color-vc-primary');
            root.style.removeProperty('--color-vc-secondary');
            root.style.removeProperty('--color-sidebar-bg');
            root.style.removeProperty('--color-sidebar-menu-text');
            root.style.removeProperty('--color-sidebar-border');
            root.style.removeProperty('--color-sidebar-active-bg');
            root.style.removeProperty('--color-sidebar-active-text');
            root.style.removeProperty('--color-sidebar-hover-bg');
            root.style.removeProperty('--color-sidebar-hover-text');
            root.style.removeProperty('--color-topbar-bg');
            root.style.removeProperty('--color-topbar-text');
            root.style.removeProperty('--color-topbar-border');
            root.style.removeProperty('--color-topbar-hover-bg');
            root.style.removeProperty('--font-global');
            root.style.removeProperty('--font-sidebar');
            root.style.removeProperty('--font-size-sidebar');
        }
    }, [settings, mode]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    // Dynamic Theme based on Settings
    const theme = useMemo(() => {
        const isLight = mode === 'light';
        const primary = isLight ? (settings?.theme?.primaryColor || '#1a237e') : '#3f51b5';
        const secondary = isLight ? (settings?.theme?.secondaryColor || '#ffc107') : '#f50057';
        const fontGlobal = settings?.theme?.globalFont || 'Inter';
        const fontGlobalMui = `"${fontGlobal}", "Inter", "Roboto", "Helvetica", "Arial", sans-serif`;

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
                fontFamily: fontGlobalMui,
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
                borderRadius: 8,
            },
            components: {
                MuiButton: {
                    styleOverrides: {
                        root: {
                            borderRadius: 6,
                            padding: '8px 16px',
                            boxShadow: 'none',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '13px',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                                boxShadow: 'none',
                            },
                        },
                        containedPrimary: {
                            backgroundColor: primary,
                            color: isLight ? '#ffffff' : '#000000',
                            border: `1px solid ${primary}`,
                            '&:hover': {
                                backgroundColor: isLight ? '#000000' : '#ffffff',
                                color: isLight ? '#ffffff' : '#000000',
                                borderColor: isLight ? '#000000' : '#ffffff',
                            }
                        },
                        outlinedPrimary: {
                            color: primary,
                            borderColor: primary,
                            '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.02)',
                                borderColor: primary,
                            }
                        }
                    },
                },
                MuiCard: {
                    styleOverrides: {
                        root: {
                            borderRadius: 8,
                            border: '1px solid',
                            borderColor: isLight ? '#ebebeb' : '#333333',
                            boxShadow: 'none',
                            backgroundImage: 'none',
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
                MuiOutlinedInput: {
                    styleOverrides: {
                        root: {
                            borderRadius: 6,
                            fontSize: '13px',
                            '& fieldset': {
                                borderColor: isLight ? '#ebebeb' : '#333333',
                            },
                            '&:hover fieldset': {
                                borderColor: isLight ? '#a1a1a1' : '#666666',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: primary,
                            },
                        },
                    },
                },
                MuiSelect: {
                    styleOverrides: {
                        select: {
                            fontSize: '13px',
                            paddingTop: '8px',
                            paddingBottom: '8px',
                        }
                    }
                },
                MuiSwitch: {
                    styleOverrides: {
                        root: {
                            width: 38,
                            height: 20,
                            padding: 0,
                            display: 'flex',
                            '&:active': {
                                '& .MuiSwitch-thumb': {
                                    width: 15,
                                },
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                    transform: 'translateX(9px)',
                                },
                            },
                        },
                        switchBase: {
                            padding: 2,
                            '&.Mui-checked': {
                                transform: 'translateX(18px)',
                                color: '#fff',
                                '& + .MuiSwitch-track': {
                                    opacity: 1,
                                    backgroundColor: primary,
                                },
                            },
                        },
                        thumb: {
                            boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
                            width: 16,
                            height: 16,
                            borderRadius: 8,
                            transition: 'width 0.09s ease-in',
                        },
                        track: {
                            borderRadius: 10,
                            opacity: 1,
                            backgroundColor: isLight ? '#e9e9ea' : '#39393d',
                            boxSizing: 'border-box',
                        },
                    }
                },
                MuiTableContainer: {
                    styleOverrides: {
                        root: {
                            boxShadow: 'none !important',
                            border: '1px solid !important',
                            borderColor: isLight ? '#ebebeb !important' : '#333333 !important',
                            borderRadius: '8px !important',
                            overflow: 'hidden !important',
                            backgroundColor: 'var(--color-vc-canvas) !important',
                        }
                    }
                },
                MuiTableHead: {
                    styleOverrides: {
                        root: {
                            backgroundColor: isLight ? '#fafafa !important' : '#1a1a1a !important',
                            '& .MuiTableCell-head': {
                                color: isLight ? '#666666 !important' : '#888888 !important',
                                fontWeight: '700 !important',
                                fontSize: '11px !important',
                                textTransform: 'uppercase !important',
                                letterSpacing: '0.08em !important',
                                borderBottom: '1px solid !important',
                                borderColor: isLight ? '#ebebeb !important' : '#333333 !important',
                            }
                        }
                    }
                },
                MuiTableCell: {
                    styleOverrides: {
                        root: {
                            padding: '12px 16px !important',
                            fontSize: '13px !important',
                            borderBottom: '1px solid !important',
                            borderColor: isLight ? '#ebebeb !important' : '#333333 !important',
                            color: 'var(--color-vc-body) !important',
                            fontFamily: 'inherit !important',
                        }
                    }
                },
                MuiTableRow: {
                    styleOverrides: {
                        root: {
                            '&:hover': {
                                backgroundColor: isLight ? '#fafafa !important' : '#1a1a1a !important',
                            },
                            '&:last-child .MuiTableCell-root': {
                                borderBottom: 'none !important',
                            }
                        }
                    }
                },
            },
        });
    }, [mode, settings]);

    const value = {
        mode,
        toggleTheme,
        isDark: mode === 'dark',
        darkMode: mode === 'dark'
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
