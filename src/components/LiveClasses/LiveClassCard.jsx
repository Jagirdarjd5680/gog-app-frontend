import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Avatar,
    Chip,
    IconButton,
    Tooltip,
    Divider,
    Grid
} from '@mui/material';
import { format, isPast, isFuture } from 'date-fns';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PersonIcon from '@mui/icons-material/Person';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const GoogleMeetIcon = () => (
    <Box
        component="img"
        src="/assets/Google_Meet_icon.png"
        alt="Google Meet"
        sx={{ width: 20, height: 20, objectFit: 'contain' }}
    />
);

const LiveClassCard = ({ liveClass, onEdit, onDelete, isAdmin }) => {
    const isLive = liveClass.status === 'ongoing';

    return (
        <Card sx={{
            height: '100%',
            borderRadius: 3,
            overflow: 'hidden',
            transition: 'all 0.2s ease',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
                boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                transform: 'translateY(-2px)'
            }
        }}>
            <Box sx={{
                p: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: isLive ? 'error.50' : 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GoogleMeetIcon />
                    <Chip
                        label={liveClass.status}
                        size="small"
                        color={isLive ? "error" : "primary"}
                        variant={isLive ? "filled" : "outlined"}
                        sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}
                    />
                </Box>
                {isAdmin && (
                    <IconButton size="small" onClick={() => onEdit(liveClass)}>
                        <MoreVertIcon fontSize="inherit" />
                    </IconButton>
                )}
            </Box>

            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1, lineHeight: 1.2 }}>
                    {liveClass.title}
                </Typography>

                <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                            <CalendarMonthIcon sx={{ fontSize: 14 }} />
                            <Typography variant="caption" fontWeight={600}>
                                {format(new Date(liveClass.scheduledDate), 'dd MMM')}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                            <AccessTimeIcon sx={{ fontSize: 14 }} />
                            <Typography variant="caption" fontWeight={600}>
                                {format(new Date(liveClass.scheduledDate), 'p')}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mt: 'auto'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                            src={liveClass.teacher?.avatar}
                            sx={{ width: 24, height: 24, fontSize: '0.7rem' }}
                        >
                            {liveClass.teacher?.name?.charAt(0)}
                        </Avatar>
                        <Typography variant="caption" fontWeight={700} color="text.primary" noWrap sx={{ maxWidth: 80 }}>
                            {liveClass.teacher?.name?.split(' ')[0]}
                        </Typography>
                    </Box>

                    <Button
                        size="small"
                        variant={isLive ? "contained" : "text"}
                        color={isLive ? "error" : "primary"}
                        href={liveClass.meetingLink}
                        target="_blank"
                        disabled={!liveClass.meetingLink || liveClass.status === 'completed'}
                        sx={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            borderRadius: 1.5,
                            minWidth: isLive ? 80 : 'auto',
                            textTransform: 'none'
                        }}
                    >
                        {isLive ? 'Join Now' : 'Join Link'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default LiveClassCard;
