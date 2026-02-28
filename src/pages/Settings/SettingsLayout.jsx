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

const SettingsLayout = () => {
    const { mode, isDark } = useTheme();
    const { updateSettings } = useSettings();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState(null);
    const [activeTab, setActiveTab] = useState('general');
    const [searchTerm, setSearchTerm] = useState('');

    const menuItems = [
        { id: 'general', label: 'General', icon: <SettingsIcon /> },
        { id: 'auth', label: 'Login & Register', icon: <VpnKeyIcon /> },
        { id: 'result', label: 'Result', icon: <AssessmentIcon /> },
        { id: 'theme', label: 'Theme Design', icon: <PaletteIcon /> },
        { id: 'smtp', label: 'SMTP Security', icon: <MailIcon /> },
        { id: 'payments', label: 'Payments', icon: <PaymentsIcon /> },
        { id: 'integrations', label: 'Integrations', icon: <IntegrationInstructionsIcon /> },
        { id: 'social', label: 'Social Media', icon: <ShareIcon /> },
        { id: 'app', label: 'App Settings', icon: <AndroidIcon /> },
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
    }, []);

    const handleSave = async (data) => {
        setIsSaving(true);
        try {
            const response = await api.put('/settings', data);
            setSettings(response.data);
            updateSettings(response.data);
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
            case 'social': return <SocialMediaSettings {...props} />;
            case 'app': return <AppSettings {...props} />;
            default: return <GeneralSettings {...props} />;
        }
    };

    return (
        <Box sx={{ p: 1, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 4, ml: 1 }}>
                System Settings
            </Typography>

            <Grid container spacing={3}>
                {/* Sidebar */}
                <Grid item xs={12} md={3}>
                    <Paper sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        bgcolor: isDark ? '#1e1e1e' : '#fff',
                        border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
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
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 2 }
                                }}
                            />
                        </Box>
                        <Divider />
                        <List sx={{ p: 0 }}>
                            {filteredMenu.map((item) => (
                                <ListItem
                                    button
                                    key={item.id}
                                    selected={activeTab === item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    sx={{
                                        py: 1.5,
                                        '&.Mui-selected': {
                                            bgcolor: 'primary.main',
                                            color: '#fff',
                                            '& .MuiListItemIcon-root': { color: '#fff' },
                                            '&:hover': { bgcolor: 'primary.dark' }
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40, color: activeTab === item.id ? '#fff' : 'text.secondary' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{ fontWeight: activeTab === item.id ? 700 : 500 }}
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
