import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, LinearProgress, Stack, Paper } from '@mui/material';
import Webcam from 'react-webcam';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import * as faceapi from 'face-api.js';
import api from '../../../utils/api';
import { toast } from 'react-toastify';

import { fixUrl } from '../../../utils/api';

const FaceCapture = ({ userId, user, onComplete }) => {
    const webcamRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);

    const registeredFace = user?.studentProfile?.biometricFace;

    const [step, setStep] = useState(-1);
    // ... rest of state stays same ...
    const [overallProgress, setOverallProgress] = useState(0);
    const [holdProgress, setHoldProgress] = useState(0);
    const [isCapturing, setIsCapturing] = useState(false);
    const [status, setStatus] = useState('Wait for models...');

    // ... steps ...
    const steps = [
        { label: 'Look Up', icon: <ArrowUpwardIcon sx={{ fontSize: 32 }} /> },
        { label: 'Look Down', icon: <ArrowDownwardIcon sx={{ fontSize: 32 }} /> },
        { label: 'Look Left', icon: <ArrowBackIcon sx={{ fontSize: 32 }} /> },
        { label: 'Look Right', icon: <ArrowForwardIcon sx={{ fontSize: 32 }} /> }
    ];

    // ... useEffect for models ...
    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models';
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
                ]);
                setModelsLoaded(true);
                setStatus('Ready to Start');
            } catch (err) {
                toast.error("Failed to load models");
            }
        };
        loadModels();
    }, []);

    const startAutoScan = () => {
        setStep(0);
        setOverallProgress(0);
        setHoldProgress(0);
        setStatus('Position your face');
    };

    const detectFace = useCallback(async () => {
        if (!webcamRef.current || !webcamRef.current.video || isCapturing || step < 0 || step >= steps.length) return;

        const video = webcamRef.current.video;
        // The webcam <video> element mounts with videoWidth/videoHeight still 0 until its
        // metadata finishes loading; running detection against it in that window makes
        // face-api.js resize its result box to a null/0 rect and throw "Box.constructor -
        // expected box to be IBoundingBox" instead of just finding no face. Skip those frames.
        if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;

        const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })).withFaceLandmarks();

        if (detection) {
            const landmarks = detection.landmarks;
            const nose = landmarks.getNose();
            const leftEye = landmarks.getLeftEye();
            const rightEye = landmarks.getRightEye();
            const jaw = landmarks.getJawOutline();
            const mouth = landmarks.getMouth();

            const eyeCenterX = (leftEye[0].x + rightEye[3].x) / 2;
            const eyeCenterY = (leftEye[0].y + rightEye[3].y) / 2;

            const jawWidth = jaw[16].x - jaw[0].x;
            const hOffset = (nose[3].x - eyeCenterX) / jawWidth;

            const eyeToMouthDist = mouth[3].y - eyeCenterY;
            const noseToEyeDist = nose[3].y - eyeCenterY;
            const vRatio = noseToEyeDist / eyeToMouthDist;

            let poseMatched = false;
            const target = steps[step].label;

            if (target === 'Look Left' && hOffset < -0.12) poseMatched = true;
            else if (target === 'Look Right' && hOffset > 0.12) poseMatched = true;
            else if (target === 'Look Up' && vRatio < 0.45) poseMatched = true;
            else if (target === 'Look Down' && vRatio > 0.75) poseMatched = true;

            if (poseMatched) {
                setHoldProgress(prev => {
                    const next = prev + 10;
                    if (next >= 100) {
                        performCapture(step);
                        return 0;
                    }
                    return next;
                });
                setStatus('Hold it...');
            } else {
                setHoldProgress(prev => Math.max(0, prev - 5));
                setStatus(`Please ${target}`);
            }
        } else {
            setHoldProgress(0);
            setStatus('Face not detected');
        }
    }, [step, isCapturing, steps]);

    useEffect(() => {
        let interval;
        if (modelsLoaded && step >= 0 && step < steps.length) {
            interval = setInterval(detectFace, 100);
        }
        return () => clearInterval(interval);
    }, [modelsLoaded, step, detectFace]);

    const [capturedImages, setCapturedImages] = useState([]);
    const [finalStep, setFinalStep] = useState(false);

    const performCapture = (currentStep) => {
        setIsCapturing(true);
        setStatus('Scanning Angle...');

        setTimeout(() => {
            const imageSrc = webcamRef.current.getScreenshot();
            setCapturedImages(prev => [...prev, imageSrc]);

            const nextStep = currentStep + 1;
            setOverallProgress((nextStep / steps.length) * 100);
            setIsCapturing(false);
            setHoldProgress(0);

            if (nextStep < steps.length) {
                setStep(nextStep);
            } else {
                setFinalStep(true);
                setStatus('Scan Complete');
            }
        }, 500);
    };

    const handleSave = async () => {
        if (capturedImages.length === 0) return;
        setLoading(true);
        try {
            // The face-api.js scan above is purely client-side pose guidance (make sure a real,
            // moving face is in frame) — the actual recognition descriptor comes from
            // python_service via this real backend endpoint. This used to only call
            // PUT /users/:id/biometric-face, which just stuffed the raw images into
            // studentProfile.faceDescriptor (a display-only JSON blob) and never touched the
            // real User.faceDescriptor column attendance verification actually reads, so
            // admin-registered faces could never be recognized during check-in.
            //
            // capturedImages is [Look Up, Look Down, Look Left, Look Right] — every one of
            // those poses tilts/turns the head away from the camera, so face_recognition's
            // detector very often finds nothing in the frontal-shot image (index 0, "Look Up")
            // and enrollment failed with "No face detected" almost every time. Try each
            // captured angle (mild turns first) until one actually contains a detectable face.
            const angleOrder = [2, 3, 1, 0].filter((i) => i < capturedImages.length);
            let lastErrorMessage = 'No face detected in any captured angle — please retake with better lighting, facing the camera more directly.';
            let enrolled = false;

            for (const idx of angleOrder) {
                try {
                    const enrollResponse = await api.post('/attendance/enroll-face', {
                        imageBase64: capturedImages[idx],
                        userId,
                    });
                    if (enrollResponse.data.success) {
                        enrolled = true;
                        break;
                    }
                } catch (err) {
                    lastErrorMessage = err.response?.data?.message || err.message || lastErrorMessage;
                }
            }

            if (!enrolled) {
                throw new Error(lastErrorMessage);
            }

            // Best-effort only — keeps a preview thumbnail on this tab; not required for
            // real recognition to work, so a failure here shouldn't block success feedback.
            let profileData = null;
            try {
                const previewResponse = await api.put(`/users/${userId}/biometric-face`, {
                    imagesBase64: capturedImages,
                });
                profileData = previewResponse.data.data;
            } catch (previewErr) {
                // Non-fatal — the real enrollment above already succeeded.
            }

            toast.success('Face ID Registered — this student can now check in via face recognition');
            if (onComplete) onComplete(profileData);
            resetCapture();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Face enrollment failed — try a clearer, well-lit photo');
        } finally {
            setLoading(false);
        }
    };

    const resetCapture = () => {
        setCapturedImages([]);
        setFinalStep(false);
        setStep(-1);
        setOverallProgress(0);
        setHoldProgress(0);
    };

    if (!modelsLoaded) return (
        <Box sx={{ textAlign: 'center', py: 5 }}>
            <CircularProgress size={24} sx={{ color: 'var(--color-vc-primary)' }} />
            <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)', mt: 1.5, fontFamily: 'inherit' }}>
                AI Biometric Initializing...
            </Typography>
        </Box>
    );

    return (
        <Box sx={{ width: '100%', maxWidth: 700, mx: 'auto' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="center" alignItems="center">
                {/* Registered Face Preview */}
                {registeredFace && step === -1 && !finalStep && (
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5, display: 'block' }}>
                            Currently Registered
                        </Typography>
                        <Box sx={{
                            width: 140, height: 140, borderRadius: '50%', overflow: 'hidden',
                            border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)'
                        }}>
                            <img src={fixUrl(registeredFace)} alt="Registered" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                    </Box>
                )}

                <Box sx={{ width: 320 }}>
                    {!finalStep ? (
                        <Box sx={{ textAlign: 'center' }}>
                            <Box sx={{
                                position: 'relative',
                                width: 200, height: 200, mx: 'auto',
                                borderRadius: '50%', overflow: 'hidden', bgcolor: '#000',
                                border: '1px solid var(--color-vc-hairline)',
                                borderColor: holdProgress > 0 ? 'var(--color-vc-success)' : (step === -1 ? 'var(--color-vc-hairline)' : 'var(--color-vc-primary)'),
                                transition: 'border-color 0.2s'
                            }}>
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    width="100%"
                                    videoConstraints={{ facingMode: "user" }}
                                    onUserMediaError={(err) => {
                                        console.error("Camera error:", err);
                                        toast.error("Camera access denied or unavailable (Check HTTPS/Permissions)");
                                    }}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                />

                                {holdProgress > 0 && (
                                    <Box sx={{
                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                        border: '6px solid var(--color-vc-success-soft)',
                                        borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <CircularProgress
                                            variant="determinate"
                                            value={holdProgress}
                                            size={188}
                                            thickness={2}
                                            sx={{ color: 'var(--color-vc-success)' }}
                                        />
                                    </Box>
                                )}

                                {isCapturing && (
                                    <Box sx={{
                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                        bgcolor: 'rgba(0,0,0,0.4)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <CircularProgress size={24} sx={{ color: 'var(--color-vc-on-primary)' }} />
                                    </Box>
                                )}
                            </Box>

                            <Stack spacing={2} sx={{ mt: 3, alignItems: 'center' }}>
                                {step === -1 ? (
                                    <Button 
                                        variant="contained" 
                                        onClick={startAutoScan}
                                        sx={{ 
                                            textTransform: 'none',
                                            fontSize: '13px',
                                            fontWeight: 500,
                                            fontFamily: 'inherit',
                                            borderRadius: '6px',
                                            boxShadow: 'none',
                                            bgcolor: 'var(--color-vc-primary)',
                                            color: 'var(--color-vc-on-primary)',
                                            px: 4,
                                            height: 36,
                                            '&:hover': {
                                                bgcolor: 'var(--color-vc-primary)',
                                                opacity: 0.9,
                                                boxShadow: 'none'
                                            }
                                        }}
                                    >
                                        Start Smart Scan
                                    </Button>
                                ) : (
                                    <>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: holdProgress > 0 ? 'var(--color-vc-success-deep)' : 'var(--color-vc-primary)' }}>
                                            {status}
                                        </Typography>
                                        <Paper elevation={0} sx={{ p: 1, bgcolor: 'var(--color-vc-canvas-soft)', border: '1px solid var(--color-vc-hairline)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-vc-ink)' }}>
                                            {steps[step]?.icon}
                                        </Paper>
                                        <Box sx={{ width: '100%', px: 4 }}>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={overallProgress} 
                                                sx={{ 
                                                    height: 4, 
                                                    borderRadius: '2px',
                                                    bgcolor: 'var(--color-vc-hairline)',
                                                    '& .MuiLinearProgress-bar': { bgcolor: 'var(--color-vc-primary)' }
                                                }} 
                                            />
                                            <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', mt: 1 }}>
                                                Total Progress: {Math.round(overallProgress)}%
                                            </Typography>
                                        </Box>
                                    </>
                                )}
                            </Stack>
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center' }}>
                            <Box sx={{ position: 'relative', width: 200, height: 200, mx: 'auto', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--color-vc-hairline)', mb: 2, bgcolor: 'var(--color-vc-canvas-soft)' }}>
                                <img src={capturedImages[0]} alt="Captured" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(76, 175, 80, 0.15)' }}>
                                    <CheckCircleIcon sx={{ fontSize: 50, color: 'var(--color-vc-success-deep)' }} />
                                </Box>
                            </Box>
                            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-vc-success-deep)' }}>Scan Successful!</Typography>
                            <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', display: 'block', mt: 0.5 }}>4 Angles Captured for Smart Attendance</Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                                <Button 
                                    fullWidth 
                                    size="small" 
                                    variant="outlined" 
                                    onClick={resetCapture}
                                    sx={{
                                        textTransform: 'none',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        fontFamily: 'inherit',
                                        borderRadius: '6px',
                                        color: 'var(--color-vc-ink)',
                                        borderColor: 'var(--color-vc-hairline)',
                                        bgcolor: 'var(--color-vc-canvas)',
                                        height: 32,
                                        '&:hover': {
                                            bgcolor: 'var(--color-vc-canvas-soft)',
                                            borderColor: 'var(--color-vc-hairline-strong)'
                                        }
                                    }}
                                >
                                    Retake
                                </Button>
                                <Button 
                                    fullWidth 
                                    size="small" 
                                    variant="contained" 
                                    onClick={handleSave} 
                                    disabled={loading}
                                    sx={{
                                        textTransform: 'none',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        fontFamily: 'inherit',
                                        borderRadius: '6px',
                                        boxShadow: 'none',
                                        bgcolor: 'var(--color-vc-success)',
                                        color: '#fff',
                                        height: 32,
                                        '&:hover': {
                                            bgcolor: 'var(--color-vc-success)',
                                            opacity: 0.9,
                                            boxShadow: 'none'
                                        }
                                    }}
                                >
                                    {loading ? <CircularProgress size={14} color="inherit" /> : 'Register Face'}
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Stack>
        </Box>
    );
};


export default FaceCapture;
