import React from 'react';
import { Box, Typography, Stack, Avatar, Chip, Tooltip, IconButton, Badge } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import WalletIcon from '@mui/icons-material/AccountBalanceWallet';

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

export const getTutorTableColumns = ({ handleEdit, handleDelete, handleViewHistory, handleProcessWithdrawal, pendingWithdrawals = {} }) => [
    {
        headerName: '', width: 45, minWidth: 45, flex: 0, checkboxSelection: true, headerCheckboxSelection: true, pinned: 'left',
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' }
    },
    {
        headerName: 'TUTOR', field: 'name', flex: 1.5, minWidth: 200, sortable: true,
        cellRenderer: (params) => {
            const { name, tutorId, profileImage } = params.data;
            const initials = name ? name.match(/(\w)\w*\s*(\w)?/) : [];
            const displayInitials = (initials && initials[1] ? initials[1] : '') + (initials && initials[2] ? initials[2] : '');
            return (
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: '100%' }}>
                    <Avatar src={profileImage} sx={{ width: 28, height: 28, border: '1px solid var(--color-vc-hairline)', bgcolor: !profileImage ? stringToColor(name || 'Tutor') : 'transparent', fontSize: '11px', fontWeight: 600 }}>
                        {!profileImage && displayInitials.toUpperCase()}
                    </Avatar>
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography sx={{ fontWeight: 500, color: 'var(--color-vc-ink)', fontSize: '13px', lineHeight: 1.2, fontFamily: 'inherit' }}>{name}</Typography>
                        <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '11px', fontFamily: 'inherit', mt: 0.25 }}>#{tutorId || '---'}</Typography>
                    </Box>
                </Stack>
            );
        }
    },
    {
        headerName: 'CATEGORIES', field: 'skills', flex: 1.2, minWidth: 180,
        cellRenderer: (params) => {
            const skills = params.data.skills || [];
            const visibleSkills = skills.slice(0, 2);
            const extraCount = skills.length - 2;
            return (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center', height: '100%' }}>
                    {visibleSkills.map((skill) => (
                        <Chip 
                            key={skill} 
                            label={skill} 
                            size="small" 
                            variant="outlined" 
                            sx={{ 
                                borderRadius: '6px', 
                                fontSize: '11px', 
                                fontWeight: 500,
                                borderColor: 'var(--color-vc-hairline)',
                                color: 'var(--color-vc-body)',
                                bgcolor: 'transparent'
                            }} 
                        />
                    ))}
                    {extraCount > 0 && (
                        <Chip 
                            label={`+${extraCount}`} 
                            size="small" 
                            variant="outlined" 
                            sx={{ 
                                borderRadius: '6px', 
                                fontSize: '11px', 
                                fontWeight: 600,
                                borderColor: 'var(--color-vc-hairline)',
                                color: 'var(--color-vc-mute)',
                                bgcolor: 'transparent'
                            }} 
                        />
                    )}
                    {skills.length === 0 && <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>No categories</Typography>}
                </Box>
            );
        }
    },
    {
        headerName: 'CHARGES', field: 'charges.perConversation', width: 120, sortable: true,
        cellRenderer: (params) => {
            const charges = params.data.charges?.perConversation || 0;
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Typography sx={{ fontWeight: 500, color: 'var(--color-vc-ink)', fontSize: '13px', fontFamily: 'inherit' }}>
                        ₹{charges}
                    </Typography>
                </Box>
            );
        }
    },
    {
        headerName: 'EARNINGS', field: 'earnings', width: 120, sortable: true,
        cellRenderer: (params) => {
            const earnings = params.data.earnings || 0;
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Typography sx={{ fontWeight: 700, color: 'var(--color-vc-primary)', fontSize: '13px', fontFamily: 'inherit' }}>
                        {earnings} pts
                    </Typography>
                </Box>
            );
        }
    },
    {
        headerName: 'STATUS', field: 'status', width: 100, sortable: true,
        cellRenderer: (params) => {
            const status = params.data.status || 'offline';
            const isOnline = status === 'online';
            const isBusy = status === 'busy';
            
            let color = 'rgba(100, 116, 139, 0.1)';
            let textColor = '#64748b';
            let borderColor = 'rgba(100, 116, 139, 0.2)';
            
            if (isOnline) {
                color = 'rgba(16, 185, 129, 0.1)';
                textColor = '#10b981';
                borderColor = 'rgba(16, 185, 129, 0.2)';
            } else if (isBusy) {
                color = 'rgba(245, 158, 11, 0.1)';
                textColor = '#f59e0b';
                borderColor = 'rgba(245, 158, 11, 0.2)';
            }

            return (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Chip
                        label={status}
                        size="small"
                        sx={{ 
                            borderRadius: '6px', 
                            fontSize: '11px', 
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            bgcolor: color,
                            color: textColor,
                            border: '1px solid',
                            borderColor: borderColor
                        }}
                    />
                </Box>
            );
        }
    },
    {
        headerName: 'ACTIONS', width: 160, pinned: 'right', sortable: false,
        cellRenderer: (params) => {
            const tutor = params.data;
            const tutorId = tutor._id;
            const pendingCount = pendingWithdrawals[tutorId] || 0;
            return (
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: '100%' }}>
                    {pendingCount > 0 && (
                        <Tooltip title={`Process ${pendingCount} Pending Withdrawal`}>
                            <IconButton 
                                size="small" 
                                onClick={() => handleProcessWithdrawal(tutorId)} 
                                sx={{ 
                                    border: '1px solid transparent', 
                                    borderRadius: '4px', 
                                    p: '4px', 
                                    color: 'var(--color-vc-error-deep)', 
                                    animation: 'pulse 1.5s infinite',
                                    '@keyframes pulse': {
                                        '0%': { transform: 'scale(1)', opacity: 1 },
                                        '50%': { transform: 'scale(1.15)', opacity: 0.8 },
                                        '100%': { transform: 'scale(1)', opacity: 1 },
                                    },
                                    '&:hover': { borderColor: 'var(--color-vc-error-soft)', bgcolor: 'var(--color-vc-error-soft)20' } 
                                }}
                            >
                                <Badge badgeContent={pendingCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '9px', height: 14, minWidth: 14, p: 0 } }}>
                                    <WalletIcon sx={{ fontSize: 16 }} />
                                </Badge>
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="View History">
                        <IconButton size="small" onClick={() => handleViewHistory(tutorId)} sx={{ border: '1px solid transparent', borderRadius: '4px', p: '4px', color: 'var(--color-vc-link)', '&:hover': { borderColor: 'var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)' } }}>
                            <HistoryIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(tutor)} sx={{ border: '1px solid transparent', borderRadius: '4px', p: '4px', color: 'var(--color-vc-mute)', '&:hover': { borderColor: 'var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)', color: 'var(--color-vc-ink)' } }}>
                            <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(tutorId)} sx={{ border: '1px solid transparent', borderRadius: '4px', p: '4px', color: 'var(--color-vc-error-deep)', '&:hover': { borderColor: 'var(--color-vc-error-soft)', bgcolor: 'var(--color-vc-error-soft)20' } }}>
                            <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            );
        }
    },
];
