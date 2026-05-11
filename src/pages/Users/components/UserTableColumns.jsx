import React from 'react';
import { Box, Typography, Stack, Avatar, Chip, Tooltip, IconButton } from '@mui/material';
import AndroidIcon from '@mui/icons-material/Android';
import LanguageIcon from '@mui/icons-material/Language';
import GoogleIcon from '@mui/icons-material/Google';
import EmailIcon from '@mui/icons-material/Email';
import AppleIcon from '@mui/icons-material/Apple';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { LinearProgress } from '@mui/material';
import { format } from 'date-fns';

const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) hash = string.charCodeAt(i) + ((hash << 5) - hash);
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
};

export const getUserTableColumns = ({ handleView, handleEdit, handleDelete, handlePayment }) => [
    {
        headerName: '', width: 45, minWidth: 45, flex: 0, checkboxSelection: true, headerCheckboxSelection: true, pinned: 'left',
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' }
    },
    {
        headerName: 'NAME/ROLL', field: 'name', flex: 1.5, minWidth: 200, sortable: true,
        cellRenderer: (params) => {
            const { name, rollNumber, avatar } = params.data;
            const initials = name ? name.match(/(\w)\w*\s*(\w)?/) : [];
            const displayInitials = (initials && initials[1] ? initials[1] : '') + (initials && initials[2] ? initials[2] : '');
            return (
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: '100%' }}>
                    <Avatar src={avatar} sx={{ width: 32, height: 32, bgcolor: !avatar ? stringToColor(name || 'User') : 'transparent', fontSize: '0.75rem', fontWeight: 700 }}>
                        {!avatar && displayInitials.toUpperCase()}
                    </Avatar>
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.85rem', lineHeight: 1.2 }}>{name}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', opacity: 0.7 }}>#{rollNumber || '---'}</Typography>
                    </Box>
                </Stack>
            );
        }
    },
    {
        headerName: 'FEE PROGRESS', width: 180,
        cellRenderer: (params) => {
            const summary = params.data.feeSummary;
            if (!summary || summary.totalFinalFee === 0) return <Typography variant="caption" color="text.disabled">No records</Typography>;
            
            const percentage = Math.min(100, (summary.totalPaid / summary.totalFinalFee) * 100);
            const isFull = percentage >= 100;

            return (
                <Box sx={{ width: '100%', pr: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: isFull ? 'success.main' : 'text.secondary', fontSize: '0.65rem' }}>
                            ₹{summary.totalPaid} / ₹{summary.totalFinalFee}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: isFull ? 'success.main' : 'error.main', fontSize: '0.65rem' }}>
                            {summary.totalRemaining > 0 ? `₹${summary.totalRemaining} left` : 'Paid'}
                        </Typography>
                    </Box>
                    <Tooltip title={`${percentage.toFixed(1)}% Paid`}>
                        <LinearProgress 
                            variant="determinate" 
                            value={percentage} 
                            sx={{ 
                                height: 6, 
                                borderRadius: 3, 
                                bgcolor: 'grey.100',
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 3,
                                    bgcolor: isFull ? '#2e7d32' : percentage > 50 ? '#1a73e8' : '#ed6c02'
                                }
                            }} 
                        />
                    </Tooltip>
                </Box>
            );
        }
    },
    {
        headerName: 'SOURCE/AUTH', width: 140,
        cellRenderer: (params) => {
            const { source, authMethod } = params.data;
            const getSourceIcon = () => {
                if (source === 'android') return <AndroidIcon sx={{ fontSize: 18, color: '#3ddc84' }} />;
                if (source === 'ios') return <AppleIcon sx={{ fontSize: 18, color: '#000000' }} />;
                if (source === 'mobile') return <PhoneIcon sx={{ fontSize: 18, color: '#1a73e8' }} />;
                return <LanguageIcon sx={{ fontSize: 18, color: '#1a73e8' }} />;
            };
            const getAuthIcon = () => {
                if (authMethod === 'google') return <GoogleIcon sx={{ fontSize: 16, color: '#DB4437' }} />;
                if (authMethod === 'phone' || authMethod === 'otp' || authMethod === 'mobile') return <PhoneIcon sx={{ fontSize: 16, color: '#1a73e8' }} />;
                return <EmailIcon sx={{ fontSize: 16, color: '#757575' }} />;
            };
            return (
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: '100%' }}>
                    <Tooltip title={`Source: ${source || 'Web'}`}>{getSourceIcon()}</Tooltip>
                    <Tooltip title={`Auth: ${authMethod || 'Email'}`}>{getAuthIcon()}</Tooltip>
                </Stack>
            );
        }
    },
    {
        headerName: 'STATUS', field: 'isActive', width: 80, cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
        cellRenderer: (params) => (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Tooltip title={params.value ? 'Active Account' : 'Deactivated'}>
                    {params.value ? <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 20 }} /> : <CancelIcon sx={{ color: '#d32f2f', fontSize: 20 }} />}
                </Tooltip>
            </Box>
        )
    },
    {
        headerName: 'ACTIONS', width: 160, pinned: 'right', sortable: false,
        cellRenderer: (params) => (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: '100%' }}>
                <IconButton size="small" onClick={() => handlePayment(params.data)} title="Quick Payment" sx={{ color: 'primary.main' }}><AccountBalanceWalletIcon sx={{ fontSize: 18 }} /></IconButton>
                <IconButton size="small" onClick={() => handleView(params.data)} title="View Detail"><VisibilityIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></IconButton>
                <IconButton size="small" onClick={() => handleEdit(params.data)} title="Edit"><EditIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></IconButton>
                <IconButton size="small" onClick={() => handleDelete(params.data)} title="Archive"><ArchiveIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></IconButton>
            </Stack>
        )
    },
];
