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
import { hasModulePermission } from '../../../utils/permissions';

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

export const getUserTableColumns = ({ handleView, handleEdit, handleDelete, handlePayment, user }) => [
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
                    <Avatar src={avatar} sx={{ width: 28, height: 28, border: '1px solid var(--color-vc-hairline)', bgcolor: !avatar ? stringToColor(name || 'User') : 'transparent', fontSize: '11px', fontWeight: 600 }}>
                        {!avatar && displayInitials.toUpperCase()}
                    </Avatar>
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography sx={{ fontWeight: 500, color: 'var(--color-vc-ink)', fontSize: '13px', lineHeight: 1.2, fontFamily: 'inherit' }}>{name}</Typography>
                        <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '11px', fontFamily: 'inherit', mt: 0.25 }}>#{rollNumber || '---'}</Typography>
                    </Box>
                </Stack>
            );
        }
    },
    {
        headerName: 'EMAIL/PHONE', field: 'email', flex: 1.2, minWidth: 180, sortable: true,
        cellRenderer: (params) => {
            const { email, phone } = params.data;
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                    <Typography sx={{ fontWeight: 400, color: 'var(--color-vc-ink)', fontSize: '13px', fontFamily: 'inherit', wordBreak: 'break-all' }}>
                        {email || '---'}
                    </Typography>
                    <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '11px', fontFamily: 'inherit', mt: 0.25 }}>
                        {phone || '---'}
                    </Typography>
                </Box>
            );
        }
    },
    {
        headerName: 'FEE PROGRESS', width: 180,
        cellRenderer: (params) => {
            const summary = params.data.feeSummary;
            if (!summary || summary.totalFinalFee === 0) return <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>No records</Typography>;
            
            const percentage = Math.min(100, (summary.totalPaid / summary.totalFinalFee) * 100);
            const isFull = percentage >= 100;

            return (
                <Box sx={{ width: '100%', pr: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ fontWeight: 500, color: isFull ? 'var(--color-vc-success)' : 'var(--color-vc-body)', fontSize: '11px', fontFamily: 'inherit' }}>
                            ₹{summary.totalPaid} / ₹{summary.totalFinalFee}
                        </Typography>
                        <Typography sx={{ fontWeight: 500, color: isFull ? 'var(--color-vc-success)' : 'var(--color-vc-error-deep)', fontSize: '11px', fontFamily: 'inherit' }}>
                            {summary.totalRemaining > 0 ? `₹${summary.totalRemaining} left` : 'Paid'}
                        </Typography>
                    </Box>
                    <Tooltip title={`${percentage.toFixed(1)}% Paid`}>
                        <LinearProgress 
                            variant="determinate" 
                            value={percentage} 
                            sx={{ 
                                height: 5, 
                                borderRadius: 3, 
                                bgcolor: 'var(--color-vc-hairline)',
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 3,
                                    bgcolor: isFull ? 'var(--color-vc-success)' : percentage > 50 ? 'var(--color-vc-link)' : 'var(--color-vc-warning)'
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
                if (source === 'android') return <AndroidIcon sx={{ fontSize: 16, color: 'var(--color-vc-mute)' }} />;
                if (source === 'ios') return <AppleIcon sx={{ fontSize: 16, color: 'var(--color-vc-mute)' }} />;
                if (source === 'mobile') return <PhoneIcon sx={{ fontSize: 16, color: 'var(--color-vc-mute)' }} />;
                return <LanguageIcon sx={{ fontSize: 16, color: 'var(--color-vc-mute)' }} />;
            };
            const getAuthIcon = () => {
                if (authMethod === 'google') return <GoogleIcon sx={{ fontSize: 14, color: 'var(--color-vc-mute)' }} />;
                if (authMethod === 'phone' || authMethod === 'otp' || authMethod === 'mobile') return <PhoneIcon sx={{ fontSize: 14, color: 'var(--color-vc-mute)' }} />;
                return <EmailIcon sx={{ fontSize: 14, color: 'var(--color-vc-mute)' }} />;
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
        cellRenderer: (params) => {
            const isActive = params.data.isActive;
            const status = params.data.status?.toLowerCase();
            
            let color = 'var(--color-vc-success)';
            let titleText = 'Active Account';
            
            if (status === 'pending') {
                color = 'var(--color-vc-warning)';
                titleText = 'Pending verification';
            } else if (!isActive || status === 'suspended' || status === 'disabled' || status === 'inactive') {
                color = 'var(--color-vc-error-deep)';
                titleText = 'Deactivated';
            }

            return (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Tooltip title={titleText}>
                        <Box 
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: color,
                                boxShadow: color === 'var(--color-vc-success)' ? '0 0 8px var(--color-vc-success)' : color === 'var(--color-vc-warning)' ? '0 0 8px var(--color-vc-warning)' : 'none'
                            }}
                        />
                    </Tooltip>
                </Box>
            );
        }
    },
    {
        headerName: 'ACTIONS', width: 160, pinned: 'right', sortable: false,
        cellRenderer: (params) => (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: '100%' }}>
                <Tooltip title="Quick Payment">
                    <IconButton size="small" onClick={() => handlePayment(params.data)} sx={{ border: '1px solid transparent', borderRadius: '4px', p: '4px', color: 'var(--color-vc-link)', '&:hover': { borderColor: 'var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)' } }}>
                        <AccountBalanceWalletIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="View Detail">
                    <IconButton size="small" onClick={() => handleView(params.data)} sx={{ border: '1px solid transparent', borderRadius: '4px', p: '4px', color: 'var(--color-vc-mute)', '&:hover': { borderColor: 'var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)', color: 'var(--color-vc-ink)' } }}>
                        <VisibilityIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Tooltip>
                {hasModulePermission(user, 'students', 'edit') && (
                    <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(params.data)} sx={{ border: '1px solid transparent', borderRadius: '4px', p: '4px', color: 'var(--color-vc-mute)', '&:hover': { borderColor: 'var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)', color: 'var(--color-vc-ink)' } }}>
                            <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                )}
                {hasModulePermission(user, 'students', 'delete') && (
                    <Tooltip title="Archive">
                        <IconButton size="small" onClick={() => handleDelete(params.data)} sx={{ border: '1px solid transparent', borderRadius: '4px', p: '4px', color: 'var(--color-vc-error-deep)', '&:hover': { borderColor: 'var(--color-vc-error-soft)', bgcolor: 'var(--color-vc-error-soft)20' } }}>
                            <ArchiveIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                )}
            </Stack>
        )
    },
];
