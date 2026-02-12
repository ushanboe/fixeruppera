"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import PandaMascot from "./PandaMascot";
import type { PandaAnimation } from "./usePandaAnimations";

interface PandaSceneProps {
  animation: PandaAnimation;
  height?: number;
  className?: string;
}

export default function PandaScene({ animation, height = 200, className = "" }: PandaSceneProps) {
  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* Soft purple glow behind panda for contrast against dark bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(192, 150, 255, 0.45) 0%, transparent 70%)",
        }}
      />
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 5]} intensity={1} />
        <Suspense fallback={null}>
          <PandaMascot animation={animation} />
        </Suspense>
      </Canvas>
      {/* HTML fallback shows while Suspense resolves (Canvas Suspense can't render HTML) */}
    </div>
  );
}
