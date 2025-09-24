"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sokmrypoigsarqrdmgpq.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

interface CameraCaptureProps {
  onClose?: () => void;
}

export default function CameraCapture({ onClose }: CameraCaptureProps) {
  if (supabaseKey == undefined) {
    return <p className="text-red-500">Supabase key is missing</p>;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [password, setPassword] = useState("");

  const startCamera = async () => {
    try {
      if (videoRef.current == null) {
        setError("Video element not available");
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setIsCameraOn(true);
      setError(null);

      videoRef.current.onloadedmetadata = () => {
        if (videoRef.current && canvasRef.current) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
        }
      };
    } catch (err) {
      setError("Failed to access camera: " + (err as Error).message);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCameraOn(false);
      setStream(null);
      setPreviewImage(null);
      setTitle("");
      setDescription("");
      setCategory("");
      setPassword("");
    }
  };

  const capturePhoto = () => {
    if (!isCameraOn) {
      setError("Camera is not active");
      return;
    }

    try {
      if (!canvasRef.current || !videoRef.current) {
        setError("Canvas or video not available");
        return;
      }

      const context = canvasRef.current.getContext("2d");
      if (!context) {
        setError("Canvas context not available");
        return;
      }

      context.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const videoAspect = video.videoWidth / video.videoHeight;
      const canvasAspect = canvas.width / canvas.height;

      let drawWidth,
        drawHeight,
        offsetX = 0,
        offsetY = 0;

      if (videoAspect > canvasAspect) {
        drawHeight = canvas.height;
        drawWidth = canvas.height * videoAspect;
        offsetX = (canvas.width - drawWidth) / 2;
      } else {
        drawWidth = canvas.width;
        drawHeight = canvas.width / videoAspect;
        offsetY = (canvas.height - drawHeight) / 2;
      }

      context.drawImage(
        video,
        0,
        0,
        video.videoWidth,
        video.videoHeight,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight
      );

      const imageData = canvasRef.current.toDataURL("image/jpeg", 0.9);
      setPreviewImage(imageData);
      setError(null);
    } catch (err) {
      setError("Error capturing photo: " + (err as Error).message);
    }
  };

  const uploadPhoto = async () => {
    if (!previewImage) {
      setError("No photo to upload");
      return;
    }

    if (!title || !description || !category) {
      setError("Please fill in all fields: title, description, and category");
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }
      );

      const { latitude, longitude } = position.coords;

      const { data, error } = await supabase.from("locations_db").insert([
        {
          photo: previewImage,
          latitude: latitude,
          longitude: longitude,
          title: title,
          description: description,
          category: category,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        throw new Error("Failed to save to Supabase: " + error.message);
      }

      setError("Photo and details saved successfully!");
      stopCamera();
    } catch (err) {
      setError("Error: " + (err as Error).message);
    }
  };

  useEffect(() => {
    startCamera();
  }, []);

  return (
    <div className="flex flex-col items-center pb-4 bg-white lg:rounded-xl h-full w-full lg:w-auto lg:h-[40em] relative">
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 transition-all duration-200"
          aria-label="Close camera"
        >
          ×
        </button>
      )}
      {previewImage ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            className="w-full lg:w-[540px] h-[460px] bg-black lg:rounded-t-xl rounded-t-none"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="gap-2 w-full">
            {!isCameraOn ? (
              <div className="w-full mt-5">
                <p className="text-sm text-center">Status: {error}</p>
                <div
                  onClick={startCamera}
                  className="flex justify-center items-center w-full mt-5"
                >
                  <img
                    className="mb-5 h-15 w-15 bg-black rounded-full p-5 outline-black outline-2 outline-offset-2 cursor-pointer duration-300"
                    src={"/activate.svg"}
                  ></img>
                </div>
              </div>
            ) : (
              <>
                <div className="w-full">
                  <div
                    onClick={capturePhoto}
                    className="flex justify-center items-center w-full mt-5"
                  >
                    <img
                      className="mb-5 h-15 w-15 bg-black rounded-full p-5 outline-black outline-2 outline-offset-2 cursor-pointer duration-300"
                      src={"/photo.svg"}
                    ></img>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center w-full h-full">
          <img
            src={previewImage}
            alt="Captured preview"
            className="w-full lg:w-[540px] h-[460px] bg-black lg:rounded-t-xl rounded-t-none object-cover"
          />
          <div className="w-full">
            <div className="lg:h-[13em] overflow-auto w-full">
              <div className="w-full">
                <p
                  onClick={async () => {
                    stopCamera();
                    await startCamera();
                  }}
                  className="block px-4 py-2 text-sm bg-gray-500 text-white text-center hover:brightness-[90%] duration-300 cursor-pointer"
                >
                  Retake Photo
                </p>
              </div>
           <div className="flex flex-col w-full">
               <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title *"
                  className="p-3 w-full outline-none border-b-[.1em] border-gray-300"
                />
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Category *"
                  className="p-3 w-full outline-none border-b-[.1em] border-l-[.1em] border-gray-300"
                />
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description *"
                  className="p-3 w-full outline-none border-b-[.1em] border-gray-300"
                />
                
                                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Password (Optional)"
                  className="p-3 w-full outline-none border-b-[.1em] border-gray-300"
                />
                {/*<p className="text-xs my-5 px-3 lg:w-[35em]">*Password is for you to unlock modification options after you have shared your location; it is optional, but recommended.</p>*/}
             
                         <div
              onClick={uploadPhoto}
              className="flex justify-center items-center w-full mt-5"
            >
              <img
                className="mb-5 h-15 w-15 bg-black rounded-full p-5 outline-black outline-2 outline-offset-2 cursor-pointer duration-300"
                src={"/upolad.svg"}
              ></img>
            </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
