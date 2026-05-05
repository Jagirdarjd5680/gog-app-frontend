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
import api from '../../utils/api';

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
                console.error("Failed to fetch attendance", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, [userId]);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => {
        return (
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <IconButton onClick={prevMonth}><ChevronLeftIcon /></IconButton>
                <Typography variant="h6" fontWeight={700}>
                    {format(currentMonth, 'MMMM yyyy')}
                </Typography>
                <IconButton onClick={nextMonth}><ChevronRightIcon /></IconButton>
            </Stack>
        );
    };

    const renderDays = () => {
        const days = [];
        const startDate = startOfWeek(currentMonth);
        for (let i = 0; i < 7; i++) {
            days.push(
                <Box key={i} sx={{ width: '14.28%', textAlign: 'center', fontWeight: 'bold', py: 1 }}>
                    {format(addDays(startDate, i), 'EEE')}
                </Box>
            );
        }
        return <Stack direction="row" sx={{ borderBottom: '1px solid #eee' }}>{days}</Stack>;
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
                let textColor = '#000';
                
                const isSunday = getDay(day) === 0;
                const isFuture = isAfter(day, today);
                // Assume absent if not future, not sunday, and enrolled
                let status = 'none';

                const record = attendanceData.find(a => isSameDay(new Date(a.date), cloneDay));

                if (isSunday) {
                    bgColor = '#fff3cd'; // Yellow for Holiday/Sunday
                    textColor = '#856404';
                    status = 'holiday';
                } else if (!isFuture) {
                    if (record) {
                        bgColor = '#d4edda'; // Green for Present
                        textColor = '#155724';
                        status = 'present';
                    } else if (enrolledDate && isAfter(day, new Date(enrolledDate))) {
                        bgColor = '#f8d7da'; // Red for Absent
                        textColor = '#721c24';
                        status = 'absent';
                    } else if (!enrolledDate) {
                        bgColor = '#f8d7da'; // Red for Absent if no enrolled date provided
                        textColor = '#721c24';
                    }
                }

                if (!isSameMonth(day, monthStart)) {
                    textColor = '#ccc';
                    bgColor = 'transparent';
                }

                days.push(
                    <Box
                        key={day}
                        sx={{
                            width: '14.28%',
                            height: 80,
                            p: 1,
                            borderRight: '1px solid #eee',
                            borderBottom: '1px solid #eee',
                            bgcolor: isSameMonth(day, monthStart) ? bgColor : '#f9f9f9',
                            color: textColor,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            opacity: isSameMonth(day, monthStart) ? 1 : 0.4
                        }}
                    >
                        <Typography variant="body2" fontWeight={isSameDay(day, today) ? 'bold' : 'normal'}>
                            {formattedDate}
                        </Typography>
                        {status === 'present' && <Typography variant="caption" sx={{ mt: 1, fontSize: '0.65rem', fontWeight: 'bold' }}>Present</Typography>}
                        {status === 'absent' && <Typography variant="caption" sx={{ mt: 1, fontSize: '0.65rem', fontWeight: 'bold' }}>Absent</Typography>}
                        {status === 'holiday' && <Typography variant="caption" sx={{ mt: 1, fontSize: '0.65rem', fontWeight: 'bold' }}>Sunday</Typography>}
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
        return <Box sx={{ borderLeft: '1px solid #eee', borderTop: '1px solid #eee' }}>{rows}</Box>;
    };

    if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #eee', borderRadius: 2 }}>
            {renderHeader()}
            {renderDays()}
            {renderCells()}
            
            <Stack direction="row" spacing={3} sx={{ mt: 3, justifyContent: 'center' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ w: 16, h: 16, width: 16, height: 16, bgcolor: '#d4edda', borderRadius: 1 }} />
                    <Typography variant="caption">Present</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ w: 16, h: 16, width: 16, height: 16, bgcolor: '#f8d7da', borderRadius: 1 }} />
                    <Typography variant="caption">Absent</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ w: 16, h: 16, width: 16, height: 16, bgcolor: '#fff3cd', borderRadius: 1 }} />
                    <Typography variant="caption">Holiday</Typography>
                </Stack>
            </Stack>
        </Paper>
    );
};

export default UserAttendanceCalendar;
