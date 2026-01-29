"use client";

import { useState } from "react";
import { ChevronLeft, Palette, Wrench, DollarSign, Clock, Target, User, Box, Gift } from "lucide-react";

interface ConstraintsFormProps {
  image: string;
  onSubmit: (constraints: any) => void;
  onBack: () => void;
  mode?: "standard" | "pro" | "creative-reuse";
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

// Creative Reuse Mode Constants
const USE_CASES = [
  { id: "functional", label: "Functional", emoji: "🔧", description: "Shelves, organizers, planters" },
  { id: "decorative", label: "Decorative", emoji: "🎨", description: "Wall art, centerpieces" },
  { id: "storage", label: "Storage", emoji: "📦", description: "Bins, racks, holders" },
  { id: "outdoor", label: "Outdoor", emoji: "🌳", description: "Garden, patio, yard" },
  { id: "gift", label: "Gift/Craft", emoji: "🎁", description: "Unique presents" },
  { id: "open", label: "Open to Ideas", emoji: "✨", description: "Surprise me!" },
];

const SKILL_LEVELS = [
  { id: "beginner", label: "Beginner", description: "Simple assembly, minimal cutting" },
  { id: "intermediate", label: "Intermediate", description: "Drilling, measuring, light mods" },
  { id: "advanced", label: "Advanced", description: "Welding, complex carpentry" },
];

const MATERIALS_AVAILABLE = [
  { id: "none", label: "None", description: "Use object as-is or adhesives" },
  { id: "basic-craft", label: "Basic Craft", description: "Paint, glue, fabric, hand tools" },
  { id: "power-tools", label: "Power Tools", description: "Drill, saw, sander available" },
  { id: "welding", label: "Welding/Advanced", description: "Metal work, complex fabrication" },
];

const INTENDED_AUDIENCE = [
  { id: "personal", label: "Personal Use", emoji: "🏠", description: "Keep for yourself" },
  { id: "gift", label: "Gift", emoji: "🎁", description: "Present for someone" },
  { id: "sell", label: "Sell", emoji: "💰", description: "List on marketplace" },
  { id: "donation", label: "Donation", emoji: "❤️", description: "Give to charity" },
];

export default function ConstraintsForm({ image, onSubmit, onBack, mode = "standard" }: ConstraintsFormProps) {
  // Standard/Pro mode state
  const [styleGoal, setStyleGoal] = useState("");
  const [tools, setTools] = useState("");
  const [budget, setBudget] = useState("");
  const [time, setTime] = useState("");

  // Creative Reuse mode state
  const [useCase, setUseCase] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [materialsAvailable, setMaterialsAvailable] = useState("");
  const [intendedAudience, setIntendedAudience] = useState("");

  const isProMode = mode === "pro";
  const isCreativeReuse = mode === "creative-reuse";

  const isValid = isCreativeReuse
    ? (useCase && skillLevel && materialsAvailable && intendedAudience && budget && time)
    : isProMode
      ? (tools && budget && time)
      : (styleGoal && tools && budget && time);

  const handleSubmit = () => {
    if (isValid) {
      const constraints: any = {
        budgetBand: budget,
        timeBand: time,
      };

      if (isCreativeReuse) {
        // Creative Reuse mode constraints
        constraints.useCase = useCase;
        constraints.skillLevel = skillLevel;
        constraints.materialsAvailable = materialsAvailable;
        constraints.intendedAudience = intendedAudience;
      } else {
        // Standard/Pro mode constraints
        constraints.tools = tools;
        if (!isProMode) {
          constraints.styleGoal = styleGoal;
        }
      }

      onSubmit(constraints);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with image preview */}
      <div className="flex items-start gap-4">
        <button
          onClick={onBack}
          className="btn mt-2 w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isCreativeReuse ? "Repurposing Goals" : isProMode ? "Project Details" : "Tell us your vision"}
          </h2>
          <p className="text-gray-400">
            {isCreativeReuse ? "Help us find creative ways to reuse this object" : isProMode ? "Help us create your transformation plan" : "Help us find the perfect makeover plan"}
          </p>
        </div>
        <img src={image} alt="Preview" className="w-20 h-20 object-cover rounded-xl border-2 border-gray-700" />
      </div>

      {/* Style Goal - Only show in standard mode */}
      {!isProMode && !isCreativeReuse && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Palette className="w-5 h-5 text-purple-400" />
            <span>Style Goal</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setStyleGoal(style.id)}
                className={`btn p-4 rounded-xl border-2 transition-all ${
                  styleGoal === style.id
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-gray-700 bg-gray-800 hover:border-gray-600"
                }`}
              >
                <div className="text-2xl mb-1">{style.emoji}</div>
                <div className="text-sm font-medium text-white">{style.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Use Case - Only show in Creative Reuse mode */}
      {isCreativeReuse && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Target className="w-5 h-5 text-orange-400" />
            <span>Use Case</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {USE_CASES.map((usecase) => (
              <button
                key={usecase.id}
                onClick={() => setUseCase(usecase.id)}
                className={`btn p-4 rounded-xl border-2 transition-all ${
                  useCase === usecase.id
                    ? "border-orange-500 bg-orange-500/20"
                    : "border-gray-700 bg-gray-800 hover:border-gray-600"
                }`}
              >
                <div className="text-2xl mb-1">{usecase.emoji}</div>
                <div className="text-sm font-medium text-white">{usecase.label}</div>
                <div className="text-xs text-gray-400 mt-1">{usecase.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tools - Only show in Standard/Pro mode */}
      {!isCreativeReuse && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Wrench className={`w-5 h-5 ${isProMode ? "text-green-400" : "text-purple-400"}`} />
            <span>Available Tools</span>
          </div>
          <div className="space-y-2">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setTools(tool.id)}
                className={`btn w-full p-4 rounded-xl border-2 transition-all text-left ${
                  tools === tool.id
                    ? isProMode
                      ? "border-green-500 bg-green-500/20"
                      : "border-purple-500 bg-purple-500/20"
                    : "border-gray-700 bg-gray-800 hover:border-gray-600"
                }`}
              >
                <div className="font-semibold text-white">{tool.label}</div>
                <div className="text-sm text-gray-400">{tool.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Skill Level - Only show in Creative Reuse mode */}
      {isCreativeReuse && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <User className="w-5 h-5 text-orange-400" />
            <span>Skill Level</span>
          </div>
          <div className="space-y-2">
            {SKILL_LEVELS.map((skill) => (
              <button
                key={skill.id}
                onClick={() => setSkillLevel(skill.id)}
                className={`btn w-full p-4 rounded-xl border-2 transition-all text-left ${
                  skillLevel === skill.id
                    ? "border-orange-500 bg-orange-500/20"
                    : "border-gray-700 bg-gray-800 hover:border-gray-600"
                }`}
              >
                <div className="font-semibold text-white">{skill.label}</div>
                <div className="text-sm text-gray-400">{skill.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Materials Available - Only show in Creative Reuse mode */}
      {isCreativeReuse && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Box className="w-5 h-5 text-orange-400" />
            <span>Materials Available</span>
          </div>
          <div className="space-y-2">
            {MATERIALS_AVAILABLE.map((material) => (
              <button
                key={material.id}
                onClick={() => setMaterialsAvailable(material.id)}
                className={`btn w-full p-4 rounded-xl border-2 transition-all text-left ${
                  materialsAvailable === material.id
                    ? "border-orange-500 bg-orange-500/20"
                    : "border-gray-700 bg-gray-800 hover:border-gray-600"
                }`}
              >
                <div className="font-semibold text-white">{material.label}</div>
                <div className="text-sm text-gray-400">{material.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Intended Audience - Only show in Creative Reuse mode */}
      {isCreativeReuse && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Gift className="w-5 h-5 text-orange-400" />
            <span>Intended Audience</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {INTENDED_AUDIENCE.map((audience) => (
              <button
                key={audience.id}
                onClick={() => setIntendedAudience(audience.id)}
                className={`btn p-4 rounded-xl border-2 transition-all ${
                  intendedAudience === audience.id
                    ? "border-orange-500 bg-orange-500/20"
                    : "border-gray-700 bg-gray-800 hover:border-gray-600"
                }`}
              >
                <div className="text-2xl mb-1">{audience.emoji}</div>
                <div className="text-sm font-medium text-white">{audience.label}</div>
                <div className="text-xs text-gray-400 mt-1">{audience.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Budget */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white font-semibold">
          <DollarSign className={`w-5 h-5 ${isCreativeReuse ? "text-orange-400" : isProMode ? "text-green-400" : "text-purple-400"}`} />
          <span>Budget</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {BUDGETS.map((budgetOption) => (
            <button
              key={budgetOption.id}
              onClick={() => setBudget(budgetOption.value)}
              className={`btn p-4 rounded-xl border-2 transition-all ${
                budget === budgetOption.value
                  ? isCreativeReuse
                    ? "border-orange-500 bg-orange-500/20"
                    : isProMode
                      ? "border-green-500 bg-green-500/20"
                      : "border-purple-500 bg-purple-500/20"
                  : "border-gray-700 bg-gray-800 hover:border-gray-600"
              }`}
            >
              <div className="text-xl font-bold text-white mb-1">{budgetOption.label}</div>
              <div className="text-xs text-gray-400">{budgetOption.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Time */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Clock className={`w-5 h-5 ${isCreativeReuse ? "text-orange-400" : isProMode ? "text-green-400" : "text-purple-400"}`} />
          <span>Time Available</span>
        </div>
        <div className="space-y-2">
          {TIMES.map((timeOption) => (
            <button
              key={timeOption.id}
              onClick={() => setTime(timeOption.value)}
              className={`btn w-full p-4 rounded-xl border-2 transition-all text-left ${
                time === timeOption.value
                  ? isCreativeReuse
                    ? "border-orange-500 bg-orange-500/20"
                    : isProMode
                      ? "border-green-500 bg-green-500/20"
                      : "border-purple-500 bg-purple-500/20"
                  : "border-gray-700 bg-gray-800 hover:border-gray-600"
              }`}
            >
              <div className="font-semibold text-white">{timeOption.label}</div>
              <div className="text-sm text-gray-400">{timeOption.description}</div>
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
            ? isCreativeReuse
              ? "bg-orange-600 text-white hover:bg-orange-700"
              : isProMode
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-purple-600 text-white hover:bg-purple-700"
            : "bg-gray-800 text-gray-600 cursor-not-allowed border-2 border-gray-700"
        }`}
      >
        {isCreativeReuse ? "Get Creative Ideas" : isProMode ? "Generate Transformation Plan" : "Get Makeover Ideas"}
      </button>
    </div>
  );
}
