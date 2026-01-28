"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp, Clock, DollarSign, ChevronRight } from "lucide-react";

interface IdeasListProps {
  analysis: any;
  constraints: any;
  onSelectIdea: (idea: any) => void;
}

export default function IdeasList({ analysis, constraints, onSelectIdea }: IdeasListProps) {
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
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Generating ideas...</h3>
        <p className="text-gray-600 text-center max-w-md">
          Creating personalized makeover plans based on your preferences
        </p>
      </div>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Makeover Ideas</h2>
        <p className="text-gray-600">Choose your favorite transformation</p>
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
