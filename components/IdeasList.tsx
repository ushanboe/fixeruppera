"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Clock, DollarSign, ChevronRight, ChevronLeft } from "lucide-react";
import PandaLoading from "@/components/panda/PandaLoading";

interface IdeasListProps {
  analysis: any;
  constraints: any;
  onSelectIdea: (idea: any) => void;
  onBack?: () => void;
}

export default function IdeasList({ analysis, constraints, onSelectIdea, onBack }: IdeasListProps) {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const response = await fetch("/api/upcycle/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis,
          constraints,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      const data = await response.json();
      setIdeas(data.ideas || []);
    } catch (error) {
      console.error("Failed to fetch ideas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PandaLoading
        animation="spinning"
        title="Generating ideas..."
        description="Creating personalized makeover plans based on your preferences"
      />
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="mb-6">
        <div className="flex items-start gap-4 mb-4">
          {onBack && (
            <button
              onClick={onBack}
              className="btn mt-2 w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Makeover Ideas</h2>
            <p className="text-gray-600">Choose your favorite transformation</p>
          </div>
        </div>
      </div>

      {ideas.map((idea, index) => (
        <button
          key={idea.id}
          onClick={() => onSelectIdea(idea)}
          className="btn w-full bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-purple-600 hover:shadow-lg transition-all text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="flex-1">
              {/* Badge */}
              {index === 0 && (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-bold mb-2">
                  <TrendingUp className="w-3 h-3" />
                  RECOMMENDED
                </div>
              )}

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">{idea.title}</h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-3">{idea.whyItWorks}</p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className={`px-2 py-1 rounded-md font-medium ${getDifficultyColor(idea.difficulty)}`}>
                  {idea.difficulty}
                </span>

                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    {idea.timeEstimate?.minHours}-{idea.timeEstimate?.maxHours}h
                  </span>
                </div>

                <div className="flex items-center gap-1 text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>
                    ${idea.costEstimate?.min}-${idea.costEstimate?.max}
                  </span>
                </div>
              </div>

              {/* Steps Preview */}
              {idea.stepsPreview && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-700 mb-1">Quick Preview:</div>
                  <div className="flex flex-wrap gap-1">
                    {idea.stepsPreview.slice(0, 3).map((step: string, i: number) => (
                      <span key={i} className="text-xs text-gray-500">
                        {i + 1}. {step}
                        {i < Math.min(2, idea.stepsPreview.length - 1) && " →"}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
          </div>
        </button>
      ))}

      {ideas.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No ideas generated. Please try again.
        </div>
      )}
    </div>
  );
}
