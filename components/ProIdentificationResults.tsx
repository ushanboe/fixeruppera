"use client";

import { Loader2, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

interface ProIdentificationResultsProps {
  beforeImage: string;
  targetImage: string;
  data: any;
  onConfirm: () => void;
  onRetake: () => void;
}

export default function ProIdentificationResults({
  beforeImage,
  targetImage,
  data,
  onConfirm,
  onRetake,
}: ProIdentificationResultsProps) {
  if (!data || !data.before || !data.target) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Analyzing your photos...</h3>
        <p className="text-gray-400 text-center max-w-md">
          Identifying your item and understanding the target style
        </p>
      </div>
    );
  }

  const { before, target } = data;
  const beforeItem = before.candidates?.[0];
  const beforeMaterial = before.materials?.[0];

  return (
    <div className="space-y-6 animate-slide-up pb-12">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">AI Analysis Complete</h2>
        <p className="text-gray-400">Review the identification before proceeding</p>
      </div>

      {/* Before Photo Analysis */}
      <div className="bg-gray-900 border-2 border-gray-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
            <span className="text-lg">📸</span>
          </div>
          <h3 className="text-lg font-bold text-white">Your Item</h3>
        </div>

        <div className="relative bg-black rounded-2xl overflow-hidden">
          <img src={beforeImage} alt="Your item" className="w-full h-auto" />
        </div>

        {beforeItem && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-2xl">
              <div className="flex-1">
                <div className="text-sm text-gray-400 mb-1">Identified as</div>
                <div className="text-xl font-bold text-white">{beforeItem.label}</div>
                {beforeMaterial && (
                  <div className="text-sm text-gray-400 mt-1">
                    Material: {beforeMaterial.label}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-purple-400">
                  {Math.round(beforeItem.confidence * 100)}%
                </div>
                <div className="text-xs text-gray-500">confidence</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
          <ArrowRight className="w-6 h-6 text-green-400" />
        </div>
      </div>

      {/* Target Photo Analysis */}
      <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-2 border-green-500/30 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Target Style</h3>
        </div>

        <div className="relative bg-black rounded-2xl overflow-hidden border-2 border-green-500/30">
          <img src={targetImage} alt="Target inspiration" className="w-full h-auto" />
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <div className="text-sm text-green-300 mb-1">Style Identified</div>
                <div className="text-xl font-bold text-white">{target.style}</div>
              </div>
              {target.confidence && (
                <div className="text-right">
                  <div className="text-2xl font-black text-green-400">
                    {Math.round(target.confidence * 100)}%
                  </div>
                  <div className="text-xs text-green-300">match</div>
                </div>
              )}
            </div>

            {target.description && (
              <p className="text-sm text-gray-300 leading-relaxed">
                {target.description}
              </p>
            )}
          </div>

          {target.keyFeatures && target.keyFeatures.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-green-300 uppercase tracking-wide">
                Key Features
              </div>
              <div className="flex flex-wrap gap-2">
                {target.keyFeatures.map((feature: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-green-500/20 text-green-300 rounded-full text-sm font-medium border border-green-500/30"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {target.colors && target.colors.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="font-semibold text-green-300">Colors:</span>
              <span>{target.colors.join(", ")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onRetake}
          className="btn flex-1 px-8 py-4 bg-gray-800 border-2 border-gray-700 text-white rounded-2xl font-bold text-lg hover:bg-gray-700 active:scale-98 transition-all"
        >
          Retake Photos
        </button>
        <button
          onClick={onConfirm}
          className="btn flex-1 px-8 py-4 bg-green-600 text-white rounded-2xl font-bold text-lg hover:bg-green-700 active:scale-98 transition-all shadow-lg shadow-green-900/50"
        >
          Looks Good! Continue
        </button>
      </div>
    </div>
  );
}
