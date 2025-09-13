"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sokmrypoigsarqrdmgpq.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

export default function CameraCapture() {
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
    }
  };

  const capturePhoto = () => {
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

      context.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      const imageData = canvasRef.current.toDataURL("image/jpeg");
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
    <div className="flex flex-col items-center pb-4 bg-white rounded-xl w-full h-full lg:w-auto lg:h-auto">
      {!previewImage ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            className="w-full lg:w-[540px] h-[460px] bg-black lg:rounded-t-xl rounded-t-none"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-2 w-full">
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
                  <p
                    onClick={stopCamera}
                    className="block px-4 py-2 text-sm bg-gray-500 text-white text-center hover:brightness-[90%] duration-300 cursor-pointer"
                  >
                    Stop Camera
                  </p>

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
        <div className="flex flex-col items-center gap-4">
          <img
            src={previewImage}
            alt="Captured preview"
            className="w-full lg:w-[540px] h-[460px] bg-black lg:rounded-t-xl rounded-t-none"
          />
          <div className="flex flex-col gap-2 w-full max-w-md">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
              className="px-2 py-1 border rounded"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className="px-2 py-1 border rounded"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-2 py-1 border rounded"
            >
              <option value="">Select category</option>
              <option value="landscape">Landscape</option>
              <option value="urban">Urban</option>
              <option value="nature">Nature</option>
              <option value="other">Other</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={uploadPhoto}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Upload Photo
              </button>
              <button
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Retake Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
