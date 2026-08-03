import React, { useState } from 'react';
import { Box, Paper, Tabs, Tab } from '@mui/material';
import DashboardIcon from '@mui/icons-material/GridView';
import GroupsIcon from '@mui/icons-material/Groups';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import BookingAdmin from './BookingAdmin';
import BatchManagement from './BatchManagement';
import SeatManagement from './SeatManagement';

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
    { id: 'batches', label: 'Manage Batches', icon: <GroupsIcon fontSize="small" /> },
    { id: 'seats', label: 'Manage Seats', icon: <EventSeatIcon fontSize="small" /> }
];

const BookingLayout = () => {
    const [activeTab, setActiveTab] = useState(() => {
        const hash = window.location.hash.replace('#', '');
        return TABS.some(t => t.id === hash) ? hash : 'dashboard';
    });

    const handleChange = (id) => {
        setActiveTab(id);
        window.location.hash = id;
    };

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ mb: 3, borderRadius: 3 }} elevation={0} variant="outlined">
                <Tabs
                    value={activeTab}
                    onChange={(e, v) => handleChange(v)}
                    sx={{
                        px: 2,
                        '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, minHeight: 56 },
                        '& .Mui-selected': { color: 'error.main !important' },
                        '& .MuiTabs-indicator': { bgcolor: 'error.main' }
                    }}
                >
                    {TABS.map(t => (
                        <Tab key={t.id} value={t.id} icon={t.icon} iconPosition="start" label={t.label} />
                    ))}
                </Tabs>
            </Paper>

            {activeTab === 'dashboard' && <BookingAdmin />}
            {activeTab === 'batches' && <BatchManagement />}
            {activeTab === 'seats' && <SeatManagement />}
        </Box>
    );
};

export default BookingLayout;
