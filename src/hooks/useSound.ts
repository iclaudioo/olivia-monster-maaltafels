"use client";

import { useEffect, useCallback } from "react";
import {
  preloadSounds,
  playCorrectTone,
  playWrongTone,
  playClickTone,
  playLevelUpTone,
  playTickTone,
} from "@/lib/sounds";

export function useSound(enabled: boolean) {
  useEffect(() => {
    preloadSounds();
  }, []);

  const correct = useCallback(() => playCorrectTone(enabled), [enabled]);
  const wrong = useCallback(() => playWrongTone(enabled), [enabled]);
  const click = useCallback(() => playClickTone(enabled), [enabled]);
  const levelUp = useCallback(() => playLevelUpTone(enabled), [enabled]);
  const tick = useCallback(() => playTickTone(enabled), [enabled]);

  return { correct, wrong, click, levelUp, tick };
}
