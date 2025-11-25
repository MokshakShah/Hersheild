"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Camera, Mic, Ban, ImageUp, Square, PhoneIncoming, Loader2, Repeat2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useRouter } from 'next/navigation';
import { FakeCall } from './FakeCall';
import { evidenceService, type EvidenceLocation } from '../services/evidence';



export function ActionButtons() {
    const { toast } = useToast();
    const router = useRouter();

    // Camera state
    const [showCamera, setShowCamera] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isCameraLoading, setIsCameraLoading] = useState(false); // Loading state for camera
    const [isSavingPhoto, setIsSavingPhoto] = useState(false); // Loading state for photo saving
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment'); // Track camera facing mode
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Audio State
    const [isRecording, setIsRecording] = useState(false);
    const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
    const [isSavingAudio, setIsSavingAudio] = useState(false); // Loading state for audio saving
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Fake Call State
    const [isCallActive, setIsCallActive] = useState(false);
    const [showTimerOptions, setShowTimerOptions] = useState(false);
    const callTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Stop camera stream when component unmounts or camera is hidden
        return () => {
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach((track) => track.stop());
            }
            if (callTimerRef.current) {
                clearTimeout(callTimerRef.current);
            }
        };
    }, []);

    const setupCameraStream = async (camera: 'user' | 'environment' = 'environment') => {
        setIsCameraLoading(true);
        try {
            // Stop existing stream before switching cameras
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach((track) => track.stop());
            }

            // Request camera with specified facing mode
            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode: { ideal: camera }
                }
            };
            
            try {
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                setHasCameraPermission(true);
                setFacingMode(camera);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (specificCameraError) {
                // If requested camera is not available, try the other one
                console.warn(`${camera} camera not available, trying alternative:`, specificCameraError);
                const alternativeCamera = camera === 'environment' ? 'user' : 'environment';
                const alternativeConstraints: MediaStreamConstraints = {
                    video: {
                        facingMode: { ideal: alternativeCamera }
                    }
                };
                const stream = await navigator.mediaDevices.getUserMedia(alternativeConstraints);
                setHasCameraPermission(true);
                setFacingMode(alternativeCamera);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions in your browser settings.',
            });
        } finally {
            setIsCameraLoading(false);
        }
    };

    const handleToggleCamera = () => {
        if (!showCamera) {
            setShowCamera(true);
            setupCameraStream('environment'); // Start with back camera
        } else {
            setShowCamera(false);
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach((track) => track.stop());
                videoRef.current.srcObject = null;
            }
        }
    };

    const handleFlipCamera = async () => {
        const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
        await setupCameraStream(newFacingMode);
    };



    const saveEvidence = async (type: 'photo' | 'audio', dataUri: string, location: EvidenceLocation | null) => {
        try {
            // Save immediately without waiting for optimization
            const evidence = await evidenceService.saveEvidence(type, dataUri, location);
            
            toast({
                title: `${type === 'photo' ? 'Photo' : 'Audio'} Captured & Saved`,
                description: "Evidence saved successfully. View it on the Evidence page.",
                action: <Button variant="outline" size="sm" onClick={() => router.push('/evidence')}>View</Button>
            });
        } catch (error) {
            console.error("Failed to save evidence:", error);
            toast({
                variant: 'destructive',
                title: "Storage Error",
                description: `Could not save ${type}. ${error instanceof Error ? error.message : 'Unknown error'}`,
            });
        }
    };

    const getCurrentLocation = (): Promise<EvidenceLocation | null> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve(null);
                return;
            }
            
            // Set a timeout to avoid blocking
            const timeoutId = setTimeout(() => {
                resolve(null);
            }, 3000); // 3 second timeout
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    clearTimeout(timeoutId);
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                    });
                },
                () => {
                    clearTimeout(timeoutId);
                    resolve(null); // Error getting location
                },
                {
                    timeout: 3000,
                    enableHighAccuracy: false, // Use faster, less accurate location
                    maximumAge: 60000 // Accept cached location up to 1 minute old
                }
            );
        });
    };

    const handleCaptureAndAlert = async () => {
        if (!canvasRef.current || !videoRef.current || !videoRef.current.srcObject) return;
        setIsSavingPhoto(true);

        const canvas = canvasRef.current;
        const video = videoRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);

        const photoDataUri = canvas.toDataURL('image/jpeg', 0.8); // Slightly lower quality for faster processing

        // Get location in background - don't wait for it
        const locationPromise = getCurrentLocation();

        try {
            await saveEvidence('photo', photoDataUri, await locationPromise);
        } finally {
            setIsSavingPhoto(false);
            handleToggleCamera(); // Turn off camera
        }
    };

    const handleRecordToggle = async () => {
        if (isRecording) {
            // Stop recording
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
            setIsRecording(false);
            // onstop will handle saving
        } else {
            // Start recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setHasMicPermission(true);
                mediaRecorderRef.current = new MediaRecorder(stream);

                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                mediaRecorderRef.current.onstop = async () => {
                    setIsSavingAudio(true);
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });

                    // Get location in background - don't wait for it
                    const locationPromise = getCurrentLocation();

                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = async () => {
                        const base64Audio = reader.result as string;
                        try {
                            await saveEvidence('audio', base64Audio, await locationPromise);
                        } finally {
                            setIsSavingAudio(false);
                        }
                    };

                    audioChunksRef.current = [];
                    stream.getTracks().forEach(track => track.stop()); // Release mic
                    setHasMicPermission(null);
                };

                audioChunksRef.current = [];
                mediaRecorderRef.current.start();
                setIsRecording(true);
                toast({ title: "Recording started..." });

            } catch (error) {
                console.error('Error accessing microphone:', error);
                setHasMicPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Microphone Access Denied',
                    description: 'Please enable microphone permissions in your browser settings.',
                });
            }
        }
    };

    const handleScheduleCall = (delay: number) => {
        setShowTimerOptions(false);
        toast({
            title: 'Fake Call Scheduled',
            description: `The call will start in ${delay / 1000} seconds.`,
        });
        if (callTimerRef.current) {
            clearTimeout(callTimerRef.current);
        }
        callTimerRef.current = setTimeout(() => {
            setIsCallActive(true);
        }, delay);
    };

    if (isCallActive) {
        return <FakeCall onEndCall={() => setIsCallActive(false)} />;
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Instantly capture evidence or schedule a distraction.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center gap-4">
                {showCamera ? (
                    <div className="flex flex-col gap-4 items-center">
                        <div className="w-full relative">
                            <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                            {hasCameraPermission === false && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-md">
                                    <Alert variant="destructive" className="w-auto bg-destructive/90 text-destructive-foreground border-0">
                                        <AlertTitle>Camera Denied</AlertTitle>
                                        <AlertDescription>
                                            Please enable camera access.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            )}
                            {isCameraLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                                    <Loader2 className="animate-spin h-8 w-8 text-white" />
                                </div>
                            )}
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="flex w-full gap-2 flex-wrap justify-center">
                            <Button
                                className="flex-1 min-w-[120px]"
                                onClick={handleCaptureAndAlert}
                                disabled={hasCameraPermission !== true || isSavingPhoto || isCameraLoading}
                            >
                                {isSavingPhoto ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <ImageUp className="mr-2 h-5 w-5" />
                                        Capture
                                    </>
                                )}
                            </Button>
                            <Button 
                                className="flex-1 min-w-[120px]" 
                                variant="secondary" 
                                onClick={handleFlipCamera}
                                disabled={isSavingPhoto || isCameraLoading}
                                title={facingMode === 'environment' ? 'Switch to Front Camera' : 'Switch to Back Camera'}
                            >
                                <Repeat2 className="mr-2 h-5 w-5" />
                                Flip
                            </Button>
                            <Button className="flex-1 min-w-[120px]" variant="outline" onClick={handleToggleCamera} disabled={isSavingPhoto || isCameraLoading}>
                                <Ban className="mr-2 h-5 w-5" />
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : showTimerOptions ? (
                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium text-center mb-2">Start call in:</p>
                        <Button variant="outline" onClick={() => handleScheduleCall(10000)}>10 seconds</Button>
                        <Button variant="outline" onClick={() => handleScheduleCall(30000)}>30 seconds</Button>
                        <Button variant="outline" onClick={() => handleScheduleCall(60000)}>1 minute</Button>
                        <Button variant="secondary" onClick={() => setShowTimerOptions(false)}>Cancel</Button>
                    </div>
                ) : (
                    <>
                        <Button className="w-full" variant="outline" onClick={handleToggleCamera} disabled={isCameraLoading}>
                            {isCameraLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Loading Camera...
                                </>
                            ) : (
                                <>
                                    <Camera className="mr-2 h-5 w-5" />
                                    Capture Photo
                                </>
                            )}
                        </Button>
                        <Button
                            className="w-full"
                            variant={isRecording ? 'destructive' : 'outline'}
                            onClick={handleRecordToggle}
                            disabled={isSavingAudio}
                        >
                            {isSavingAudio ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Saving...
                                </>
                            ) : isRecording ? (
                                <>
                                    <Square className="mr-2 h-5 w-5" />
                                    Stop Recording
                                </>
                            ) : (
                                <>
                                    <Mic className="mr-2 h-5 w-5" />
                                    Record Audio
                                </>
                            )}
                        </Button>
                        <Button className="w-full" variant="outline" onClick={() => setShowTimerOptions(true)}>
                            <PhoneIncoming className="mr-2 h-5 w-5" />
                            Schedule Fake Call
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}