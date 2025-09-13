"use client";

import { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sokmrypoigsarqrdmgpq.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

export default function CameraCapture() {
  // Check if Supabase is configured
  if (supabaseKey == undefined) {
    return (
      <div className="flex flex-col items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 font-medium">⚠️ Supabase not configured</p>
        <p className="text-yellow-700 text-sm text-center">
          Please add NEXT_PUBLIC_SUPABASE_KEY to your .env file to enable photo saving.
        </p>
      </div>
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>("unknown");

  const startCamera = async () => {
    try {
      if (videoRef.current == null) {
        return;
      }

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera access is not supported in this browser");
        setPermissionStatus("not-supported");
        return;
      }

      // Request camera permission
      setPermissionStatus("requesting");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
      });
      
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setIsCameraOn(true);
      setError(null);
      setPermissionStatus("granted");
    } catch (err) {
      const error = err as Error;
      setPermissionStatus("denied");
      
      if (error.name === "NotAllowedError") {
        setError("Camera permission denied. Please allow camera access and try again.");
      } else if (error.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else if (error.name === "NotReadableError") {
        setError("Camera is already in use by another application.");
      } else {
        setError("Failed to access camera: " + error.message);
      }
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
      setError("Camera is not active");
      return;
    }

    try {
      if (!canvasRef.current) {
        setError("Canvas not available");
        return;
      }

      const context = canvasRef.current.getContext("2d");
      if (!context) {
        setError("Canvas context not available");
        return;
      }

      if (!videoRef.current) {
        setError("Video element not available");
        return;
      }
      context.drawImage(videoRef.current, 0, 0, 640, 480);
      const imageData = canvasRef.current.toDataURL("image/jpeg");

      // Get geolocation
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }
      );

      const { latitude, longitude } = position.coords;

      // Save to Supabase
      const { data, error } = await supabase.from("photos").insert([
        {
          image_data: imageData,
          coordinates: [latitude, longitude],
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        throw new Error("Failed to save to Supabase: " + error.message);
      }

      setError("Photo and coordinates saved successfully!");
      stopCamera();
    } catch (err) {
      setError("Error: " + (err as Error).message);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">📸 Camera Capture</h2>
      
      {/* Camera Video */}
      <div className="relative">
        <video 
          ref={videoRef} 
          autoPlay 
          className="w-full max-w-[640px] h-auto border-2 border-gray-300 rounded-lg"
          style={{ display: isCameraOn ? 'block' : 'none' }}
        />
        {!isCameraOn && (
          <div className="w-full max-w-[640px] h-[480px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">📷</div>
              <p className="text-lg">Camera not active</p>
              <p className="text-sm">Click "Enable Camera" to start</p>
            </div>
          </div>
        )}
      </div>
      
      <canvas ref={canvasRef} width="640" height="480" className="hidden" />
      
      {/* Control Buttons */}
      <div className="flex gap-3 flex-wrap justify-center">
        {!isCameraOn ? (
          <button
            onClick={startCamera}
            disabled={permissionStatus === "requesting"}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              permissionStatus === "requesting"
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {permissionStatus === "requesting" ? "Requesting Access..." : "Enable Camera"}
          </button>
        ) : (
          <>
            <button
              onClick={capturePhoto}
              className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              📸 Capture Photo
            </button>
            <button
              onClick={stopCamera}
              className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              ⏹️ Stop Camera
            </button>
          </>
        )}
      </div>
      
      {/* Permission Status */}
      {permissionStatus === "granted" && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <span>✅</span>
          <span>Camera access granted</span>
        </div>
      )}
      
      {/* Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full max-w-md">
          <p className="text-red-800 text-sm font-medium">⚠️ {error}</p>
          {permissionStatus === "denied" && (
            <p className="text-red-700 text-xs mt-2">
              Tip: Check your browser's camera permissions in the address bar or browser settings.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
