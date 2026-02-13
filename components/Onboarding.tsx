"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Wrench, Clock, Sparkles, Check, X } from "lucide-react";
import { PandaScene } from "@/components/panda";

export interface UserProfile {
  name: string;
  email: string;
  tools: string;
  time: string;
  spiritAnimal: string;
  onboardedAt: string;
}

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const TOOLS = [
  { id: "none", label: "Just My Hands", emoji: "🤲", description: "Simple supplies only" },
  { id: "basic", label: "Basic Kit", emoji: "🔧", description: "Brush, sandpaper, screwdriver" },
  { id: "power", label: "Power Tools", emoji: "⚡", description: "Drill, sander, saw" },
];

const TIMES = [
  { id: "1-2 hrs", label: "Quick Fix", emoji: "⏱️", description: "1-2 hours" },
  { id: "weekend", label: "Weekend Project", emoji: "📅", description: "1-2 days" },
  { id: "multi-week", label: "Grand Build", emoji: "🏗️", description: "Take my time" },
];

const SPIRITS = [
  { id: "warrior", label: "Weekend Warrior", emoji: "💪", description: "DIY every chance I get" },
  { id: "hunter", label: "Bargain Hunter", emoji: "🏷️", description: "Love a curbside find" },
  { id: "visionary", label: "Creative Visionary", emoji: "✨", description: "I see potential everywhere" },
  { id: "champion", label: "Eco Champion", emoji: "🌿", description: "Save it from landfill" },
];

// Confetti particles for celebration
function Confetti() {
  const colors = ["bg-purple-400", "bg-yellow-400", "bg-pink-400", "bg-green-400", "bg-blue-400", "bg-orange-400"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 rounded-full ${colors[i % colors.length]}`}
          initial={{
            x: "50%",
            y: "40%",
            opacity: 1,
            scale: 0,
          }}
          animate={{
            x: `${15 + Math.random() * 70}%`,
            y: `${Math.random() * 80}%`,
            opacity: [1, 1, 0],
            scale: [0, 1, 0.5],
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 1.5 + Math.random(),
            delay: Math.random() * 0.5,
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

// Step progress dots
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className={`h-2 rounded-full ${i === current ? "bg-purple-400 w-8" : i < current ? "bg-purple-600 w-2" : "bg-gray-700 w-2"}`}
          layout
          transition={{ type: "spring", bounce: 0.3 }}
        />
      ))}
    </div>
  );
}

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
};

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tools, setTools] = useState("");
  const [time, setTime] = useState("");
  const [spiritAnimal, setSpiritAnimal] = useState("");

  const nextStep = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };

  const handleComplete = () => {
    const profile: UserProfile = {
      name: name.trim(),
      email: email.trim(),
      tools,
      time,
      spiritAnimal,
      onboardedAt: new Date().toISOString(),
    };
    localStorage.setItem("fixeruppera_user_profile", JSON.stringify(profile));
    onComplete(profile);
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 max-w-md mx-auto">
      <StepDots current={step} total={5} />

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <motion.div
              key="welcome"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              className="flex flex-col items-center text-center h-full"
            >
              <motion.h1
                className="text-4xl font-black text-white mb-2"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.4, delay: 0.1 }}
              >
                Welcome to
              </motion.h1>
              <motion.h1
                className="text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
              >
                FixerUppera!
              </motion.h1>
              <motion.p
                className="text-gray-400 text-lg mb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Turn trash into treasure, one project at a time
              </motion.p>

              {/* Panda mascot */}
              <motion.div
                className="w-full mb-10"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.4, delay: 0.3 }}
              >
                <PandaScene animation="rallying" height={250} className="w-full max-w-[400px] mx-auto" />
              </motion.div>

              <motion.button
                onClick={nextStep}
                className="btn w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 active:scale-98 transition-all"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <span className="flex items-center justify-center gap-2">
                  Let&apos;s Go!
                  <ChevronRight className="w-5 h-5" />
                </span>
              </motion.button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="about"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              className="flex flex-col h-full"
            >
              <motion.div
                className="text-center mb-8"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <PandaScene animation="walking" height={120} className="w-full max-w-[150px] mx-auto" />
                <h2 className="text-3xl font-black text-white mb-2">About You</h2>
                <p className="text-gray-400">First things first!</p>
              </motion.div>

              <div className="space-y-5 flex-1">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    What should we call you? *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-4 bg-gray-800 border-2 border-gray-700 rounded-xl text-white text-lg placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                    autoFocus
                  />
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Email for project tips (optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full px-4 py-4 bg-gray-800 border-2 border-gray-700 rounded-xl text-white text-lg placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </motion.div>
              </div>

              <motion.button
                onClick={nextStep}
                disabled={!name.trim()}
                className={`btn w-full py-4 rounded-2xl font-bold text-lg transition-all mt-6 ${
                  name.trim()
                    ? "bg-purple-600 text-white hover:bg-purple-700 active:scale-98"
                    : "bg-gray-800 text-gray-600 cursor-not-allowed"
                }`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="flex items-center justify-center gap-2">
                  Next
                  <ChevronRight className="w-5 h-5" />
                </span>
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="workshop"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              className="flex flex-col h-full"
            >
              <motion.div
                className="text-center mb-6"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <PandaScene animation="spinning" height={120} className="w-full max-w-[150px] mx-auto" />
                <h2 className="text-3xl font-black text-white mb-2">Your Workshop</h2>
                <p className="text-gray-400">Tell us about your setup, {name.split(" ")[0]}!</p>
              </motion.div>

              <div className="space-y-5 flex-1 overflow-y-auto pb-4">
                {/* Tools */}
                <div>
                  <div className="flex items-center gap-2 text-white font-semibold mb-2">
                    <Wrench className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">Your Toolkit</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {TOOLS.map((tool, i) => (
                      <motion.button
                        key={tool.id}
                        onClick={() => setTools(tool.id)}
                        className={`btn p-3 rounded-xl border-2 transition-all text-center ${
                          tools === tool.id
                            ? "border-purple-500 bg-purple-500/20"
                            : "border-gray-700 bg-gray-800 hover:border-gray-600"
                        }`}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 + i * 0.1 }}
                      >
                        <div className="text-2xl mb-1">{tool.emoji}</div>
                        <div className="text-xs font-semibold text-white">{tool.label}</div>
                        <div className="text-xs text-gray-400 mt-0.5 leading-tight">{tool.description}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Time */}
                <div>
                  <div className="flex items-center gap-2 text-white font-semibold mb-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">Time Per Project</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {TIMES.map((t, i) => (
                      <motion.button
                        key={t.id}
                        onClick={() => setTime(t.id)}
                        className={`btn p-3 rounded-xl border-2 transition-all text-center ${
                          time === t.id
                            ? "border-purple-500 bg-purple-500/20"
                            : "border-gray-700 bg-gray-800 hover:border-gray-600"
                        }`}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                      >
                        <div className="text-2xl mb-1">{t.emoji}</div>
                        <div className="text-xs font-semibold text-white">{t.label}</div>
                        <div className="text-xs text-gray-400 mt-0.5 leading-tight">{t.description}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Spirit Animal */}
                <div>
                  <div className="flex items-center gap-2 text-white font-semibold mb-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">Your DIY Spirit Animal</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {SPIRITS.map((spirit, i) => (
                      <motion.button
                        key={spirit.id}
                        onClick={() => setSpiritAnimal(spirit.id)}
                        className={`btn p-3 rounded-xl border-2 transition-all text-left ${
                          spiritAnimal === spirit.id
                            ? "border-purple-500 bg-purple-500/20"
                            : "border-gray-700 bg-gray-800 hover:border-gray-600"
                        }`}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                      >
                        <div className="text-2xl mb-1">{spirit.emoji}</div>
                        <div className="text-sm font-semibold text-white">{spirit.label}</div>
                        <div className="text-xs text-gray-400">{spirit.description}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <motion.button
                onClick={nextStep}
                disabled={!tools || !time || !spiritAnimal}
                className={`btn w-full py-4 rounded-2xl font-bold text-lg transition-all mt-4 ${
                  tools && time && spiritAnimal
                    ? "bg-purple-600 text-white hover:bg-purple-700 active:scale-98"
                    : "bg-gray-800 text-gray-600 cursor-not-allowed"
                }`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="flex items-center justify-center gap-2">
                  Almost There!
                  <ChevronRight className="w-5 h-5" />
                </span>
              </motion.button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="comparison"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              className="flex flex-col h-full"
            >
              <motion.div
                className="text-center mb-4"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <h2 className="text-2xl font-black text-white mb-1">Why FixerUppera?</h2>
                <p className="text-gray-400 text-sm">What makes us different</p>
              </motion.div>

              <div className="flex-1 overflow-y-auto space-y-2 pb-4">
                {[
                  { feature: "AI Mockups", us: "Real AI image edits", them: "Overlays & filters" },
                  { feature: "DIY Plans", us: "Step-by-step instructions", them: "None" },
                  { feature: "Shopping Lists", us: "Items with cost estimates", them: "None" },
                  { feature: "Material Detection", us: "Identifies wood & finish", them: "None" },
                  { feature: "Profit Calculator", us: "Built-in with every plan", them: "None" },
                  { feature: "Free Trial", us: "7-day full access", them: "Hidden paywalls" },
                  { feature: "3 Modes", us: "Standard, Pro, Creative", them: "Single mode" },
                  { feature: "Before & After", us: "Interactive slider", them: "None" },
                ].map((row, i) => (
                  <motion.div
                    key={row.feature}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="bg-gray-800/50 rounded-xl p-3 flex items-center gap-3"
                  >
                    <div className="flex-shrink-0 w-20">
                      <span className="text-xs font-bold text-purple-400">{row.feature}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-400" />
                      </div>
                      <span className="text-xs text-white">{row.us}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <X className="w-3 h-3 text-red-400" />
                      </div>
                      <span className="text-xs text-gray-500">{row.them}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                onClick={nextStep}
                className="btn w-full py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg hover:bg-purple-700 active:scale-98 transition-all mt-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <span className="flex items-center justify-center gap-2">
                  Almost There!
                  <ChevronRight className="w-5 h-5" />
                </span>
              </motion.button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="ready"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              className="flex flex-col items-center text-center h-full relative"
            >
              <Confetti />

              <motion.h2
                className="text-3xl font-black text-white mb-1 z-10"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.4 }}
              >
                Let&apos;s do this,
              </motion.h2>
              <motion.h2
                className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8 z-10"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.4, delay: 0.1 }}
              >
                {name.split(" ")[0]}!
              </motion.h2>

              {/* Celebrating panda */}
              <motion.div
                className="w-full mb-8 z-10"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
              >
                <PandaScene animation="rallying" height={250} className="w-full max-w-[400px] mx-auto" />
              </motion.div>

              {/* Summary */}
              <motion.div
                className="w-full bg-gray-800/50 rounded-2xl p-4 mb-8 text-left z-10"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-sm font-semibold text-gray-400 mb-3">Your Profile</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Toolkit</span>
                    <span className="text-white font-medium">{TOOLS.find((t) => t.id === tools)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time</span>
                    <span className="text-white font-medium">{TIMES.find((t) => t.id === time)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Spirit</span>
                    <span className="text-white font-medium">{SPIRITS.find((s) => s.id === spiritAnimal)?.emoji} {SPIRITS.find((s) => s.id === spiritAnimal)?.label}</span>
                  </div>
                </div>
              </motion.div>

              <motion.button
                onClick={handleComplete}
                className="btn w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-xl hover:from-purple-700 hover:to-pink-700 active:scale-98 transition-all z-10 shadow-lg shadow-purple-500/30"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Transforming!
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
