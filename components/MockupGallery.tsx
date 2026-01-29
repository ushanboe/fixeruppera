"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles, AlertCircle, X } from "lucide-react";

interface MockupGalleryProps {
  beforeImage: string;
  concept: any;
  onClose?: () => void;
}

export default function MockupGallery({ beforeImage, concept, onClose }: MockupGalleryProps) {
  const [mockups, setMockups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMockup, setSelectedMockup] = useState<number | null>(null);

  useEffect(() => {
    generateMockups();
  }, []);

  const generateMockups = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/upcycle/mockups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beforeImage,
          concept,
          count: 2, // Generate 2 mockups by default
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else if (data.mockups && data.mockups.length > 0) {
        setMockups(data.mockups);
      } else {
        setError("No mockups were generated. Please try again.");
      }
    } catch (err: any) {
      console.error("Failed to generate mockups:", err);
      setError("Failed to generate mockups. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-3xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Generating Mockups...</h3>
            <p className="text-gray-400">
              Creating concept previews of your transformation
            </p>
            <div className="mt-6 w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-purple-500 animate-pulse" style={{ width: "60%" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-3xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Generation Failed</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => generateMockups()}
                className="btn flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700"
              >
                Try Again
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="btn flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto">
      <div className="min-h-screen p-4 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sticky top-4 bg-gray-900/95 backdrop-blur rounded-2xl p-4 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Concept Previews</h2>
                <p className="text-sm text-gray-400">{mockups.length} mockups generated</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="btn w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          {/* Disclaimer */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 mb-6">
            <p className="text-sm text-orange-300">
              <strong>Concept Preview Only:</strong> These AI-generated images show possible outcomes.
              Real results depend on your materials, techniques, and workmanship. Use these as inspiration, not exact representations.
            </p>
          </div>

          {/* Before Image */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3">Before</h3>
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
              <img src={beforeImage} alt="Before" className="w-full h-auto" />
            </div>
          </div>

          {/* Mockups Grid */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3">After (Concept Previews)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockups.map((mockup, index) => (
                <div
                  key={mockup.id}
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedMockup(index)}
                >
                  <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-xl border-2 border-purple-500/30 hover:border-purple-500 transition-all">
                    <img src={mockup.dataUrl} alt={`Mockup ${index + 1}`} className="w-full h-auto" />
                    <div className="absolute top-3 right-3 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                      Option {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => generateMockups()}
              className="btn flex-1 px-6 py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg hover:bg-purple-700 active:scale-98 transition-all"
            >
              Generate More Options
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="btn px-8 py-4 bg-gray-800 text-white rounded-2xl font-semibold text-lg hover:bg-gray-700 active:scale-98 transition-all"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal for Selected Mockup */}
      {selectedMockup !== null && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMockup(null)}
        >
          <img
            src={mockups[selectedMockup].dataUrl}
            alt={`Mockup ${selectedMockup + 1}`}
            className="max-w-full max-h-full rounded-2xl"
          />
        </div>
      )}
    </div>
  );
}
