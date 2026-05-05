import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box, Typography, Button, Grid, Paper, Card, CardContent,
    Avatar, Chip, List, ListItem, ListItemAvatar, ListItemText,
    CircularProgress, Alert, Stack, Divider, IconButton
} from '@mui/material';
import Webcam from 'react-webcam';
import api from '../../utils/api';
import { useParams, useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import { toast } from 'react-toastify';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import StopIcon from '@mui/icons-material/Stop';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const BatchAttendance = () => {
    const { batchId } = useParams();
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const [batch, setBatch] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [presentStudents, setPresentStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastDetection, setLastDetection] = useState(null);
    const [stats, setStats] = useState({ total: 0, present: 0 });
    const [scanStatus, setScanStatus] = useState({ type: 'idle', message: '' });
    const [isProcessing, setIsProcessing] = useState(false);
    const [livenessStatus, setLivenessStatus] = useState({ active: false, score: 0 });
    const lastLandmarks = useRef(null);
    const canvasRef = useRef(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models';
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                ]);
                setModelsLoaded(true);
            } catch (err) {
                console.error("Error loading face models:", err);
            }
        };
        loadModels();
        fetchBatchDetails();
        fetchTodayAttendance();
    }, [batchId]);

    const fetchBatchDetails = async () => {
        try {
            const response = await api.get(`/batches/${batchId}`);
            if (response.data.success) {
                setBatch(response.data.data);
                setStats(prev => ({ ...prev, total: response.data.data.students?.length || 0 }));
            }
        } catch (error) {
            toast.error('Failed to load batch details');
        } finally {
            setLoading(false);
        }
    };

    const fetchTodayAttendance = async () => {
        try {
            const response = await api.get(`/attendance/batch/${batchId}`);
            if (response.data.success) {
                setPresentStudents(response.data.data);
                setStats(prev => ({ ...prev, present: response.data.data.length }));
            }
        } catch (error) {
            console.error('Attendance fetch error:', error);
        }
    };

    const capture = useCallback(async () => {
        if (!isScanning || !webcamRef.current) return;

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        // Visual detection in browser
        if (modelsLoaded && canvasRef.current && webcamRef.current.video) {
            const video = webcamRef.current.video;
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();

            const displaySize = { width: video.videoWidth, height: video.videoHeight };
            faceapi.matchDimensions(canvasRef.current, displaySize);

            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, displaySize.width, displaySize.height);

            // Liveness Detection: Check for micro-movements of landmarks
            if (resizedDetections.length > 0) {
                const currentLandmarks = resizedDetections[0].landmarks.positions;
                if (lastLandmarks.current) {
                    let movement = 0;
                    for (let i = 0; i < currentLandmarks.length; i += 5) {
                        const dx = currentLandmarks[i].x - lastLandmarks.current[i].x;
                        const dy = currentLandmarks[i].y - lastLandmarks.current[i].y;
                        movement += Math.sqrt(dx * dx + dy * dy);
                    }
                    const avgMovement = movement / (currentLandmarks.length / 5);
                    // 0.1 - 20 is more relaxed for typical webcams
                    if (avgMovement > 0.1 && avgMovement < 20) {
                        setLivenessStatus(prev => ({ active: true, score: Math.min(100, prev.score + 50) })); // Faster verify
                    } else {
                        setLivenessStatus(prev => ({ ...prev, score: Math.max(0, prev.score - 5) })); // Slower penalty
                    }
                }
                lastLandmarks.current = currentLandmarks;
            }

            // Box color logic: Yellow if static/checking, Blue if marking, Green if Human verified
            let boxColor = '#28a745'; 
            let label = 'Real Human Verified';

            if (livenessStatus.score < 50) {
                boxColor = '#ffc107'; 
                label = 'Please Move or Blink...';
            }
            if (isProcessing) {
                boxColor = '#007bff';
                label = 'Marking Attendance...';
            }

            resizedDetections.forEach(det => {
                const box = det.detection ? det.detection.box : det.box;
                if (!box) return;
                
                const drawBox = new faceapi.draw.DrawBox(box, {
                    label,
                    boxColor,
                    drawLabel: true
                });
                drawBox.draw(canvasRef.current);
            });
        }

        if (isProcessing) return;
        
        // Skip AJAX if liveness score is too low (potential photo)
        if (livenessStatus.score < 30) {
            console.log(`🟡 [Frontend] Liveness check pending... Score: ${livenessStatus.score}/100. Need 30 to send.`);
            return;
        }

        console.log(`🟢 [Frontend] Liveness passed! (Score: ${livenessStatus.score}). Sending request to Backend... 🚀`);

        try {
            setIsProcessing(true);
            setScanStatus({ type: 'scanning', message: 'Analyzing frame...' });
            const response = await api.post('/attendance/verify', {
                batchId,
                imageBase64: imageSrc
            });

            console.log(`✅ [Frontend] Response received from Backend:`, response.data);

            if (response.data.success) {
                const newAttendance = response.data.data;
                const student = response.data.student;

                setScanStatus({ type: 'success', message: `Matched: ${student.name}` });

                // Check if already in list to avoid duplicates in UI
                const isAlreadyPresent = presentStudents.some(p => p.student._id === student._id);
                if (!isAlreadyPresent) {
                    setPresentStudents(prev => [
                        { ...newAttendance, student },
                        ...prev
                    ]);
                    setStats(prev => ({ ...prev, present: prev.present + 1 }));
                    setLastDetection({ student, time: new Date() });
                    toast.success(`Marked: ${student.name}`, { autoClose: 1000 });
                }
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Error';
            if (error.response?.status === 400) {
                setScanStatus({ type: 'warning', message: msg || 'No registered students' });
            } else if (error.response?.status === 404) {
                setScanStatus({ type: 'error', message: 'Unknown Face' });
            } else if (error.response?.status === 403) {
                const name = error.response.data.studentName || 'Student';
                setScanStatus({ type: 'warning', message: `${name} not in this batch` });
            } else {
                setScanStatus({ type: 'error', message: 'Connection Error' });
            }

            if (error.response?.status !== 404 && error.response?.status !== 400) {
                console.error('Verification error:', error);
            }
        } finally {
            setIsProcessing(false);
        }
    }, [isScanning, batchId, presentStudents, modelsLoaded, isProcessing, livenessStatus]);

    useEffect(() => {
        let interval;
        if (isScanning) {
            interval = setInterval(capture, 500); // Super fast capture rate
        } else {
            setScanStatus({ type: 'idle', message: '' });
        }
        return () => clearInterval(interval);
    }, [isScanning, capture]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 4 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Batch Attendance</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        {batch?.name} • {batch?.course?.title}
                    </Typography>
                </Box>
            </Stack>

            <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                    <Paper elevation={4} sx={{ p: 2, borderRadius: 4, bgcolor: '#000', overflow: 'hidden', position: 'relative' }}>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: "user" }}
                            onUserMediaError={(err) => console.error("Webcam Error:", err)}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                        />
                        <canvas
                            ref={canvasRef}
                            style={{
                                position: 'absolute', top: 0, left: 0,
                                width: '100%', height: '100%',
                                pointerEvents: 'none'
                            }}
                        />

                        {isScanning && (
                            <Box sx={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                border: '2px solid #C40C0C',
                                animation: 'pulse 2s infinite',
                                pointerEvents: 'none',
                                borderRadius: 4,
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: '50%', left: '10%', right: '10%',
                                    height: '2px', bgcolor: '#C40C0C',
                                    boxShadow: '0 0 15px #C40C0C',
                                    animation: 'scan 3s infinite ease-in-out'
                                }
                            }} />
                        )}

                        <Box sx={{
                            position: 'absolute',
                            bottom: 30, left: '50%', transform: 'translateX(-50%)',
                            display: 'flex', gap: 2
                        }}>
                            {!isScanning ? (
                                <Button
                                    variant="contained"
                                    color="error"
                                    size="large"
                                    startIcon={<CameraAltIcon />}
                                    onClick={() => setIsScanning(true)}
                                    sx={{ borderRadius: 10, px: 4 }}
                                >
                                    Start Scanning
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="inherit"
                                    size="large"
                                    startIcon={<StopIcon />}
                                    onClick={() => setIsScanning(false)}
                                    sx={{ borderRadius: 10, px: 4, bgcolor: 'rgba(255,255,255,0.9)' }}
                                >
                                    Stop Scanning
                                </Button>
                            )}
                        </Box>

                        {scanStatus.message && (
                            <Box sx={{
                                position: 'absolute', top: 20, left: 20,
                                bgcolor: scanStatus.type === 'success' ? 'rgba(0,200,0,0.9)' :
                                    scanStatus.type === 'error' ? 'rgba(200,0,0,0.9)' :
                                        scanStatus.type === 'warning' ? 'rgba(255,165,0,0.9)' : 'rgba(0,0,0,0.6)',
                                color: 'white',
                                px: 2, py: 1, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1,
                                zIndex: 10
                            }}>
                                {scanStatus.type === 'scanning' && <CircularProgress size={16} color="inherit" />}
                                <Typography variant="body2" fontWeight={700}>
                                    {scanStatus.message}
                                </Typography>
                            </Box>
                        )}
                    </Paper>

                    <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                        Ensure students are facing the camera clearly. Face ID will match their profile photo.
                    </Alert>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Card elevation={2} sx={{ borderRadius: 4, mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Today's Statistics</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', borderRadius: 2 }}>
                                        <Typography variant="h4" fontWeight={800} color="primary">{stats.total}</Typography>
                                        <Typography variant="caption">Total Students</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', borderRadius: 2 }}>
                                        <Typography variant="h4" fontWeight={800} color="success.main">{stats.present}</Typography>
                                        <Typography variant="caption">Present Today</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    <Paper elevation={2} sx={{ borderRadius: 4, maxHeight: 400, overflow: 'auto' }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight={700}>Present Students</Typography>
                            <Chip label="Real-time" size="small" color="success" />
                        </Box>
                        <List>
                            {presentStudents.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography color="text.secondary">No attendance marked yet</Typography>
                                </Box>
                            ) : (
                                presentStudents.map((item, index) => (
                                    <ListItem key={index} divider={index < presentStudents.length - 1}>
                                        <ListItemAvatar>
                                            <Avatar src={item.student.avatar} />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={item.student.name}
                                            secondary={new Date(item.date).toLocaleTimeString()}
                                        />
                                        <Chip
                                            icon={<CheckCircleIcon />}
                                            label={`${((item.confidenceScore || 0) * 100).toFixed(0)}% Match`}
                                            size="small"
                                            color="success"
                                            variant="outlined"
                                        />
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>

            <style>{`
                @keyframes scan {
                    0%, 100% { top: 10%; }
                    50% { top: 90%; }
                }
                @keyframes pulse {
                    0% { opacity: 0.5; }
                    50% { opacity: 1; }
                    100% { opacity: 0.5; }
                }
            `}</style>
        </Box>
    );
};

export default BatchAttendance;
