"use client";

import { Home, Bookmark, Settings } from "lucide-react";

interface BottomNavProps {
  currentView: "home" | "saved" | "settings";
  onNavigate: (view: "home" | "saved" | "settings") => void;
}

export default function BottomNav({ currentView, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 safe-bottom z-50">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => onNavigate("home")}
            className={`btn flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-all ${
              currentView === "home"
                ? "text-purple-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <Home className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-semibold">Home</span>
          </button>

          <button
            onClick={() => onNavigate("saved")}
            className={`btn flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-all ${
              currentView === "saved"
                ? "text-purple-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <Bookmark className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-semibold">Saved</span>
          </button>

          <button
            onClick={() => onNavigate("settings")}
            className={`btn flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-all ${
              currentView === "settings"
                ? "text-purple-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <Settings className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-semibold">Settings</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
