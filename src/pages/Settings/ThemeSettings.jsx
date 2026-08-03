import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    Button,
    Box,
    FormControlLabel,
    Switch,
    Divider,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    Radio
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const PRESETS = [
    {
        id: 'default',
        name: 'Default',
        colors: {
            primaryColor: '#3f51b5',
            secondaryColor: '#f50057',
            sidebarBg: '#1e293b',
            menuText: '#94a3b8',
            activeMenuBg: '#3f51b5',
            activeMenuText: '#ffffff',
            hoverMenuBg: '#334155',
            hoverMenuText: '#ffffff',
            topbarBg: '#ffffff',
            topbarText: '#333333',
            topbarHoverBg: '#f1f5f9'
        },
        swatches: ['#1e293b', '#94a3b8', '#3f51b5', '#ffffff']
    },
    {
        id: 'fresh',
        name: 'Fresh',
        colors: {
            primaryColor: '#0f766e',
            secondaryColor: '#14b8a6',
            sidebarBg: '#0f172a',
            menuText: '#94a3b8',
            activeMenuBg: '#0f766e',
            activeMenuText: '#ffffff',
            hoverMenuBg: '#1e293b',
            hoverMenuText: '#ffffff',
            topbarBg: '#ffffff',
            topbarText: '#0f172a',
            topbarHoverBg: '#f1f5f9'
        },
        swatches: ['#0f172a', '#94a3b8', '#0f766e', '#ffffff']
    },
    {
        id: 'light',
        name: 'Light',
        colors: {
            primaryColor: '#2563eb',
            secondaryColor: '#4f46e5',
            sidebarBg: '#ffffff',
            menuText: '#475569',
            activeMenuBg: '#eff6ff',
            activeMenuText: '#2563eb',
            hoverMenuBg: '#f8fafc',
            hoverMenuText: '#0f172a',
            topbarBg: '#ffffff',
            topbarText: '#1e293b',
            topbarHoverBg: '#f1f5f9'
        },
        swatches: ['#ffffff', '#475569', '#eff6ff', '#2563eb']
    },
    {
        id: 'blue',
        name: 'Blue',
        colors: {
            primaryColor: '#004e7c',
            secondaryColor: '#0091d5',
            sidebarBg: '#004e7c',
            menuText: '#a3d8f8',
            activeMenuBg: '#007bb6',
            activeMenuText: '#ffffff',
            hoverMenuBg: '#003758',
            hoverMenuText: '#ffffff',
            topbarBg: '#004e7c',
            topbarText: '#ffffff',
            topbarHoverBg: '#003758'
        },
        swatches: ['#004e7c', '#a3d8f8', '#007bb6', '#ffffff']
    },
    {
        id: 'coffee',
        name: 'Coffee',
        colors: {
            primaryColor: '#4a2c11',
            secondaryColor: '#d4a373',
            sidebarBg: '#4a2c11',
            menuText: '#dfc7b2',
            activeMenuBg: '#6f421b',
            activeMenuText: '#ffffff',
            hoverMenuBg: '#351e0a',
            hoverMenuText: '#ffffff',
            topbarBg: '#4a2c11',
            topbarText: '#ffffff',
            topbarHoverBg: '#351e0a'
        },
        swatches: ['#4a2c11', '#dfc7b2', '#6f421b', '#ffffff']
    },
    {
        id: 'ectoplasm',
        name: 'Ectoplasm',
        colors: {
            primaryColor: '#4c1d95',
            secondaryColor: '#84cc16',
            sidebarBg: '#2e1065',
            menuText: '#d8b4fe',
            activeMenuBg: '#4c1d95',
            activeMenuText: '#84cc16',
            hoverMenuBg: '#3b0764',
            hoverMenuText: '#d8b4fe',
            topbarBg: '#ffffff',
            topbarText: '#2e1065',
            topbarHoverBg: '#f1f5f9'
        },
        swatches: ['#2e1065', '#d8b4fe', '#4c1d95', '#84cc16']
    },
    {
        id: 'midnight',
        name: 'Midnight',
        colors: {
            primaryColor: '#1e293b',
            secondaryColor: '#f43f5e',
            sidebarBg: '#0b0f19',
            menuText: '#64748b',
            activeMenuBg: '#1e293b',
            activeMenuText: '#ffffff',
            hoverMenuBg: '#111827',
            hoverMenuText: '#cbd5e1',
            topbarBg: '#0b0f19',
            topbarText: '#ffffff',
            topbarHoverBg: '#111827'
        },
        swatches: ['#0b0f19', '#64748b', '#1e293b', '#ffffff']
    },
    {
        id: 'ocean',
        name: 'Ocean',
        colors: {
            primaryColor: '#0284c7',
            secondaryColor: '#38bdf8',
            sidebarBg: '#0f172a',
            menuText: '#94a3b8',
            activeMenuBg: '#1e293b',
            activeMenuText: '#38bdf8',
            hoverMenuBg: '#1e293b',
            hoverMenuText: '#38bdf8',
            topbarBg: '#0f172a',
            topbarText: '#ffffff',
            topbarHoverBg: '#1e293b'
        },
        swatches: ['#0f172a', '#94a3b8', '#1e293b', '#38bdf8']
    },
    {
        id: 'sunrise',
        name: 'Sunrise',
        colors: {
            primaryColor: '#be123c',
            secondaryColor: '#fb7185',
            sidebarBg: '#4c0519',
            menuText: '#fda4af',
            activeMenuBg: '#be123c',
            activeMenuText: '#ffffff',
            hoverMenuBg: '#881337',
            hoverMenuText: '#ffffff',
            topbarBg: '#4c0519',
            topbarText: '#ffffff',
            topbarHoverBg: '#881337'
        },
        swatches: ['#4c0519', '#fda4af', '#be123c', '#ffffff']
    }
];

const COMPANY_PRESETS = [
    {
        id: 'vercel',
        name: 'Vercel',
        colors: {
            primaryColor: '#000000',
            secondaryColor: '#888888',
            sidebarBg: '#000000',
            menuText: '#a1a1a1',
            activeMenuBg: '#111111',
            activeMenuText: '#ffffff',
            hoverMenuBg: '#0a0a0a',
            hoverMenuText: '#ffffff',
            topbarBg: '#000000',
            topbarText: '#ffffff',
            topbarHoverBg: '#111111'
        },
        fonts: {
            globalFont: 'Inter',
            sidebarFont: 'Inter',
            sidebarFontSize: '13px'
        },
        swatches: ['#000000', '#a1a1a1', '#111111', '#ffffff']
    },
    {
        id: 'cloudflare',
        name: 'Cloudflare',
        colors: {
            primaryColor: '#f6821f',
            secondaryColor: '#045582',
            sidebarBg: '#1d2021',
            menuText: '#a0a0a2',
            activeMenuBg: '#f6821f',
            activeMenuText: '#ffffff',
            hoverMenuBg: '#2d3133',
            hoverMenuText: '#ffffff',
            topbarBg: '#151718',
            topbarText: '#ffffff',
            topbarHoverBg: '#25282a'
        },
        fonts: {
            globalFont: 'Inter',
            sidebarFont: 'Inter',
            sidebarFontSize: '13px'
        },
        swatches: ['#1d2021', '#a0a0a2', '#f6821f', '#ffffff']
    },
    {
        id: 'netlify',
        name: 'Netlify',
        colors: {
            primaryColor: '#00ad9f',
            secondaryColor: '#20c997',
            sidebarBg: '#0e1e25',
            menuText: '#7fa3b0',
            activeMenuBg: '#00ad9f',
            activeMenuText: '#ffffff',
            hoverMenuBg: '#17303a',
            hoverMenuText: '#00ad9f',
            topbarBg: '#0b171c',
            topbarText: '#ffffff',
            topbarHoverBg: '#17303a'
        },
        fonts: {
            globalFont: 'Plus Jakarta Sans',
            sidebarFont: 'Plus Jakarta Sans',
            sidebarFontSize: '13px'
        },
        swatches: ['#0e1e25', '#7fa3b0', '#00ad9f', '#ffffff']
    },
    {
        id: 'render',
        name: 'Render',
        colors: {
            primaryColor: '#4e61ec',
            secondaryColor: '#7e8eff',
            sidebarBg: '#0d0e15',
            menuText: '#9aa0b9',
            activeMenuBg: '#4e61ec',
            activeMenuText: '#ffffff',
            hoverMenuBg: '#191a27',
            hoverMenuText: '#ffffff',
            topbarBg: '#08090d',
            topbarText: '#ffffff',
            topbarHoverBg: '#191a27'
        },
        fonts: {
            globalFont: 'Outfit',
            sidebarFont: 'Outfit',
            sidebarFontSize: '13px'
        },
        swatches: ['#0d0e15', '#9aa0b9', '#4e61ec', '#ffffff']
    }
];

const FONTS = [
    { value: 'Inter', label: 'Inter [Default sans-serif]' },
    { value: 'Outfit', label: 'Outfit' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans' },
    { value: 'JetBrains Mono', label: 'JetBrains Mono [Monospace]' }
];

const FONT_SIZES = [
    { value: '12px', label: '12px [Small - Recommended]' },
    { value: '13px', label: '13px [Medium]' },
    { value: '14px', label: '14px [Large]' },
    { value: '15px', label: '15px [Extra Large]' }
];

const ThemeSettings = ({ settings, onSave, isSaving }) => {
    const [formData, setFormData] = useState({
        primaryColor: '#3f51b5',
        secondaryColor: '#f50057',
        sidebarBg: '#ffffff',
        menuText: '#333333',
        activeMenuBg: '#3f51b5',
        activeMenuText: '#ffffff',
        hoverMenuBg: '#f5f5f5',
        hoverMenuText: '#333333',
        topbarBg: '#ffffff',
        topbarText: '#333333',
        topbarHoverBg: '#f5f7fa',
        globalFont: 'Inter',
        sidebarFont: 'Inter',
        sidebarFontSize: '14px',
        preset: 'default',
        darkMode: false,
        ...settings?.theme
    });

    useEffect(() => {
        if (settings?.theme) {
            setFormData(prev => ({ ...prev, ...settings.theme }));
        }
    }, [settings]);

    // Live preview: apply local changes immediately to document style variables
    useEffect(() => {
        const root = document.documentElement;
        if (formData) {
            // Primary & Secondary
            if (formData.primaryColor) root.style.setProperty('--color-vc-primary', formData.primaryColor);
            if (formData.secondaryColor) root.style.setProperty('--color-vc-secondary', formData.secondaryColor);
            
            // Sidebar custom colors (only applied if dark mode is disabled)
            const isDarkMode = formData.darkMode ?? false;
            if (formData.sidebarBg && !isDarkMode) {
                root.style.setProperty('--color-sidebar-bg', formData.sidebarBg);
            } else {
                root.style.removeProperty('--color-sidebar-bg');
            }
            if (formData.menuText && !isDarkMode) {
                root.style.setProperty('--color-sidebar-menu-text', formData.menuText);
                if (formData.menuText.startsWith('#')) {
                    const opacityHex = formData.menuText.length === 7 ? '20' : '';
                    root.style.setProperty('--color-sidebar-border', formData.menuText + opacityHex);
                } else {
                    root.style.removeProperty('--color-sidebar-border');
                }
            } else {
                root.style.removeProperty('--color-sidebar-menu-text');
                root.style.removeProperty('--color-sidebar-border');
            }
            if (formData.activeMenuBg && !isDarkMode) {
                root.style.setProperty('--color-sidebar-active-bg', formData.activeMenuBg);
            } else {
                root.style.removeProperty('--color-sidebar-active-bg');
            }
            if (formData.activeMenuText && !isDarkMode) {
                root.style.setProperty('--color-sidebar-active-text', formData.activeMenuText);
            } else {
                root.style.removeProperty('--color-sidebar-active-text');
            }
            if (formData.hoverMenuBg && !isDarkMode) {
                root.style.setProperty('--color-sidebar-hover-bg', formData.hoverMenuBg);
            } else {
                root.style.removeProperty('--color-sidebar-hover-bg');
            }
            if (formData.hoverMenuText && !isDarkMode) {
                root.style.setProperty('--color-sidebar-hover-text', formData.hoverMenuText);
            } else {
                root.style.removeProperty('--color-sidebar-hover-text');
            }
            
            // Topbar custom colors (only applied if dark mode is disabled)
            if (formData.topbarBg && !isDarkMode) {
                root.style.setProperty('--color-topbar-bg', formData.topbarBg);
            } else {
                root.style.removeProperty('--color-topbar-bg');
            }
            if (formData.topbarText && !isDarkMode) {
                root.style.setProperty('--color-topbar-text', formData.topbarText);
                if (formData.topbarText.startsWith('#')) {
                    const opacityHex = formData.topbarText.length === 7 ? '20' : '';
                    root.style.setProperty('--color-topbar-border', formData.topbarText + opacityHex);
                } else {
                    root.style.removeProperty('--color-topbar-border');
                }
            } else {
                root.style.removeProperty('--color-topbar-text');
                root.style.removeProperty('--color-topbar-border');
            }
            if (formData.topbarHoverBg && !isDarkMode) {
                root.style.setProperty('--color-topbar-hover-bg', formData.topbarHoverBg);
            } else {
                root.style.removeProperty('--color-topbar-hover-bg');
            }
            
            // Fonts
            if (formData.globalFont) {
                root.style.setProperty('--font-global', `"${formData.globalFont}", sans-serif`);
                const fontUrl = `https://fonts.googleapis.com/css2?family=${formData.globalFont.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;
                let link = document.querySelector(`link[href^="https://fonts.googleapis.com/css2?family=${formData.globalFont.replace(/ /g, '+')}"]`);
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = fontUrl;
                    document.head.appendChild(link);
                }
            }
            if (formData.sidebarFont) {
                root.style.setProperty('--font-sidebar', `"${formData.sidebarFont}", sans-serif`);
                const fontUrl = `https://fonts.googleapis.com/css2?family=${formData.sidebarFont.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;
                let link = document.querySelector(`link[href^="https://fonts.googleapis.com/css2?family=${formData.sidebarFont.replace(/ /g, '+')}"]`);
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = fontUrl;
                    document.head.appendChild(link);
                }
            }
            if (formData.sidebarFontSize) {
                root.style.setProperty('--font-size-sidebar', formData.sidebarFontSize);
            }
        }
    }, [formData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            preset: name !== 'preset' ? 'custom' : value // Mark as custom if individual color is changed
        }));
    };

    const handlePresetSelect = (presetId, isCompany = false) => {
        const source = isCompany ? COMPANY_PRESETS : PRESETS;
        const selectedPreset = source.find(p => p.id === presetId);
        if (selectedPreset) {
            setFormData(prev => ({
                ...prev,
                ...selectedPreset.colors,
                ...(selectedPreset.fonts || {}),
                preset: presetId
            }));
        }
    };

    const handleReset = () => {
        const defaultPreset = PRESETS.find(p => p.id === 'default');
        if (defaultPreset) {
            setFormData({
                ...defaultPreset.colors,
                globalFont: 'Inter',
                sidebarFont: 'Inter',
                sidebarFontSize: '14px',
                preset: 'default',
                darkMode: false
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ theme: formData });
    };

    const ColorInput = ({ label, name, defaultValue }) => {
        const value = formData[name] || defaultValue;
        return (
            <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: '13px' }}>
                    {label}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <TextField
                        size="small"
                        name={name}
                        value={value}
                        onChange={handleChange}
                        fullWidth
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                fontFamily: '"JetBrains Mono", monospace',
                                fontSize: '13px'
                            }
                        }}
                    />
                    <input
                        type="color"
                        name={name}
                        value={value.startsWith('#') && value.length === 7 ? value : '#ffffff'}
                        onChange={handleChange}
                        style={{
                            width: 42,
                            height: 38,
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            padding: 0,
                            backgroundColor: 'transparent'
                        }}
                    />
                </Box>
            </Grid>
        );
    };

    return (
        <Card sx={{ borderRadius: '8px', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <Box component="form" onSubmit={handleSubmit}>
                    
                    {/* SECTION 1: Theme & Color Customization */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', mb: 3, color: 'text.primary' }}>
                        Theme & Color Customization
                    </Typography>
                    <Grid container spacing={3}>
                        <ColorInput label="Primary Theme Color" name="primaryColor" defaultValue="#3f51b5" />
                        <ColorInput label="Secondary Color" name="secondaryColor" defaultValue="#f50057" />
                        <ColorInput label="Sidebar Background" name="sidebarBg" defaultValue="#ffffff" />
                        <ColorInput label="Menu Text Color" name="menuText" defaultValue="#333333" />
                        <ColorInput label="Active Menu Background" name="activeMenuBg" defaultValue="#3f51b5" />
                        <ColorInput label="Active Menu Text Color" name="activeMenuText" defaultValue="#ffffff" />
                        <ColorInput label="Menu Hover Background" name="hoverMenuBg" defaultValue="#f5f5f5" />
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    {/* SECTION 2: Topbar Styling Settings */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', mb: 3, color: 'text.primary' }}>
                        Topbar Styling Settings
                    </Typography>
                    <Grid container spacing={3}>
                        <ColorInput label="Topbar Background" name="topbarBg" defaultValue="#ffffff" />
                        <ColorInput label="Topbar Text & Icons" name="topbarText" defaultValue="#333333" />
                        <ColorInput label="Topbar Hover Background" name="topbarHoverBg" defaultValue="#f5f7fa" />
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    {/* SECTION 3: Font & Typography Settings */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', mb: 3, color: 'text.primary' }}>
                        Font & Typography Settings
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: '13px' }}>
                                Global Font Family
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    name="globalFont"
                                    value={formData.globalFont || 'Inter'}
                                    onChange={handleChange}
                                    sx={{ borderRadius: '8px', fontSize: '13px' }}
                                >
                                    {FONTS.map(f => (
                                        <MenuItem key={f.value} value={f.value} sx={{ fontSize: '13px' }}>{f.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: '13px' }}>
                                Sidebar Font Family
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    name="sidebarFont"
                                    value={formData.sidebarFont || 'Inter'}
                                    onChange={handleChange}
                                    sx={{ borderRadius: '8px', fontSize: '13px' }}
                                >
                                    {FONTS.map(f => (
                                        <MenuItem key={f.value} value={f.value} sx={{ fontSize: '13px' }}>{f.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: '13px' }}>
                                Sidebar Font Size
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    name="sidebarFontSize"
                                    value={formData.sidebarFontSize || '14px'}
                                    onChange={handleChange}
                                    sx={{ borderRadius: '8px', fontSize: '13px' }}
                                >
                                    {FONT_SIZES.map(s => (
                                        <MenuItem key={s.value} value={s.value} sx={{ fontSize: '13px' }}>{s.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    {/* SECTION 4: Prebuilt Theme Presets */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', mb: 3, color: 'text.primary' }}>
                        Prebuilt Theme Presets
                    </Typography>
                    <Grid container spacing={3}>
                        {PRESETS.map((preset) => {
                            const isSelected = formData.preset === preset.id;
                            return (
                                <Grid item xs={12} sm={6} md={4} key={preset.id}>
                                    <Card
                                        onClick={() => handlePresetSelect(preset.id)}
                                        sx={{
                                            borderRadius: '12px',
                                            border: '2px solid',
                                            borderColor: isSelected ? 'primary.main' : 'divider',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            boxShadow: isSelected ? '0 4px 12px rgba(63, 81, 181, 0.15)' : 'none',
                                            '&:hover': {
                                                borderColor: isSelected ? 'primary.main' : 'text.secondary',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Radio
                                                checked={isSelected}
                                                size="small"
                                                sx={{ p: 0 }}
                                            />
                                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px' }}>
                                                {preset.name}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ px: 2, pb: 2 }}>
                                            {/* Swatch bars */}
                                            <Box sx={{ display: 'flex', height: 16, borderRadius: '4px', overflow: 'hidden' }}>
                                                {preset.swatches.map((color, index) => (
                                                    <Box key={index} sx={{ flex: 1, bgcolor: color }} />
                                                ))}
                                            </Box>
                                        </Box>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    {/* SECTION 4.5: Popular Companies Theme Presets */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', mb: 3, color: 'text.primary' }}>
                        Popular Companies
                    </Typography>
                    <Grid container spacing={3}>
                        {COMPANY_PRESETS.map((preset) => {
                            const isSelected = formData.preset === preset.id;
                            return (
                                <Grid item xs={12} sm={6} md={4} key={preset.id}>
                                    <Card
                                        onClick={() => handlePresetSelect(preset.id, true)}
                                        sx={{
                                            borderRadius: '8px',
                                            border: isSelected ? '2px solid' : '1px solid',
                                            borderColor: isSelected ? 'primary.main' : 'divider',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            boxShadow: 'none',
                                            '&:hover': {
                                                borderColor: isSelected ? 'primary.main' : 'text.secondary',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Radio
                                                checked={isSelected}
                                                size="small"
                                                sx={{ p: 0 }}
                                            />
                                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px' }}>
                                                {preset.name}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ px: 2, pb: 2 }}>
                                            {/* Swatch bars */}
                                            <Box sx={{ display: 'flex', height: 16, borderRadius: '4px', overflow: 'hidden' }}>
                                                {preset.swatches.map((color, index) => (
                                                    <Box key={index} sx={{ flex: 1, bgcolor: color }} />
                                                ))}
                                            </Box>
                                        </Box>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    {/* SECTION 5: Dark Mode Toggle */}
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.darkMode ?? false}
                                        onChange={handleChange}
                                        name="darkMode"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>
                                            Enable Dark Mode
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Apply dark system styles across student dashboards.
                                        </Typography>
                                    </Box>
                                }
                            />
                        </Grid>
                    </Grid>

                    {/* Submit Actions */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<RestartAltIcon />}
                            onClick={handleReset}
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                py: 1
                            }}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="contained"
                            type="submit"
                            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            disabled={isSaving}
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 4,
                                py: 1
                            }}
                        >
                            {isSaving ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </Box>

                </Box>
            </CardContent>
        </Card>
    );
};

export default ThemeSettings;
