"use client";

import { useState } from "react";
import type { AvatarConfig } from "@/lib/progress";

export const MONSTER_TYPES = [
  { id: "weerwolf" as const, name: "Weerwolf", emoji: "🐺", image: "/avatars/weerwolf.png" },
  { id: "vampier" as const, name: "Vampier", emoji: "🧛", image: "/avatars/vampier.png" },
  { id: "wolfje" as const, name: "Wolfje", emoji: "🐾", image: "/avatars/wolfje.png" },
  { id: "vleermuisje" as const, name: "Vleermuisje", emoji: "🦇", image: "/avatars/vleermuisje.png" },
];

export const MONSTER_COLORS = [
  { id: "paars", name: "Lavendel", hex: "#B39DDB" },
  { id: "goud", name: "Zonnig", hex: "#FFD166" },
  { id: "groen", name: "Mossig", hex: "#4CAF6E" },
  { id: "roze", name: "Koraal", hex: "#FF8FAB" },
];

export function useAvatar(initial?: AvatarConfig | null) {
  const [type, setType] = useState<AvatarConfig["type"]>(initial?.type || "weerwolf");
  const [color, setColor] = useState(initial?.color || "paars");
  const [name, setName] = useState(initial?.name || "");

  const config: AvatarConfig = { type, color, name };

  const isValid = name.trim().length > 0;

  return {
    type,
    setType,
    color,
    setColor,
    name,
    setName,
    config,
    isValid,
  };
}
