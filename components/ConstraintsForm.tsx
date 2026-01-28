"use client";

import { useState } from "react";
import { ChevronLeft, Palette, Wrench, DollarSign, Clock } from "lucide-react";

interface ConstraintsFormProps {
  image: string;
  onSubmit: (constraints: any) => void;
  onBack: () => void;
}

const STYLES = [
  { id: "modern", label: "Modern", emoji: "✨" },
  { id: "rustic", label: "Rustic", emoji: "🪵" },
  { id: "coastal", label: "Coastal", emoji: "🌊" },
  { id: "mid-century", label: "Mid-Century", emoji: "🎨" },
  { id: "industrial", label: "Industrial", emoji: "⚙️" },
  { id: "boho", label: "Boho", emoji: "🌺" },
];

const TOOLS = [
  { id: "none", label: "None", description: "Just simple supplies" },
  { id: "basic", label: "Basic", description: "Brush, sandpaper, screwdriver" },
  { id: "power", label: "Power Tools", description: "Drill, sander, saw" },
];

const BUDGETS = [
  { id: "$", label: "$", description: "Under $50", value: "$" },
  { id: "$$", label: "$$", description: "$50 - $150", value: "$$" },
  { id: "$$$", label: "$$$", description: "$150+", value: "$$$" },
];

const TIMES = [
  { id: "quick", label: "1-2 Hours", description: "Quick refresh", value: "1-2 hrs" },
  { id: "weekend", label: "Weekend", description: "1-2 days", value: "weekend" },
  { id: "project", label: "Multi-Week", description: "Take your time", value: "multi-week" },
];

export default function ConstraintsForm({ image, onSubmit, onBack }: ConstraintsFormProps) {
  const [styleGoal, setStyleGoal] = useState("");
  const [tools, setTools] = useState("");
  const [budget, setBudget] = useState("");
  const [time, setTime] = useState("");

  const isValid = styleGoal && tools && budget && time;

  const handleSubmit = () => {
    if (isValid) {
      onSubmit({
        styleGoal,
        tools,
        budgetBand: budget,
        timeBand: time,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with image preview */}
      <div className="flex items-start gap-4">
        <button
          onClick={onBack}
          className="btn mt-2 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us your vision</h2>
          <p className="text-gray-600">Help us find the perfect makeover plan</p>
        </div>
        <img src={image} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
      </div>

      {/* Style Goal */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          <Palette className="w-5 h-5 text-purple-600" />
          <span>Style Goal</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setStyleGoal(style.id)}
              className={`btn p-4 rounded-xl border-2 transition-all ${
                styleGoal === style.id
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-1">{style.emoji}</div>
              <div className="text-sm font-medium text-gray-900">{style.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          <Wrench className="w-5 h-5 text-purple-600" />
          <span>Available Tools</span>
        </div>
        <div className="space-y-2">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setTools(tool.id)}
              className={`btn w-full p-4 rounded-xl border-2 transition-all text-left ${
                tools === tool.id
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="font-semibold text-gray-900">{tool.label}</div>
              <div className="text-sm text-gray-600">{tool.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          <DollarSign className="w-5 h-5 text-purple-600" />
          <span>Budget</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {BUDGETS.map((budgetOption) => (
            <button
              key={budgetOption.id}
              onClick={() => setBudget(budgetOption.value)}
              className={`btn p-4 rounded-xl border-2 transition-all ${
                budget === budgetOption.value
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="text-xl font-bold text-gray-900 mb-1">{budgetOption.label}</div>
              <div className="text-xs text-gray-600">{budgetOption.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Time */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          <Clock className="w-5 h-5 text-purple-600" />
          <span>Time Available</span>
        </div>
        <div className="space-y-2">
          {TIMES.map((timeOption) => (
            <button
              key={timeOption.id}
              onClick={() => setTime(timeOption.value)}
              className={`btn w-full p-4 rounded-xl border-2 transition-all text-left ${
                time === timeOption.value
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="font-semibold text-gray-900">{timeOption.label}</div>
              <div className="text-sm text-gray-600">{timeOption.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className={`btn w-full py-4 rounded-xl font-bold text-lg transition-all ${
          isValid
            ? "bg-purple-600 text-white hover:bg-purple-700"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        Get Makeover Ideas
      </button>
    </div>
  );
}
