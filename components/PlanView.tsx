"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronDown,
  ShoppingCart,
  AlertTriangle,
  Clock,
  DollarSign,
  CheckCircle2,
  Share2,
  Save,
  Sparkles,
  X,
  Download,
  Image as ImageIcon,
} from "lucide-react";
import MockupGallery from "./MockupGallery";
import { imageToBase64 } from "@/lib/imageUtils";
import PandaLoading from "@/components/panda/PandaLoading";

interface PlanViewProps {
  idea: any;
  analysis: any;
  constraints: any;
  beforeImage?: string;
  targetImage?: string;
  onBack: () => void;
  initialPlan?: any;
  initialCompletedSteps?: number[];
  initialMockupImage?: string;
}

export default function PlanView({ idea, analysis, constraints, beforeImage, targetImage, onBack, initialPlan, initialCompletedSteps, initialMockupImage }: PlanViewProps) {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    new Set(initialCompletedSteps || [])
  );
  const [showMockups, setShowMockups] = useState(false);
  const [selectedMockupImage, setSelectedMockupImage] = useState<string | null>(
    initialMockupImage || null
  );
  const [shoppingListOpen, setShoppingListOpen] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  useEffect(() => {
    if (initialPlan) {
      // Restored from saved plan — skip API call entirely
      console.log("=== RESTORED: Using saved plan data ===");
      setPlan(initialPlan);
      setLoading(false);
    } else if (analysis?.plan) {
      // Pro Mode: analysis contains a plan from match-target
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

    // Mockup note
    if (selectedMockupImage) {
      content += `🎨 Includes AI-generated concept preview\n\n`;
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

  const handleSave = async () => {
    try {
      console.log('💾 Starting save process...');

      // Compress before image to same size as mockup for consistent storage
      let compressedBeforeImage = beforeImage;
      if (beforeImage) {
        try {
          compressedBeforeImage = await imageToBase64(beforeImage, 512, 0.7);
        } catch {
          console.log('⚠️ Could not compress before image, using original');
        }
      }

      // Get existing saved plans from localStorage
      const savedPlansJson = localStorage.getItem('fixeruppera_saved_plans');
      console.log('📦 Existing saved plans JSON:', savedPlansJson);
      const savedPlans = savedPlansJson ? JSON.parse(savedPlansJson) : [];
      console.log('📊 Existing saved plans count:', savedPlans.length);

      // Create new saved plan object
      const savedPlan = {
        id: `plan-${Date.now()}`,
        savedAt: new Date().toISOString(),
        version: 2,
        plan,
        idea,
        analysis,
        constraints,
        beforeImage: compressedBeforeImage,
        completedSteps: Array.from(completedSteps),
        mockupImage: selectedMockupImage || undefined,
        appMode: analysis?.plan ? "pro" : "standard",
      };
      console.log('✨ New saved plan object:', savedPlan);

      // Add to saved plans array
      savedPlans.unshift(savedPlan); // Add to beginning
      console.log('📈 Total plans after adding:', savedPlans.length);

      // Limit to 20 saved plans
      if (savedPlans.length > 20) {
        savedPlans.pop();
      }

      // Save back to localStorage
      localStorage.setItem('fixeruppera_saved_plans', JSON.stringify(savedPlans));
      console.log('✅ Saved to localStorage successfully');

      // Verify it was saved
      const verification = localStorage.getItem('fixeruppera_saved_plans');
      console.log('🔍 Verification - data in localStorage:', verification);

      alert('Plan saved! View it in Saved Plans.');
    } catch (error) {
      console.error('❌ Failed to save plan:', error);
      alert('Failed to save plan. Storage may be full.');
    }
  };

  const handleExport = () => {
    const itemType = analysis.objectCandidates?.[0]?.label || "furniture item";
    const materials = analysis.materials?.map((m: any) => m.label).join(", ") || "unknown materials";

    // Generate HTML content with embedded image
    const html = `<!DOCTYPE html>
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

  ${selectedMockupImage ? `
  <div class="section">
    <h2>🎨 Concept Preview</h2>
    <img src="${selectedMockupImage}" alt="AI concept preview" class="photo" />
    <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">AI-generated concept preview — actual results may vary.</p>
  </div>
  ` : ''}

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
      <PandaLoading
        animation="walking"
        title="Creating your plan..."
        description="Generating detailed steps and materials list"
      />
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
      </div>

      {/* Before Photo */}
      {beforeImage && (
        <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
          <img
            src={beforeImage}
            alt="Your item"
            className="w-full h-auto max-h-64 object-cover"
          />
        </div>
      )}

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

      {/* Generate Mockup Button */}
      {beforeImage && (
        <button
          onClick={() => setShowMockups(true)}
          className="btn w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl p-5 hover:from-purple-700 hover:to-purple-800 active:scale-98 transition-all shadow-lg"
        >
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-6 h-6" />
            <div className="text-left">
              <div className="text-lg font-bold">See the Makeover</div>
              <div className="text-sm text-purple-200">AI-generated preview of your transformation</div>
            </div>
          </div>
        </button>
      )}

      {/* Mockup Gallery Modal */}
      {showMockups && beforeImage && (
        <MockupGallery
          beforeImage={beforeImage}
          targetImage={targetImage}
          concept={{
            itemType: analysis?.objectCandidates?.[0]?.label || "furniture piece",
            ideaTitle: idea?.title || plan?.title || "restored furniture",
            keyTransformations: idea?.keyTransformations || plan?.keyTransformations || [],
            stepsPreview: idea?.stepsPreview || plan?.steps?.map((s: any) => s.title || s) || [],
            whyItWorks: idea?.whyItWorks || "",
          }}
          onClose={() => setShowMockups(false)}
          onSelectMockup={(base64) => {
            setSelectedMockupImage(base64);
            setShowMockups(false);
          }}
        />
      )}

      {/* Materials List (Collapsible) */}
      <div className="bg-white rounded-xl border border-gray-200">
        <button
          onClick={() => setShoppingListOpen(!shoppingListOpen)}
          className="btn w-full flex items-center justify-between p-6"
        >
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-purple-600" />
            Shopping List
            <span className="text-sm font-normal text-gray-500">
              ({plan.materials?.length || 0} items)
            </span>
          </h3>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              shoppingListOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {shoppingListOpen && (
          <div className="px-6 pb-6 space-y-2">
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
        )}
      </div>

      {/* Steps (Collapsible) */}
      <div className="bg-white rounded-xl border border-gray-200">
        <button
          onClick={() => setInstructionsOpen(!instructionsOpen)}
          className="btn w-full flex items-center justify-between p-6"
        >
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            📋 Step-by-Step Instructions
            <span className="text-sm font-normal text-gray-500">
              ({plan.steps?.length || 0} steps)
            </span>
          </h3>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              instructionsOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {instructionsOpen && (
          <div className="px-6 pb-6 space-y-3">
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
        )}
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

      {/* Selected Mockup Preview */}
      {selectedMockupImage && (
        <div className="bg-white rounded-xl p-4 border-2 border-purple-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-600" />
              Selected Concept Preview
            </h3>
            <button
              onClick={() => setSelectedMockupImage(null)}
              className="btn w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Remove mockup"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="rounded-lg overflow-hidden border border-purple-200">
            <img
              src={selectedMockupImage}
              alt="Selected concept preview"
              className="w-full h-auto"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">This preview will be saved with your plan.</p>
        </div>
      )}

      {/* Save & Share Actions */}
      <div className="space-y-3">
        <button
          onClick={handleSave}
          className="btn w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save Plan
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="btn flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={handleExport}
            className="btn flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export HTML
          </button>
        </div>
      </div>
    </div>
  );
}
