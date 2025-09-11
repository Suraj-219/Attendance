import { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function CameraTest() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraInfo, setCameraInfo] = useState<string>('');

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setCameraInfo('Requesting camera access...');

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Get camera info
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const settings = videoTrack.getSettings();
          setCameraInfo(`Camera: ${videoTrack.label || 'Unknown'} | Resolution: ${settings.width}x${settings.height}`);
        }
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              setIsStreaming(true);
              setCameraInfo(prev => prev + ' | Status: Active');
            }).catch((playError) => {
              console.error('Error playing video:', playError);
              setError('Failed to start video playback.');
            });
          }
        };
        
        videoRef.current.onerror = (error) => {
          console.error('Video error:', error);
          setError('Video playback error.');
        };
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permissions and try again.');
        } else if (error.name === 'NotFoundError') {
          setError('No camera found. Please connect a camera and try again.');
        } else {
          setError(`Failed to access camera: ${error.message}`);
        }
      } else {
        setError('Failed to access camera. Please try again.');
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
      setCameraInfo('');
    }
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Camera Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-4">
          <Button 
            onClick={isStreaming ? stopCamera : startCamera}
            className="mr-2"
          >
            {isStreaming ? (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Stop Camera
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </>
            )}
          </Button>
          <Button 
            onClick={startCamera}
            variant="outline"
            disabled={!isStreaming}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Restart
          </Button>
        </div>

        {cameraInfo && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{cameraInfo}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <div className="relative bg-gray-100 rounded-lg border overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-auto min-h-[300px] object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror the video
          />
          {!isStreaming && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-500">
                <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Click "Start Camera" to test</p>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Troubleshooting Tips:</strong></p>
          <p>• Make sure your camera is connected and not being used by another app</p>
          <p>• Allow camera permissions when prompted by your browser</p>
          <p>• Try refreshing the page if the camera doesn't start</p>
          <p>• Check if your browser supports camera access (Chrome, Firefox, Safari)</p>
        </div>
      </CardContent>
    </Card>
  );
}



