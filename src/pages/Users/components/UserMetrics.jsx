import React from 'react';
import { Grid } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GoogleIcon from '@mui/icons-material/Google';
import EmailIcon from '@mui/icons-material/Email';
import MetricsCard from '../../../components/Dashboard/MetricsCard';

const UserMetrics = ({ total, active, google, email }) => {
    return (
        <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
                <MetricsCard title="Total Users" value={total} icon={<PeopleIcon sx={{ fontSize: 24 }} />} color="primary" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricsCard title="Active Users" value={active} icon={<CheckCircleIcon sx={{ fontSize: 24 }} />} color="success" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricsCard title="From Google" value={google} icon={<GoogleIcon sx={{ fontSize: 24 }} />} color="error" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricsCard title="From Email" value={email} icon={<EmailIcon sx={{ fontSize: 24 }} />} color="info" />
            </Grid>
        </Grid>
    );
};

export default UserMetrics;
