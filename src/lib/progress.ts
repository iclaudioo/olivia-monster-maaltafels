export interface TableProgress {
  table: number;
  stars: number; // 0-3
  bestScore: number;
  totalAttempts: number;
  totalCorrect: number;
}

export interface AvatarConfig {
  type: "weerwolf" | "vampier" | "heks" | "spook";
  color: string;
  accessory: string;
  name: string;
}

export interface PlayerProgress {
  avatar: AvatarConfig | null;
  xp: number;
  level: number;
  tables: Record<number, TableProgress>;
  unlockedMonsters: string[];
  totalCorrect: number;
  totalAttempts: number;
  longestStreak: number;
  bestRaceScore: number;
  soundEnabled: boolean;
}

const STORAGE_KEY = "olivia-monster-maaltafels";

export function getDefaultProgress(): PlayerProgress {
  return {
    avatar: null,
    xp: 0,
    level: 1,
    tables: Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [
        i + 1,
        { table: i + 1, stars: 0, bestScore: 0, totalAttempts: 0, totalCorrect: 0 },
      ])
    ),
    unlockedMonsters: [],
    totalCorrect: 0,
    totalAttempts: 0,
    longestStreak: 0,
    bestRaceScore: 0,
    soundEnabled: true,
  };
}

export function loadProgress(): PlayerProgress {
  if (typeof window === "undefined") return getDefaultProgress();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...getDefaultProgress(), ...parsed };
    }
  } catch {
    // Corrupted data, reset
  }
  return getDefaultProgress();
}

export function saveProgress(progress: PlayerProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage full or unavailable
  }
}

export function updateTableProgress(
  progress: PlayerProgress,
  table: number,
  correct: number,
  total: number,
  stars: number
): PlayerProgress {
  const existing = progress.tables[table] || {
    table,
    stars: 0,
    bestScore: 0,
    totalAttempts: 0,
    totalCorrect: 0,
  };

  return {
    ...progress,
    tables: {
      ...progress.tables,
      [table]: {
        ...existing,
        stars: Math.max(existing.stars, stars),
        bestScore: Math.max(existing.bestScore, correct),
        totalAttempts: existing.totalAttempts + total,
        totalCorrect: existing.totalCorrect + correct,
      },
    },
    totalCorrect: progress.totalCorrect + correct,
    totalAttempts: progress.totalAttempts + total,
  };
}
