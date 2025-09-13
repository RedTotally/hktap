'use client';

import { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setIsCameraOn(true);
      setError(null);
    } catch (err) {
      setError('Failed to access camera: ' + (err as Error).message);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCameraOn(false);
      setStream(null);
    }
  };

  const capturePhoto = async () => {
    if (!isCameraOn) {
      setError('Camera is not active');
      return;
    }

    try {
      if (!canvasRef.current || !videoRef.current) {
        setError('Camera elements not available');
        return;
      }
      
      const context = canvasRef.current.getContext('2d');
      if (!context) {
        setError('Canvas context not available');
        return;
      }
      
      context.drawImage(videoRef.current, 0, 0, 640, 480);
      const imageData = canvasRef.current.toDataURL('image/jpeg');

      // Get geolocation
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      // Save to Supabase
      const { data, error } = await supabase
        .from('photos')
        .insert([
          {
            image_data: imageData,
            coordinates: [latitude, longitude],
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        throw new Error('Failed to save to Supabase: ' + error.message);
      }

      setError('Photo and coordinates saved successfully!');
      stopCamera();
    } catch (err) {
      setError('Error: ' + (err as Error).message);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <video ref={videoRef} autoPlay className="w-[640px] h-[480px] border" />
      <canvas ref={canvasRef} width="640" height="480" className="hidden" />
      <div className="flex gap-2">
        {!isCameraOn ? (
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Enable Camera
          </button>
        ) : (
          <>
            <button
              onClick={capturePhoto}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Capture Photo
            </button>
            <button
              onClick={stopCamera}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Stop Camera
            </button>
          </>
        )}
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}