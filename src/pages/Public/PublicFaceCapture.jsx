import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FaceCapture from '../../components/Users/FaceCaptureFolder/FaceCapture';
import { Box, Typography, Button, Paper } from '@mui/material';

const PublicFaceCapture = () => {
    const { userId, token } = useParams();
    const navigate = useNavigate();
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        console.log("🛠️ [DEBUG] PublicFaceCapture mounted");
        console.log(`🛠️ [DEBUG] UserID: ${userId}, Token provided: ${token ? "Yes" : "No"}`);
        if (token) {
            localStorage.setItem('token', token);
            console.log("🛠️ [DEBUG] Token saved to localStorage");
        }
    }, [token, userId]);

    const handleComplete = (data) => {
        console.log("🛠️ [DEBUG] Face capture completed successfully on frontend");
        setIsComplete(true);
        console.log("FACE_CAPTURE_COMPLETE");
    };

    if (isComplete) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh" bgcolor="#f5f5f5" p={3}>
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 4, maxWidth: 400 }}>
                    <Typography variant="h5" color="success.main" gutterBottom fontWeight="bold">
                        Capture Successful!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mb={3}>
                        Your face ID has been registered successfully. You can now return to the app.
                    </Typography>
                    <Button variant="contained" color="primary" onClick={() => window.close()} fullWidth>
                        Close & Return to App
                    </Button>
                </Paper>
            </Box>
        );
    }

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" bgcolor="#f5f5f5" p={2}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, width: '100%', maxWidth: 800, borderRadius: 4 }}>
                <Typography variant="h5" align="center" gutterBottom fontWeight="bold" color="primary.main" mb={3}>
                    Face ID Registration
                </Typography>
                <FaceCapture userId={userId} user={{ studentProfile: {} }} onComplete={handleComplete} />
            </Paper>
        </Box>
    );
};

export default PublicFaceCapture;
