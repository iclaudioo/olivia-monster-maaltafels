"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PlayerProgress,
  loadProgress,
  saveProgress,
  getDefaultProgress,
  updateTableProgress,
} from "@/lib/progress";
import { calculateLevel, calculateXPGain, getRewardForLevel, LevelReward } from "@/lib/xp";

export function useProgress() {
  const [progress, setProgress] = useState<PlayerProgress>(getDefaultProgress);
  const [loaded, setLoaded] = useState(false);
  const [pendingLevelUp, setPendingLevelUp] = useState<LevelReward | null>(null);

  useEffect(() => {
    const saved = loadProgress();
    setProgress(saved);
    setLoaded(true);
  }, []);

  const save = useCallback((updated: PlayerProgress) => {
    setProgress(updated);
    saveProgress(updated);
  }, []);

  const addXP = useCallback(
    (correct: number, streak: number) => {
      const xpGain = calculateXPGain(correct, streak);
      const newXP = progress.xp + xpGain;
      const oldLevel = progress.level;
      const newLevel = calculateLevel(newXP);

      const updated = { ...progress, xp: newXP, level: newLevel };

      if (newLevel > oldLevel) {
        const reward = getRewardForLevel(newLevel);
        if (reward) {
          updated.unlockedMonsters = [...updated.unlockedMonsters, reward.id];
          setPendingLevelUp(reward);
        } else {
          setPendingLevelUp({ level: newLevel, type: "monster", id: "", name: "", emoji: "🎉" });
        }
      }

      save(updated);
      return xpGain;
    },
    [progress, save]
  );

  const recordTableResult = useCallback(
    (table: number, correct: number, total: number, stars: number) => {
      const updated = updateTableProgress(progress, table, correct, total, stars);
      save(updated);
    },
    [progress, save]
  );

  const updateStreak = useCallback(
    (streak: number) => {
      if (streak > progress.longestStreak) {
        save({ ...progress, longestStreak: streak });
      }
    },
    [progress, save]
  );

  const updateRaceScore = useCallback(
    (score: number) => {
      const isNewRecord = score > progress.bestRaceScore;
      if (isNewRecord) {
        save({ ...progress, bestRaceScore: score });
      }
      return isNewRecord;
    },
    [progress, save]
  );

  const setAvatar = useCallback(
    (avatar: PlayerProgress["avatar"]) => {
      save({ ...progress, avatar });
    },
    [progress, save]
  );

  const toggleSound = useCallback(() => {
    save({ ...progress, soundEnabled: !progress.soundEnabled });
  }, [progress, save]);

  const dismissLevelUp = useCallback(() => {
    setPendingLevelUp(null);
  }, []);

  return {
    progress,
    loaded,
    addXP,
    recordTableResult,
    updateStreak,
    updateRaceScore,
    setAvatar,
    toggleSound,
    pendingLevelUp,
    dismissLevelUp,
  };
}
