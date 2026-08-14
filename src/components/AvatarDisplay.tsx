"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MONSTER_TYPES } from "@/hooks/useAvatar";

const FALLBACK_EMOJI: Record<string, string> = {
  weerwolf: "🐺",
  vampier: "🧛",
  wolfje: "🐾",
  vleermuisje: "🦇",
};

const SIZE_CLASSES = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
};

const EMOJI_SIZE_CLASSES = {
  sm: "text-3xl",
  md: "text-5xl",
  lg: "text-6xl",
};

interface AvatarDisplayProps {
  type: "weerwolf" | "vampier" | "wolfje" | "vleermuisje";
  color: string;
  name: string;
  size?: "sm" | "md" | "lg";
  accessory?: string;
}

export default function AvatarDisplay({
  type,
  color,
  name,
  size = "md",
}: AvatarDisplayProps) {
  const [imgError, setImgError] = useState(false);
  const monsterType = MONSTER_TYPES.find((m) => m.id === type);
  const imageSrc = monsterType?.image;
  const fallbackEmoji = FALLBACK_EMOJI[type] ?? "🐺";

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        className="relative"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className={`${SIZE_CLASSES[size]} rounded-full flex items-center justify-center relative overflow-hidden`}
          style={{
            backgroundColor: color,
            boxShadow: `0 0 20px ${color}40`,
          }}
        >
          {imageSrc && !imgError ? (
            <img
              src={imageSrc}
              alt={monsterType?.name ?? type}
              className="w-[85%] h-[85%] object-contain select-none"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className={`${EMOJI_SIZE_CLASSES[size]} select-none`}>{fallbackEmoji}</span>
          )}
        </div>
      </motion.div>

      <span className="text-forest-cream font-semibold text-base truncate max-w-[120px] font-display">
        {name}
      </span>
    </div>
  );
}
