"use client";

import { useState } from "react";
import { Camera, Upload, Sparkles, Zap, Target } from "lucide-react";
import PhotoCapture from "@/components/PhotoCapture";
import DualPhotoCapture from "@/components/DualPhotoCapture";
import IdentificationResults from "@/components/IdentificationResults";
import ProIdentificationResults from "@/components/ProIdentificationResults";
import ConstraintsForm from "@/components/ConstraintsForm";
import AnalysisResults from "@/components/AnalysisResults";
import IdeasList from "@/components/IdeasList";
import PlanView from "@/components/PlanView";
import ComparisonResults from "@/components/ComparisonResults";

type AppMode = "standard" | "pro";
type AppStep = "mode" | "upload" | "identification" | "pro-identification" | "constraints" | "analysis" | "ideas" | "plan" | "pro-comparison";

export default function Home() {
  const [appMode, setAppMode] = useState<AppMode | null>(null);
  const [currentStep, setCurrentStep] = useState<AppStep>("mode");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [targetImage, setTargetImage] = useState<string | null>(null);
  const [identificationData, setIdentificationData] = useState<any>(null);
  const [constraints, setConstraints] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);

  const handleImageCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    setCurrentStep("identification");

    // Call quick identification API
    const response = await fetch("/api/upcycle/identify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: { dataUrl: imageData },
      }),
    });

    const data = await response.json();
    setIdentificationData(data);
  };

  const handleIdentificationConfirm = () => {
    setCurrentStep("constraints");
  };

  const handleConstraintsSubmit = async (constraintsData: any) => {
    setConstraints(constraintsData);
    setCurrentStep("analysis");

    // Call analyze API
    const response = await fetch("/api/upcycle/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        images: [{ role: "before", dataUrl: capturedImage }],
        locale: "en-AU",
      }),
    });

    const data = await response.json();
    setAnalysisData(data);
    setCurrentStep("ideas");
  };

  const handleIdeaSelect = (idea: any) => {
    setSelectedIdea(idea);
    setCurrentStep("plan");
  };

  const handleModeSelect = (mode: AppMode) => {
    setAppMode(mode);
    setCurrentStep("upload");
  };

  const handleDualPhotoCapture = async (beforeImage: string, targetImage: string) => {
    setCapturedImage(beforeImage);
    setTargetImage(targetImage);
    setCurrentStep("pro-identification");

    // Call identification APIs for both images
    const [beforeResponse, targetResponse] = await Promise.all([
      fetch("/api/upcycle/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: { dataUrl: beforeImage } }),
      }),
      fetch("/api/upcycle/identify-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: { dataUrl: targetImage } }),
      }),
    ]);

    const beforeData = await beforeResponse.json();
    const targetData = await targetResponse.json();

    setIdentificationData({
      before: beforeData,
      target: targetData,
    });
  };

  const handleProIdentificationConfirm = () => {
    setCurrentStep("constraints");
  };

  const handleProModeAnalysis = async (constraintsData: any) => {
    setConstraints(constraintsData);
    setCurrentStep("analysis");

    // Call Pro Mode match-target API
    const response = await fetch("/api/upcycle/match-target", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        images: [
          { role: "before", dataUrl: capturedImage },
          { role: "target", dataUrl: targetImage }
        ],
        constraints: constraintsData,
      }),
    });

    const data = await response.json();
    setComparisonData(data);
    setCurrentStep("pro-comparison");
  };

  const handleReset = () => {
    setAppMode(null);
    setCapturedImage(null);
    setTargetImage(null);
    setIdentificationData(null);
    setConstraints(null);
    setAnalysisData(null);
    setSelectedIdea(null);
    setComparisonData(null);
    setCurrentStep("mode");
  };

  return (
    <main className="min-h-screen min-h-dvh bg-black">
      {/* Header */}
      <header className="safe-header bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">FixerUppera</h1>
          </div>
          {currentStep !== "mode" && (
            <button
              onClick={handleReset}
              className="text-sm font-medium text-purple-400 hover:text-purple-300"
            >
              Start Over
            </button>
          )}
        </div>
      </header>

      {/* Progress Indicator - Standard Mode Only */}
      {appMode === "standard" && currentStep !== "upload" && currentStep !== "identification" && (
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className={`h-1 flex-1 rounded-full ${["constraints", "analysis", "ideas", "plan"].includes(currentStep) ? "bg-purple-500" : "bg-gray-800"}`} />
            <div className={`h-1 flex-1 rounded-full ${["analysis", "ideas", "plan"].includes(currentStep) ? "bg-purple-500" : "bg-gray-800"}`} />
            <div className={`h-1 flex-1 rounded-full ${["ideas", "plan"].includes(currentStep) ? "bg-purple-500" : "bg-gray-800"}`} />
            <div className={`h-1 flex-1 rounded-full ${currentStep === "plan" ? "bg-purple-500" : "bg-gray-800"}`} />
          </div>
        </div>
      )}

      {/* Progress Indicator - Pro Mode */}
      {appMode === "pro" && currentStep !== "mode" && currentStep !== "upload" && currentStep !== "pro-identification" && (
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className={`h-1 flex-1 rounded-full ${["constraints", "analysis", "pro-comparison"].includes(currentStep) ? "bg-green-500" : "bg-gray-800"}`} />
            <div className={`h-1 flex-1 rounded-full ${["analysis", "pro-comparison"].includes(currentStep) ? "bg-green-500" : "bg-gray-800"}`} />
            <div className={`h-1 flex-1 rounded-full ${currentStep === "pro-comparison" ? "bg-green-500" : "bg-gray-800"}`} />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 safe-bottom pb-12">
        {currentStep === "mode" && (
          <div className="animate-fade-in space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Transform Your Furniture
              </h2>
              <p className="text-lg text-gray-400 max-w-md mx-auto">
                Choose how you want to get started
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleModeSelect("standard")}
                className="btn w-full bg-gray-900 border-2 border-purple-500 rounded-3xl hover:bg-gray-800 hover:shadow-2xl hover:shadow-purple-900/50 active:scale-98 transition-all group overflow-hidden"
              >
                <div className="flex items-center gap-6 px-6 py-8">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center group-hover:bg-purple-500/30 group-hover:scale-110 transition-all flex-shrink-0">
                    <Zap className="w-8 h-8 text-purple-400" strokeWidth={2.5} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-xl font-bold text-white mb-1">Standard Mode</div>
                    <div className="text-sm text-gray-400">Take a photo and get AI-generated makeover ideas</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleModeSelect("pro")}
                className="btn w-full bg-gray-900 border-2 border-green-500 rounded-3xl hover:bg-gray-800 hover:shadow-2xl hover:shadow-green-900/50 active:scale-98 transition-all group overflow-hidden"
              >
                <div className="flex items-center gap-6 px-6 py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center group-hover:bg-green-500/30 group-hover:scale-110 transition-all flex-shrink-0">
                    <Target className="w-8 h-8 text-green-400" strokeWidth={2.5} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                      Pro Mode
                      <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-md">NEW</span>
                    </div>
                    <div className="text-sm text-gray-400">Upload before + target photos to match a specific look</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {currentStep === "upload" && appMode === "standard" && (
          <div className="animate-fade-in space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Take a Photo
              </h2>
              <p className="text-lg text-gray-400 max-w-md mx-auto">
                Capture your furniture to get AI-powered ideas
              </p>
            </div>
            <PhotoCapture onCapture={handleImageCapture} />
          </div>
        )}

        {currentStep === "upload" && appMode === "pro" && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Pro Mode
              </h2>
              <p className="text-lg text-gray-400 max-w-md mx-auto">
                Upload your before photo and a target inspiration photo
              </p>
            </div>
            <DualPhotoCapture onCapture={handleDualPhotoCapture} />
          </div>
        )}

        {currentStep === "identification" && (
          <div className="animate-slide-up">
            <IdentificationResults
              image={capturedImage!}
              data={identificationData}
              onConfirm={handleIdentificationConfirm}
              onRetake={() => setCurrentStep("upload")}
            />
          </div>
        )}

        {currentStep === "pro-identification" && (
          <div className="animate-slide-up">
            <ProIdentificationResults
              beforeImage={capturedImage!}
              targetImage={targetImage!}
              data={identificationData}
              onConfirm={handleProIdentificationConfirm}
              onRetake={() => setCurrentStep("upload")}
            />
          </div>
        )}

        {currentStep === "constraints" && appMode === "standard" && (
          <div className="animate-slide-up">
            <ConstraintsForm
              image={capturedImage!}
              onSubmit={handleConstraintsSubmit}
              onBack={() => setCurrentStep("upload")}
              mode="standard"
            />
          </div>
        )}

        {currentStep === "constraints" && appMode === "pro" && (
          <div className="animate-slide-up">
            <ConstraintsForm
              image={capturedImage!}
              onSubmit={handleProModeAnalysis}
              onBack={() => setCurrentStep("upload")}
              mode="pro"
            />
          </div>
        )}

        {currentStep === "analysis" && (
          <div className="animate-scale-in">
            <AnalysisResults data={analysisData} />
          </div>
        )}

        {currentStep === "ideas" && (
          <div className="animate-slide-up">
            <IdeasList
              analysis={analysisData}
              constraints={constraints}
              onSelectIdea={handleIdeaSelect}
            />
          </div>
        )}

        {currentStep === "plan" && (
          <div className="animate-slide-up">
            <PlanView
              idea={selectedIdea}
              analysis={analysisData}
              constraints={constraints}
              onBack={() => setCurrentStep("ideas")}
            />
          </div>
        )}

        {currentStep === "pro-comparison" && (
          <div className="animate-slide-up">
            <ComparisonResults
              beforeImage={capturedImage!}
              targetImage={targetImage!}
              data={comparisonData}
              constraints={constraints}
              onBack={() => setCurrentStep("constraints")}
            />
          </div>
        )}
      </div>
    </main>
  );
}
