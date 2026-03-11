"use client";

import { useState } from "react";
import type { AvatarConfig } from "@/lib/progress";

export const MONSTER_TYPES = [
  { id: "weerwolf" as const, name: "Weerwolf", emoji: "🐺" },
  { id: "vampier" as const, name: "Vampier", emoji: "🧛" },
  { id: "heks" as const, name: "Heks", emoji: "🧙" },
  { id: "spook" as const, name: "Spook", emoji: "👻" },
];

export const MONSTER_COLORS = [
  { id: "paars", name: "Paars", hex: "#7C3AED" },
  { id: "goud", name: "Goud", hex: "#FFD700" },
  { id: "groen", name: "Groen", hex: "#34D399" },
  { id: "roze", name: "Roze", hex: "#F472B6" },
];

export const MONSTER_ACCESSORIES = [
  { id: "geen", name: "Geen", emoji: "" },
  { id: "hoed", name: "Hoed", emoji: "🎩" },
  { id: "cape", name: "Cape", emoji: "🧣" },
  { id: "bril", name: "Bril", emoji: "👓" },
];

export function useAvatar(initial?: AvatarConfig | null) {
  const [type, setType] = useState<AvatarConfig["type"]>(initial?.type || "weerwolf");
  const [color, setColor] = useState(initial?.color || "paars");
  const [accessory, setAccessory] = useState(initial?.accessory || "geen");
  const [name, setName] = useState(initial?.name || "");

  const config: AvatarConfig = { type, color, accessory, name };

  const isValid = name.trim().length > 0;

  return {
    type,
    setType,
    color,
    setColor,
    accessory,
    setAccessory,
    name,
    setName,
    config,
    isValid,
  };
}
