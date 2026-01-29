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
  Download,
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

  const generateShareContent = () => {
    const itemType = analysis.objectCandidates?.[0]?.label || "furniture item";
    const materials = analysis.materials?.map((m: any) => m.label).join(", ") || "unknown materials";

    let content = `🛠️ ${plan.title}\n`;
    content += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Item identification
    content += `📦 ITEM IDENTIFIED:\n`;
    content += `${itemType}\n`;
    content += `Materials: ${materials}\n\n`;

    // Project overview
    content += `🎨 PROJECT: ${idea.title}\n\n`;

    // Summary
    content += `⏱️ Time: ${plan.timeEstimate?.minHours}-${plan.timeEstimate?.maxHours} hours\n`;
    content += `💰 Cost: $${plan.costEstimate?.min}-$${plan.costEstimate?.max} AUD\n`;
    content += `⭐ Difficulty: ${plan.difficulty}\n\n`;

    // Materials
    content += `🛒 SHOPPING LIST:\n`;
    plan.materials?.forEach((material: any, i: number) => {
      content += `${i + 1}. ${material.item} - ${material.qty}\n`;
    });
    content += `\n`;

    // Steps
    content += `📋 INSTRUCTIONS:\n`;
    plan.steps?.forEach((step: any) => {
      content += `\nStep ${step.n}: ${step.title}\n`;
      content += `${step.detail}\n`;
    });
    content += `\n`;

    // Safety
    if (plan.safety && plan.safety.length > 0) {
      content += `⚠️ SAFETY NOTES:\n`;
      plan.safety.forEach((warning: any) => {
        content += `• ${warning.text}\n`;
      });
      content += `\n`;
    }

    // Resale value
    if (plan.resale?.enabled) {
      content += `💵 POTENTIAL RESALE VALUE:\n`;
      content += `$${plan.resale.range?.min}-$${plan.resale.range?.max} ${plan.resale.range?.currency}\n`;
      content += `${plan.resale.note}\n\n`;
    }

    // Branding
    content += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    content += `Created by FixerUppera App 🌟\n`;
    content += `Transform your furniture finds!\n`;

    return content;
  };

  const handleShare = async () => {
    const shareContent = generateShareContent();

    if (navigator.share) {
      try {
        await navigator.share({
          title: plan?.title || "My DIY Plan",
          text: shareContent,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareContent);
        alert("Plan copied to clipboard!");
      } catch (error) {
        alert("Sharing not supported on this device");
      }
    }
  };

  const handleSave = () => {
    const itemType = analysis.objectCandidates?.[0]?.label || "furniture item";
    const materials = analysis.materials?.map((m: any) => m.label).join(", ") || "unknown materials";

    // Generate HTML content with embedded image
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${plan.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f9fafb;
      color: #111827;
    }
    .header {
      background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .header p {
      margin: 0;
      opacity: 0.9;
    }
    .photo {
      width: 100%;
      max-width: 600px;
      border-radius: 12px;
      margin: 20px 0;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .section {
      background: white;
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .section h2 {
      margin: 0 0 16px 0;
      font-size: 20px;
      color: #7c3aed;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }
    .summary-item {
      background: #f3f4f6;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
    }
    .summary-item .label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .summary-item .value {
      font-size: 18px;
      font-weight: bold;
      color: #111827;
    }
    .material-item {
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
      margin-bottom: 8px;
    }
    .step {
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
      margin-bottom: 12px;
    }
    .step-number {
      display: inline-block;
      width: 32px;
      height: 32px;
      background: #7c3aed;
      color: white;
      border-radius: 50%;
      text-align: center;
      line-height: 32px;
      font-weight: bold;
      margin-right: 12px;
    }
    .safety {
      background: #fef2f2;
      border: 2px solid #fca5a5;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .safety h2 {
      color: #dc2626;
    }
    .resale {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border: 2px solid #86efac;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .resale .value {
      font-size: 32px;
      font-weight: bold;
      color: #047857;
      margin: 8px 0;
    }
    .footer {
      text-align: center;
      padding: 30px;
      background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
      color: white;
      border-radius: 12px;
      margin-top: 20px;
    }
    .footer h3 {
      margin: 0 0 8px 0;
      font-size: 24px;
    }
    .footer p {
      margin: 0;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🛠️ ${plan.title}</h1>
    <p>${idea.title}</p>
  </div>

  ${beforeImage ? `<img src="${beforeImage}" alt="Before photo" class="photo" />` : ''}

  <div class="section">
    <h2>📦 Item Identified</h2>
    <p><strong>${itemType}</strong></p>
    <p>Materials: ${materials}</p>
  </div>

  <div class="summary">
    <div class="summary-item">
      <div class="label">Time</div>
      <div class="value">${plan.timeEstimate?.minHours}-${plan.timeEstimate?.maxHours}h</div>
    </div>
    <div class="summary-item">
      <div class="label">Cost</div>
      <div class="value">$${plan.costEstimate?.min}-$${plan.costEstimate?.max}</div>
    </div>
    <div class="summary-item">
      <div class="label">Difficulty</div>
      <div class="value" style="text-transform: capitalize;">${plan.difficulty}</div>
    </div>
  </div>

  <div class="section">
    <h2>🛒 Shopping List</h2>
    ${plan.materials?.map((material: any) => `
      <div class="material-item">
        <strong>${material.item}</strong><br>
        <span style="color: #6b7280; font-size: 14px;">Quantity: ${material.qty}</span>
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2>📋 Step-by-Step Instructions</h2>
    ${plan.steps?.map((step: any) => `
      <div class="step">
        <span class="step-number">${step.n}</span>
        <strong>${step.title}</strong>
        <p style="margin: 8px 0 0 44px; color: #4b5563;">${step.detail}</p>
      </div>
    `).join('')}
  </div>

  ${plan.safety && plan.safety.length > 0 ? `
    <div class="safety">
      <h2>⚠️ Safety Notes</h2>
      ${plan.safety.map((warning: any) => `
        <p style="margin: 8px 0; color: #991b1b;">• ${warning.text}</p>
      `).join('')}
    </div>
  ` : ''}

  ${plan.resale?.enabled ? `
    <div class="resale">
      <h2 style="color: #047857; margin: 0 0 8px 0;">💰 Potential Resale Value</h2>
      <div class="value">$${plan.resale.range?.min} - $${plan.resale.range?.max} ${plan.resale.range?.currency}</div>
      <p style="color: #065f46; margin: 8px 0 0 0;">${plan.resale.note}</p>
    </div>
  ` : ''}

  <div class="footer">
    <h3>Created by FixerUppera App 🌟</h3>
    <p>Transform your furniture finds!</p>
  </div>
</body>
</html>`;

    // Create and download HTML file
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-plan.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          onClick={handleSave}
          className="btn w-10 h-10 flex items-center justify-center rounded-full bg-purple-100 hover:bg-purple-200 transition-colors"
          title="Save plan"
        >
          <Download className="w-5 h-5 text-purple-600" />
        </button>
        <button
          onClick={handleShare}
          className="btn w-10 h-10 flex items-center justify-center rounded-full bg-purple-100 hover:bg-purple-200 transition-colors"
          title="Share plan"
        >
          <Share2 className="w-5 h-5 text-purple-600" />
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

      {/* Branding Footer */}
      <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-6 text-center">
        <div className="text-2xl font-bold text-purple-900 mb-2">
          Created by FixerUppera App 🌟
        </div>
        <p className="text-sm text-purple-700">Transform your furniture finds!</p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={handleSave}
            className="btn px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Save Plan
          </button>
          <button
            onClick={handleShare}
            className="btn px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share Plan
          </button>
        </div>
      </div>
    </div>
  );
}
