import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Divider,
    Card,
    CardContent,
    Tabs,
    Tab,
    Stack,
    CircularProgress,
    IconButton,
    Alert,
    InputAdornment
} from '@mui/material';
import {
    AutoAwesome as AIIcon,
    VpnKey as KeyIcon,
    Chat as ChatIcon,
    Send as SendIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const AISettings = ({ settings, onSave, isSaving }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [localSettings, setLocalSettings] = useState(settings?.ai || {
        openai: { apiKey: '', model: 'gpt-3.5-turbo', enabled: false },
        gemini: { apiKey: '', enabled: false },
        claude: { apiKey: '', enabled: false }
    });

    const [testResults, setTestResults] = useState({
        openai: { loading: false, success: null, message: '' },
        gemini: { loading: false, success: null, message: '' },
        claude: { loading: false, success: null, message: '' }
    });

    const [chatHistory, setChatHistory] = useState({
        openai: [],
        gemini: [],
        claude: []
    });
    const [userInput, setUserInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [showKey, setShowKey] = useState({ openai: false, gemini: false, claude: false });

    useEffect(() => {
        if (settings?.ai) {
            setLocalSettings(settings.ai);
        }
    }, [settings]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleInputChange = (provider, field, value) => {
        setLocalSettings(prev => ({
            ...prev,
            [provider]: {
                ...prev[provider],
                [field]: value
            }
        }));
    };

    const handleSave = () => {
        onSave({ ai: localSettings });
    };

    const testAPI = async (provider) => {
        setTestResults(prev => ({
            ...prev,
            [provider]: { ...prev[provider], loading: true, success: null, message: '' }
        }));

        try {
            const response = await api.post('/settings/test-ai', {
                provider,
                config: localSettings[provider]
            });

            setTestResults(prev => ({
                ...prev,
                [provider]: { 
                    loading: false, 
                    success: response.data.success, 
                    message: response.data.message 
                }
            }));

            if (response.data.success) {
                toast.success(`${provider.toUpperCase()} API connection successful!`);
            } else {
                toast.error(`${provider.toUpperCase()} API connection failed!`);
            }
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                [provider]: { 
                    loading: false, 
                    success: false, 
                    message: error.response?.data?.message || 'Connection error' 
                }
            }));
            toast.error(`Error testing ${provider.toUpperCase()} API`);
        }
    };

    const handleSendMessage = async (provider) => {
        if (!userInput.trim()) return;

        const newMsg = { role: 'user', content: userInput };
        setChatHistory(prev => ({
            ...prev,
            [provider]: [...prev[provider], newMsg]
        }));
        setUserInput('');
        setChatLoading(true);

        try {
            const response = await api.post('/settings/chat-ai', {
                provider,
                config: localSettings[provider],
                message: userInput
            });

            const aiMsg = { role: 'assistant', content: response.data.content };
            setChatHistory(prev => ({
                ...prev,
                [provider]: [...prev[provider], aiMsg]
            }));
        } catch (error) {
            const errorMsg = error.response?.data?.message || "AI response failed";
            toast.error(errorMsg);
            setChatHistory(prev => ({
                ...prev,
                [provider]: [...prev[provider], { role: 'assistant', content: `Error: ${errorMsg}` }]
            }));
        } finally {
            setChatLoading(false);
        }
    };

    const providers = [
        { id: 'openai', name: 'OpenAI (GPT)', icon: 'https://cdn.worldvectorlogo.com/logos/openai-2.svg' },
        { id: 'gemini', name: 'Google Gemini', icon: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v2_f6728510192e2e7428f52.svg' },
        { id: 'claude', name: 'Anthropic Claude', icon: 'https://claude.ai/images/claude_logo.svg' }
    ];

    const currentProvider = providers[activeTab].id;

    return (
        <Box sx={{ pb: 4 }}>
            <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', mb: 3 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.neutral' }}>
                    <Tabs value={activeTab} onChange={handleTabChange} sx={{ px: 2 }}>
                        {providers.map((p, index) => (
                            <Tab 
                                key={p.id} 
                                icon={<AIIcon />} 
                                iconPosition="start" 
                                label={p.name} 
                                sx={{ py: 2, fontWeight: 700 }} 
                            />
                        ))}
                    </Tabs>
                </Box>

                <Box sx={{ p: 4 }}>
                    <Grid container spacing={4}>
                        {/* Config Column */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <KeyIcon color="primary" /> Configuration
                            </Typography>
                            
                            <Stack spacing={3} sx={{ mt: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Switch 
                                            checked={localSettings[currentProvider].enabled} 
                                            onChange={(e) => handleInputChange(currentProvider, 'enabled', e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label={`Enable ${providers[activeTab].name}`}
                                />

                                <TextField
                                    fullWidth
                                    label="API Key"
                                    type={showKey[currentProvider] ? 'text' : 'password'}
                                    value={localSettings[currentProvider].apiKey}
                                    onChange={(e) => handleInputChange(currentProvider, 'apiKey', e.target.value)}
                                    autoComplete="new-password"
                                    placeholder={`Enter your ${currentProvider.toUpperCase()} API Key`}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowKey(prev => ({ ...prev, [currentProvider]: !prev[currentProvider] }))}>
                                                    {showKey[currentProvider] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                {currentProvider === 'openai' && (
                                    <TextField
                                        fullWidth
                                        select
                                        label="Select Model"
                                        value={localSettings.openai.model}
                                        onChange={(e) => handleInputChange('openai', 'model', e.target.value)}
                                        SelectProps={{ native: true }}
                                    >
                                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast & Cheap)</option>
                                        <option value="gpt-4">GPT-4 (Smart & Robust)</option>
                                        <option value="gpt-4-turbo">GPT-4 Turbo (Latest)</option>
                                        <option value="gpt-4o">GPT-4o (Omni - Best)</option>
                                    </TextField>
                                )}

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button 
                                        variant="outlined" 
                                        onClick={() => testAPI(currentProvider)}
                                        disabled={testResults[currentProvider].loading || !localSettings[currentProvider].apiKey}
                                        sx={{ borderRadius: 2, py: 1 }}
                                    >
                                        {testResults[currentProvider].loading ? <CircularProgress size={20} /> : 'Test Connection'}
                                    </Button>
                                    <Button 
                                        variant="contained" 
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        sx={{ borderRadius: 2, py: 1, px: 4 }}
                                    >
                                        {isSaving ? <CircularProgress size={20} /> : 'Save Settings'}
                                    </Button>
                                </Box>

                                {testResults[currentProvider].success !== null && (
                                    <Alert 
                                        severity={testResults[currentProvider].success ? 'success' : 'error'}
                                        icon={testResults[currentProvider].success ? <SuccessIcon /> : <ErrorIcon />}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        {testResults[currentProvider].message}
                                    </Alert>
                                )}
                            </Stack>
                        </Grid>

                        {/* Sandbox Column */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column', bgcolor: 'background.neutral' }}>
                                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ChatIcon color="primary" />
                                    <Typography fontWeight={700}>AI Sandbox (Chat Test)</Typography>
                                </Box>
                                <CardContent sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 300, display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
                                    {chatHistory[currentProvider].length === 0 ? (
                                        <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
                                            <Typography variant="body2">No messages yet. Test your API key by sending a message.</Typography>
                                        </Box>
                                    ) : (
                                        chatHistory[currentProvider].map((msg, index) => (
                                            <Box 
                                                key={index} 
                                                sx={{ 
                                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                                    maxWidth: '85%',
                                                    bgcolor: msg.role === 'user' ? 'primary.main' : 'background.paper',
                                                    color: msg.role === 'user' ? '#fff' : 'text.primary',
                                                    p: 1.5,
                                                    borderRadius: msg.role === 'user' ? '15px 15px 0 15px' : '15px 15px 15px 0',
                                                    boxShadow: 1
                                                }}
                                            >
                                                <Typography variant="body2">{msg.content}</Typography>
                                            </Box>
                                        ))
                                    )}
                                    {chatLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
                                </CardContent>
                                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Send a test message..."
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(currentProvider)}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton 
                                                        color="primary" 
                                                        onClick={() => handleSendMessage(currentProvider)}
                                                        disabled={chatLoading || !localSettings[currentProvider].apiKey}
                                                    >
                                                        <SendIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            <Alert severity="info" sx={{ borderRadius: 3 }}>
                <Typography variant="body2">
                    <strong>Note:</strong> API keys are stored securely in the database. Ensure you have enabled billing and created valid keys on the respective provider's developer console.
                </Typography>
            </Alert>
        </Box>
    );
};

export default AISettings;
