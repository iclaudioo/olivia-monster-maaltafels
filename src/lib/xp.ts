export const XP_PER_CORRECT = 10;
export const XP_STREAK_BONUS = 5;
export const STREAK_THRESHOLD = 3;
export const XP_PER_LEVEL = 100;

export interface LevelReward {
  level: number;
  type: "monster" | "accessory" | "background";
  id: string;
  name: string;
  emoji: string;
}

export const LEVEL_REWARDS: LevelReward[] = [
  { level: 2, type: "monster", id: "vampiervleermuis", name: "Vampiervleermuis", emoji: "🦇" },
  { level: 3, type: "accessory", id: "zilveren-ketting", name: "Zilveren ketting", emoji: "🔗" },
  { level: 4, type: "monster", id: "wolfwelp", name: "Wolfwelp", emoji: "🐺" },
  { level: 5, type: "background", id: "spookkasteel", name: "Spookkasteel", emoji: "🏰" },
  { level: 6, type: "accessory", id: "vampiercape", name: "Vampiercape", emoji: "🦇" },
  { level: 7, type: "monster", id: "gouden-weerwolf", name: "Gouden weerwolf", emoji: "🐺" },
  { level: 8, type: "background", id: "kerkhof-maanlicht", name: "Kerkhof bij maanlicht", emoji: "🌕" },
  { level: 9, type: "accessory", id: "vleermuisvleugels", name: "Vleermuisvleugels", emoji: "🦇" },
  { level: 10, type: "monster", id: "zilveren-vampier", name: "Zilveren vampier", emoji: "🧛" },
  { level: 12, type: "background", id: "volle-maan", name: "Volle maan", emoji: "🌕" },
  { level: 15, type: "monster", id: "graaf-dracula", name: "Graaf Dracula", emoji: "🧛‍♂️" },
  { level: 20, type: "accessory", id: "bloedrobijn", name: "Bloedrobijn", emoji: "💎" },
];

export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpForCurrentLevel(xp: number): number {
  return xp % XP_PER_LEVEL;
}

export function xpToNextLevel(xp: number): number {
  return XP_PER_LEVEL - xpForCurrentLevel(xp);
}

export function xpProgressPercent(xp: number): number {
  return (xpForCurrentLevel(xp) / XP_PER_LEVEL) * 100;
}

export function getRewardForLevel(level: number): LevelReward | undefined {
  return LEVEL_REWARDS.find((r) => r.level === level);
}

export function getUnlockedRewards(level: number): LevelReward[] {
  return LEVEL_REWARDS.filter((r) => r.level <= level);
}

export function getLockedRewards(level: number): LevelReward[] {
  return LEVEL_REWARDS.filter((r) => r.level > level);
}

export function calculateXPGain(correct: number, streak: number): number {
  let xp = correct * XP_PER_CORRECT;
  const streakBonuses = Math.floor(streak / STREAK_THRESHOLD);
  xp += streakBonuses * XP_STREAK_BONUS;
  return xp;
}
