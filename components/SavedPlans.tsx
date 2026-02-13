"use client";

import { useState, useEffect } from "react";
import { Trash2, Calendar, Clock, DollarSign, ChevronRight, Bookmark } from "lucide-react";
import PlanView from "./PlanView";

interface SavedPlansProps {
  onBack: () => void;
}

export default function SavedPlans({ onBack }: SavedPlansProps) {
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  useEffect(() => {
    console.log('🚀 SavedPlans component mounted');
    loadSavedPlans();
  }, []);

  const loadSavedPlans = () => {
    try {
      console.log('🔍 Loading saved plans...');
      const savedPlansJson = localStorage.getItem('fixeruppera_saved_plans');
      console.log('📦 Raw localStorage data:', savedPlansJson);
      const plans = savedPlansJson ? JSON.parse(savedPlansJson) : [];
      console.log('✅ Parsed plans:', plans);
      console.log('📊 Number of plans:', plans.length);
      setSavedPlans(plans);
    } catch (error) {
      console.error('❌ Failed to load saved plans:', error);
      setSavedPlans([]);
    }
  };

  const handleDeletePlan = (planId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (confirm('Delete this saved plan?')) {
      try {
        const updatedPlans = savedPlans.filter(p => p.id !== planId);
        localStorage.setItem('fixeruppera_saved_plans', JSON.stringify(updatedPlans));
        setSavedPlans(updatedPlans);
      } catch (error) {
        console.error('Failed to delete plan:', error);
      }
    }
  };

  const handleViewPlan = (plan: any) => {
    setSelectedPlan(plan);
  };

  const handleBackFromPlan = () => {
    setSelectedPlan(null);
    loadSavedPlans(); // Reload in case plan was modified
  };

  // If viewing a specific plan, show the PlanView
  if (selectedPlan) {
    return (
      <PlanView
        idea={selectedPlan.idea}
        analysis={selectedPlan.analysis}
        constraints={selectedPlan.constraints}
        beforeImage={selectedPlan.beforeImage}
        onBack={handleBackFromPlan}
        initialPlan={selectedPlan.plan}
        initialCompletedSteps={selectedPlan.completedSteps}
        initialMockupImage={selectedPlan.mockupImage}
        initialProfitData={selectedPlan.profitData}
        initialBunningsData={selectedPlan.bunningsData}
      />
    );
  }

  console.log('🎨 Rendering SavedPlans, state has:', savedPlans.length, 'plans');
  console.log('📋 Saved plans state:', savedPlans);

  return (
    <div className="space-y-6 animate-slide-up pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bookmark className="w-7 h-7 text-purple-400" />
            Saved Plans
          </h2>
          <p className="text-gray-400 mt-1">{savedPlans.length} saved {savedPlans.length === 1 ? 'plan' : 'plans'}</p>
        </div>
        <button
          onClick={onBack}
          className="btn px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
        >
          Back
        </button>
      </div>

      {/* Saved Plans List */}
      {savedPlans.length === 0 ? (
        <div className="bg-gray-900 rounded-xl p-12 border border-gray-800 text-center">
          <Bookmark className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Saved Plans Yet</h3>
          <p className="text-gray-400 mb-6">
            When you save a plan, it will appear here for easy access later.
          </p>
          <button
            onClick={onBack}
            className="btn px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Start a New Project
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {savedPlans.map((savedPlan) => {
            const date = new Date(savedPlan.savedAt);
            const itemType = savedPlan.analysis?.objectCandidates?.[0]?.label || 'Item';

            return (
              <div
                key={savedPlan.id}
                className="relative bg-gray-900 rounded-xl border border-gray-800 hover:border-purple-500 transition-all overflow-hidden"
              >
                <div
                  onClick={() => handleViewPlan(savedPlan)}
                  className="btn w-full text-left cursor-pointer"
                >
                  <div className="flex items-start gap-4 p-4">
                    {/* Thumbnails: Before + Mockup */}
                    {(savedPlan.beforeImage || savedPlan.mockupImage) && (
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        {savedPlan.beforeImage && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-800">
                            <img
                              src={savedPlan.beforeImage}
                              alt="Before"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {savedPlan.mockupImage && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-800 border-2 border-purple-500">
                            <img
                              src={savedPlan.mockupImage}
                              alt="Concept"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Plan Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1 truncate">
                        {savedPlan.plan?.title || savedPlan.idea?.title}
                      </h3>
                      <p className="text-sm text-gray-400 mb-3">{itemType}</p>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{date.toLocaleDateString()}</span>
                        </div>
                        {savedPlan.plan?.timeEstimate && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {savedPlan.plan.timeEstimate.minHours}-{savedPlan.plan.timeEstimate.maxHours}h
                            </span>
                          </div>
                        )}
                        {savedPlan.plan?.costEstimate && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>
                              ${savedPlan.plan.costEstimate.min}-${savedPlan.plan.costEstimate.max}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Progress */}
                      {savedPlan.completedSteps && savedPlan.completedSteps.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>
                              {savedPlan.completedSteps.length} of {savedPlan.plan?.steps?.length || 0} steps
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 transition-all"
                              style={{
                                width: `${((savedPlan.completedSteps.length / (savedPlan.plan?.steps?.length || 1)) * 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => handleDeletePlan(savedPlan.id, e)}
                        className="btn w-10 h-10 flex items-center justify-center rounded-full bg-red-900/20 hover:bg-red-900/30 transition-colors z-10"
                        title="Delete plan"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                      <ChevronRight className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
