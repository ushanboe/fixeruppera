"use client";

import { PandaScene, type PandaAnimation } from "@/components/panda";

interface PandaLoadingProps {
  animation: PandaAnimation;
  title: string;
  description: string;
  height?: number;
  isModal?: boolean;
  progressBar?: boolean;
}

export default function PandaLoading({
  animation,
  title,
  description,
  height = 180,
  isModal = false,
  progressBar = false,
}: PandaLoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center py-8">
      <PandaScene animation={animation} height={height} className="w-full max-w-[250px]" />
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-center max-w-md">{description}</p>
      {progressBar && (
        <div className="mt-6 w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-purple-500 animate-pulse" style={{ width: "60%" }} />
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-3xl p-8 max-w-md w-full">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
