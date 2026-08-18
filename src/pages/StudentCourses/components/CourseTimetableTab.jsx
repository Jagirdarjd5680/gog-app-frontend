import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Stack, Paper, Chip, CircularProgress } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import api from '../../../utils/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function CourseTimetableTab({ courseId }) {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const res = await api.get(`/timetables/course/${courseId}`);
            setSlots(res.data.data || []);
        } catch (err) {
            setSlots([]);
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        load();
    }, [load]);

    if (loading) {
        return (
            <Box sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (slots.length === 0) {
        return (
            <Box sx={{ py: 6, textAlign: 'center' }}>
                <EventIcon sx={{ fontSize: 36, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                    Timetable will show up here once you're assigned to a batch.
                </Typography>
            </Box>
        );
    }

    const batchName = slots[0]?.batch?.name;
    const sortedDays = DAYS
        .map((day) => ({ day, items: slots.filter((s) => s.day === day).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || '')) }))
        .filter((d) => d.items.length > 0);

    return (
        <Box>
            {batchName && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                    Showing schedule for your batch: <b>{batchName}</b>
                </Typography>
            )}
            <Stack spacing={2}>
                {sortedDays.map(({ day, items }) => (
                    <Box key={day}>
                        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>{day}</Typography>
                        <Stack spacing={1}>
                            {items.map((slot) => (
                                <Paper
                                    key={slot.id || slot._id}
                                    elevation={0}
                                    sx={{ p: 1.5, borderRadius: '10px', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}
                                >
                                    <Chip
                                        icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
                                        label={`${slot.startTime || ''}${slot.endTime ? ` - ${slot.endTime}` : ''}`}
                                        size="small"
                                        sx={{ fontWeight: 700 }}
                                    />
                                    <Typography variant="body2" fontWeight={700} sx={{ flex: 1 }}>{slot.subject || slot.topic}</Typography>
                                </Paper>
                            ))}
                        </Stack>
                    </Box>
                ))}
            </Stack>
        </Box>
    );
}
