"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X, Check } from "lucide-react";

interface DualPhotoCaptureProps {
  onCapture: (beforeImage: string, targetImage: string) => void;
}

export default function DualPhotoCapture({ onCapture }: DualPhotoCaptureProps) {
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [targetImage, setTargetImage] = useState<string | null>(null);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const targetInputRef = useRef<HTMLInputElement>(null);

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

  const handleBeforeSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await processImage(file);
      setBeforeImage(dataUrl);
    }
  };

  const handleTargetSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await processImage(file);
      setTargetImage(dataUrl);
    }
  };

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
              onChange={handleBeforeSelect}
              className="hidden"
              aria-label="Upload before photo"
            />
            <button
              onClick={() => beforeInputRef.current?.click()}
              className="btn w-full bg-gray-900 border-2 border-gray-700 rounded-3xl hover:bg-gray-800 hover:border-green-500 hover:shadow-lg active:scale-98 transition-all group overflow-hidden"
            >
              <div className="flex flex-col items-center gap-5 py-10">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-green-500/20 group-hover:scale-110 transition-all">
                  <Upload className="w-10 h-10 text-gray-400 group-hover:text-green-400" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-xl font-bold text-white mb-1">Upload Your Item</div>
                  <div className="text-sm text-gray-400">Current state of your furniture</div>
                </div>
              </div>
            </button>
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
              onChange={handleTargetSelect}
              className="hidden"
              aria-label="Upload target inspiration photo"
            />
            <button
              onClick={() => targetInputRef.current?.click()}
              className="btn w-full bg-gray-900 border-2 border-gray-700 rounded-3xl hover:bg-gray-800 hover:border-green-500 hover:shadow-lg active:scale-98 transition-all group overflow-hidden"
              disabled={!beforeImage}
            >
              <div className="flex flex-col items-center gap-5 py-10">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-green-500/20 group-hover:scale-110 transition-all">
                  <Upload className="w-10 h-10 text-gray-400 group-hover:text-green-400" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-xl font-bold text-white mb-1">Upload Inspiration</div>
                  <div className="text-sm text-gray-400">Pinterest, marketplace, or any style you like</div>
                </div>
              </div>
            </button>
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
