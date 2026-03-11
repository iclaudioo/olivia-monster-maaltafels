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
  { level: 2, type: "monster", id: "vampier-blauw", name: "Blauwe vampier", emoji: "🧛" },
  { level: 3, type: "accessory", id: "kroon", name: "Gouden kroon", emoji: "👑" },
  { level: 4, type: "monster", id: "heks-groen", name: "Groene heks", emoji: "🧙" },
  { level: 5, type: "background", id: "kasteel", name: "Spookkasteel", emoji: "🏰" },
  { level: 6, type: "accessory", id: "toverstaf", name: "Toverstaf", emoji: "🪄" },
  { level: 7, type: "monster", id: "spook-goud", name: "Gouden spook", emoji: "👻" },
  { level: 8, type: "background", id: "maanbos", name: "Maanlichtbos", emoji: "🌙" },
  { level: 9, type: "accessory", id: "vleugels", name: "Vleermuisvleugels", emoji: "🦇" },
  { level: 10, type: "monster", id: "weerwolf-zilver", name: "Zilveren weerwolf", emoji: "🐺" },
  { level: 12, type: "background", id: "kerkhof", name: "Griezelig kerkhof", emoji: "⚰️" },
  { level: 15, type: "monster", id: "draak", name: "Paarse draak", emoji: "🐉" },
  { level: 20, type: "accessory", id: "diamant", name: "Diamanten amulet", emoji: "💎" },
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
