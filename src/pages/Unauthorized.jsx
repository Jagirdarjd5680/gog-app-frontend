import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BlockIcon from '@mui/icons-material/Block';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                p: 3,
            }}
        >
            <BlockIcon sx={{ fontSize: 100, color: 'error.main', mb: 2 }} />
            <Typography variant="h3" fontWeight={700} gutterBottom>
                Access Denied
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
                You don't have permission to access this page.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/')}>
                Go to Dashboard
            </Button>
        </Box>
    );
};

export default Unauthorized;
