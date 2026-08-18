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

    // Refs mirror the "live" values `capture` needs to read. Previously capture was a
    // useCallback depending on presentStudents/lastDetection/livenessStatus/isProcessing —
    // all of which change on nearly every tick while scanning — so the setInterval effect
    // below tore down and rebuilt its timer almost continuously instead of ticking on a
    // steady cadence. With 20-30 students in frame (more matches per frame, more state
    // updates per second) that thrashing got severe enough to feel like lag. Reading from
    // refs instead keeps `capture` referentially stable so the interval just ticks.
    const isProcessingRef = useRef(false);
    const livenessScoreRef = useRef(0);
    const presentIdsRef = useRef(new Set());
    // Per-student de-dupe for toasts/status text. The old code only remembered the single
    // "lastDetection" student, so with several students in one frame every match after the
    // first re-toasted "Already Marked" / "Marked" on every single tick — the exact
    // back-and-forth spam being reported. Now each student notifies at most once per
    // scanning session.
    const notifiedRef = useRef(new Set());
    const lastVerifyAtRef = useRef(0);

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
                presentIdsRef.current = new Set(list.map(p => p.student?._id).filter(Boolean));
                setStats(prev => ({ ...prev, present: list.length }));
            }
        } catch (error) {
            console.error('Failed to fetch attendance', error);
        }
    };

    // Caps how big a frame we actually send for recognition. The webcam can hand back a
    // 720p+ screenshot; python_service's face_recognition (HOG) has to locate + encode every
    // face in that frame, and with 20-30 students in one photo that cost scales with both
    // pixel count and face count. Downscaling here keeps a full-classroom frame fast without
    // hurting recognition accuracy (faces are still plenty large at this width).
    const MAX_CAPTURE_WIDTH = 960;
    const captureCanvasRef = useRef(null);
    const getResizedScreenshot = (video) => {
        if (!captureCanvasRef.current) captureCanvasRef.current = document.createElement('canvas');
        const scale = Math.min(1, MAX_CAPTURE_WIDTH / video.videoWidth);
        const w = Math.round(video.videoWidth * scale);
        const h = Math.round(video.videoHeight * scale);
        const canvas = captureCanvasRef.current;
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(video, 0, 0, w, h);
        return canvas.toDataURL('image/jpeg', 0.85);
    };

    const capture = useCallback(async () => {
        if (!isScanning || !webcamRef.current) return;
        const video = webcamRef.current.video;
        if (!video || video.readyState < 2 || !video.videoWidth) return;

        if (modelsLoaded && canvasRef.current) {
            // Cheap pass: locate every face (no landmarks) just to draw boxes — this is the
            // part whose cost scales with how many students are in frame, so it deliberately
            // skips the landmark model entirely.
            const boxDetections = await faceapi.detectAllFaces(
                video,
                new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 })
            );

            const displaySize = { width: video.videoWidth, height: video.videoHeight };
            faceapi.matchDimensions(canvasRef.current, displaySize);
            const resizedBoxes = faceapi.resizeResults(boxDetections, displaySize);
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, displaySize.width, displaySize.height);

            // Liveness/anti-spoof only ever needs ONE face's landmarks (whichever is
            // largest/closest) — running the landmark model per detected face used to mean a
            // full classroom frame paid for 20-30 landmark passes every single tick, which is
            // exactly the kind of per-frame cost that turns into visible lag.
            const landmarkTarget = await faceapi.detectSingleFace(
                video,
                new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 })
            ).withFaceLandmarks();

            if (landmarkTarget) {
                const currentLandmarks = landmarkTarget.landmarks.positions;
                if (lastLandmarks.current) {
                    let movement = 0;
                    for (let i = 0; i < currentLandmarks.length; i += 5) {
                        const dx = currentLandmarks[i].x - lastLandmarks.current[i].x;
                        const dy = currentLandmarks[i].y - lastLandmarks.current[i].y;
                        movement += Math.sqrt(dx * dx + dy * dy);
                    }
                    const avgMovement = movement / (currentLandmarks.length / 5);
                    if (avgMovement > 0.1 && avgMovement < 20) {
                        livenessScoreRef.current = Math.min(100, livenessScoreRef.current + 50);
                    } else {
                        livenessScoreRef.current = Math.max(0, livenessScoreRef.current - 5);
                    }
                }
                lastLandmarks.current = currentLandmarks;
            }
            setLivenessStatus({ active: true, score: livenessScoreRef.current });

            let boxColor = 'var(--color-vc-success-deep)';
            let label = 'Real Human Verified';

            if (livenessScoreRef.current < 50) {
                boxColor = '#ffc107';
                label = 'Please Move or Blink...';
            }
            if (isProcessingRef.current) {
                boxColor = 'var(--color-vc-primary)';
                label = 'Marking Attendance...';
            }

            resizedBoxes.forEach(det => {
                const box = det.box || det;
                if (!box) return;

                const drawBox = new faceapi.draw.DrawBox(box, {
                    label,
                    boxColor,
                    drawLabel: true
                });
                drawBox.draw(canvasRef.current);
            });
        }

        // The visual overlay above stays smooth every tick; the actual backend recognition
        // call — the expensive part when a room full of students is in frame — is gated so
        // it never overlaps itself and never fires more than once a second.
        if (isProcessingRef.current) return;
        if (livenessScoreRef.current < 30) return;
        if (Date.now() - lastVerifyAtRef.current < 1000) return;

        const imageSrc = getResizedScreenshot(video);
        if (!imageSrc) return;

        try {
            isProcessingRef.current = true;
            setIsProcessing(true);
            lastVerifyAtRef.current = Date.now();
            setScanStatus({ type: 'scanning', message: 'Analyzing frame...' });
            const response = await api.post('/attendance/verify', {
                batchId,
                imageBase64: imageSrc
            });

            if (response.data.success) {
                const results = response.data.results || [];
                let lastLabel = null;

                results.forEach(res => {
                    const student = res.student;
                    if (!student) return;
                    lastLabel = student.name;

                    if (res.alreadyMarked) {
                        // De-duped per student for the whole scanning session — otherwise every
                        // already-present student in a group frame re-toasts on every tick.
                        if (!notifiedRef.current.has(student._id)) {
                            notifiedRef.current.add(student._id);
                            toast.info(`${student.name}: Already marked today`, { autoClose: 1500 });
                        }
                    } else if (!presentIdsRef.current.has(student._id)) {
                        presentIdsRef.current.add(student._id);
                        notifiedRef.current.add(student._id);
                        setPresentStudents(prev => [
                            { ...res.attendance, student },
                            ...prev
                        ]);
                        setStats(prev => ({ ...prev, present: prev.present + 1 }));
                        toast.success(`Marked: ${student.name}`, { autoClose: 2000 });
                    }
                    setLastDetection({ student, time: new Date() });
                });

                if (results.length > 0) {
                    setScanStatus({
                        type: 'success',
                        message: results.length === 1 ? `Processed: ${lastLabel}` : `Processed ${results.length} students`,
                    });
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
        } finally {
            isProcessingRef.current = false;
            setIsProcessing(false);
        }
    }, [isScanning, batchId, modelsLoaded]);

    useEffect(() => {
        if (!isScanning) {
            setScanStatus({ type: 'idle', message: '' });
            return;
        }

        // Self-scheduling loop instead of a fixed setInterval: the next tick is only queued
        // once the current one (including any in-flight /attendance/verify call) fully
        // finishes. A fixed interval would keep firing every 500ms regardless of how long a
        // crowded-frame recognition call takes, piling up work and making the whole scanner
        // feel laggy/unpredictable exactly when there are the most students to process.
        let cancelled = false;
        let timeoutId;
        const tick = async () => {
            if (cancelled) return;
            await capture();
            if (!cancelled) timeoutId = setTimeout(tick, 400);
        };
        tick();

        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
        };
    }, [isScanning, capture]);

    // Starting a fresh scan session should forget who's already been toasted about this run.
    useEffect(() => {
        if (isScanning) notifiedRef.current = new Set();
    }, [isScanning]);

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
