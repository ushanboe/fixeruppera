"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, Upload, X, Check } from "lucide-react";

interface DualPhotoCaptureProps {
  onCapture: (beforeImage: string, targetImage: string) => void;
}

type CameraTarget = "before" | "target" | null;

export default function DualPhotoCapture({ onCapture }: DualPhotoCaptureProps) {
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [targetImage, setTargetImage] = useState<string | null>(null);
  const [cameraTarget, setCameraTarget] = useState<CameraTarget>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const targetInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const processImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
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
        resolve(dataUrl);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "before" | "target"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await processImage(file);
      if (target === "before") {
        setBeforeImage(dataUrl);
      } else {
        setTargetImage(dataUrl);
      }
    }
  };

  const startCamera = useCallback(async (target: "before" | "target") => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setStream(mediaStream);
      setCameraTarget(target);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error("Camera access denied:", error);
      alert("Camera access is required to take photos. Please grant permission or use file upload.");
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && cameraTarget) {
      const canvas = document.createElement("canvas");
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

      if (cameraTarget === "before") {
        setBeforeImage(dataUrl);
      } else {
        setTargetImage(dataUrl);
      }

      stopCamera();
    }
  }, [cameraTarget]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraTarget(null);
  }, [stream]);

  const handleContinue = () => {
    if (beforeImage && targetImage) {
      onCapture(beforeImage, targetImage);
    }
  };

  const handleClearBefore = () => {
    setBeforeImage(null);
    if (beforeInputRef.current) {
      beforeInputRef.current.value = "";
    }
  };

  const handleClearTarget = () => {
    setTargetImage(null);
    if (targetInputRef.current) {
      targetInputRef.current.value = "";
    }
  };

  // Camera overlay — shared for both before and target
  if (cameraTarget) {
    return (
      <div className="relative bg-black rounded-3xl overflow-hidden aspect-[3/4] max-h-[70vh] shadow-2xl">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {/* Label which photo we're capturing */}
        <div className="absolute top-4 left-4 bg-black/60 text-white text-sm font-bold px-3 py-1.5 rounded-lg">
          {cameraTarget === "before" ? "Before Photo" : "Target Inspiration"}
        </div>
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

  return (
    <div className="space-y-6">
      {/* Before Photo */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">1. Before Photo</h3>
          {beforeImage && (
            <button
              onClick={handleClearBefore}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              Change
            </button>
          )}
        </div>

        {beforeImage ? (
          <div className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-green-500">
            <img src={beforeImage} alt="Before" className="w-full h-auto" />
            <div className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
          </div>
        ) : (
          <>
            <input
              ref={beforeInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, "before")}
              className="hidden"
              aria-label="Upload before photo"
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => startCamera("before")}
                className="btn bg-gray-900 border-2 border-purple-500 rounded-2xl hover:bg-gray-800 hover:shadow-lg active:scale-98 transition-all group overflow-hidden"
              >
                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center group-hover:bg-purple-500/30 group-hover:scale-110 transition-all">
                    <Camera className="w-7 h-7 text-purple-400" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-base font-bold text-white mb-0.5">Take Photo</div>
                    <div className="text-xs text-gray-400">Use camera</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => beforeInputRef.current?.click()}
                className="btn bg-gray-900 border-2 border-gray-700 rounded-2xl hover:bg-gray-800 hover:border-green-500 hover:shadow-lg active:scale-98 transition-all group overflow-hidden"
              >
                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-green-500/20 group-hover:scale-110 transition-all">
                    <Upload className="w-7 h-7 text-gray-400 group-hover:text-green-400" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-base font-bold text-white mb-0.5">Upload</div>
                    <div className="text-xs text-gray-400">From gallery</div>
                  </div>
                </div>
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center">Current state of your furniture</p>
          </>
        )}
      </div>

      {/* Target Photo */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">2. Target Inspiration</h3>
          {targetImage && (
            <button
              onClick={handleClearTarget}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              Change
            </button>
          )}
        </div>

        {targetImage ? (
          <div className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-green-500">
            <img src={targetImage} alt="Target" className="w-full h-auto" />
            <div className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
          </div>
        ) : (
          <>
            <input
              ref={targetInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, "target")}
              className="hidden"
              aria-label="Upload target inspiration photo"
            />
            <div className={`grid grid-cols-2 gap-3 ${!beforeImage ? "opacity-40 pointer-events-none" : ""}`}>
              <button
                onClick={() => startCamera("target")}
                className="btn bg-gray-900 border-2 border-purple-500 rounded-2xl hover:bg-gray-800 hover:shadow-lg active:scale-98 transition-all group overflow-hidden"
              >
                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center group-hover:bg-purple-500/30 group-hover:scale-110 transition-all">
                    <Camera className="w-7 h-7 text-purple-400" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-base font-bold text-white mb-0.5">Take Photo</div>
                    <div className="text-xs text-gray-400">Use camera</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => targetInputRef.current?.click()}
                className="btn bg-gray-900 border-2 border-gray-700 rounded-2xl hover:bg-gray-800 hover:border-green-500 hover:shadow-lg active:scale-98 transition-all group overflow-hidden"
              >
                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-green-500/20 group-hover:scale-110 transition-all">
                    <Upload className="w-7 h-7 text-gray-400 group-hover:text-green-400" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-base font-bold text-white mb-0.5">Upload</div>
                    <div className="text-xs text-gray-400">From gallery</div>
                  </div>
                </div>
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center">Pinterest, marketplace, or any style you like</p>
          </>
        )}
      </div>

      {/* Continue Button */}
      {beforeImage && targetImage && (
        <button
          onClick={handleContinue}
          className="btn w-full px-8 py-4 bg-green-600 text-white rounded-2xl font-bold text-lg hover:bg-green-700 active:scale-98 transition-all shadow-lg shadow-green-900/50 animate-scale-in"
        >
          Continue to Details
        </button>
      )}

      {/* Helper Text */}
      <div className="text-center pt-4">
        <p className="text-sm text-gray-500 leading-relaxed">
          AI will analyze both photos to create a transformation plan
          <br />
          <span className="text-xs">Works best with similar furniture types</span>
        </p>
      </div>
    </div>
  );
}
