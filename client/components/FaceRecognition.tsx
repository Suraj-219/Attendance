import { useRef, useEffect, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Camera, CheckCircle, XCircle } from 'lucide-react';
import { recognizeFace } from '@/lib/faceRecognition';

interface FaceRecognitionProps {
  onFaceDetected?: (descriptor: Float32Array) => void;
  onError: (error: string) => void;
  mode: 'capture' | 'recognize';
  onRecognized?: (user: { name: string; email: string }) => void;
}

export default function FaceRecognition({ 
  onFaceDetected, 
  onError, 
  mode, 
  onRecognized 
}: FaceRecognitionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectionResult, setDetectionResult] = useState<'success' | 'error' | null>(null);
  const [message, setMessage] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null; error: string | null }>({
    latitude: null,
    longitude: null,
    error: null
  });

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        setMessage('Loading face recognition models...');
        
        // Load the models from public directory
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        
        setModelsLoaded(true);
        setMessage('Models loaded successfully');
      } catch (error) {
        console.error('Error loading models:', error);
        onError('Failed to load face recognition models');
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, [onError]);


  // Get GPS location
  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation({ latitude: null, longitude: null, error: 'Geolocation is not supported by this browser.' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null
        });
        setMessage('Location acquired successfully.');
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setLocation({ latitude: null, longitude: null, error: errorMessage });
        setMessage(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      if (!modelsLoaded) {
        onError('Models not loaded yet');
        return;
      }

      setMessage('Starting camera...');
      setCameraError(null);

      // Get GPS location when starting camera
      getLocation();
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      // Try preferred constraints first; fall back to a generic request on failure
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });
      } catch (constraintError) {
        console.warn('Preferred constraints failed, retrying with generic video...', constraintError);
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;

        // Some browsers fire loadedmetadata immediately; ensure we attempt play either way
        const startPlayback = async () => {
          try {
            await video.play();
            setIsStreaming(true);
            setMessage('Camera started. Position your face in the frame.');
            setCameraError(null);
          } catch (playError) {
            console.error('Error playing video:', playError);
            setCameraError('Failed to start video playback.');
            onError('Failed to start video playback.');
          }
        };

        if (video.readyState >= 1) {
          // HAVE_METADATA or more
          await startPlayback();
        } else {
          const handler = async () => {
            video.removeEventListener('loadedmetadata', handler);
            await startPlayback();
          };
          video.addEventListener('loadedmetadata', handler, { once: true });
        }

        // As an extra safety, retry playback once after a short delay if not streaming
        setTimeout(() => {
          if (!video.paused && isStreaming) return;
          startPlayback();
        }, 1200);

        video.onerror = (error) => {
          console.error('Video error:', error);
          setCameraError('Video playback error.');
          onError('Video playback error. Please try again.');
        };
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      setCameraError('Camera access failed');
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          onError('Camera access denied. Please allow camera permissions and try again.');
        } else if (error.name === 'NotFoundError') {
          onError('No camera found. Please connect a camera and try again.');
        } else {
          onError('Failed to access camera. Please check permissions and try again.');
        }
      } else {
        onError('Failed to access camera. Please try again.');
      }
    }
  }, [modelsLoaded, onError, getLocation]);

  // No auto-start: camera will only start when user clicks "Start Camera"

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
      setMessage('');
    }
  }, []);

  // Detect face and extract descriptor
  const detectFace = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;

    try {
      setIsDetecting(true);
      setMessage('Detecting face...');
      setDetectionResult(null);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Detect face and landmarks
      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

        if (detections) {
        const descriptor = detections.descriptor;
        
        if (mode === 'capture') {
          onFaceDetected?.(descriptor);
          setDetectionResult('success');
          setMessage('Face captured successfully!');
        } else if (mode === 'recognize') {
          // For recognition, we'll compare with stored descriptors
          const result = recognizeFace(descriptor);
          if (result.success && result.user) {
            setDetectionResult('success');
            setMessage(result.message);
            onRecognized?.(result.user);
          } else {
            setDetectionResult('error');
            setMessage(result.message);
          }
        }
      } else {
        setDetectionResult('error');
        setMessage('No face detected. Please ensure your face is visible.');
      }
    } catch (error) {
      console.error('Error detecting face:', error);
      setDetectionResult('error');
      setMessage('Error detecting face. Please try again.');
      onError('Face detection failed');
    } finally {
      setIsDetecting(false);
    }
  }, [modelsLoaded, mode, onFaceDetected, onRecognized, onError]);


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          {mode === 'capture' ? 'Capture Face' : 'Face Recognition'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        )}

        {!isLoading && !isStreaming && (
          <div className="text-center py-8 space-y-4">
            <Button onClick={startCamera} disabled={!modelsLoaded}>
              <Camera className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
            {!modelsLoaded && (
              <p className="text-sm text-muted-foreground">
                Loading face recognition models...
              </p>
            )}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Make sure your camera is connected and not being used by another app</p>
              <p>• Allow camera permissions when prompted</p>
              <p>• Ensure good lighting for better face detection</p>
            </div>
          </div>
        )}

        {isStreaming && (
          <div className="space-y-4">
            <div className="relative bg-gray-100 rounded-lg border overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-auto min-h-[300px] object-cover"
                style={{ transform: 'scaleX(-1)' }} // Mirror the video
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ transform: 'scaleX(-1)' }} // Mirror the canvas
              />
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-90">
                  <div className="text-center text-red-600">
                    <XCircle className="h-12 w-12 mx-auto mb-2" />
                    <p className="font-medium">Camera Error</p>
                    <p className="text-sm mb-3">{cameraError}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCameraError(null);
                        startCamera();
                      }}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Location Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Location Information</h3>
              {location.error ? (
                <p className="text-sm text-red-600">{location.error}</p>
              ) : location.latitude && location.longitude ? (
                <div className="text-sm text-blue-700">
                  <p>Latitude: {location.latitude.toFixed(6)}</p>
                  <p>Longitude: {location.longitude.toFixed(6)}</p>
                </div>
              ) : (
                <p className="text-sm text-blue-600">Acquiring location...</p>
              )}
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                onClick={detectFace}
                disabled={isDetecting}
                className="flex-1"
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    {mode === 'capture' ? 'Capture Face' : 'Recognize Face'}
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={stopCamera}>
                Stop Camera
              </Button>
            </div>
          </div>
        )}

        {message && (
          <Alert className={detectionResult === 'success' ? 'border-green-200 bg-green-50' : 
                           detectionResult === 'error' ? 'border-red-200 bg-red-50' : ''}>
            <div className="flex items-center gap-2">
              {detectionResult === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
              {detectionResult === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
              <AlertDescription>{message}</AlertDescription>
            </div>
          </Alert>
        )}

        {!modelsLoaded && !isLoading && (
          <Alert>
            <AlertDescription>
              Face recognition models failed to load. Please refresh the page and try again.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
