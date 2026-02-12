"use client";

import { useState } from "react";
import { ChevronLeft, ChevronDown, ChevronUp, ChevronRight, Palette, Wrench, DollarSign, Clock, Target, User, Box, Gift, Pencil, Sparkles } from "lucide-react";
import type { UserProfile } from "./Onboarding";

interface ConstraintsFormProps {
  image: string;
  onSubmit: (constraints: any) => void;
  onBack: () => void;
  mode?: "standard" | "pro" | "creative-reuse";
  userProfile?: UserProfile | null;
}

interface DesignSubcategory {
  id: string;
  label: string;
  description?: string;
}

interface DesignCategory {
  id: string;
  label: string;
  emoji: string;
  description: string;
  subcategories: DesignSubcategory[];
}

const DESIGN_DIRECTIONS: DesignCategory[] = [
  {
    id: "classic",
    label: "Classic Styles",
    emoji: "🎨",
    description: "Timeless design aesthetics",
    subcategories: [
      { id: "modern", label: "Modern" },
      { id: "rustic", label: "Rustic" },
      { id: "coastal", label: "Coastal" },
      { id: "mid-century", label: "Mid-Century" },
      { id: "industrial", label: "Industrial" },
      { id: "boho", label: "Boho" },
      { id: "farmhouse", label: "Farmhouse" },
      { id: "scandinavian", label: "Scandinavian" },
    ],
  },
  {
    id: "retro-60s",
    label: "Retro 60's",
    emoji: "🌈",
    description: "Groovy throwback vibes",
    subcategories: [
      { id: "rainbow", label: "Rainbow Paint Over", description: "Bright multi-colour stripes or gradient" },
      { id: "psychedelic", label: "Psychedelic Design", description: "Swirls, tie-dye patterns, trippy colours" },
      { id: "bold-retro", label: "Bold Retro Colours", description: "Avocado green, burnt orange, mustard yellow" },
    ],
  },
  {
    id: "kids",
    label: "Designs for Kids",
    emoji: "🧸",
    description: "Fun themes for children",
    subcategories: [
      { id: "blue-paint", label: "Blue Paint Over", description: "Solid blue or ocean tones" },
      { id: "pink-paint", label: "Pink Paint Over", description: "Solid pink or blush tones" },
      { id: "white-paint", label: "White Paint Over", description: "Clean white or cream" },
      { id: "unicorns", label: "Unicorns", description: "Pastel rainbow + unicorn motifs" },
      { id: "balloons", label: "Balloons", description: "Balloon shapes + party colours" },
      { id: "rainbows-clouds", label: "Rainbows & Clouds", description: "Rainbow arcs + fluffy clouds" },
      { id: "space", label: "Space - Rockets & Stars", description: "Planets, rockets, stars, galaxies" },
      { id: "dolls", label: "Dolls", description: "Doll-house style pastel design" },
      { id: "teddy-bears", label: "Teddy Bears", description: "Cute bear motifs + warm tones" },
    ],
  },
  {
    id: "trending",
    label: "2025-2026 Trends",
    emoji: "🔥",
    description: "What's hot right now",
    subcategories: [
      { id: "bold-moody", label: "Bold & Moody Colours", description: "Deep emerald, mustard, navy, high-gloss black" },
      { id: "sculptural", label: "Sculptural & Curved", description: "Scalloped edges, organic curves" },
      { id: "decoupage", label: "Decoupage & Pattern", description: "Botanical/floral motifs, patterned paper" },
      { id: "mixed-materials", label: "Mixed Materials", description: "Wood + metal legs, leather accents" },
      { id: "statement-hardware", label: "Statement Hardware", description: "Modern or vintage-inspired handles" },
      { id: "two-tone", label: "Two-Tone Design", description: "Contrasting paint + stained wood" },
      { id: "hand-painted", label: "Hand-Painted Detailing", description: "Floral garlands, leafy cottagecore" },
      { id: "stained-revival", label: "Stained Wood Revival", description: "Showcase natural grain, modernised" },
      { id: "hidden-color", label: "Hidden Colour Pop", description: "Surprise bright colour inside drawers" },
    ],
  },
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

export default function ConstraintsForm({ image, onSubmit, onBack, mode = "standard", userProfile }: ConstraintsFormProps) {
  const hasProfile = !!(userProfile?.tools && userProfile?.time);

  // Design direction state (replaces old styleGoal)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [customDesignText, setCustomDesignText] = useState("");

  // Standard/Pro mode state — pre-fill from profile
  const [tools, setTools] = useState(hasProfile ? userProfile!.tools : "");
  const [budget, setBudget] = useState("");
  const [time, setTime] = useState(hasProfile ? userProfile!.time : "");
  const [showToolsTime, setShowToolsTime] = useState(!hasProfile);

  // Creative Reuse mode state
  const [useCase, setUseCase] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [materialsAvailable, setMaterialsAvailable] = useState("");
  const [intendedAudience, setIntendedAudience] = useState("");

  const isProMode = mode === "pro";
  const isCreativeReuse = mode === "creative-reuse";

  const hasDesignDirection = (selectedCategory && selectedSubcategory) || customDesignText.trim().length > 0;

  const isValid = isCreativeReuse
    ? (useCase && skillLevel && materialsAvailable && intendedAudience && budget && time)
    : isProMode
      ? (tools && budget && time)
      : (hasDesignDirection && tools && budget && time);

  const handleCategoryToggle = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  const handleSubcategorySelect = (categoryId: string, subcategoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(subcategoryId);
    setCustomDesignText(""); // Clear custom text when selecting a preset
  };

  const handleCustomTextChange = (text: string) => {
    setCustomDesignText(text);
    if (text.trim()) {
      // Clear preset selection when typing custom text
      setSelectedCategory("");
      setSelectedSubcategory("");
    }
  };

  const handleSubmit = () => {
    if (isValid) {
      const constraints: any = {
        budgetBand: budget,
        timeBand: time,
      };

      if (isCreativeReuse) {
        constraints.useCase = useCase;
        constraints.skillLevel = skillLevel;
        constraints.materialsAvailable = materialsAvailable;
        constraints.intendedAudience = intendedAudience;
      } else {
        constraints.tools = tools;
        if (!isProMode) {
          if (customDesignText.trim()) {
            constraints.designDirection = {
              type: "custom",
              customText: customDesignText.trim(),
            };
            // Keep styleGoal for backward compat
            constraints.styleGoal = "custom";
          } else {
            const cat = DESIGN_DIRECTIONS.find(c => c.id === selectedCategory);
            const sub = cat?.subcategories.find(s => s.id === selectedSubcategory);
            constraints.designDirection = {
              type: "preset",
              categoryId: selectedCategory,
              categoryLabel: cat?.label || selectedCategory,
              subcategoryId: selectedSubcategory,
              subcategoryLabel: sub?.label || selectedSubcategory,
              subcategoryDescription: sub?.description || "",
            };
            // Keep styleGoal for backward compat (use subcategory label)
            constraints.styleGoal = sub?.label || selectedSubcategory;
          }
        }
      }

      onSubmit(constraints);
    }
  };

  const accentIconClass = isCreativeReuse ? "text-orange-400" : isProMode ? "text-green-400" : "text-purple-400";
  const accentSelectedClass = isCreativeReuse ? "border-orange-500 bg-orange-500/20" : isProMode ? "border-green-500 bg-green-500/20" : "border-purple-500 bg-purple-500/20";
  const toolLabel = TOOLS.find((t) => t.id === tools)?.label || "Not set";
  const timeLabel = TIMES.find((t) => t.value === time)?.label || "Not set";

  // Get the selected design direction label for display
  const getSelectedLabel = () => {
    if (customDesignText.trim()) return `Custom: ${customDesignText.trim()}`;
    if (selectedCategory && selectedSubcategory) {
      const cat = DESIGN_DIRECTIONS.find(c => c.id === selectedCategory);
      const sub = cat?.subcategories.find(s => s.id === selectedSubcategory);
      return sub?.label || "";
    }
    return "";
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

      {/* Design Direction — Only show in standard mode */}
      {!isProMode && !isCreativeReuse && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Palette className="w-5 h-5 text-purple-400" />
            <span>Design Direction</span>
          </div>

          {/* Selected indicator */}
          {hasDesignDirection && (
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/15 border border-purple-500/30 rounded-xl">
              <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span className="text-sm text-purple-300 font-medium truncate">{getSelectedLabel()}</span>
            </div>
          )}

          {/* Collapsible category cards */}
          <div className="space-y-2">
            {DESIGN_DIRECTIONS.map((category) => {
              const isExpanded = expandedCategory === category.id;
              const hasSelection = selectedCategory === category.id;

              return (
                <div key={category.id} className="rounded-xl border-2 border-gray-700 bg-gray-800 overflow-hidden transition-all">
                  {/* Category header */}
                  <button
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`btn w-full p-4 flex items-center gap-3 transition-all text-left ${
                      hasSelection ? "bg-purple-500/10" : "hover:bg-gray-700/50"
                    }`}
                  >
                    <div className="text-2xl flex-shrink-0">{category.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white flex items-center gap-2">
                        {category.label}
                        {hasSelection && (
                          <span className="text-xs px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded-md">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">{category.description}</div>
                    </div>
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Subcategories (collapsible) */}
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-1.5 border-t border-gray-700">
                      <div className="pt-2" />
                      {category.subcategories.map((sub) => {
                        const isSelected = selectedCategory === category.id && selectedSubcategory === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleSubcategorySelect(category.id, sub.id)}
                            className={`btn w-full p-3 rounded-lg border transition-all text-left ${
                              isSelected
                                ? "border-purple-500 bg-purple-500/20"
                                : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                            }`}
                          >
                            <div className="font-medium text-white text-sm">{sub.label}</div>
                            {sub.description && (
                              <div className="text-xs text-gray-400 mt-0.5">{sub.description}</div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Custom design input */}
          <div className="rounded-xl border-2 border-gray-700 bg-gray-800 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Pencil className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-white">Your Own Idea</span>
            </div>
            <textarea
              value={customDesignText}
              onChange={(e) => handleCustomTextChange(e.target.value)}
              placeholder="Describe your design idea... e.g. 'Farmhouse style with copper accents and distressed edges'"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
              rows={2}
            />
            {customDesignText.trim() && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-400">
                <Sparkles className="w-3 h-3" />
                AI will generate ideas based on your description
              </div>
            )}
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
          <DollarSign className={`w-5 h-5 ${accentIconClass}`} />
          <span>Budget</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {BUDGETS.map((budgetOption) => (
            <button
              key={budgetOption.id}
              onClick={() => setBudget(budgetOption.value)}
              className={`btn p-4 rounded-xl border-2 transition-all ${
                budget === budgetOption.value
                  ? accentSelectedClass
                  : "border-gray-700 bg-gray-800 hover:border-gray-600"
              }`}
            >
              <div className="text-xl font-bold text-white mb-1">{budgetOption.label}</div>
              <div className="text-xs text-gray-400">{budgetOption.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tools & Time — collapsible when pre-filled from profile */}
      {!isCreativeReuse && hasProfile && !showToolsTime && (
        <button
          onClick={() => setShowToolsTime(true)}
          className="btn w-full p-4 rounded-xl border-2 border-gray-700 bg-gray-800/50 hover:border-gray-600 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Using your defaults</div>
              <div className="text-sm text-white">
                <Wrench className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                {toolLabel}
                <span className="text-gray-600 mx-2">|</span>
                <Clock className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                {timeLabel}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              Change
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </button>
      )}

      {/* Tools - expanded */}
      {!isCreativeReuse && (showToolsTime || !hasProfile) && (
        <>
          {hasProfile && (
            <button
              onClick={() => setShowToolsTime(false)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-400 transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
              Hide tools &amp; time
            </button>
          )}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Wrench className={`w-5 h-5 ${accentIconClass}`} />
              <span>Available Tools</span>
            </div>
            <div className="space-y-2">
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setTools(tool.id)}
                  className={`btn w-full p-4 rounded-xl border-2 transition-all text-left ${
                    tools === tool.id
                      ? accentSelectedClass
                      : "border-gray-700 bg-gray-800 hover:border-gray-600"
                  }`}
                >
                  <div className="font-semibold text-white">{tool.label}</div>
                  <div className="text-sm text-gray-400">{tool.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Clock className={`w-5 h-5 ${accentIconClass}`} />
              <span>Time Available</span>
            </div>
            <div className="space-y-2">
              {TIMES.map((timeOption) => (
                <button
                  key={timeOption.id}
                  onClick={() => setTime(timeOption.value)}
                  className={`btn w-full p-4 rounded-xl border-2 transition-all text-left ${
                    time === timeOption.value
                      ? accentSelectedClass
                      : "border-gray-700 bg-gray-800 hover:border-gray-600"
                  }`}
                >
                  <div className="font-semibold text-white">{timeOption.label}</div>
                  <div className="text-sm text-gray-400">{timeOption.description}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Time - standalone for Creative Reuse (always visible since no profile tools) */}
      {isCreativeReuse && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Clock className="w-5 h-5 text-orange-400" />
            <span>Time Available</span>
          </div>
          <div className="space-y-2">
            {TIMES.map((timeOption) => (
              <button
                key={timeOption.id}
                onClick={() => setTime(timeOption.value)}
                className={`btn w-full p-4 rounded-xl border-2 transition-all text-left ${
                  time === timeOption.value
                    ? "border-orange-500 bg-orange-500/20"
                    : "border-gray-700 bg-gray-800 hover:border-gray-600"
                }`}
              >
                <div className="font-semibold text-white">{timeOption.label}</div>
                <div className="text-sm text-gray-400">{timeOption.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

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
