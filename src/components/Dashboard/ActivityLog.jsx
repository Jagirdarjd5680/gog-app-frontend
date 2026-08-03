import { Card, CardContent, Typography, Box, List, ListItem, ListItemText, Chip } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

const ActivityLog = ({ activities = [] }) => {
    const getActivityColorVar = (type) => {
        const colors = {
            user: 'var(--color-vc-link)',
            course: 'var(--color-vc-violet)',
            payment: 'var(--color-vc-success)',
            assignment: 'var(--color-vc-warning)',
            default: 'var(--color-vc-mute)',
        };
        return colors[type] || colors.default;
    };

    return (
        <Card sx={{ 
            bgcolor: 'var(--color-vc-canvas)',
            border: '1px solid var(--color-vc-hairline)',
            borderRadius: '8px',
            boxShadow: '0px 1px 1px rgba(0,0,0,0.02)',
        }}>
            <CardContent sx={{ p: '24px !important' }}>
                <Typography sx={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit', mb: 2 }}>
                    Recent Activity
                </Typography>

                {activities.length === 0 ? (
                    <Typography sx={{ py: 3, textAlign: 'center', color: 'var(--color-vc-mute)', fontSize: '14px', fontFamily: 'inherit' }}>
                        No recent activities
                    </Typography>
                ) : (
                    <List sx={{ maxHeight: 400, overflow: 'auto', p: 0 }}>
                        {activities.map((activity, index) => (
                            <ListItem
                                key={index}
                                sx={{
                                    border: '1px solid var(--color-vc-hairline)',
                                    borderLeft: '3px solid',
                                    borderLeftColor: getActivityColorVar(activity.type),
                                    mb: 1,
                                    borderRadius: '6px',
                                    backgroundColor: 'var(--color-vc-canvas-soft)',
                                    py: 1,
                                    px: 2,
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>
                                                {activity.title}
                                            </Typography>
                                            <Chip
                                                label={activity.type}
                                                size="small"
                                                sx={{
                                                    bgcolor: `${getActivityColorVar(activity.type)}15`,
                                                    color: getActivityColorVar(activity.type),
                                                    fontWeight: 600,
                                                    fontSize: '10px',
                                                    height: 18,
                                                    borderRadius: '4px',
                                                    border: `1px solid ${getActivityColorVar(activity.type)}20`,
                                                    textTransform: 'uppercase'
                                                }}
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit', mt: 0.5, display: 'block' }}>
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
