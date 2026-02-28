import { Card, CardContent, Typography, Box, List, ListItem, ListItemText, Chip } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

const ActivityLog = ({ activities = [] }) => {
    const getActivityColor = (type) => {
        const colors = {
            user: 'primary',
            course: 'success',
            payment: 'warning',
            assignment: 'info',
            default: 'default',
        };
        return colors[type] || colors.default;
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                    Recent Activity
                </Typography>

                {activities.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                        No recent activities
                    </Typography>
                ) : (
                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                        {activities.map((activity, index) => (
                            <ListItem
                                key={index}
                                sx={{
                                    borderLeft: 3,
                                    borderColor: `${getActivityColor(activity.type)}.main`,
                                    mb: 1,
                                    borderRadius: 1,
                                    backgroundColor: 'background.default',
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2" fontWeight={500}>
                                                {activity.title}
                                            </Typography>
                                            <Chip
                                                label={activity.type}
                                                size="small"
                                                color={getActivityColor(activity.type)}
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <Typography variant="caption" color="text.secondary">
                                            {activity.timestamp && formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </CardContent>
        </Card>
    );
};

export default ActivityLog;
