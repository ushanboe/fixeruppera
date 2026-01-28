"use client";

import { useState } from "react";
import { Camera, Upload, Sparkles } from "lucide-react";
import PhotoCapture from "@/components/PhotoCapture";
import IdentificationResults from "@/components/IdentificationResults";
import ConstraintsForm from "@/components/ConstraintsForm";
import AnalysisResults from "@/components/AnalysisResults";
import IdeasList from "@/components/IdeasList";
import PlanView from "@/components/PlanView";

type AppStep = "upload" | "identification" | "constraints" | "analysis" | "ideas" | "plan";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<AppStep>("upload");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [identificationData, setIdentificationData] = useState<any>(null);
  const [constraints, setConstraints] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [selectedIdea, setSelectedIdea] = useState<any>(null);

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

  const handleReset = () => {
    setCapturedImage(null);
    setIdentificationData(null);
    setConstraints(null);
    setAnalysisData(null);
    setSelectedIdea(null);
    setCurrentStep("upload");
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
          {currentStep !== "upload" && (
            <button
              onClick={handleReset}
              className="text-sm font-medium text-purple-400 hover:text-purple-300"
            >
              Start Over
            </button>
          )}
        </div>
      </header>

      {/* Progress Indicator */}
      {currentStep !== "upload" && currentStep !== "identification" && (
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className={`h-1 flex-1 rounded-full ${["constraints", "analysis", "ideas", "plan"].includes(currentStep) ? "bg-purple-500" : "bg-gray-800"}`} />
            <div className={`h-1 flex-1 rounded-full ${["analysis", "ideas", "plan"].includes(currentStep) ? "bg-purple-500" : "bg-gray-800"}`} />
            <div className={`h-1 flex-1 rounded-full ${["ideas", "plan"].includes(currentStep) ? "bg-purple-500" : "bg-gray-800"}`} />
            <div className={`h-1 flex-1 rounded-full ${currentStep === "plan" ? "bg-purple-500" : "bg-gray-800"}`} />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 safe-bottom pb-12">
        {currentStep === "upload" && (
          <div className="animate-fade-in space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Transform Your Furniture
              </h2>
              <p className="text-lg text-gray-400 max-w-md mx-auto">
                Take a photo to get AI-powered upcycling ideas
              </p>
            </div>
            <PhotoCapture onCapture={handleImageCapture} />
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

        {currentStep === "constraints" && (
          <div className="animate-slide-up">
            <ConstraintsForm
              image={capturedImage!}
              onSubmit={handleConstraintsSubmit}
              onBack={() => setCurrentStep("upload")}
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
      </div>
    </main>
  );
}
