"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import PandaLoading from "@/components/panda/PandaLoading";

interface IdentificationResultsProps {
  image: string;
  data: any;
  onConfirm: () => void;
  onRetake: () => void;
}

export default function IdentificationResults({ image, data, onConfirm, onRetake }: IdentificationResultsProps) {
  if (!data) {
    return (
      <PandaLoading
        animation="walking"
        title="Identifying your item..."
        description="Our AI is analyzing the photo to identify what you have"
      />
    );
  }

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Image Preview */}
      <div className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
        <img src={image} alt="Your item" className="w-full h-auto" />
      </div>

      {/* Identification Results */}
      <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800">
        <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-green-500" />
          What We Found
        </h3>

        <div className="space-y-3">
          {data.candidates?.map((candidate: any, index: number) => (
            <div
              key={index}
              className={`p-4 rounded-2xl border-2 transition-all ${
                index === 0
                  ? "bg-purple-500/10 border-purple-500"
                  : "bg-gray-800/50 border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {index === 0 && (
                    <div className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded-md">
                      BEST MATCH
                    </div>
                  )}
                  <span className="text-white font-bold text-lg">
                    {candidate.label}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Confidence</div>
                  <div className="text-2xl font-black text-purple-400">
                    {Math.round(candidate.confidence * 100)}%
                  </div>
                </div>
              </div>
              {candidate.notes && (
                <p className="text-gray-400 text-sm mt-2">{candidate.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Material Info */}
      {data.materials && data.materials.length > 0 && (
        <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800">
          <h4 className="text-white font-bold mb-3">Likely Materials</h4>
          <div className="flex flex-wrap gap-2">
            {data.materials.map((material: any, index: number) => (
              <div
                key={index}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm"
              >
                {material.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning if uncertain */}
      {data.candidates && data.candidates[0]?.confidence < 0.6 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-3xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <div className="text-yellow-500 font-bold mb-1">Uncertain Identification</div>
              <div className="text-gray-400 text-sm">
                We&apos;re not completely sure what this is. You can still continue, but results may vary.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={onRetake}
          className="btn flex-1 px-8 py-4 bg-gray-800 border-2 border-gray-700 text-white rounded-2xl font-bold text-lg hover:bg-gray-700 active:scale-98 transition-all"
        >
          Retake Photo
        </button>
        <button
          onClick={onConfirm}
          className="btn flex-1 px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg hover:bg-purple-700 active:scale-98 transition-all shadow-lg shadow-purple-900/50"
        >
          Looks Good!
        </button>
      </div>
    </div>
  );
}
