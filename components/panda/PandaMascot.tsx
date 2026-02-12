"use client";

import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { usePandaAnimations, type PandaAnimation } from "./usePandaAnimations";

interface PandaMascotProps {
  animation: PandaAnimation;
  scale?: number;
}

export default function PandaMascot({ animation, scale = 0.005 }: PandaMascotProps) {
  const { baseModel, actions, groupRef } = usePandaAnimations();

  // Play the requested animation with crossfade
  useEffect(() => {
    const action = actions[animation];
    if (!action) return;

    // Fade out all other actions
    Object.entries(actions).forEach(([name, a]) => {
      if (a && name !== animation) {
        a.fadeOut(0.3);
      }
    });

    // Fade in and play the requested animation
    action.reset().fadeIn(0.3).play();

    return () => {
      action.fadeOut(0.3);
    };
  }, [animation, actions]);

  // Slow auto-rotation for visual interest
  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef} scale={scale} position={[0, -1, 0]}>
      <primitive object={baseModel} />
    </group>
  );
}
