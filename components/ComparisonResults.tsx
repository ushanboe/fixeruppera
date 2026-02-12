"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, ShoppingCart, AlertTriangle, Sparkles } from "lucide-react";
import PlanView from "./PlanView";

interface ComparisonResultsProps {
  beforeImage: string;
  targetImage: string;
  data: any;
  constraints: any;
  onBack: () => void;
}

export default function ComparisonResults({ beforeImage, targetImage, data, constraints, onBack }: ComparisonResultsProps) {
  const [showPlan, setShowPlan] = useState(false);

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Loading comparison...</p>
      </div>
    );
  }

  if (showPlan && data.plan) {
    // Show the detailed plan view
    return (
      <PlanView
        idea={{ id: "pro-transformation", title: "Pro Mode Transformation" }}
        analysis={data}
        constraints={constraints}
        beforeImage={beforeImage}
        targetImage={targetImage}
        onBack={() => setShowPlan(false)}
        initialPlan={data.plan}
      />
    );
  }

  const { targetSummary, differences, plan } = data;

  return (
    <div className="space-y-6 animate-slide-up pb-24">
      {/* Photos Comparison */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Your Transformation</h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Before</div>
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
              <img src={beforeImage} alt="Before" className="w-full h-auto" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-green-400 uppercase tracking-wide">Target</div>
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-xl border-2 border-green-500/30">
              <img src={targetImage} alt="Target" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Target Style Summary */}
      {targetSummary && (
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-3xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">Target Style Analysis</h3>
              <p className="text-lg text-green-300 font-semibold mb-3 capitalize">{targetSummary.style}</p>
              {targetSummary.keyElements && targetSummary.keyElements.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {targetSummary.keyElements.map((element: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium"
                    >
                      {element}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Key Differences */}
      {differences && differences.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">What Needs to Change</h3>
          <div className="space-y-3">
            {differences.map((diff: any, index: number) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-2xl">
                <div className="flex-1">
                  <div className="text-sm text-gray-400 uppercase tracking-wide mb-1">{diff.change}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium">{diff.from}</span>
                    <ArrowRight className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-bold">{diff.to}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan Preview */}
      {plan && (
        <>
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Transformation Summary</h3>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-purple-400 mb-1">
                  {plan.timeEstimate?.minHours}-{plan.timeEstimate?.maxHours}h
                </div>
                <div className="text-xs text-gray-400">Time</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-green-400 mb-1">
                  ${plan.costEstimate?.min}-${plan.costEstimate?.max}
                </div>
                <div className="text-xs text-gray-400">Cost</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-orange-400 mb-1 capitalize">
                  {plan.difficulty}
                </div>
                <div className="text-xs text-gray-400">Level</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm uppercase tracking-wide">Steps Preview</h4>
              {plan.steps?.slice(0, 3).map((step: any, index: number) => (
                <div key={index} className="flex items-start gap-3 text-gray-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{step.title}</span>
                </div>
              ))}
              {plan.steps?.length > 3 && (
                <div className="text-sm text-gray-500">
                  +{plan.steps.length - 3} more steps...
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowPlan(true)}
            className="btn w-full px-8 py-4 bg-green-600 text-white rounded-2xl font-bold text-lg hover:bg-green-700 active:scale-98 transition-all shadow-lg shadow-green-900/50"
          >
            View Full Transformation Plan
          </button>
        </>
      )}

      <button
        onClick={onBack}
        className="btn w-full px-8 py-4 bg-gray-800 border-2 border-gray-700 text-white rounded-2xl font-semibold text-lg hover:bg-gray-700 active:scale-98 transition-all"
      >
        Back
      </button>
    </div>
  );
}
