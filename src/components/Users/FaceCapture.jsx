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
import api from '../../utils/api';
import { toast } from 'react-toastify';

const FaceCapture = ({ studentId, onCaptureSuccess }) => {
    const webcamRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    
    const [step, setStep] = useState(-1);
    const [overallProgress, setOverallProgress] = useState(0);
    const [holdProgress, setHoldProgress] = useState(0);
    const [isCapturing, setIsCapturing] = useState(false);
    const [status, setStatus] = useState('Wait for models...');

    const steps = [
        { label: 'Look Up', icon: <ArrowUpwardIcon sx={{ fontSize: 32 }} /> },
        { label: 'Look Down', icon: <ArrowDownwardIcon sx={{ fontSize: 32 }} /> },
        { label: 'Look Left', icon: <ArrowBackIcon sx={{ fontSize: 32 }} /> },
        { label: 'Look Right', icon: <ArrowForwardIcon sx={{ fontSize: 32 }} /> }
    ];

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
        const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })).withFaceLandmarks();

        if (detection) {
            const landmarks = detection.landmarks;
            const nose = landmarks.getNose();
            const leftEye = landmarks.getLeftEye();
            const rightEye = landmarks.getRightEye();
            const jaw = landmarks.getJawOutline();
            const mouth = landmarks.getMouth();

            // Calculate center of eyes
            const eyeCenterX = (leftEye[0].x + rightEye[3].x) / 2;
            const eyeCenterY = (leftEye[0].y + rightEye[3].y) / 2;
            
            // Horizontal Pose (Y-axis rotation)
            // Using nose tip relative to eye center and jaw width
            const jawWidth = jaw[16].x - jaw[0].x;
            const hOffset = (nose[3].x - eyeCenterX) / jawWidth;

            // Vertical Pose (X-axis rotation)
            // Using nose length relative to distance between eyes and mouth
            const eyeToMouthDist = mouth[3].y - eyeCenterY;
            const noseToEyeDist = nose[3].y - eyeCenterY;
            const vRatio = noseToEyeDist / eyeToMouthDist;

            let poseMatched = false;
            const target = steps[step].label;

            // Refined Thresholds
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
    
    // ... existing code ...

    const performCapture = (currentStep) => {
        setIsCapturing(true);
        setStatus('Scanning Angle...');
        
        setTimeout(() => {
            const imageSrc = webcamRef.current.getScreenshot();
            
            // Save to capturedImages array
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
            const response = await api.put(`/users/${studentId}/biometric-face`, {
                imagesBase64: capturedImages
            });
            if (response.data.success) {
                toast.success('Face ID Registered');
                if (onCaptureSuccess) onCaptureSuccess(response.data.data);
                resetCapture();
            }
        } catch (error) {
            toast.error("Upload failed");
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
            <CircularProgress size={30} />
            <Typography variant="caption" display="block" mt={1}>AI Initializing...</Typography>
        </Box>
    );

    return (
        <Box sx={{ width: '100%', maxWidth: 320, mx: 'auto' }}>
            {!finalStep ? (
                <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ 
                        position: 'relative', 
                        width: 200, height: 200, mx: 'auto',
                        borderRadius: '50%', overflow: 'hidden', bgcolor: '#000', 
                        border: '4px solid', 
                        borderColor: holdProgress > 0 ? 'success.main' : (step === -1 ? 'grey.300' : 'primary.main'), 
                        transition: 'border-color 0.2s'
                    }}>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            width="100%"
                            videoConstraints={{ facingMode: "user" }}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        
                        {/* Hold Progress Overlay */}
                        {holdProgress > 0 && (
                            <Box sx={{ 
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                                border: '8px solid rgba(76, 175, 80, 0.4)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <CircularProgress 
                                    variant="determinate" 
                                    value={holdProgress} 
                                    size={184} 
                                    thickness={2}
                                    sx={{ color: 'success.main' }}
                                />
                            </Box>
                        )}

                        {isCapturing && (
                            <Box sx={{ 
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                                bgcolor: 'rgba(26, 115, 232, 0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <CircularProgress color="inherit" />
                            </Box>
                        )}
                    </Box>

                    <Stack spacing={2} sx={{ mt: 3, alignItems: 'center' }}>
                        {step === -1 ? (
                            <Button variant="contained" onClick={startAutoScan} sx={{ borderRadius: 5, px: 4 }}>Start Smart Scan</Button>
                        ) : (
                            <>
                                <Typography variant="subtitle1" fontWeight={700} color={holdProgress > 0 ? 'success.main' : 'primary.main'}>
                                    {status}
                                </Typography>
                                <Paper elevation={0} sx={{ p: 1, bgcolor: 'rgba(26, 115, 232, 0.05)', borderRadius: '50%' }}>
                                    {steps[step]?.icon}
                                </Paper>
                                <Box sx={{ width: '100%', px: 4 }}>
                                    <LinearProgress variant="determinate" value={overallProgress} sx={{ height: 4, borderRadius: 2 }} />
                                    <Typography variant="caption" color="text.secondary">Total Progress: {Math.round(overallProgress)}%</Typography>
                                </Box>
                            </>
                        )}
                    </Stack>
                </Box>
            ) : (
                <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', width: 200, height: 200, mx: 'auto', borderRadius: '50%', overflow: 'hidden', border: '4px solid #2e7d32', mb: 2 }}>
                        <img src={capturedImages[0]} alt="Captured" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(46, 125, 50, 0.1)' }}>
                            <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main' }} />
                        </Box>
                    </Box>
                    <Typography variant="subtitle1" fontWeight={700} color="success.main">Scan Successful!</Typography>
                    <Typography variant="caption" display="block">4 Angles Captured for Smart Attendance</Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Button fullWidth size="small" variant="outlined" onClick={resetCapture}>Retake</Button>
                        <Button fullWidth size="small" variant="contained" color="success" onClick={handleSave} disabled={loading}>
                            {loading ? <CircularProgress size={16} color="inherit" /> : 'Register Face'}
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default FaceCapture;
