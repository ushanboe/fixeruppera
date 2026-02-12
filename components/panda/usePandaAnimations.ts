"use client";

import { useMemo, useRef } from "react";
import { useFBX, useAnimations } from "@react-three/drei";
import type * as THREE from "three";

export type PandaAnimation = "walking" | "rallying" | "sadIdle" | "spinning" | "swimming";

export function usePandaAnimations() {
  const groupRef = useRef<THREE.Group>(null!);

  // Load the base model (mesh + skeleton + walking animation)
  const baseModel = useFBX("/images/Panda_Walking.fbx");

  // Load animation-only FBX files
  const rallyingFbx = useFBX("/images/Rallying.fbx");
  const sadIdleFbx = useFBX("/images/Sad-Idle.fbx");
  const spinningFbx = useFBX("/images/Spinning.fbx");
  const swimmingFbx = useFBX("/images/Swimming-To-Edge.fbx");

  // Rename each animation clip and collect them
  const allClips = useMemo(() => {
    const clips: THREE.AnimationClip[] = [];

    if (baseModel.animations.length > 0) {
      baseModel.animations[0].name = "walking";
      clips.push(baseModel.animations[0]);
    }
    if (rallyingFbx.animations.length > 0) {
      rallyingFbx.animations[0].name = "rallying";
      clips.push(rallyingFbx.animations[0]);
    }
    if (sadIdleFbx.animations.length > 0) {
      sadIdleFbx.animations[0].name = "sadIdle";
      clips.push(sadIdleFbx.animations[0]);
    }
    if (spinningFbx.animations.length > 0) {
      spinningFbx.animations[0].name = "spinning";
      clips.push(spinningFbx.animations[0]);
    }
    if (swimmingFbx.animations.length > 0) {
      swimmingFbx.animations[0].name = "swimming";
      clips.push(swimmingFbx.animations[0]);
    }

    return clips;
  }, [baseModel, rallyingFbx, sadIdleFbx, spinningFbx, swimmingFbx]);

  // useAnimations binds clips to the group ref and returns actions
  const { actions } = useAnimations(allClips, groupRef);

  return { baseModel, actions, groupRef };
}
