"use client";

import { motion } from "framer-motion";

interface XPBarProps {
  current: number;
  max: number;
  level: number;
}

export default function XPBar({ current, max, level }: XPBarProps) {
  const percent = Math.min((current / max) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-forest-light font-display">
          Level {level}
        </span>
        <span className="text-xs text-forest-muted">
          {current} / {max} XP
        </span>
      </div>

      <div className="h-4 rounded-full bg-forest-deepest/60 overflow-hidden border border-forest-green/30">
        <motion.div
          className="h-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #4CAF6E 0%, #8FD4A4 60%, #FFD166 100%)",
            boxShadow: "0 0 12px rgba(76, 175, 110, 0.6)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
