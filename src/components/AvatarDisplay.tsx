"use client";

import { motion } from "framer-motion";

const MONSTER_EMOJI: Record<string, string> = {
  weerwolf: "🐺",
  vampier: "🧛",
  heks: "🧙",
  spook: "👻",
};

const SIZE_CLASSES = {
  sm: "w-16 h-16 text-3xl",
  md: "w-24 h-24 text-5xl",
  lg: "w-32 h-32 text-6xl",
};

const ACCESSORY_SIZE = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-xl",
};

interface AvatarDisplayProps {
  type: "weerwolf" | "vampier" | "heks" | "spook";
  color: string;
  accessory: string;
  name: string;
  size?: "sm" | "md" | "lg";
}

export default function AvatarDisplay({
  type,
  color,
  accessory,
  name,
  size = "md",
}: AvatarDisplayProps) {
  const emoji = MONSTER_EMOJI[type] ?? "👻";

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        className="relative"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className={`${SIZE_CLASSES[size]} rounded-full flex items-center justify-center relative`}
          style={{ backgroundColor: color }}
        >
          <span className="select-none">{emoji}</span>

          {accessory && (
            <span
              className={`absolute -top-1 -right-1 ${ACCESSORY_SIZE[size]} select-none`}
            >
              {accessory}
            </span>
          )}
        </div>
      </motion.div>

      <span className="text-monster-text font-semibold text-sm truncate max-w-[120px]">
        {name}
      </span>
    </div>
  );
}
