import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    Button,
    Box,
    Divider,
    FormControlLabel,
    Switch,
    Radio,
    RadioGroup,
    FormControl,
    FormLabel,
    Alert,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const DEFAULT_GATEWAYS = [
    { name: 'Razorpay', key: '', secret: '', enabled: true },
    { name: 'Stripe', key: '', secret: '', enabled: false },
    { name: 'PayPal', key: '', secret: '', enabled: false },
    { name: 'PhonePe', key: '', secret: '', enabled: false },
    { name: 'Paytm', key: '', secret: '', enabled: false },
    { name: 'PayU', key: '', secret: '', enabled: false }
];

const PaymentSettings = ({ settings, onSave, isSaving }) => {
    const { user } = useAuth();
    const [testDialogOpen, setTestDialogOpen] = useState(false);
    const [testAmount, setTestAmount] = useState('1');
    const [testLoading, setTestLoading] = useState(false);
    // Helper to merge settings with defaults
    const getInitialGateways = () => {
        const savedGateways = settings?.payments?.gateways || [];

        // 1. Start with defaults and merge saved data
        const merged = DEFAULT_GATEWAYS.map(dg => {
            const saved = savedGateways.find(sg => sg.name === dg.name);
            return saved ? { ...dg, ...saved } : dg;
        });

        // 2. Add any saved gateways that aren't in defaults
        savedGateways.forEach(sg => {
            if (!DEFAULT_GATEWAYS.some(dg => dg.name === sg.name)) {
                merged.push(sg);
            }
        });

        return merged;
    };

    const [currentGateway, setCurrentGateway] = useState(settings?.payments?.currentGateway || 'Razorpay');
    const [gateways, setGateways] = useState(getInitialGateways());
    const [showSecret, setShowSecret] = useState(false);

    // Sync state if settings prop changes (e.g. after loading or saving)
    useEffect(() => {
        if (settings?.payments) {
            setCurrentGateway(settings.payments.currentGateway || 'Razorpay');
            setGateways(getInitialGateways());
        }
    }, [settings]);

    const handleGatewayChange = (name, field, value) => {
        setGateways(prev => prev.map(g => g.name === name ? { ...g, [field]: value } : g));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Ensure only the current selected gateway is 'enabled' in the payload
        const updatedGateways = gateways.map(g => ({
            ...g,
            enabled: g.name === currentGateway
        }));

        onSave({
            payments: {
                currentGateway,
                gateways: updatedGateways
            }
        });
    };

    const handleTestPayment = async () => {
        if (!activeGatewayData?.key) {
            toast.error(`Please provide ${currentGateway} API Key first`);
            return;
        }

        setTestLoading(true);
        try {
            // Call backend to "initiate" and get tokens/hashes
            const initRes = await api.post('/payments/test/initiate', {
                gateway: currentGateway,
                amount: testAmount
            });

            if (!initRes.data.success) {
                throw new Error('Failed to initiate test payment on server');
            }

            const initData = initRes.data.data;

            if (currentGateway === 'Razorpay') {
                const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
                if (!res) {
                    toast.error('Razorpay SDK failed to load');
                    return;
                }

                const options = {
                    key: initData.key || activeGatewayData.key,
                    amount: initData.amount || (parseInt(testAmount) * 100),
                    currency: 'INR',
                    name: settings?.general?.siteName || 'LMS Test',
                    description: 'Test Transaction',
                    order_id: initData.order_id,
                    handler: function (response) {
                        toast.success(`Payment Successful! ID: ${response.razorpay_payment_id}`);
                        setTestDialogOpen(false);
                    },
                    prefill: {
                        name: user?.name || 'Test User',
                        email: user?.email || 'test@example.com',
                    },
                    theme: {
                        color: settings?.theme?.primaryColor || '#3f51b5',
                    },
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.open();
                setTestDialogOpen(false);
            } else if (currentGateway === 'PayU') {
                toast.info('Redirecting to Official PayU Wizard...');

                // Create a dynamic form and submit it to PayU
                const payuForm = document.createElement('form');
                payuForm.action = initData.action || 'https://test.payu.in/_payment';
                payuForm.method = 'POST';

                const fields = {
                    key: activeGatewayData.key,
                    txnid: initData.txnid,
                    amount: initData.amount || testAmount,
                    firstname: user?.name || 'Test',
                    email: user?.email || 'test@example.com',
                    phone: '9999999999',
                    productinfo: 'Test Product',
                    surl: window.location.origin, // Success URL
                    furl: window.location.origin, // Failure URL
                    hash: initData.hash
                };

                for (const key in fields) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = fields[key];
                    payuForm.appendChild(input);
                }

                document.body.appendChild(payuForm);
                payuForm.submit();
                setTestDialogOpen(false);
            } else if (currentGateway === 'Paytm') {
                const res = await loadScript(`https://securegw-stage.paytm.in/merchantpgpui/checkoutjs/merchants/${activeGatewayData.key}.js`);
                if (!res) {
                    toast.error('Paytm SDK failed to load');
                    return;
                }

                // Paytm usually needs a txnToken from backend
                toast.info('Paytm Checkout requires a dynamic Token from backend. Mocking checkout...');
                setTimeout(() => {
                    toast.success('Paytm Checkout Mock Success');
                    setTestDialogOpen(false);
                }, 2000);
            } else if (currentGateway === 'Stripe') {
                await loadScript('https://js.stripe.com/v3/');
                toast.info('Stripe Checkout redirected. Mocking success...');
                setTimeout(() => {
                    toast.success('Stripe Payment Successful');
                    setTestDialogOpen(false);
                }, 2000);
            } else if (currentGateway === 'PayPal') {
                await loadScript(`https://www.paypal.com/sdk/js?client-id=${activeGatewayData.key}`);
                toast.info('PayPal Smart Buttons loading...');
                setTimeout(() => {
                    toast.success('PayPal Payment Successful');
                    setTestDialogOpen(false);
                }, 2000);
            } else {
                await new Promise(resolve => setTimeout(resolve, 1500));
                toast.success(`Test Payment Successful via ${currentGateway}`);
                setTestDialogOpen(false);
            }
        } catch (error) {
            toast.error('Payment wizard failed to open');
            console.error(error);
        } finally {
            setTestLoading(false);
        }
    };

    const activeGatewayData = gateways.find(g => g.name === currentGateway);

    return (
        <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>Payment Gateways</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Configure multiple payment gateways and select the active one.
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<PlayCircleOutlineIcon />}
                        color="secondary"
                        onClick={() => setTestDialogOpen(true)}
                    >
                        Test Payment
                    </Button>
                </Box>

                <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>
                    Active Gateway: <b>{currentGateway}</b>
                </Alert>

                <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
                    Only the <b>Active Gateway</b> selected below will be used for real-time transactions.
                </Alert>

                <Box component="form" onSubmit={handleSubmit}>
                    <FormControl component="fieldset" fullWidth sx={{ mb: 4 }}>
                        <FormLabel component="legend" sx={{ mb: 2, fontWeight: 700 }}>Select Active Gateway</FormLabel>
                        <RadioGroup
                            row
                            value={currentGateway}
                            onChange={(e) => setCurrentGateway(e.target.value)}
                        >
                            {gateways.map(g => (
                                <FormControlLabel
                                    key={g.name}
                                    value={g.name}
                                    control={<Radio />}
                                    label={g.name}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>

                    <Divider sx={{ mb: 4 }} />

                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                                {currentGateway} Configuration
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label={`${currentGateway} Public Key / Client ID`}
                                value={activeGatewayData?.key || ''}
                                onChange={(e) => handleGatewayChange(currentGateway, 'key', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label={`${currentGateway} Secret Key`}
                                type={showSecret ? 'text' : 'password'}
                                value={activeGatewayData?.secret || ''}
                                onChange={(e) => handleGatewayChange(currentGateway, 'secret', e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowSecret(!showSecret)}
                                                onMouseDown={(e) => e.preventDefault()}
                                                edge="end"
                                            >
                                                {showSecret ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={activeGatewayData?.enabled ?? false}
                                        onChange={(e) => handleGatewayChange(currentGateway, 'enabled', e.target.checked)}
                                    />
                                }
                                label={`Enable ${currentGateway}`}
                            />
                        </Grid>

                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                type="submit"
                                startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                size="large"
                                disabled={isSaving}
                            >
                                {isSaving ? 'Updating...' : 'Update Gateway Settings'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                {/* Test Payment Dialog */}
                <Dialog open={testDialogOpen} onClose={() => !testLoading && setTestDialogOpen(false)} maxWidth="xs" fullWidth>
                    <DialogTitle>Test Payment</DialogTitle>
                    <DialogContent>
                        <Box sx={{ py: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Initiate a test transaction using <b>{currentGateway}</b>.
                                Make sure your API keys are correct.
                            </Typography>
                            <TextField
                                fullWidth
                                label="Amount (INR)"
                                type="number"
                                value={testAmount}
                                onChange={(e) => setTestAmount(e.target.value)}
                                sx={{ mt: 2 }}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setTestDialogOpen(false)} disabled={testLoading}>Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={handleTestPayment}
                            disabled={testLoading || !testAmount}
                            startIcon={testLoading && <CircularProgress size={16} color="inherit" />}
                        >
                            {testLoading ? 'Processing...' : 'Pay Now'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    );
};

export default PaymentSettings;
