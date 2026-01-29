"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  ChevronLeft,
  ShoppingCart,
  AlertTriangle,
  Clock,
  DollarSign,
  CheckCircle2,
  Share2,
} from "lucide-react";

interface PlanViewProps {
  idea: any;
  analysis: any;
  constraints: any;
  beforeImage?: string;
  onBack: () => void;
}

export default function PlanView({ idea, analysis, constraints, beforeImage, onBack }: PlanViewProps) {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Check if this is Pro Mode (analysis contains a plan from match-target)
    if (analysis?.plan) {
      console.log("=== PRO MODE: Using existing plan from match-target ===");
      setPlan(analysis.plan);
      setLoading(false);
    } else {
      // Standard Mode: Fetch plan from plan API
      console.log("=== STANDARD MODE: Fetching plan from API ===");
      fetchPlan();
    }
  }, []);

  const fetchPlan = async () => {
    try {
      const response = await fetch("/api/upcycle/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis,
          ideaId: idea.id,
          selectedIdea: idea,
          constraints: {
            ...constraints,
            skill: "beginner",
          },
          assumptions: {
            woodType: "unknown",
            indoorOutdoor: "indoor",
          },
        }),
      });

      const data = await response.json();
      setPlan(data);
    } catch (error) {
      console.error("Failed to fetch plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (stepNumber: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepNumber)) {
      newCompleted.delete(stepNumber);
    } else {
      newCompleted.add(stepNumber);
    }
    setCompletedSteps(newCompleted);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: plan?.title || "My DIY Plan",
          text: `Check out this ${idea.title} makeover plan from FixerUppera!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      alert("Sharing not supported on this device");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Creating your plan...</h3>
        <p className="text-gray-600 text-center max-w-md">
          Generating detailed steps and materials list
        </p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load plan. Please try again.</p>
        <button
          onClick={onBack}
          className="btn mt-4 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const progress = plan.steps ? (completedSteps.size / plan.steps.length) * 100 : 0;

  return (
    <div className="space-y-6 animate-slide-up pb-24">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={onBack}
          className="btn mt-2 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{plan.title}</h2>
          <p className="text-gray-600">{idea.title}</p>
        </div>
        <button
          onClick={handleShare}
          className="btn w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <Share2 className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Progress Bar */}
      {completedSteps.size > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-900">Your Progress</span>
            <span className="text-sm text-gray-600">
              {completedSteps.size} of {plan.steps?.length || 0} steps
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
          <div className="text-xs text-gray-600 mb-1">Time</div>
          <div className="font-bold text-gray-900">
            {plan.timeEstimate?.minHours}-{plan.timeEstimate?.maxHours}h
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <div className="text-xs text-gray-600 mb-1">Cost</div>
          <div className="font-bold text-gray-900">
            ${plan.costEstimate?.min}-${plan.costEstimate?.max}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-lg mb-1">⭐</div>
          <div className="text-xs text-gray-600 mb-1">Level</div>
          <div className="font-bold text-gray-900 capitalize">{plan.difficulty}</div>
        </div>
      </div>

      {/* Materials List */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-purple-600" />
            Shopping List
          </h3>
        </div>
        <div className="space-y-2">
          {plan.materials?.map((material: any, index: number) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">{material.item}</div>
                <div className="text-sm text-gray-600">Quantity: {material.qty}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">Step-by-Step Instructions</h3>
        <div className="space-y-3">
          {plan.steps?.map((step: any) => (
            <button
              key={step.n}
              onClick={() => toggleStep(step.n)}
              className="btn w-full text-left"
            >
              <div
                className={`p-4 rounded-lg border-2 transition-all ${
                  completedSteps.has(step.n)
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-purple-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                      completedSteps.has(step.n)
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {completedSteps.has(step.n) ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      step.n
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.detail}</p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Safety Warnings */}
      {plan.safety && plan.safety.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Safety Notes
          </h3>
          <div className="space-y-2">
            {plan.safety.map((warning: any, index: number) => (
              <p key={index} className="text-sm text-red-800">
                {warning.text}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Resale Estimate */}
      {plan.resale?.enabled && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <h3 className="font-bold text-green-900 mb-2">💰 Potential Resale Value</h3>
          <div className="text-2xl font-black text-green-900 mb-2">
            ${plan.resale.range?.min} - ${plan.resale.range?.max} {plan.resale.range?.currency}
          </div>
          <p className="text-sm text-green-800">{plan.resale.note}</p>
        </div>
      )}
    </div>
  );
}
