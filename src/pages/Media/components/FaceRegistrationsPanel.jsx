import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    Card,
    Avatar,
    Dialog,
    DialogContent,
    IconButton,
    TextField,
    InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural';
import api, { fixUrl } from '../../../utils/api';
import { toast } from 'react-toastify';
import MediaGridSkeleton from './MediaSkeleton';

// Every user with a real enrolled face descriptor (attendance.service.ts's enrollFace),
// each paired with the single display thumbnail saved alongside it — see
// UsersService.getFaceRegistrations for why this is one photo per user rather than the
// 4 pose-capture angles (only the angle that actually enrolled gets kept as a preview).
const FaceRegistrationsPanel = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);

    const fetchRegistrations = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/users/face-registrations');
            setRegistrations(res.data?.data || []);
        } catch (error) {
            toast.error('Failed to load face registrations');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);

    const filtered = useMemo(() => {
        const term = search.toLowerCase().trim();
        if (!term) return registrations;
        return registrations.filter((r) =>
            (r.name || '').toLowerCase().includes(term) ||
            (r.rollNumber || '').toLowerCase().includes(term) ||
            (r.email || '').toLowerCase().includes(term)
        );
    }, [registrations, search]);

    if (loading) return <MediaGridSkeleton count={8} />;

    return (
        <Box>
            <TextField
                size="small"
                placeholder="Search by name, roll number, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2.5, width: 340, maxWidth: '100%' }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            />

            {filtered.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: 'var(--color-vc-mute)' }}>
                    <FaceRetouchingNaturalIcon sx={{ fontSize: 48, opacity: 0.4, mb: 1 }} />
                    <Typography variant="body2">
                        {registrations.length === 0 ? 'No students have registered their Face ID yet.' : 'No matches for that search.'}
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2 }}>
                    {filtered.map((reg) => (
                        <Card
                            key={reg._id}
                            onClick={() => setSelected(reg)}
                            sx={{
                                p: 2,
                                textAlign: 'center',
                                borderRadius: '14px',
                                cursor: 'pointer',
                                border: '1px solid var(--color-vc-hairline)',
                                bgcolor: 'var(--color-vc-canvas-soft)',
                                transition: 'all 0.15s ease',
                                boxShadow: 'none',
                                '&:hover': { borderColor: 'var(--color-vc-primary)', transform: 'translateY(-2px)' },
                            }}
                        >
                            <Avatar
                                src={reg.biometricFace ? fixUrl(reg.biometricFace) : fixUrl(reg.avatar)}
                                sx={{ width: 76, height: 76, mx: 'auto', mb: 1.5, border: '2px solid var(--color-vc-hairline)' }}
                            >
                                {reg.name?.charAt(0) || 'U'}
                            </Avatar>
                            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-vc-ink)' }} noWrap>
                                {reg.name || 'Student'}
                            </Typography>
                            {reg.rollNumber && (
                                <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)' }} noWrap>
                                    #{reg.rollNumber}
                                </Typography>
                            )}
                        </Card>
                    ))}
                </Box>
            )}

            <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="xs" fullWidth>
                <DialogContent sx={{ position: 'relative', textAlign: 'center', py: 4 }}>
                    <IconButton onClick={() => setSelected(null)} sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <CloseIcon />
                    </IconButton>
                    <Avatar
                        src={selected?.biometricFace ? fixUrl(selected.biometricFace) : fixUrl(selected?.avatar)}
                        sx={{ width: 180, height: 180, mx: 'auto', mb: 2, border: '1px solid var(--color-vc-hairline)' }}
                    >
                        {selected?.name?.charAt(0) || 'U'}
                    </Avatar>
                    <Typography sx={{ fontWeight: 700, fontSize: '15px' }}>{selected?.name}</Typography>
                    {selected?.rollNumber && (
                        <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)' }}>#{selected.rollNumber}</Typography>
                    )}
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)', mt: 1 }}>{selected?.email}</Typography>
                    {selected?.registeredAt && (
                        <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', mt: 1.5 }}>
                            Face ID registered on {new Date(selected.registeredAt).toLocaleDateString()}
                        </Typography>
                    )}
                    {!selected?.biometricFace && (
                        <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-warning-deep)', mt: 1.5 }}>
                            No preview photo saved for this registration (recognition still works — only the display thumbnail is missing).
                        </Typography>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default FaceRegistrationsPanel;
