import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, Stack, CircularProgress } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    isAfter,
    isBefore,
    getDay
} from 'date-fns';
import api from '../../../utils/api';
import socket from '../../../utils/socket';

const UserAttendanceCalendar = ({ userId, enrolledDate }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/attendance/user/${userId}`);
                if (response.data.success) {
                    setAttendanceData(response.data.data);
                }
            } catch (error) {
                
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, [userId]);

    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }
        // Join the user's room to receive personal updates
        socket.emit('setup', userId);

        const handleRealtimeAttendance = (data) => {
            const { student, attendance } = data;
            if (student?._id !== userId) return;

            setAttendanceData(prev => {
                const exists = prev.some(a => isSameDay(new Date(a.date), new Date(attendance.date)));
                if (exists) return prev;
                return [...prev, attendance];
            });
        };

        socket.on('attendance_marked', handleRealtimeAttendance);

        return () => {
            socket.off('attendance_marked', handleRealtimeAttendance);
        };
    }, [userId]);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => {
        return (
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <IconButton onClick={prevMonth} sx={{ color: 'var(--color-vc-mute)', '&:hover': { color: 'var(--color-vc-ink)' } }}><ChevronLeftIcon /></IconButton>
                <Typography sx={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>
                    {format(currentMonth, 'MMMM yyyy')}
                </Typography>
                <IconButton onClick={nextMonth} sx={{ color: 'var(--color-vc-mute)', '&:hover': { color: 'var(--color-vc-ink)' } }}><ChevronRightIcon /></IconButton>
            </Stack>
        );
    };

    const renderDays = () => {
        const days = [];
        const startDate = startOfWeek(currentMonth);
        for (let i = 0; i < 7; i++) {
            days.push(
                <Box key={i} sx={{ width: '14.28%', textAlign: 'center', fontWeight: 600, py: 1, fontSize: '11px', color: 'var(--color-vc-mute)' }}>
                    {format(addDays(startDate, i), 'EEE')}
                </Box>
            );
        }
        return <Stack direction="row" sx={{ borderBottom: '1px solid var(--color-vc-hairline)' }}>{days}</Stack>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);
        const today = new Date();

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = '';

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, 'd');
                const cloneDay = day;

                // Determine Day Status
                let bgColor = 'transparent';
                let textColor = 'var(--color-vc-ink)';
                
                const isSunday = getDay(day) === 0;
                const isFuture = isAfter(day, today);
                // Assume absent if not future, not sunday, and enrolled
                let status = 'none';

                const record = attendanceData.find(a => isSameDay(new Date(a.date), cloneDay));

                if (isSunday) {
                    bgColor = 'var(--color-vc-warning-soft)'; // Yellow for Holiday/Sunday
                    textColor = 'var(--color-vc-warning-deep)';
                    status = 'holiday';
                } else if (!isFuture) {
                    if (record) {
                        bgColor = 'var(--color-vc-success-soft)'; // Green for Present
                        textColor = 'var(--color-vc-success-deep)';
                        status = 'present';
                    } else if (enrolledDate && isAfter(day, new Date(enrolledDate))) {
                        bgColor = 'var(--color-vc-error-soft)'; // Red for Absent
                        textColor = 'var(--color-vc-error-deep)';
                        status = 'absent';
                    } else if (!enrolledDate) {
                        bgColor = 'var(--color-vc-error-soft)'; // Red for Absent if no enrolled date provided
                        textColor = 'var(--color-vc-error-deep)';
                    }
                }

                if (!isSameMonth(day, monthStart)) {
                    textColor = 'var(--color-vc-mute)';
                    bgColor = 'transparent';
                }

                days.push(
                    <Box
                        key={day}
                        sx={{
                            width: '14.28%',
                            height: 72,
                            p: 1,
                            borderRight: '1px solid var(--color-vc-hairline)',
                            borderBottom: '1px solid var(--color-vc-hairline)',
                            bgcolor: isSameMonth(day, monthStart) ? bgColor : 'var(--color-vc-canvas-soft)',
                            color: textColor,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            opacity: isSameMonth(day, monthStart) ? 1 : 0.35
                        }}
                    >
                        <Typography sx={{ fontSize: '11px', fontFamily: '"JetBrains Mono", monospace', fontWeight: isSameDay(day, today) ? 700 : 500 }}>
                            {formattedDate}
                        </Typography>
                        {status === 'present' && <Typography sx={{ mt: 1, fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Present</Typography>}
                        {status === 'absent' && <Typography sx={{ mt: 1, fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Absent</Typography>}
                        {status === 'holiday' && <Typography sx={{ mt: 1, fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Sunday</Typography>}
                    </Box>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <Stack direction="row" key={day}>
                    {days}
                </Stack>
            );
            days = [];
        }
        return <Box sx={{ borderLeft: '1px solid var(--color-vc-hairline)', borderTop: '1px solid var(--color-vc-hairline)' }}>{rows}</Box>;
    };

    if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={24} sx={{ color: 'var(--color-vc-primary)' }} /></Box>;

    return (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid var(--color-vc-hairline)', borderRadius: '6px', bgcolor: 'var(--color-vc-canvas)' }}>
            {renderHeader()}
            {renderDays()}
            {renderCells()}
            
            <Stack direction="row" spacing={3} sx={{ mt: 3, justifyContent: 'center' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 14, height: 14, bgcolor: 'var(--color-vc-success-soft)', border: '1px solid var(--color-vc-success-deep)', borderRadius: '3px' }} />
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)' }}>Present</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 14, height: 14, bgcolor: 'var(--color-vc-error-soft)', border: '1px solid var(--color-vc-error-deep)', borderRadius: '3px' }} />
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)' }}>Absent</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 14, height: 14, bgcolor: 'var(--color-vc-warning-soft)', border: '1px solid var(--color-vc-warning-deep)', borderRadius: '3px' }} />
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)' }}>Sunday</Typography>
                </Stack>
            </Stack>
        </Paper>
    );
};

export default UserAttendanceCalendar;
