import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import React from "react";

export type { PandaAnimation } from "./usePandaAnimations";

export const PandaScene = dynamic(() => import("./PandaScene"), {
  ssr: false,
  loading: () =>
    React.createElement(
      "div",
      { className: "flex items-center justify-center", style: { height: 200 } },
      React.createElement(Loader2, { className: "w-8 h-8 text-purple-500 animate-spin" })
    ),
});
