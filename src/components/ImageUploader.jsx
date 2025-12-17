import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, X, RefreshCw } from 'lucide-react';

export default function ImageUploader({ onImageUpload }) {
    const [dragActive, setDragActive] = useState(false);

    // Camera State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [facingMode, setFacingMode] = useState('environment'); // 'user' or 'environment'

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const startCamera = async () => {
        setIsCameraOpen(true);
        setCameraError(null);
        try {
            const constraints = {
                video: {
                    facingMode: facingMode
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera Error:", err);
            setCameraError("Could not access camera. Please ensure you are on HTTPS or localhost and have granted permission.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraOpen(false);
    };

    const switchCamera = () => {
        setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
        // We need to restart the stream with new constraints
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };

    // Effect to restart camera when facingMode changes if it's already open
    useEffect(() => {
        if (isCameraOpen) {
            startCamera();
        }
    }, [facingMode]);

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Set canvas size to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = canvas.toDataURL('image/jpeg');
            onImageUpload(imageData);
            stopCamera();
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                onImageUpload(reader.result);
            };
        } else {
            alert("Please upload an image file.");
        }
    };

    return (
        <div className="animate-fade-in" style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>

            {/* Camera Modal Overlay */}
            {isCameraOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1000,
                    background: 'black',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* Close Button */}
                    <button
                        onClick={stopCamera}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1001
                        }}
                    >
                        <X size={24} />
                    </button>

                    {cameraError ? (
                        <div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>
                            <p>{cameraError}</p>
                            <button
                                onClick={stopCamera}
                                className="btn-primary"
                                style={{ marginTop: '1rem' }}
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Video Preview */}
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />

                            {/* Controls Bar */}
                            <div style={{
                                position: 'absolute',
                                bottom: '2rem',
                                left: 0,
                                right: 0,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '2rem'
                            }}>
                                {/* Switch Camera Button */}
                                <button
                                    onClick={switchCamera}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: '50px',
                                        height: '50px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <RefreshCw size={24} />
                                </button>

                                {/* Shutter Button */}
                                <button
                                    onClick={capturePhoto}
                                    style={{
                                        width: '70px',
                                        height: '70px',
                                        borderRadius: '50%',
                                        background: 'white',
                                        border: '4px solid rgba(255,255,255,0.5)',
                                        boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                                    }}
                                />

                                {/* Placeholder for symmetry */}
                                <div style={{ width: '50px' }}></div>
                            </div>
                        </>
                    )}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
            )}

            {/* Main Drag & Drop Area */}
            <div
                className="glass-panel"
                style={{ padding: '3rem', textAlign: 'center', cursor: 'default', width: '100%', border: dragActive ? '2px dashed var(--accent-color)' : '2px dashed var(--glass-border)' }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="input-file-upload"
                    style={{ display: 'none' }}
                    onChange={handleChange}
                    accept="image/*"
                />
                <label htmlFor="input-file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1.5rem', borderRadius: '50%' }}>
                        <Upload size={48} color="var(--accent-color)" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Upload Receipt</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Drag & drop or click to browse</p>
                    </div>
                </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', color: 'var(--text-secondary)' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                <span>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
            </div>

            <button
                className="glass-panel"
                onClick={startCamera}
                style={{
                    width: '100%',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: 'rgba(99, 102, 241, 0.1)',
                    borderColor: 'var(--accent-color)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                }}
            >
                <Camera size={24} color="var(--accent-color)" />
                Open Camera
            </button>

        </div>
    );
}
