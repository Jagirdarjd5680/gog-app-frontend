import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Divider,
    TextField,
    InputAdornment,
    IconButton,
    CircularProgress,
    Fade
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PaletteIcon from '@mui/icons-material/Palette';
import MailIcon from '@mui/icons-material/Mail';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import PaymentsIcon from '@mui/icons-material/Payments';
import ShareIcon from '@mui/icons-material/Share';
import SearchIcon from '@mui/icons-material/Search';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AndroidIcon from '@mui/icons-material/Android';
import StorageIcon from '@mui/icons-material/Storage';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import api from '../../utils/api';
import { toast } from 'react-toastify';

// Sub-components
import GeneralSettings from './GeneralSettings';
import AuthSettings from './AuthSettings';
import ThemeSettings from './ThemeSettings';
import SMTPSettings from './SMTPSettings';
import IntegrationSettings from './IntegrationSettings';
import PaymentSettings from './PaymentSettings';
import SocialMediaSettings from './SocialMediaSettings';
import ResultSettings from './ResultSettings';
import AppSettings from './AppSettings';
import BackupSettings from './BackupSettings';
import PDFFormatsSettings from './PDFFormatsSettings';
import PDFSettings from './PDFSettings';
import AISettings from './AISettings';
import PoliciesSettings from './PoliciesSettings';
import StorageSettings from './StorageSettings';
import PolicyIcon from '@mui/icons-material/Policy';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const SettingsLayout = () => {
    const { mode, isDark } = useTheme();
    const { updateSettings } = useSettings();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState(null);
    const [activeTab, setActiveTab] = useState(() => {
        const hash = window.location.hash.replace('#', '');
        return hash || 'general';
    });
    const [searchTerm, setSearchTerm] = useState('');

    const menuItems = [
        { id: 'general', label: 'General', icon: <SettingsIcon /> },
        { id: 'auth', label: 'Login & Register', icon: <VpnKeyIcon /> },
        { id: 'result', label: 'Result', icon: <AssessmentIcon /> },
        { id: 'theme', label: 'Theme Design', icon: <PaletteIcon /> },
        { id: 'smtp', label: 'SMTP Security', icon: <MailIcon /> },
        { id: 'payments', label: 'Payments', icon: <PaymentsIcon /> },
        { id: 'integrations', label: 'Integrations', icon: <IntegrationInstructionsIcon /> },
        { id: 'ai', label: 'AI Integration', icon: <AutoAwesomeIcon /> },
        { id: 'social', label: 'Social Media', icon: <ShareIcon /> },
        { id: 'policies', label: 'Company & Policies', icon: <PolicyIcon /> },
        { id: 'app', label: 'App Settings', icon: <AndroidIcon /> },
        { id: 'pdf-formats', label: 'PDF Formats', icon: <PictureAsPdfIcon /> },
        { id: 'pdf-settings', label: 'PDF Settings', icon: <PictureAsPdfIcon /> },
        { id: 'storage', label: 'Storage & Management', icon: <StorageIcon /> },
        { id: 'backup', label: 'Backup & Restore', icon: <StorageIcon /> },
    ];

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                setSettings(response.data);
            } catch (error) {
                toast.error('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();

        // Listen for hash changes (back/forward button)
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash) setActiveTab(hash);
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Update hash when activeTab changes
    useEffect(() => {
        window.location.hash = activeTab;
    }, [activeTab]);

    const handleSave = async (data) => {
        setIsSaving(true);
        try {
            const response = await api.put('/settings', data);
            const newSettings = response.data.data || response.data;
            setSettings(newSettings);
            updateSettings(newSettings);
            toast.success('Settings updated successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredMenu = menuItems.filter(item =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const renderContent = () => {
        const props = { settings, onSave: handleSave, isSaving };
        switch (activeTab) {
            case 'general': return <GeneralSettings {...props} />;
            case 'auth': return <AuthSettings {...props} />;
            case 'result': return <ResultSettings {...props} />;
            case 'theme': return <ThemeSettings {...props} />;
            case 'smtp': return <SMTPSettings {...props} />;
            case 'payments': return <PaymentSettings {...props} />;
            case 'integrations': return <IntegrationSettings {...props} />;
            case 'ai': return <AISettings {...props} />;
            case 'social': return <SocialMediaSettings {...props} />;
            case 'policies': return <PoliciesSettings {...props} />;
            case 'app': return <AppSettings {...props} />;
            case 'pdf-formats': return <PDFFormatsSettings {...props} />;
            case 'pdf-settings': return <PDFSettings {...props} />;
            case 'storage': return <StorageSettings {...props} />;
            case 'backup': return <BackupSettings />;
            default: return <GeneralSettings {...props} />;
        }
    };

    return (
        <Box sx={{ p: 2, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 4, ml: 1, letterSpacing: '-0.5px' }}>
                System Settings
            </Typography>
 
            <Grid container spacing={3}>
                {/* Sidebar */}
                <Grid item xs={12} md={3}>
                    <Paper sx={{
                        borderRadius: '8px',
                        overflow: 'hidden',
                        bgcolor: 'var(--color-vc-canvas)',
                        border: '1px solid var(--color-vc-hairline)',
                        boxShadow: 'none',
                        position: 'sticky',
                        top: 24,
                    }}>
                        <Box sx={{ p: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Filter settings..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoComplete="off"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" sx={{ color: 'var(--color-vc-mute)' }} />
                                        </InputAdornment>
                                    ),
                                    sx: { 
                                        borderRadius: '6px',
                                        bgcolor: 'var(--color-vc-canvas-soft)',
                                        '& fieldset': { border: 'none' },
                                        height: 36
                                    }
                                }}
                            />
                        </Box>
                        <Divider sx={{ borderColor: 'var(--color-vc-hairline)' }} />
                        <List sx={{ p: 1 }}>
                            {filteredMenu.map((item) => (
                                <ListItem
                                    button
                                    key={item.id}
                                    selected={activeTab === item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    sx={{
                                        py: 1,
                                        px: 2,
                                        my: 0.5,
                                        borderRadius: '6px',
                                        color: 'var(--color-vc-body)',
                                        transition: 'all 0.15s ease',
                                        '&.Mui-selected': {
                                            bgcolor: 'var(--color-vc-primary) !important',
                                            color: 'var(--color-vc-on-primary)',
                                            '& .MuiListItemIcon-root': { color: 'var(--color-vc-on-primary)' },
                                            '&:hover': { bgcolor: 'var(--color-vc-primary)' }
                                        },
                                        '&:hover': {
                                            bgcolor: 'var(--color-vc-canvas-soft-2)',
                                            color: 'var(--color-vc-ink)',
                                            '& .MuiListItemIcon-root': { color: 'var(--color-vc-ink)' }
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 32, color: 'inherit', '& .MuiSvgIcon-root': { fontSize: 18 } }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{ 
                                            fontWeight: activeTab === item.id ? 600 : 500,
                                            fontSize: '13px',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
 
                {/* Content */}
                <Grid item xs={12} md={9}>
                    <Fade in key={activeTab}>
                        <Box>
                            {renderContent()}
                        </Box>
                    </Fade>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SettingsLayout;
