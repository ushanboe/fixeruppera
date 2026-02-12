"use client";

import { AlertTriangle } from "lucide-react";
import PandaLoading from "@/components/panda/PandaLoading";

interface AnalysisResultsProps {
  data: any;
}

export default function AnalysisResults({ data }: AnalysisResultsProps) {
  if (!data) {
    return (
      <PandaLoading
        animation="sadIdle"
        title="Analyzing your item..."
        description="Our AI is identifying the material, condition, and potential of your furniture"
      />
    );
  }

  return (
    <div className="space-y-6 animate-scale-in">
      <h2 className="text-2xl font-bold text-gray-900">Analysis Complete</h2>

      {/* Object Identification */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-3">What We Found</h3>
        <div className="space-y-2">
          {data.objectCandidates?.map((candidate: any, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-700">{candidate.label}</span>
              <span className="text-sm text-gray-500">
                {Math.round(candidate.confidence * 100)}% confident
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Materials */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-3">Materials</h3>
        <div className="space-y-2">
          {data.materials?.map((material: any, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-700">{material.label}</span>
              <span className="text-sm text-gray-500">
                {Math.round(material.confidence * 100)}% confident
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-3">Condition Notes</h3>
        {data.condition?.issues?.length > 0 && (
          <div className="space-y-2 mb-3">
            {data.condition.issues.map((issue: any, index: number) => (
              <div
                key={index}
                className={`flex items-start gap-2 p-3 rounded-lg ${
                  issue.severity === "high"
                    ? "bg-red-50 border border-red-200"
                    : "bg-yellow-50 border border-yellow-200"
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 mt-0.5 ${
                    issue.severity === "high" ? "text-red-600" : "text-yellow-600"
                  }`}
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{issue.label}</div>
                  <div className="text-sm text-gray-600">Severity: {issue.severity}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {data.condition?.notes && (
          <p className="text-gray-700 text-sm">{data.condition.notes}</p>
        )}
      </div>

      {/* Safety Flags */}
      {data.safetyFlags?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Safety Warnings
          </h3>
          <div className="space-y-2">
            {data.safetyFlags.map((flag: any, index: number) => (
              <div key={index} className="text-sm">
                <div className="font-medium text-red-900">{flag.label.replace(/_/g, " ").toUpperCase()}</div>
                <div className="text-red-700">{flag.why}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
