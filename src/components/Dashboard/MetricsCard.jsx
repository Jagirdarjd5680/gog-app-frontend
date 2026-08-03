import { Card, CardContent, Typography, Box } from '@mui/material';

const MetricsCard = ({ title, value, icon, color = 'primary', subtitle, onClick }) => {
    return (
        <Card
            onClick={onClick}
            sx={{
                height: '100%',
                bgcolor: 'var(--color-vc-canvas)',
                border: '1px solid var(--color-vc-hairline)',
                borderRadius: '8px',
                boxShadow: '0px 1px 1px rgba(0,0,0,0.02)',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                '&:hover': {
                    borderColor: 'var(--color-vc-hairline-strong)',
                    boxShadow: '0px 2px 2px rgba(0,0,0,0.02), 0px 8px 16px -4px rgba(0,0,0,0.04)',
                    transform: onClick ? 'translateY(-2px)' : 'none',
                },
            }}
        >
            <CardContent sx={{ p: '20px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'inherit', mb: 1 }}>
                            {title}
                        </Typography>
                        <Typography sx={{ fontSize: '28px', fontWeight: 600, color: 'var(--color-vc-ink)', letterSpacing: '-0.03em', fontFamily: 'inherit', lineHeight: 1.2 }}>
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography sx={{ mt: 1, fontSize: '12px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    {icon && (
                        <Box
                            sx={{
                                color: 'var(--color-vc-mute)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                ml: 2,
                                mt: 0.5,
                                '& svg': {
                                    fontSize: '20px'
                                }
                            }}
                        >
                            {icon}
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default MetricsCard;
