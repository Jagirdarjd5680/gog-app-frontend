import React from 'react';
import { Grid } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ComputerIcon from '@mui/icons-material/Computer';
import BusinessIcon from '@mui/icons-material/Business';
import MetricsCard from '../../../components/Dashboard/MetricsCard';

const CourseMetrics = ({ total, published, online, offline }) => {
    return (
        <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
                <MetricsCard title="Total Courses" value={total} icon={<SchoolIcon />} color="primary" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricsCard title="Published" value={published} icon={<CheckCircleIcon />} color="success" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricsCard title="Online Courses" value={online} icon={<ComputerIcon />} color="info" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricsCard title="Offline Courses" value={offline} icon={<BusinessIcon />} color="warning" />
            </Grid>
        </Grid>
    );
};

export default CourseMetrics;
