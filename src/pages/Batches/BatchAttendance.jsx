import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    Box, Typography, Button, Grid, Paper, Card, CardContent,
    Avatar, Chip, List, ListItem, ListItemAvatar, ListItemText,
    CircularProgress, Alert, Stack, IconButton
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
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import FaceIcon from '@mui/icons-material/Face';
import GenericMetrics from '../../components/Common/GenericMetrics';

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
                console.error('Failed to load faceapi models', err);
            }
        };
        loadModels();
        fetchBatchDetails();
        fetchTodayAttendance();
    }, [batchId]);

    const fetchBatchDetails = async () => {
        try {
            const response = await api.get(`/batches/${batchId}`);
            if (response.data.success || response.data.data) {
                const b = response.data.data || response.data;
                setBatch(b);
                setStats(prev => ({ ...prev, total: b.studentCount || b.maxStudents || 50 }));
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
            if (response.data.success || Array.isArray(response.data.data)) {
                const list = response.data.data || [];
                setPresentStudents(list);
                setStats(prev => ({ ...prev, present: list.length }));
            }
        } catch (error) {
            console.error('Failed to fetch attendance', error);
        }
    };

    const capture = useCallback(async () => {
        if (!isScanning || !webcamRef.current) return;

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        if (modelsLoaded && canvasRef.current && webcamRef.current.video) {
            const video = webcamRef.current.video;
            const detections = await faceapi.detectAllFaces(
                video, 
                new faceapi.TinyFaceDetectorOptions({ inputSize: 608, scoreThreshold: 0.3 })
            ).withFaceLandmarks();

            const displaySize = { width: video.videoWidth, height: video.videoHeight };
            faceapi.matchDimensions(canvasRef.current, displaySize);

            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, displaySize.width, displaySize.height);

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
                    if (avgMovement > 0.1 && avgMovement < 20) {
                        setLivenessStatus(prev => ({ active: true, score: Math.min(100, prev.score + 50) }));
                    } else {
                        setLivenessStatus(prev => ({ ...prev, score: Math.max(0, prev.score - 5) }));
                    }
                }
                lastLandmarks.current = currentLandmarks;
            }

            let boxColor = 'var(--color-vc-success-deep)'; 
            let label = 'Real Human Verified';

            if (livenessStatus.score < 50) {
                boxColor = '#ffc107'; 
                label = 'Please Move or Blink...';
            }
            if (isProcessing) {
                boxColor = 'var(--color-vc-primary)';
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
        if (livenessStatus.score < 30) return;

        try {
            setIsProcessing(true);
            setScanStatus({ type: 'scanning', message: 'Analyzing frame...' });
            const response = await api.post('/attendance/verify', {
                batchId,
                imageBase64: imageSrc
            });

            if (response.data.success) {
                const results = response.data.results || [];
                
                results.forEach(res => {
                    const student = res.student;
                    if (!student) return;

                    if (res.alreadyMarked) {
                        setScanStatus({ type: 'warning', message: `${student.name}: Already Marked` });
                        if (lastDetection?.student?._id !== student._id) {
                            toast.info(`${student.name}: Already marked today`, { autoClose: 1500 });
                        }
                    } else {
                        setScanStatus({ type: 'success', message: `Marked: ${student.name}` });
                        const isAlreadyInList = presentStudents.some(p => p.student?._id === student._id);
                        if (!isAlreadyInList) {
                            setPresentStudents(prev => [
                                { ...res.attendance, student },
                                ...prev
                            ]);
                            setStats(prev => ({ ...prev, present: prev.present + 1 }));
                            toast.success(`Marked: ${student.name}`, { autoClose: 2000 });
                        }
                    }
                    setLastDetection({ student, time: new Date() });
                });
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
        } finally {
            setIsProcessing(false);
        }
    }, [isScanning, batchId, presentStudents, modelsLoaded, isProcessing, livenessStatus, lastDetection]);

    useEffect(() => {
        let interval;
        if (isScanning) {
            interval = setInterval(capture, 500);
        } else {
            setScanStatus({ type: 'idle', message: '' });
        }
        return () => clearInterval(interval);
    }, [isScanning, capture]);

    const metricsItems = useMemo(() => [
        { title: 'Total Students', value: stats.total, icon: <PeopleIcon />, color: 'primary' },
        { title: 'Present Today', value: stats.present, icon: <CheckCircleIcon />, color: 'success' },
        { title: 'Attendance Rate', value: `${stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%`, icon: <FaceIcon />, color: 'info' },
        { title: 'Cohort Name', value: batch?.name || 'Cohort', icon: <SchoolIcon />, color: 'warning' },
    ], [stats, batch]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 0.5 }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                <IconButton onClick={() => navigate('/batches')} size="small" sx={{ border: '1px solid var(--color-vc-hairline)', borderRadius: '6px', height: 36, width: 36, color: 'var(--color-vc-mute)', bgcolor: 'var(--color-vc-canvas)' }}>
                    <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Box>
                    <Typography sx={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit', lineHeight: 1.2 }}>
                        Face ID Attendance: {batch?.name || 'Loading...'}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>
                        {batch?.course?.title ? `Course: ${batch.course.title}` : 'Real-time biometric attendance system with facial verification'}
                    </Typography>
                </Box>
            </Stack>

            {/* Metrics */}
            <GenericMetrics items={metricsItems} />

            <Grid container spacing={3}>
                {/* Camera Scanner View */}
                <Grid item xs={12} md={7}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            borderRadius: '8px',
                            bgcolor: '#000',
                            border: '1px solid var(--color-vc-hairline)',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: "user" }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }}
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
                                border: '2px solid var(--color-vc-primary)',
                                animation: 'pulse 2s infinite',
                                pointerEvents: 'none',
                                borderRadius: '8px',
                            }} />
                        )}

                        <Box sx={{
                            position: 'absolute',
                            bottom: 24, left: '50%', transform: 'translateX(-50%)',
                            display: 'flex', gap: 2, zIndex: 10
                        }}>
                            {!isScanning ? (
                                <Button
                                    variant="contained"
                                    size="medium"
                                    startIcon={<CameraAltIcon />}
                                    onClick={() => setIsScanning(true)}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '13px',
                                        fontFamily: 'inherit',
                                        borderRadius: '6px',
                                        height: 38,
                                        px: 3,
                                        bgcolor: 'var(--color-vc-primary)',
                                        color: 'var(--color-vc-on-primary)',
                                        '&:hover': { opacity: 0.9 }
                                    }}
                                >
                                    Start Face Scanner
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    size="medium"
                                    startIcon={<StopIcon />}
                                    onClick={() => setIsScanning(false)}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '13px',
                                        fontFamily: 'inherit',
                                        borderRadius: '6px',
                                        height: 38,
                                        px: 3,
                                        bgcolor: 'var(--color-vc-canvas)',
                                        color: 'var(--color-vc-ink)',
                                        border: '1px solid var(--color-vc-hairline)',
                                        '&:hover': { bgcolor: 'var(--color-vc-canvas-soft)' }
                                    }}
                                >
                                    Stop Scanner
                                </Button>
                            )}
                        </Box>

                        {scanStatus.message && (
                            <Box sx={{
                                position: 'absolute', top: 20, left: 20,
                                bgcolor: scanStatus.type === 'success' ? 'var(--color-vc-success-soft)' :
                                    scanStatus.type === 'error' ? 'var(--color-vc-error-soft)' :
                                        scanStatus.type === 'warning' ? 'rgba(255,165,0,0.2)' : 'var(--color-vc-canvas)',
                                color: scanStatus.type === 'success' ? 'var(--color-vc-success-deep)' :
                                    scanStatus.type === 'error' ? 'var(--color-vc-error-deep)' : 'var(--color-vc-ink)',
                                border: '1px solid var(--color-vc-hairline)',
                                px: 2, py: 1, borderRadius: '6px', display: 'flex', alignItems: 'center', gap: 1,
                                zIndex: 10
                            }}>
                                {scanStatus.type === 'scanning' && <CircularProgress size={14} color="inherit" />}
                                <Typography sx={{ fontSize: '12px', fontWeight: 600, fontFamily: 'inherit' }}>
                                    {scanStatus.message}
                                </Typography>
                            </Box>
                        )}
                    </Paper>

                    <Alert severity="info" sx={{ mt: 2, borderRadius: '6px', fontSize: '12px', fontFamily: 'inherit', bgcolor: 'var(--color-vc-canvas-soft)', border: '1px solid var(--color-vc-hairline)', color: 'var(--color-vc-body)' }}>
                        Position students facing the camera. Face ID verifies identity against registered biometric profiles.
                    </Alert>
                </Grid>

                {/* Present Students Realtime List */}
                <Grid item xs={12} md={5}>
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: '8px',
                            border: '1px solid var(--color-vc-hairline)',
                            bgcolor: 'var(--color-vc-canvas)',
                            maxHeight: 520,
                            overflow: 'auto'
                        }}
                    >
                        <Box sx={{ p: 2, borderBottom: '1px solid var(--color-vc-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>
                                Present Students Today
                            </Typography>
                            <Chip label="Real-time Sync" size="small" sx={{ fontSize: '10px', fontWeight: 600, bgcolor: 'var(--color-vc-success-soft)', color: 'var(--color-vc-success-deep)', borderRadius: '4px' }} />
                        </Box>

                        <List sx={{ p: 0 }}>
                            {presentStudents.length === 0 ? (
                                <Box sx={{ p: 6, textAlign: 'center' }}>
                                    <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '13px', fontFamily: 'inherit' }}>
                                        No attendance marked yet today
                                    </Typography>
                                </Box>
                            ) : (
                                presentStudents.map((item, index) => (
                                    <ListItem key={index} divider={index < presentStudents.length - 1} sx={{ py: 1.5, px: 2, borderColor: 'var(--color-vc-hairline)' }}>
                                        <ListItemAvatar>
                                            <Avatar src={item.student?.avatar} sx={{ width: 34, height: 34, bgcolor: 'var(--color-vc-primary)', fontSize: '12px', color: 'var(--color-vc-on-primary)' }}>
                                                {item.student?.name?.charAt(0) || 'S'}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={<Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>{item.student?.name || 'Student'}</Typography>}
                                            secondary={<Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>{item.date ? new Date(item.date).toLocaleTimeString() : 'Just now'}</Typography>}
                                        />
                                        <Chip
                                            icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                                            label={`${((item.confidenceScore || 0.95) * 100).toFixed(0)}% Match`}
                                            size="small"
                                            sx={{
                                                fontSize: '10px',
                                                fontWeight: 600,
                                                bgcolor: 'var(--color-vc-success-soft)',
                                                color: 'var(--color-vc-success-deep)',
                                                borderRadius: '4px'
                                            }}
                                        />
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>

            <style>{`
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
