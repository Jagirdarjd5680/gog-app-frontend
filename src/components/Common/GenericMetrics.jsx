import React from 'react';
import { Grid } from '@mui/material';
import MetricsCard from '../Dashboard/MetricsCard';

const GenericMetrics = ({ items = [] }) => {
    return (
        <Grid container spacing={2} mb={3}>
            {items.map((item, idx) => (
                <Grid item xs={12} sm={6} md={3} key={idx}>
                    <MetricsCard
                        title={item.title}
                        value={item.value}
                        icon={item.icon}
                        color={item.color || 'primary'}
                        subtitle={item.subtitle}
                        onClick={item.onClick}
                    />
                </Grid>
            ))}
        </Grid>
    );
};

export default GenericMetrics;
