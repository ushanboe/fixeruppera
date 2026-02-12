"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X } from "lucide-react";

interface PhotoCaptureProps {
  onCapture: (imageData: string) => void;
}

export default function PhotoCapture({ onCapture }: PhotoCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const processImage = async (file: File) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      let width = img.width;
      let height = img.height;
      const maxSize = 1024;

      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setPreview(dataUrl);
    };

    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setStream(mediaStream);
      setShowCamera(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error("Camera access denied:", error);
      alert("Camera access is required to take photos. Please grant permission or use file upload.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setPreview(dataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const handleConfirm = () => {
    if (preview) {
      onCapture(preview);
    }
  };

  const handleRetake = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (showCamera) {
    return (
      <div className="relative bg-black rounded-3xl overflow-hidden aspect-[3/4] max-h-[70vh] shadow-2xl">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={stopCamera}
              className="btn w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-all active:scale-95"
            >
              <X className="w-7 h-7 text-white" />
            </button>
            <button
              onClick={capturePhoto}
              className="btn w-24 h-24 bg-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              <div className="w-20 h-20 border-4 border-black rounded-full" />
            </button>
            <div className="w-16" />
          </div>
        </div>
      </div>
    );
  }

  if (preview) {
    return (
      <div className="space-y-6 animate-scale-in">
        <div className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
          <img src={preview} alt="Preview" className="w-full h-auto" />
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleRetake}
            className="btn flex-1 px-8 py-4 bg-gray-800 border-2 border-gray-700 text-white rounded-2xl font-bold text-lg hover:bg-gray-700 active:scale-98 transition-all"
          >
            Retake
          </button>
          <button
            onClick={handleConfirm}
            className="btn flex-1 px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg hover:bg-purple-700 active:scale-98 transition-all shadow-lg shadow-purple-900/50"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload photo"
      />

      <button
        onClick={startCamera}
        className="btn w-full bg-gray-900 border-2 border-purple-500 rounded-3xl hover:bg-gray-800 hover:shadow-2xl hover:shadow-purple-900/50 active:scale-98 transition-all group overflow-hidden"
      >
        <div className="flex flex-col items-center gap-5 py-10">
          <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center group-hover:bg-purple-500/30 group-hover:scale-110 transition-all">
            <Camera className="w-10 h-10 text-purple-400" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-xl font-bold text-white mb-1">Take Photo</div>
            <div className="text-sm text-gray-400">Use your camera</div>
          </div>
        </div>
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-800"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-black text-gray-500 font-medium">
            or
          </span>
        </div>
      </div>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="btn w-full bg-gray-900 border-2 border-gray-700 rounded-3xl hover:bg-gray-800 hover:border-gray-600 hover:shadow-lg active:scale-98 transition-all group overflow-hidden"
      >
        <div className="flex flex-col items-center gap-5 py-10">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-gray-700 group-hover:scale-110 transition-all">
            <Upload className="w-10 h-10 text-gray-400" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-xl font-bold text-white mb-1">Upload Photo</div>
            <div className="text-sm text-gray-400">Choose from gallery</div>
          </div>
        </div>
      </button>

      <div className="text-center pt-4">
        <p className="text-sm text-gray-500 leading-relaxed">
          📸 Take a clear, well-lit photo from the front
          <br />
          <span className="text-xs">Works best with the entire item visible</span>
        </p>
      </div>
    </div>
  );
}
