"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Loader2, Sparkles, AlertCircle, X, MoveHorizontal, Check } from "lucide-react";
import { imageToBase64 } from "@/lib/imageUtils";
import PandaLoading from "@/components/panda/PandaLoading";

interface MockupGalleryProps {
  beforeImage: string;
  targetImage?: string;
  concept: any;
  onClose?: () => void;
  onSelectMockup?: (mockupBase64: string) => void;
}

function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  onClose,
}: {
  beforeSrc: string;
  afterSrc: string;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  const updatePosition = useCallback(
    (clientX: number) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPos(pct);
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      updatePosition(e.clientX);
    },
    [isDragging, updatePosition]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const bothLoaded = imagesLoaded >= 2;

  return (
    <div
      className="fixed inset-0 bg-black/95 z-[60] flex flex-col items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-gray-800/80 hover:bg-gray-700 transition-colors"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Hint */}
      <p className="text-gray-400 text-sm mb-3 flex items-center gap-2">
        <MoveHorizontal className="w-4 h-4" />
        Drag slider to compare
      </p>

      {/* Slider container */}
      <div
        ref={containerRef}
        className="relative max-w-2xl w-full rounded-2xl overflow-hidden select-none touch-none"
        style={{ cursor: isDragging ? "grabbing" : "default" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* After image (full, bottom layer) */}
        <img
          src={afterSrc}
          alt="After"
          className="w-full h-auto block"
          draggable={false}
          onLoad={() => setImagesLoaded((c) => c + 1)}
        />

        {/* Before image (clipped, top layer) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <img
            src={beforeSrc}
            alt="Before"
            className="w-full h-full object-cover block"
            draggable={false}
            onLoad={() => setImagesLoaded((c) => c + 1)}
          />
        </div>

        {/* Slider line + handle */}
        {bothLoaded && (
          <>
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white/80 pointer-events-none"
              style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center pointer-events-none"
              style={{ left: `${sliderPos}%`, transform: "translate(-50%, -50%)" }}
            >
              <MoveHorizontal className="w-5 h-5 text-gray-800" />
            </div>
          </>
        )}

        {/* Labels */}
        {bothLoaded && (
          <>
            <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-md pointer-events-none">
              Before
            </div>
            <div className="absolute top-3 right-3 bg-purple-500/80 text-white text-xs font-bold px-2 py-1 rounded-md pointer-events-none">
              After
            </div>
          </>
        )}

        {/* Loading overlay */}
        {!bothLoaded && (
          <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function MockupGallery({ beforeImage, targetImage, concept, onClose, onSelectMockup }: MockupGalleryProps) {
  const [mockups, setMockups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMockup, setSelectedMockup] = useState<number | null>(null);
  const [pickingIndex, setPickingIndex] = useState<number | null>(null);

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
          ...(targetImage && { targetImage }),
          concept,
          count: 2,
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

  const handlePickMockup = async (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSelectMockup || pickingIndex !== null) return;

    setPickingIndex(index);
    try {
      const src = mockups[index].imageUrl || mockups[index].dataUrl;
      const base64 = await imageToBase64(src, 512, 0.7);
      onSelectMockup(base64);
      setTimeout(() => onClose?.(), 500);
    } catch (err) {
      console.error("Failed to pick mockup:", err);
      setPickingIndex(null);
    }
  };

  if (loading) {
    return (
      <PandaLoading
        animation="swimming"
        title="Generating Mockups..."
        description="Creating concept previews of your transformation"
        isModal
        progressBar
      />
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
    <>
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

            {/* Mockups Grid */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">Concept Previews</h3>
              <p className="text-sm text-gray-500 mb-3">Tap a mockup to compare before &amp; after</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockups.map((mockup, index) => (
                  <div
                    key={mockup.id}
                    className="relative group cursor-pointer"
                    onClick={() => setSelectedMockup(index)}
                  >
                    <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-xl border-2 border-purple-500/30 hover:border-purple-500 transition-all">
                      {/* Image area */}
                      <div className="relative">
                        <img src={mockup.imageUrl || mockup.dataUrl} alt={`Mockup ${index + 1}`} className="w-full h-auto" />
                        <div className="absolute top-3 right-3 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                          Option {index + 1}
                        </div>
                        {/* Tap to compare hint */}
                        <div className="absolute bottom-3 left-3 right-3 flex justify-center pointer-events-none">
                          <div className="bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoveHorizontal className="w-3 h-3 inline mr-1" />
                            Tap to compare
                          </div>
                        </div>
                      </div>
                      {/* Save button - below image in normal flow */}
                      {onSelectMockup && (
                        <div className="p-3">
                          <button
                            onClick={(e) => handlePickMockup(index, e)}
                            disabled={pickingIndex !== null}
                            className="btn w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-900/50"
                          >
                            {pickingIndex === index ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            {pickingIndex === index ? "Saving..." : "I Love This! Save It!"}
                          </button>
                        </div>
                      )}
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
      </div>

      {/* Before/After Comparison Slider - portaled to body to avoid overflow clipping */}
      {selectedMockup !== null &&
        createPortal(
          <BeforeAfterSlider
            beforeSrc={beforeImage}
            afterSrc={mockups[selectedMockup].imageUrl || mockups[selectedMockup].dataUrl}
            onClose={() => setSelectedMockup(null)}
          />,
          document.body
        )}
    </>
  );
}
